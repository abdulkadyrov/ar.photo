import { describe, expect, it } from "vitest";
import {
  corsHeaders,
  createPublicManifest,
  extractPublicSlug,
  parseAllowedOrigins,
  requestNetworkIdentifier,
  sha256Hex,
  type PublicManifestSource,
} from "./manifest";

const slug = "ab".repeat(18);
const source: PublicManifestSource = {
  target_index: 0,
  title: "Выпускной портрет",
  marker_width: 1600,
  marker_height: 1200,
  autoplay: true,
  loop_video: false,
  marker_lost_behavior: "pause_hide",
  audio_default: "user_enabled",
  fallback_enabled: true,
  tracking_bucket: "generated-private",
  tracking_path: "accounts/internal/target.mind",
  video_bucket: "videos-private",
  video_path: "accounts/internal/video.mp4",
  poster_bucket: "generated-private",
  poster_path: "accounts/internal/poster.webp",
};

describe("public AR manifest helpers", () => {
  it("accepts only the 144-bit lowercase public slug contract", () => {
    expect(extractPublicSlug(`https://example.test/functions/v1/public-ar-manifest/${slug}`)).toBe(slug);
    expect(extractPublicSlug("https://example.test/functions/v1/public-ar-manifest/demo")).toBeNull();
    expect(extractPublicSlug(`https://example.test/functions/v1/public-ar-manifest/${slug.toUpperCase()}`)).toBeNull();
  });

  it("uses only the first forwarded network identifier", () => {
    expect(requestNetworkIdentifier(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(requestNetworkIdentifier(new Headers())).toBe("missing");
  });

  it("hashes identifiers deterministically without retaining plaintext", async () => {
    const digest = await sha256Hex("salt|203.0.113.7");
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).toBe(await sha256Hex("salt|203.0.113.7"));
    expect(digest).not.toContain("203.0.113.7");
  });

  it("allows configured HTTPS and local origins only", () => {
    const allowed = parseAllowedOrigins("https://ar.example, http://127.0.0.1:5173, javascript:alert(1)");
    expect(corsHeaders("https://ar.example/path", allowed)?.["access-control-allow-origin"]).toBe("https://ar.example");
    expect(corsHeaders("https://evil.example", allowed)).toBeNull();
  });

  it("maps only the minimal public contract", () => {
    const manifest = createPublicManifest(
      [source],
      [
        {
          trackingAssetUrl: "https://storage.test/tracking?token=one",
          videoUrl: "https://storage.test/video?token=two",
          posterUrl: "https://storage.test/poster?token=three",
        },
      ],
      "2026-08-03T00:05:00.000Z",
    );
    const serialized = JSON.stringify(manifest);

    expect(manifest.marker.aspectRatio).toBe(4 / 3);
    expect(manifest.behavior.audioDefault).toBe("user_enabled");
    expect(serialized).not.toContain("accounts/internal");
    expect(serialized).not.toContain("generated-private");
    expect(serialized).not.toContain("account_id");
  });

  it("returns an ordered multi-target manifest for one shared QR", () => {
    const manifest = createPublicManifest(
      [source, { ...source, target_index: 1, title: "Второе фото" }],
      [
        {
          trackingAssetUrl: "https://storage.test/one.mind",
          videoUrl: "https://storage.test/one.mp4",
          posterUrl: "https://storage.test/one.webp",
        },
        {
          trackingAssetUrl: "https://storage.test/two.mind",
          videoUrl: "https://storage.test/two.mp4",
          posterUrl: "https://storage.test/two.webp",
        },
      ],
      "2026-08-03T00:05:00.000Z",
    );

    expect(manifest.version).toBe(2);
    expect(manifest.targets).toHaveLength(2);
    expect(manifest.targets?.[1].title).toBe("Второе фото");
  });
});
