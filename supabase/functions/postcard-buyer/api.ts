import { z } from "zod";

const token = z.string().regex(/^[a-f0-9]{32}$/);
const edit = z.string().regex(/^[a-f0-9]{64}$/);
const base = { publicToken: token, editToken: edit.optional() };
const video = z
  .object({
    name: z.string().min(1).max(255),
    mimeType: z.enum(["video/mp4", "video/quicktime", "video/webm"]),
    sizeBytes: z.number().int().min(1).max(104857600),
    width: z.number().int().min(1).max(16384),
    height: z.number().int().min(1).max(16384),
    durationSeconds: z.number().positive().max(120),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export const buyerRequestSchema = z.discriminatedUnion("action", [
  z.object({ ...base, action: z.literal("lookup") }).strict(),
  z.object({ ...base, action: z.literal("state"), editToken: edit }).strict(),
  z
    .object({ ...base, action: z.literal("claim"), editToken: edit, shopCode: z.string().trim().min(1).max(40) })
    .strict(),
  z
    .object({
      ...base,
      action: z.literal("upload"),
      editToken: edit,
      requestId: z.string().uuid(),
      mode: z.enum(["frame", "full"]),
      video,
    })
    .strict(),
  z.object({ ...base, action: z.literal("completeUpload"), editToken: edit, uploadId: z.string().uuid() }).strict(),
  z.object({ ...base, action: z.literal("publish"), editToken: edit }).strict(),
]);
export type BuyerRequest = z.infer<typeof buyerRequestSchema>;

export function buyerRpc(input: BuyerRequest, editHash: string | null) {
  const common = { p_public_token: input.publicToken, p_edit_hash: editHash };
  switch (input.action) {
    case "lookup":
    case "state":
      return { name: "postcard_buyer_state", args: common };
    case "claim":
      return { name: "postcard_buyer_claim", args: { ...common, p_shop_code: input.shopCode } };
    case "upload":
      return {
        name: "postcard_buyer_start_upload",
        args: { ...common, p_request_id: input.requestId, p_mode: input.mode, p_video: input.video },
      };
    case "completeUpload":
      return { name: "postcard_buyer_complete_upload", args: { ...common, p_upload_id: input.uploadId } };
    case "publish":
      return { name: "postcard_buyer_publish", args: common };
  }
}
export function buyerErrorStatus(code: string) {
  if (code === "invalid_card") return 404;
  if (code === "rate_limited") return 429;
  if (["activation_unavailable", "storage_limit_reached", "too_many_uploads"].includes(code)) return 409;
  if (
    ["invalid_upload", "request_conflict", "upload_expired", "upload_superseded", "media_limit_reached"].includes(code)
  )
    return 422;
  return 503;
}
export function databaseErrorCode(error: { code?: string; details?: string; message?: string }) {
  if (error.code === "23514") return "media_limit_reached";
  if (["55000", "23503", "22000"].includes(error.code ?? "")) return "upload_not_ready";
  if (error.code === "42501") return "activation_unavailable";
  return "service_unavailable";
}
export function stripPrivateFields(data: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(data).filter(([key]) => !key.startsWith("_")));
}
export function buyerCors(origin: string | null, allowed: Set<string>) {
  if (origin && !allowed.has(origin)) return null;
  const destination = origin ?? [...allowed][0];
  if (!destination) return null;
  return {
    "access-control-allow-origin": destination,
    "access-control-allow-methods": "POST, PUT, OPTIONS",
    "access-control-allow-headers": "apikey, authorization, content-type, x-postcard-edit-token",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}
export async function hashBuyerSecret(salt: string, value: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}|${value}`));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function exactByteStream(body: ReadableStream<Uint8Array>, expectedBytes: number) {
  if (!Number.isSafeInteger(expectedBytes) || expectedBytes < 1 || expectedBytes > 104857600)
    throw new Error("invalid_upload_size");
  const reader = body.getReader();
  let bytes = 0;
  let completed = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          if (bytes !== expectedBytes) throw new Error("upload_size_mismatch");
          completed = true;
          controller.close();
          return;
        }
        if (value.byteLength > expectedBytes - bytes) throw new Error("upload_size_mismatch");
        bytes += value.byteLength;
        controller.enqueue(value);
      } catch {
        await reader.cancel().catch(() => undefined);
        controller.error(new Error("upload_size_mismatch"));
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    },
  });
  return {
    stream,
    get completed() {
      return completed;
    },
    get bytes() {
      return bytes;
    },
  };
}
