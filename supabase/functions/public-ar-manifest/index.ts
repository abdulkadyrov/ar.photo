import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import {
  SIGNED_URL_TTL_SECONDS,
  corsHeaders,
  createPublicManifest,
  extractPublicSlug,
  parseAllowedOrigins,
  requestNetworkIdentifier,
  sha256Hex,
  type PublicManifestSource,
} from "./manifest.ts";

Deno.serve(async (request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const rateLimitSalt = Deno.env.get("PUBLIC_MANIFEST_RATE_LIMIT_SALT");
  const allowedOrigins = parseAllowedOrigins(Deno.env.get("PUBLIC_MANIFEST_ALLOWED_ORIGINS") ?? "");
  const cors = corsHeaders(request.headers.get("origin"), allowedOrigins);

  if (!cors) return json({ code: "origin_not_allowed" }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "GET") return json({ code: "method_not_allowed" }, 405, cors);
  if (!supabaseUrl || !serviceRoleKey || !rateLimitSalt || rateLimitSalt.length < 32) {
    return json({ code: "manifest_not_configured" }, 503, cors);
  }

  const publicSlug = extractPublicSlug(request.url);
  if (!publicSlug) return json({ code: "not_found" }, 404, cors);

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const networkId = requestNetworkIdentifier(request.headers);
  const [ipHash, slugHash] = await Promise.all([
    sha256Hex(`${rateLimitSalt}|ip|${networkId}`),
    sha256Hex(`${rateLimitSalt}|slug|${publicSlug}`),
  ]);
  const [ipLimit, slugLimit] = await Promise.all([
    client.rpc("consume_public_manifest_rate_limit", {
      p_bucket_key: `ip:${ipHash}`,
      p_max_requests: 60,
      p_window_seconds: 60,
    }),
    client.rpc("consume_public_manifest_rate_limit", {
      p_bucket_key: `slug:${slugHash}`,
      p_max_requests: 240,
      p_window_seconds: 60,
    }),
  ]);
  if (ipLimit.error || slugLimit.error) {
    console.error("Public manifest rate limit unavailable", {
      code: ipLimit.error?.code ?? slugLimit.error?.code,
    });
    return json({ code: "manifest_unavailable" }, 503, cors);
  }
  if (!ipLimit.data || !slugLimit.data) {
    return json({ code: "rate_limited" }, 429, { ...cors, "retry-after": "60" });
  }

  const resolved = await client.rpc("get_public_ar_manifest_source", { p_public_slug: publicSlug });
  const sources = (resolved.data ?? []) as PublicManifestSource[];
  if (resolved.error) {
    console.error("Public manifest source unavailable", { code: resolved.error.code });
    return json({ code: "manifest_unavailable" }, 503, cors);
  }
  if (!sources.length) return json({ code: "not_found" }, 404, cors);

  const signedTargets = await Promise.all(
    sources.map(async (source) => {
      const [tracking, video, poster] = await Promise.all([
        client.storage.from(source.tracking_bucket).createSignedUrl(source.tracking_path, SIGNED_URL_TTL_SECONDS),
        client.storage.from(source.video_bucket).createSignedUrl(source.video_path, SIGNED_URL_TTL_SECONDS),
        client.storage.from(source.poster_bucket).createSignedUrl(source.poster_path, SIGNED_URL_TTL_SECONDS),
      ]);
      return { tracking, video, poster };
    }),
  );
  if (signedTargets.some(({ tracking, video, poster }) => tracking.error || video.error || poster.error)) {
    console.error("Public manifest bundle signing failed", { targetCount: sources.length });
    return json({ code: "manifest_unavailable" }, 503, cors);
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString();
  return json(
    createPublicManifest(
      sources,
      signedTargets.map(({ tracking, video, poster }) => ({
        trackingAssetUrl: tracking.data!.signedUrl,
        videoUrl: video.data!.signedUrl,
        posterUrl: poster.data!.signedUrl,
      })),
      expiresAt,
    ),
    200,
    cors,
  );
});

function json(payload: Record<string, unknown>, status: number, extraHeaders: Record<string, string> = {}) {
  return Response.json(payload, {
    status,
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}
