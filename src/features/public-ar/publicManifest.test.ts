import { afterEach, describe, expect, it, vi } from "vitest";
import {
  initialArMuted,
  loadPublicManifest,
  manifestRefreshDelay,
  parsePublicArManifest,
  publicArTargets,
  PublicManifestError,
} from "./publicManifest";

describe("public AR manifest client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("provides the local demo manifest without a network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const manifest = await loadPublicManifest("demo");

    expect(manifest.title).toBe("Демо AR Photo");
    expect(manifest.marker).toEqual({ width: 2742, height: 1542, aspectRatio: 2742 / 1542 });
    expect(manifest.assets.trackingAssetUrl).toContain("test.mind");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("starts with sound after the user launches an audio-enabled item", async () => {
    const manifest = await loadPublicManifest("demo");
    expect(initialArMuted(manifest)).toBe(true);
    expect(
      initialArMuted({
        ...manifest,
        behavior: { ...manifest.behavior, audioDefault: "user_enabled" },
      }),
    ).toBe(false);
  });

  it("does not invent public content for an unknown demo slug", async () => {
    await expect(loadPublicManifest("missing")).rejects.toMatchObject({
      code: "not_found",
    } satisfies Partial<PublicManifestError>);
  });

  it("opens a locally published 144-bit demo slug without a network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(loadPublicManifest("a".repeat(36))).resolves.toMatchObject({ title: "Демо AR Photo" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refreshes signed URLs 45 seconds before expiry", () => {
    expect(manifestRefreshDelay("2026-08-03T00:05:00.000Z", Date.parse("2026-08-03T00:00:00.000Z"))).toBe(255_000);
    expect(manifestRefreshDelay("2026-08-03T00:00:30.000Z", Date.parse("2026-08-03T00:00:00.000Z"))).toBe(0);
  });

  it("preserves the optional postcard window through the single-target contract", async () => {
    const legacy = await loadPublicManifest("demo");
    expect(publicArTargets(legacy)[0]).not.toHaveProperty("videoViewport");
    const videoViewport = { x: 0.08, y: 0.22, width: 0.84, height: 0.5 };
    const manifest = parsePublicArManifest({ ...legacy, videoViewport });
    expect(publicArTargets(manifest)[0].videoViewport).toEqual(videoViewport);
    expect(publicArTargets(manifest)[0].marker).toEqual(legacy.marker);
  });

  it("accepts bounded windows per target and rejects unsafe window metadata", async () => {
    const legacy = await loadPublicManifest("demo");
    const first = publicArTargets(legacy)[0];
    const frame = { x: 0.1, y: 0.2, width: 0.8, height: 0.5 };
    const bundle = parsePublicArManifest({
      ...legacy,
      version: 2,
      targets: [first, { ...first, targetId: "target-1", videoViewport: frame }],
    });
    expect(publicArTargets(bundle)[1].videoViewport).toEqual(frame);
    for (const videoViewport of [
      { ...frame, x: -0.1 },
      { ...frame, y: 0.8 },
      { ...frame, width: 0 },
      { ...frame, height: Number.POSITIVE_INFINITY },
      { ...frame, shopCode: "never-public" },
    ])
      expect(() => parsePublicArManifest({ ...legacy, videoViewport })).toThrow(PublicManifestError);
  });
});
