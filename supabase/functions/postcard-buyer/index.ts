import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import {
  buyerCors,
  buyerErrorStatus,
  buyerRequestSchema,
  buyerRpc,
  databaseErrorCode,
  hashBuyerSecret,
  stripPrivateFields,
  exactByteStream,
} from "./api.ts";

Deno.serve(async (request) => {
  const allowed = new Set(
    (Deno.env.get("PUBLIC_MANIFEST_ALLOWED_ORIGINS") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const cors = buyerCors(request.headers.get("origin"), allowed);
  const json = (data: unknown, status = 200) =>
    Response.json(data, {
      status,
      headers: {
        ...(cors ?? {}),
        "cache-control": "private, no-store, max-age=0",
        "x-content-type-options": "nosniff",
        ...(status === 429 ? { "retry-after": "600" } : {}),
      },
    });
  if (!cors) return json({ code: "origin_not_allowed" }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const salt = Deno.env.get("POSTCARD_TOKEN_SALT");
  if (!url || !key || !salt || salt.length < 32) return json({ code: "service_unavailable" }, 503);
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  if (request.method === "PUT") {
    const match = new URL(request.url).pathname.match(/\/postcard-buyer\/upload\/([a-f0-9]{32})\/([a-f0-9-]{36})$/);
    const editToken = request.headers.get("x-postcard-edit-token") ?? "";
    if (!match || !/^[a-f0-9]{64}$/.test(editToken) || !request.body) return json({ code: "invalid_upload" }, 400);
    try {
      const cardBucket = await hashBuyerSecret(salt, `upload-card|${match[1]}`);
      const rate = await client.rpc("consume_public_manifest_rate_limit", {
        p_bucket_key: `slug:${cardBucket}`,
        p_max_requests: 30,
        p_window_seconds: 60,
      });
      if (rate.error) return json({ code: "service_unavailable" }, 503);
      if (!rate.data) return json({ code: "rate_limited", retryAfterSeconds: 60 }, 429);
      const editHash = await hashBuyerSecret(salt, `edit|${match[1]}|${editToken}`);
      const target = await client.rpc("postcard_buyer_upload_target", {
        p_public_token: match[1],
        p_edit_hash: editHash,
        p_upload_id: match[2],
      });
      if (target.error || !target.data || target.data.error) return json({ code: "invalid_upload" }, 404);
      const data = target.data as {
        bucket: string;
        path: string;
        sizeBytes: number;
        mimeType: string;
        uploadedSize?: number | null;
      };
      const length = request.headers.get("content-length");
      if (length && Number(length) !== data.sizeBytes) return json({ code: "upload_size_mismatch" }, 422);
      if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== data.mimeType)
        return json({ code: "invalid_upload" }, 422);
      if (data.uploadedSize === data.sizeBytes) return json({ uploaded: true });
      const guarded = exactByteStream(request.body, data.sizeBytes);
      const objectUrl = `${url.replace(/\/$/, "")}/storage/v1/object/${data.bucket}/${data.path.split("/").map(encodeURIComponent).join("/")}`;
      const upstream = await fetch(objectUrl, {
        method: "POST",
        headers: { authorization: `Bearer ${key}`, apikey: key, "content-type": data.mimeType, "x-upsert": "false" },
        body: guarded.stream,
        duplex: "half",
      } as RequestInit);
      if (!upstream.ok || !guarded.completed) return json({ code: "upload_failed" }, 422);
      return json({ uploaded: true });
    } catch {
      return json({ code: "upload_failed" }, 422);
    }
  }
  if (request.method !== "POST") return json({ code: "method_not_allowed" }, 405);
  try {
    // Bound the JSON body before parsing. Video bytes only go to signed private Storage.
    const reader = request.body?.getReader();
    if (!reader) return json({ code: "invalid_request" }, 400);
    let length = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 8192) {
        await reader.cancel();
        return json({ code: "invalid_request" }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let body: unknown;
    try {
      body = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return json({ code: "invalid_request" }, 400);
    }
    const parsed = buyerRequestSchema.safeParse(body);
    if (!parsed.success) return json({ code: "invalid_request" }, 400);
    const input = parsed.data;
    if (input.action === "upload" && input.video.sizeBytes > 15 * 1024 * 1024)
      return json({ code: "media_limit_reached" }, 422);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "missing";
    const ipHash = await hashBuyerSecret(salt, `ip|${ip}|${input.action === "claim" ? "claim" : "request"}`);
    const rate = await client.rpc("consume_public_manifest_rate_limit", {
      p_bucket_key: `ip:${ipHash}`,
      p_max_requests: input.action === "claim" ? 10 : 120,
      p_window_seconds: input.action === "claim" ? 600 : 60,
    });
    if (rate.error) return json({ code: "service_unavailable" }, 503);
    if (!rate.data) return json({ code: "rate_limited", retryAfterSeconds: input.action === "claim" ? 600 : 60 }, 429);
    if (input.action === "claim") {
      const cardHash = await hashBuyerSecret(salt, `claim-card|${input.publicToken}`);
      const perCard = await client.rpc("consume_public_manifest_rate_limit", {
        p_bucket_key: `slug:${cardHash}`,
        p_max_requests: 10,
        p_window_seconds: 600,
      });
      if (perCard.error) return json({ code: "service_unavailable" }, 503);
      if (!perCard.data) return json({ code: "rate_limited", retryAfterSeconds: 600 }, 429);
    }
    const editHash = input.editToken
      ? await hashBuyerSecret(salt, `edit|${input.publicToken}|${input.editToken}`)
      : null;
    const rpc = buyerRpc(input, editHash);
    const result = await client.rpc(rpc.name, rpc.args);
    if (result.error) {
      console.error("Postcard RPC rejected", { action: input.action, code: result.error.code });
      const code =
        input.action === "claim" && result.error.code === "23514"
          ? "activation_unavailable"
          : databaseErrorCode(result.error);
      return json({ code }, code === "service_unavailable" ? 503 : 422);
    }
    const data = result.data as Record<string, unknown> | null;
    if (!data || typeof data !== "object") return json({ code: "service_unavailable" }, 503);
    if (typeof data.error === "string") return json({ code: data.error }, buyerErrorStatus(data.error));
    if (input.action === "upload") {
      if (typeof data.bucket !== "string" || typeof data.path !== "string" || typeof data.uploadId !== "string")
        return json({ code: "service_unavailable" }, 503);
      const external = new URL(Deno.env.get("POSTCARD_PUBLIC_ORIGIN") ?? "https://khanzama.ru");
      const uploadUrl = new URL(`/functions/v1/postcard-buyer/upload/${input.publicToken}/${data.uploadId}`, external);
      return json({
        uploadId: data.uploadId,
        video: { signedUrl: uploadUrl.toString(), headers: { "x-postcard-edit-token": input.editToken } },
      });
    }
    const envelope = stripPrivateFields(data);
    for (const [privateField, publicField] of [
      ["_previewAssetId", "previewImageUrl"],
      ["_videoAssetId", "videoPreviewUrl"],
    ]) {
      const id = data[privateField];
      envelope[publicField] = null;
      if (typeof id !== "string") continue;
      const asset = await client
        .from("media_assets")
        .select("storage_bucket,storage_path")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();
      if (asset.error || !asset.data) return json({ code: "service_unavailable" }, 503);
      const signed = await client.storage.from(asset.data.storage_bucket).createSignedUrl(asset.data.storage_path, 300);
      if (signed.error || !signed.data) return json({ code: "service_unavailable" }, 503);
      const mediaUrl = new URL(signed.data.signedUrl);
      const external = new URL(Deno.env.get("POSTCARD_PUBLIC_ORIGIN") ?? "https://khanzama.ru");
      mediaUrl.protocol = external.protocol;
      mediaUrl.host = external.host;
      envelope[publicField] = mediaUrl.toString();
    }
    return json(envelope);
  } catch {
    return json({ code: "service_unavailable" }, 503);
  }
});
