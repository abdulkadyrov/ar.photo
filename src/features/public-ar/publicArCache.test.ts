import "fake-indexeddb/auto";
import { Blob as NativeBlob } from "node:buffer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicArManifest } from "./publicManifest";
import {
  cachePublicArProject,
  loadCachedPublicArProject,
  loadPublicArVideo,
  materializeCachedPublicArProject,
  publicArAssetFingerprint,
  refreshedPlaybackTarget,
} from "./publicArCache";
const manifest: PublicArManifest = {
  version: 1,
  title: "Memory",
  marker: { width: 1200, height: 800, aspectRatio: 1.5 },
  behavior: { autoplay: true, loop: true, markerLost: "pause_hide", audioDefault: "muted" },
  fallbackEnabled: true,
  assets: {
    posterUrl: "https://cache.test/one/poster.webp?token=first",
    videoUrl: "https://cache.test/one/video.mp4?token=first",
    trackingAssetUrl: "https://cache.test/one/target.mind?token=first",
  },
  signedUrlsExpireAt: "2026-08-06T15:00:00.000Z",
};
const response = () =>
  new Response(new Uint8Array([1, 2, 3, 4]), { headers: { "content-type": "application/octet-stream" } });

describe("public AR device cache", () => {
  beforeEach(() => vi.stubGlobal("Blob", NativeBlob));
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it("bootstraps recognition only, then reuses each video across signed URL refreshes", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () => response());
    const steps: number[] = [];
    const cached = await cachePublicArProject("cache-test", manifest, (step) => steps.push(step));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(String(fetch.mock.calls[0][0])).toContain("target.mind");
    expect(cached.targets[0].video).toBeUndefined();
    expect(steps[0]).toBe(1);
    expect(steps.at(-1)).toBe(4);
    const first = await loadPublicArVideo(manifest.assets.videoUrl);
    const second = await loadPublicArVideo(manifest.assets.videoUrl.replace("first", "second"));
    expect(first.size).toBe(4);
    expect(second.size).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(await loadCachedPublicArProject("cache-test", manifest)).not.toBeNull();
  });
  it("prepares 50 markers with at most three concurrent requests and no video/poster requests", async () => {
    let active = 0,
      peak = 0;
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return response();
    });
    const target = {
      targetId: "target-0",
      title: manifest.title,
      marker: manifest.marker,
      behavior: manifest.behavior,
      fallbackEnabled: true,
      assets: manifest.assets,
    };
    const album: PublicArManifest = {
      ...manifest,
      version: 2,
      targets: Array.from({ length: 50 }, (_, i) => ({
        ...target,
        targetId: `target-${i}`,
        assets: {
          ...target.assets,
          trackingAssetUrl: `https://cache.test/fifty/${i}.mind`,
          videoUrl: `https://cache.test/fifty/${i}.mp4`,
        },
      })),
    };
    const cached = await cachePublicArProject("fifty", album, () => undefined);
    expect(cached.targets).toHaveLength(50);
    expect(peak).toBeLessThanOrEqual(3);
    expect(fetch).toHaveBeenCalledTimes(50);
    expect(fetch.mock.calls.every(([url]) => String(url).endsWith(".mind"))).toBe(true);
  });
  it("restores an evicted in-memory video from IndexedDB without another download", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () => response());
    for (const name of ["first", "second", "third", "fourth"])
      await loadPublicArVideo(`https://cache.test/persistent/${name}.mp4`);
    const restored = await loadPublicArVideo("https://cache.test/persistent/first.mp4?token=refreshed");
    expect(restored.size).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(4);
  });
  it("keeps unchanged videos reusable when a different video is republished", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () => response());
    await loadPublicArVideo("https://cache.test/revision/photo-one-v1.mp4");
    await loadPublicArVideo("https://cache.test/revision/photo-two-v1.mp4");
    await loadPublicArVideo("https://cache.test/revision/photo-two-v2.mp4");
    await loadPublicArVideo("https://cache.test/revision/photo-one-v1.mp4?token=new");
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(
      publicArAssetFingerprint({
        ...manifest,
        assets: { ...manifest.assets, videoUrl: "https://cache.test/revision/new.mp4" },
      }),
    ).not.toBe(publicArAssetFingerprint(manifest));
  });
  it("does not persist a failed or oversized response and can retry", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
      .mockResolvedValueOnce(new Response("huge", { headers: { "content-length": String(501 * 1024 * 1024) } }))
      .mockImplementation(async () => response());
    const url = "https://cache.test/retry/video.mp4";
    await expect(loadPublicArVideo(url)).rejects.toMatchObject({ status: 403 });
    await expect(loadPublicArVideo(url)).rejects.toMatchObject({ name: "QuotaExceededError" });
    await expect(loadPublicArVideo(url)).resolves.toHaveProperty("size", 4);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("releases only recognition object URLs and does not fabricate signed URL expiry", async () => {
    const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:marker");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const result = materializeCachedPublicArProject(manifest, {
      version: 3,
      publicSlug: "one",
      fingerprint: "",
      savedAt: "",
      targets: [{ trackingAsset: new Blob(["mind"]) }],
    });
    expect(create).toHaveBeenCalledTimes(1);
    expect(result.manifest.assets.videoUrl).toBe(manifest.assets.videoUrl);
    expect(result.manifest.signedUrlsExpireAt).toBe(manifest.signedUrlsExpireAt);
    result.dispose();
    expect(revoke).toHaveBeenCalledWith("blob:marker");
  });
  it("keeps the QR pairing when only a video revision changes", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(async () => response());
    const first = {
      ...manifest,
      assets: { ...manifest.assets, trackingAssetUrl: "https://cache.test/pairing/target.mind" },
    };
    await cachePublicArProject("pairing", first, () => undefined);
    const changed = { ...first, assets: { ...first.assets, videoUrl: "https://cache.test/pairing/video-v2.mp4" } };
    expect(await loadCachedPublicArProject("pairing", changed)).not.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("continues playback and reports unavailable durable storage", async () => {
    vi.stubGlobal("indexedDB", undefined);
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => response());
    const unavailable = vi.fn();
    expect(
      (await loadPublicArVideo("https://cache.test/no-storage/video.mp4", undefined, undefined, unavailable)).size,
    ).toBe(4);
    expect(unavailable).toHaveBeenCalledOnce();
  });
  it("keeps a video's binding to its photograph when an album is reordered", () => {
    const original = {
      ...manifest,
      targetId: "target-1",
      assets: { ...manifest.assets, trackingAssetUrl: "https://cache.test/binding/photo-two.mind" },
    };
    const reordered: PublicArManifest = {
      ...manifest,
      assets: {
        ...manifest.assets,
        trackingAssetUrl: original.assets.trackingAssetUrl,
        videoUrl: "https://cache.test/binding/photo-two.mp4",
      },
    };
    expect(refreshedPlaybackTarget(reordered, original)?.assets.videoUrl).toContain("photo-two.mp4");
    expect(refreshedPlaybackTarget(manifest, original)).toBeUndefined();
    expect(
      refreshedPlaybackTarget({ ...reordered, videoViewport: { x: 0, y: 0, width: 0.5, height: 1 } }, original),
    ).toBeUndefined();
  });
});
