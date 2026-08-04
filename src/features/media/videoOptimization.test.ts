import { describe, expect, it } from "vitest";
import {
  audioConversionOptions,
  clientVideoTargetBytes,
  containedVideoSize,
  shouldOptimizeVideo,
  targetVideoBitrate,
} from "./videoOptimization";

function videoFile(size: number) {
  return new File([new Uint8Array(size)], "video.mp4", { type: "video/mp4" });
}

describe("video optimization policy", () => {
  it("keeps an already efficient 1080p video", () => {
    expect(shouldOptimizeVideo(videoFile(7 * 1024 * 1024), { width: 1920, height: 1080, durationSeconds: 30 })).toBe(
      false,
    );
  });

  it("optimizes files above the client target and oversized frames", () => {
    expect(
      shouldOptimizeVideo(videoFile(clientVideoTargetBytes + 1), {
        width: 1920,
        height: 1080,
        durationSeconds: 120,
      }),
    ).toBe(true);
    expect(shouldOptimizeVideo(videoFile(4 * 1024 * 1024), { width: 3840, height: 2160, durationSeconds: 30 })).toBe(
      true,
    );
  });

  it("uses bounded even dimensions and adaptive bitrates", () => {
    expect(containedVideoSize(3840, 2160, 1920)).toEqual({ width: 1920, height: 1080 });
    expect(containedVideoSize(1081, 1921, 1920)).toEqual({ width: 1080, height: 1920 });
    expect(targetVideoBitrate({ width: 1280, height: 720 })).toBeLessThan(
      targetVideoBitrate({ width: 1920, height: 1080 }),
    );
  });

  it("keeps AAC passthrough available for Safari", () => {
    expect(audioConversionOptions()).toEqual({ codec: "aac", forceTranscode: false });
    expect(audioConversionOptions()).not.toHaveProperty("bitrate");
    expect(audioConversionOptions()).not.toHaveProperty("quality");
  });
});
