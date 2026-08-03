import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import {
  ANALYTICS_BODY_LIMIT_BYTES,
  corsHeaders,
  parseAllowedOrigins,
  parseAnalyticsPayload,
  requestNetworkIdentifier,
  sha256Hex,
} from "./analytics.ts";

Deno.serve(async (request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const hashSalt = Deno.env.get("PUBLIC_ANALYTICS_HASH_SALT");
  const allowedOrigins = parseAllowedOrigins(Deno.env.get("PUBLIC_ANALYTICS_ALLOWED_ORIGINS") ?? "");
  const cors = corsHeaders(request.headers.get("origin"), allowedOrigins);

  if (!cors) return json({ code: "origin_not_allowed" }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return json({ code: "method_not_allowed" }, 405, cors);
  if (!supabaseUrl || !serviceRoleKey || !hashSalt || hashSalt.length < 32) {
    return json({ code: "analytics_not_configured" }, 503, cors);
  }

  const announcedLength = Number(request.headers.get("content-length") ?? "0");
  if (announcedLength > ANALYTICS_BODY_LIMIT_BYTES) return json({ code: "payload_too_large" }, 413, cors);

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ code: "invalid_payload" }, 400, cors);
  }
  if (new TextEncoder().encode(rawBody).byteLength > ANALYTICS_BODY_LIMIT_BYTES) {
    return json({ code: "payload_too_large" }, 413, cors);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return json({ code: "invalid_payload" }, 400, cors);
  }
  const payload = parseAnalyticsPayload(parsedBody);
  if (!payload) return json({ code: "invalid_payload" }, 400, cors);

  const networkIdentifier = requestNetworkIdentifier(request.headers);
  const [networkHash, sessionHash] = await Promise.all([
    sha256Hex(`${hashSalt}|ip|${networkIdentifier}`),
    sha256Hex(`${hashSalt}|session|${payload.sessionToken}`),
  ]);
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const [networkLimit, sessionLimit] = await Promise.all([
    client.rpc("consume_public_analytics_rate_limit", {
      p_bucket_key: `analytics-ip:${networkHash}`,
      p_max_requests: 120,
      p_window_seconds: 60,
    }),
    client.rpc("consume_public_analytics_rate_limit", {
      p_bucket_key: `analytics-session:${sessionHash}`,
      p_max_requests: 60,
      p_window_seconds: 60,
    }),
  ]);
  if (networkLimit.error || sessionLimit.error) {
    console.error("Public analytics rate limit unavailable", {
      code: networkLimit.error?.code ?? sessionLimit.error?.code,
    });
    return json({ code: "analytics_unavailable" }, 503, cors);
  }
  if (!networkLimit.data || !sessionLimit.data) {
    return json({ code: "rate_limited" }, 429, { ...cors, "retry-after": "60" });
  }

  const recorded = await client.rpc("record_public_ar_event", {
    p_public_slug: payload.publicSlug,
    p_session_token_hash: sessionHash,
    p_event_type: payload.event,
    p_value_numeric: payload.valueSeconds,
    p_device_type: payload.deviceType,
    p_browser_family: payload.browserFamily,
    p_os_family: payload.osFamily,
    p_referrer_domain: payload.referrerDomain,
    p_error_code: payload.errorCode,
  });
  if (recorded.error) {
    if (recorded.error.code === "P0002") return json({ code: "not_found" }, 404, cors);
    console.error("Public analytics event unavailable", { code: recorded.error.code });
    return json({ code: "analytics_unavailable" }, 503, cors);
  }

  const result = recorded.data as { accepted?: boolean; duplicate?: boolean } | null;
  return json({ accepted: result?.accepted === true, duplicate: result?.duplicate === true }, 202, cors);
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
