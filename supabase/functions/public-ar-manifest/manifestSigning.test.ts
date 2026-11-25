import { describe, expect, it, vi } from "vitest";
import { signManifestAssets } from "./manifestSigning";
import type { PublicManifestSource } from "./manifest";
const sources = Array.from(
  { length: 50 },
  (_, i) =>
    ({
      target_index: i,
      title: "Photo",
      marker_width: 640,
      marker_height: 480,
      autoplay: true,
      loop_video: true,
      marker_lost_behavior: "pause_hide",
      audio_default: "muted",
      fallback_enabled: true,
      tracking_bucket: "generated-private",
      tracking_path: `item-${i}/target.mind`,
      video_bucket: "generated-private",
      video_path: `item-${i}/video.mp4`,
      poster_bucket: "generated-private",
      poster_path: `item-${i}/poster.webp`,
    }) satisfies PublicManifestSource,
);
describe("album signing", () => {
  it("signs a 50-photo album once per bucket and preserves target order", async () => {
    const sign = vi.fn(async (paths: string[], ttl: number) => ({
      data: paths.map((path) => ({ path, error: null, signedUrl: `https://signed.test/${path}?ttl=${ttl}` })).reverse(),
      error: null,
    }));
    const from = vi.fn(() => ({ createSignedUrls: sign }));
    const assets = await signManifestAssets({ from }, sources, 300);
    expect(from).toHaveBeenCalledTimes(1);
    expect(sign).toHaveBeenCalledTimes(1);
    expect(sign.mock.calls[0][0]).toHaveLength(150);
    expect(assets[49].videoUrl).toContain("item-49/video.mp4");
    expect(assets[0].trackingAssetUrl).toContain("item-0/target.mind");
  });
  it("fails closed when any private asset could not be signed", async () => {
    const from = () => ({
      createSignedUrls: async () => ({
        data: [{ path: sources[0].video_path, signedUrl: null, error: "missing" }],
        error: null,
      }),
    });
    await expect(signManifestAssets({ from }, sources.slice(0, 1), 300)).rejects.toThrow();
  });
  it("rejects oversized albums before issuing storage requests", async () => {
    const from = vi.fn();
    await expect(signManifestAssets({ from }, [...sources, sources[0]], 300)).rejects.toThrow();
    expect(from).not.toHaveBeenCalled();
  });
});
