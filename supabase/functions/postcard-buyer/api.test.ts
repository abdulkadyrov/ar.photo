import { describe, expect, it } from "vitest";
import { buyerCors, buyerRequestSchema, buyerRpc, exactByteStream, stripPrivateFields } from "./api";
const publicToken = "a".repeat(32);
const editToken = "b".repeat(64);
const video = {
  name: "clip.mov",
  mimeType: "video/quicktime",
  sizeBytes: 4,
  width: 1920,
  height: 1080,
  durationSeconds: 10,
  sha256: "c".repeat(64),
};
function bytes(...chunks: number[][]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new Uint8Array(chunk));
      controller.close();
    },
  });
}
describe("postcard buyer gateway boundary", () => {
  it("accepts video-only metadata without allowing caller-selected account, path or marker", () => {
    const request = {
      action: "upload",
      publicToken,
      editToken,
      requestId: "10000000-0000-4000-8000-000000000001",
      mode: "frame",
      video,
    };
    expect(buyerRequestSchema.safeParse(request).success).toBe(true);
    for (const field of [{ accountId: "attacker" }, { marker: { sizeBytes: 5 } }, { path: "other/account" }])
      expect(buyerRequestSchema.safeParse({ ...request, ...field }).success).toBe(false);
    expect(buyerRequestSchema.safeParse({ ...request, video: { ...video, sizeBytes: 104857601 } }).success).toBe(false);
  });
  it("requires private edit capability for every write and status RPC", () => {
    for (const action of ["claim", "upload", "completeUpload", "publish", "state"])
      expect(buyerRequestSchema.safeParse({ action, publicToken }).success).toBe(false);
    expect(buyerRpc({ action: "lookup", publicToken }, null)).toEqual({
      name: "postcard_buyer_state",
      args: { p_public_token: publicToken, p_edit_hash: null },
    });
  });
  it("strips all internal asset identifiers from responses", () => {
    expect(
      stripPrivateFields({
        _previewAssetId: "secret",
        _videoAssetId: "private",
        card: { state: "available" },
        owned: false,
      }),
    ).toEqual({ card: { state: "available" }, owned: false });
  });
  it("allows only configured origins and bounded PUT headers", () => {
    const allowed = new Set(["https://khanzama.ru"]);
    expect(buyerCors("https://evil.example", allowed)).toBeNull();
    expect(buyerCors("https://khanzama.ru", allowed)?.["access-control-allow-methods"]).toContain("PUT");
    expect(buyerCors(null, new Set())).toBeNull();
  });
  it("streams exactly reserved bytes without buffering the complete video", async () => {
    const bounded = exactByteStream(bytes([1, 2], [3, 4]), 4);
    expect(Array.from(new Uint8Array(await new Response(bounded.stream).arrayBuffer()))).toEqual([1, 2, 3, 4]);
    expect(bounded.completed).toBe(true);
    expect(bounded.bytes).toBe(4);
  });
  it("rejects oversized bodies before enqueueing bytes beyond reservation", async () => {
    const bounded = exactByteStream(bytes([1], [2, 3, 4]), 2);
    await expect(new Response(bounded.stream).arrayBuffer()).rejects.toThrow("upload_size_mismatch");
    expect(bounded.completed).toBe(false);
    expect(bounded.bytes).toBeLessThanOrEqual(2);
  });
  it("rejects truncated bodies and oversized reservations", async () => {
    const bounded = exactByteStream(bytes([1]), 2);
    await expect(new Response(bounded.stream).arrayBuffer()).rejects.toThrow("upload_size_mismatch");
    expect(() => exactByteStream(bytes([1]), 104857601)).toThrow("invalid_upload_size");
    expect(() => exactByteStream(bytes([1]), 0)).toThrow("invalid_upload_size");
  });
});
