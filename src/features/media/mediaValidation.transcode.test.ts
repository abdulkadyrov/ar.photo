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

  it("uploads the untouched source for secure server transcoding when Safari drops audio", async () => {
    vi.mocked(inspectVideoSource).mockReset().mockResolvedValue({
      width: 1920,
      height: 1080,
      durationSeconds: 12,
      videoCodec: "hevc",
      audioCodec: "aac",
    });
    vi.mocked(optimizeVideoFile).mockRejectedValue(new Error("Браузер не смог сохранить аудиодорожку видео"));

    const source = new File(["quicktime-source"], "iphone.mov", { type: "video/quicktime" });
    const prepared = await prepareMediaFile(source);

    expect(prepared).toMatchObject({
      kind: "video",
      file: expect.objectContaining({ name: "iphone.source.mp4", type: "video/mp4" }),
      metadata: {
        width: 1920,
        height: 1080,
        durationSeconds: 12,
        videoCodec: "source",
        audioCodec: "source",
        serverTranscodeRequired: true,
        sourceVideoCodec: "hevc",
        sourceAudioCodec: "aac",
        optimization: { strategy: "server-transcode", optimized: false },
      },
    });
    expect(await prepared.file.text()).toBe("quicktime-source");
  });

  it("accepts a video for server inspection when the browser cannot decode its codec", async () => {
    vi.mocked(inspectVideoSource).mockReset().mockRejectedValue(new Error("unsupported codec"));
    const source = new File(["mkv-source"], "camera.mkv", { type: "video/x-matroska" });

    const prepared = await prepareMediaFile(source);

    expect(optimizeVideoFile).not.toHaveBeenCalled();
    expect(prepared).toMatchObject({
      kind: "video",
      metadata: {
        width: null,
        height: null,
        durationSeconds: null,
        serverTranscodeRequired: true,
        optimization: { strategy: "server-transcode" },
      },
    });
  });
});
