import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PublicArManifest } from "./publicManifest";
import { cachePublicArProject, loadCachedPublicArProject, publicArAssetFingerprint } from "./publicArCache";

const manifest: PublicArManifest = {
  version: 1,
  title: "Memory",
  marker: { width: 1200, height: 800, aspectRatio: 1.5 },
  behavior: { autoplay: true, loop: true, markerLost: "pause_hide", audioDefault: "user_enabled" },
  fallbackEnabled: true,
  assets: {
    posterUrl: "https://cdn.test/items/one/poster.webp?token=first",
    videoUrl: "https://cdn.test/items/one/video.mp4?token=first",
    trackingAssetUrl: "https://cdn.test/items/one/target.mind?token=first",
  },
  signedUrlsExpireAt: "2026-08-06T15:00:00.000Z",
};

describe("public AR device cache", () => {
  afterEach(() => vi.restoreAllMocks());

  it("downloads four logical stages and reuses blobs across signed URL refreshes", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(new Blob(["poster"], { type: "image/webp" })))
      .mockResolvedValueOnce(new Response(new Blob(["video"], { type: "video/mp4" })))
      .mockResolvedValueOnce(new Response(new Blob(["mind-data"], { type: "application/octet-stream" })));
    const steps: number[] = [];

    const cached = await cachePublicArProject("cache-test", manifest, (step) => steps.push(step));
    const refreshedManifest = {
      ...manifest,
      assets: {
        posterUrl: `${manifest.assets.posterUrl.split("?")[0]}?token=second`,
        videoUrl: `${manifest.assets.videoUrl.split("?")[0]}?token=second`,
        trackingAssetUrl: `${manifest.assets.trackingAssetUrl.split("?")[0]}?token=second`,
      },
    };
    const restored = await loadCachedPublicArProject("cache-test", refreshedManifest);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(steps).toEqual([1, 2, 3, 4]);
    expect(restored?.fingerprint).toBe(cached.fingerprint);
    expect(restored?.video.size).toBeGreaterThan(0);
  });

  it("invalidates a cache entry when a republished asset path changes", () => {
    const changed = {
      ...manifest,
      assets: { ...manifest.assets, videoUrl: "https://cdn.test/items/two/video.mp4?token=next" },
    };

    expect(publicArAssetFingerprint(changed)).not.toBe(publicArAssetFingerprint(manifest));
  });
});
