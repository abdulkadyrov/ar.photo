import { afterEach, describe, expect, it, vi } from "vitest";
import { buyerSnapshotSchema, PostcardBuyerApi, PostcardBuyerError, type BuyerSnapshot } from "./postcardBuyerApi";

const publicToken = "1234567890abcdef1234567890abcdef";
const editToken = "a".repeat(64);
const config = {
  authMode: "supabase" as const,
  supabaseUrl: "https://khanzama.ru",
  supabasePublishableKey: "test-public-key-not-a-secret",
};
const snapshot: BuyerSnapshot = {
  card: {
    publicToken,
    templateCode: "eid",
    title: "Ид мубарак!",
    state: "available",
    mode: "frame",
    frame: { x: 0.1, y: 0.3, width: 0.8, height: 0.4 },
    publicSlug: null,
  },
  limits: { maxVideoBytes: 100 * 1024 * 1024, maxVideoSeconds: 120 },
  owned: false,
};
afterEach(() => vi.unstubAllGlobals());

describe("postcard buyer API boundary", () => {
  it("keeps signed preview URLs stable while polling, but refreshes changed assets and explicit retries", async () => {
    const media = "https://khanzama.ru/storage/v1/object/sign/markers-private/card.png";
    const fetchMock = vi
      .fn()
      .mockImplementation(
        async () =>
          new Response(
            JSON.stringify({ ...snapshot, previewImageUrl: `${media}?token=${fetchMock.mock.calls.length}` }),
          ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const api = new PostcardBuyerApi(config);
    const first = await api.lookup(publicToken);
    expect((await api.lookup(publicToken)).previewImageUrl).toBe(first.previewImageUrl);
    api.clearPreviewCache();
    expect((await api.lookup(publicToken)).previewImageUrl).not.toBe(first.previewImageUrl);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ...snapshot, previewImageUrl: `${media}-new?token=4` })));
    expect((await api.lookup(publicToken)).previewImageUrl).toContain("card.png-new");
  });
  it("sends recovery capabilities only in a no-store POST body, without a studio session", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(snapshot), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await new PostcardBuyerApi(config).lookup(publicToken, editToken);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://khanzama.ru/functions/v1/postcard-buyer");
    expect(url).not.toContain(editToken);
    expect(options).toMatchObject({
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
    });
    expect(JSON.parse(options.body)).toEqual({ action: "lookup", publicToken, editToken });
    expect(options.headers).not.toHaveProperty("Authorization");
  });
  it("rejects a response for a different physical card", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ...snapshot, card: { ...snapshot.card, publicToken: "b".repeat(32) } })),
        ),
    );
    await expect(new PostcardBuyerApi(config).lookup(publicToken)).rejects.toMatchObject({ code: "unexpected" });
  });
  it("rejects a frame extending outside the marker", () => {
    expect(
      buyerSnapshotSchema.safeParse({
        ...snapshot,
        card: { ...snapshot.card, frame: { x: 0.5, y: 0.3, width: 0.8, height: 0.4 } },
      }).success,
    ).toBe(false);
  });
  it("does not reveal raw service errors for an invalid activation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "activation_failed", message: "private database shop_id=secret" }), {
          status: 403,
        }),
      ),
    );
    const error = await new PostcardBuyerApi(config).claim(publicToken, "SHOP-CODE", editToken).catch((value) => value);
    expect(error).toBeInstanceOf(PostcardBuyerError);
    expect(error.message).not.toContain("private database");
    expect(error.message).toContain("код");
  });
  it("preserves rate-limit retry timing", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ code: "rate_limited", retryAfterSeconds: 60 }), { status: 429 }),
        ),
    );
    await expect(new PostcardBuyerApi(config).claim(publicToken, "CODE", editToken)).rejects.toMatchObject({
      code: "rate_limited",
      retryAfterSeconds: 60,
    });
  });
  it("never pretends an unconfigured or demo backend has accepted a claim", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      new PostcardBuyerApi({ authMode: "demo" }).claim(publicToken, "CODE", editToken),
    ).rejects.toMatchObject({ code: "backend_unavailable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("registers video only and refuses a signed upload to a different origin", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          uploadId: "10000000-0000-4000-8000-000000000001",
          video: { signedUrl: "https://other.example/storage/v1/object/upload/sign/videos-private/x?token=x" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const video = {
      name: "gift.mov",
      mimeType: "video/quicktime" as const,
      sizeBytes: 20,
      width: 1920,
      height: 1080,
      durationSeconds: 10,
      sha256: "a".repeat(64),
    };
    await expect(
      new PostcardBuyerApi(config).upload(
        publicToken,
        editToken,
        "10000000-0000-4000-8000-000000000002",
        "frame",
        video,
      ),
    ).rejects.toMatchObject({ code: "unexpected" });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.video.sha256).toBe(video.sha256);
    expect(payload).not.toHaveProperty("marker");
  });
  it("binds the bounded upload gateway to this card/upload and supplies its limited capability", async () => {
    const uploadId = "10000000-0000-4000-8000-000000000001";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          uploadId,
          video: {
            signedUrl: `https://khanzama.ru/functions/v1/postcard-buyer/upload/${publicToken}/${uploadId}`,
            headers: { "x-test": "yes" },
          },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const video = {
      name: "gift.mp4",
      mimeType: "video/mp4" as const,
      sizeBytes: 20,
      width: 1920,
      height: 1080,
      durationSeconds: 10,
      sha256: "a".repeat(64),
    };
    const result = await new PostcardBuyerApi(config).upload(
      publicToken,
      editToken,
      "10000000-0000-4000-8000-000000000002",
      "frame",
      video,
    );
    expect(result.video.headers).toMatchObject({
      "x-postcard-edit-token": editToken,
      apikey: config.supabasePublishableKey,
    });
    expect(result.video.signedUrl).not.toContain(editToken);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          uploadId,
          video: { signedUrl: `https://khanzama.ru/functions/v1/postcard-buyer/upload/${"b".repeat(32)}/${uploadId}` },
        }),
      ),
    );
    await expect(
      new PostcardBuyerApi(config).upload(
        publicToken,
        editToken,
        "10000000-0000-4000-8000-000000000002",
        "frame",
        video,
      ),
    ).rejects.toMatchObject({ code: "unexpected" });
  });
  it("accepts the grouped shop code printed on the insert without storing its formatting", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(snapshot)));
    vi.stubGlobal("fetch", fetchMock);
    await new PostcardBuyerApi(config).claim(publicToken, "abcd · ef12 - 3456", editToken);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).shopCode).toBe("ABCDEF123456");
  });
});
