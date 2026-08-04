import { beforeEach, describe, expect, it, vi } from "vitest";
import { prepareMediaFile } from "./mediaValidation";
import { inspectVideoSource, optimizeVideoFile } from "./videoOptimization";

vi.mock("./videoOptimization", () => ({
  clientVideoHardLimitBytes: 50 * 1024 * 1024,
  inspectVideoSource: vi.fn(),
  optimizeVideoFile: vi.fn(),
  VideoOptimizationUnavailableError: class VideoOptimizationUnavailableError extends Error {},
}));

describe("media video transcoding", () => {
  beforeEach(() => {
    vi.mocked(inspectVideoSource)
      .mockReset()
      .mockResolvedValueOnce({
        width: 640,
        height: 360,
        durationSeconds: 1,
        videoCodec: "vp8",
        audioCodec: "opus",
      })
      .mockResolvedValueOnce({
        width: 640,
        height: 360,
        durationSeconds: 1,
        videoCodec: "avc",
        audioCodec: "aac",
      });
    vi.mocked(optimizeVideoFile)
      .mockReset()
      .mockResolvedValue({
        file: new File(["....ftypisom....avc1....mp4a"], "clip.optimized.mp4", { type: "video/mp4" }),
        strategy: "webcodecs-h264",
      });
  });

  it("converts a browser-decodable non-MP4 video before upload", async () => {
    const source = new File(["webm-source"], "clip.webm", { type: "video/webm" });
    const prepared = await prepareMediaFile(source);

    expect(optimizeVideoFile).toHaveBeenCalledWith(
      source,
      expect.objectContaining({ width: 640, height: 360, videoCodec: "h264", audioCodec: "aac" }),
      undefined,
      true,
    );
    expect(prepared).toMatchObject({
      kind: "video",
      file: expect.objectContaining({ name: "clip.optimized.mp4", type: "video/mp4" }),
      metadata: {
        width: 640,
        height: 360,
        durationSeconds: 1,
        videoCodec: "h264",
        audioCodec: "aac",
        optimization: { strategy: "webcodecs-h264", optimized: true },
      },
    });
  });
});
