import { webcrypto } from "node:crypto";
import { readFileSync } from "node:fs";
import { Blob as NodeBlob, File as NodeFile } from "node:buffer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { inspectBuyerVideo, videoMimeType } from "./postcardBuyerMedia";

const source = vi.hoisted(() => ({ inspect: vi.fn() }));
vi.mock("../../media/videoOptimization", () => ({ inspectVideoSource: source.inspect }));

const limits = { maxVideoBytes: 1024, maxVideoSeconds: 120 };
beforeEach(() => {
  source.inspect.mockReset();
  URL.createObjectURL = vi.fn(() => "blob:metadata-test");
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("buyer video validation", () => {
  it("rejects empty, oversized and unsupported media before decoding", async () => {
    await expect(inspectBuyerVideo(new File([], "empty.mp4", { type: "video/mp4" }), limits)).rejects.toThrow("пуст");
    await expect(
      inspectBuyerVideo(new File([new Uint8Array(2048)], "large.mp4", { type: "video/mp4" }), limits),
    ).rejects.toThrow("не больше");
    await expect(inspectBuyerVideo(new File(["test"], "image.jpg", { type: "image/jpeg" }), limits)).rejects.toThrow(
      "MP4",
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
  it("uses an allowed extension only when the camera export lacks a reliable MIME type", () => {
    expect(videoMimeType(new File(["test"], "camera.MOV"))).toBe("video/quicktime");
    expect(videoMimeType(new File(["test"], "not-video.mp4", { type: "image/jpeg" }))).toBeNull();
  });
  it("inspects actual dimensions/duration, hashes the original bytes and frees metadata URLs", async () => {
    vi.stubGlobal("crypto", webcrypto);
    const original = document.createElement.bind(document);
    let video: HTMLVideoElement | undefined;
    vi.spyOn(document, "createElement").mockImplementation((tag, options) => {
      const element = original(tag, options);
      if (tag === "video") {
        video = element as HTMLVideoElement;
        Object.defineProperties(video, {
          duration: { value: 12 },
          videoWidth: { value: 1920 },
          videoHeight: { value: 1080 },
        });
      }
      return element;
    });
    const file = new File(["test"], "gift.mp4", { type: "video/mp4" });
    Object.defineProperty(file, "arrayBuffer", { value: async () => new TextEncoder().encode("test").buffer });
    const result = inspectBuyerVideo(file, limits);
    video!.dispatchEvent(new Event("loadedmetadata"));
    await expect(result).resolves.toEqual({
      name: "gift.mp4",
      mimeType: "video/mp4",
      sizeBytes: 4,
      width: 1920,
      height: 1080,
      durationSeconds: 12,
      sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:metadata-test");
    expect(source.inspect).not.toHaveBeenCalled();
  });
  it("rejects overlong videos and handles cancellation without retaining object URLs", async () => {
    const original = document.createElement.bind(document);
    let video: HTMLVideoElement | undefined;
    vi.spyOn(document, "createElement").mockImplementation((tag, options) => {
      const element = original(tag, options);
      if (tag === "video") {
        video = element as HTMLVideoElement;
        Object.defineProperties(video, {
          duration: { value: 121 },
          videoWidth: { value: 1920 },
          videoHeight: { value: 1080 },
        });
      }
      return element;
    });
    const file = new File(["test"], "gift.mp4", { type: "video/mp4" });
    const tooLong = inspectBuyerVideo(file, limits);
    video!.dispatchEvent(new Event("loadedmetadata"));
    await expect(tooLong).rejects.toThrow("120 секунд");
    const abort = new AbortController();
    const pending = inspectBuyerVideo(file, limits, abort.signal);
    abort.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(source.inspect).not.toHaveBeenCalled();
  });
  it("falls back to actual container metadata when native decoding has no frame dimensions", async () => {
    vi.stubGlobal("crypto", webcrypto);
    source.inspect.mockResolvedValue({
      width: 1080,
      height: 608,
      durationSeconds: 9.5,
      videoCodec: "avc",
      audioCodec: "aac",
    });
    const { file, video } = unsupportedNativeVideo();
    const result = inspectBuyerVideo(file, limits);
    video().dispatchEvent(new Event("loadedmetadata"));
    await expect(result).resolves.toEqual({
      name: "gift.mp4",
      mimeType: "video/mp4",
      sizeBytes: 4,
      width: 1080,
      height: 608,
      durationSeconds: 9.5,
      sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    });
    expect(source.inspect).toHaveBeenCalledWith(file, false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:metadata-test");
  });
  it("reads the real MP4 fixture's 1080×608 container when native frame dimensions are zero", async () => {
    vi.stubGlobal("crypto", webcrypto);
    vi.stubGlobal("Blob", NodeBlob);
    const actual = await vi.importActual<typeof import("../../media/videoOptimization")>(
      "../../media/videoOptimization",
    );
    source.inspect.mockImplementation(actual.inspectVideoSource);
    const bytes = readFileSync("public/test-assets/test.mp4");
    const file = new NodeFile([bytes], "test.mp4", { type: "video/mp4" }) as unknown as File;
    const { video } = unsupportedNativeVideo();
    const result = inspectBuyerVideo(file, { maxVideoBytes: 100 * 1024 * 1024, maxVideoSeconds: 120 });
    video().dispatchEvent(new Event("loadedmetadata"));
    const metadata = await result;
    expect(metadata.width).toBe(1080);
    expect(metadata.height).toBe(608);
    expect(metadata.durationSeconds).toBeGreaterThan(0);
    expect(metadata.durationSeconds).toBeLessThanOrEqual(120);
    expect(source.inspect).toHaveBeenCalledWith(file, false);
    expect(metadata.sha256).toMatch(/^[a-f0-9]{64}$/);
  });
  it("reads container metadata after a native decoder error without fabricating dimensions", async () => {
    vi.stubGlobal("crypto", webcrypto);
    source.inspect.mockResolvedValue({
      width: 720,
      height: 1280,
      durationSeconds: 8,
      videoCodec: "hevc",
      audioCodec: "aac",
    });
    const { file, video } = unsupportedNativeVideo();
    const result = inspectBuyerVideo(file, limits);
    video().dispatchEvent(new Event("error"));
    await expect(result).resolves.toMatchObject({ width: 720, height: 1280, durationSeconds: 8 });
    expect(source.inspect).toHaveBeenCalledWith(file, false);
  });
  it.each([
    [{ width: 1080, height: 608, durationSeconds: 121 }, "120 секунд"],
    [{ width: 0, height: 608, durationSeconds: 9 }, "определить"],
    [{ width: 20000, height: 608, durationSeconds: 9 }, "16384"],
    [{ width: 1080, height: 608, durationSeconds: Number.NaN }, "определить"],
  ])("validates fallback metadata caps and real dimensions: %j", async (metadata, message) => {
    source.inspect.mockResolvedValue(metadata);
    const { file, video } = unsupportedNativeVideo();
    const result = inspectBuyerVideo(file, limits);
    video().dispatchEvent(new Event("loadedmetadata"));
    await expect(result).rejects.toThrow(message);
  });
  it("does not fall back past a native duration cap even when native dimensions are unavailable", async () => {
    const { file, video } = unsupportedNativeVideo(121);
    const result = inspectBuyerVideo(file, limits);
    video().dispatchEvent(new Event("loadedmetadata"));
    await expect(result).rejects.toThrow("120 секунд");
    expect(source.inspect).not.toHaveBeenCalled();
  });
  it("aborts a pending container inspection and ignores its late valid result", async () => {
    let resolveMetadata: ((value: { width: number; height: number; durationSeconds: number }) => void) | undefined;
    source.inspect.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMetadata = resolve;
        }),
    );
    const { file, video } = unsupportedNativeVideo();
    const controller = new AbortController();
    const result = inspectBuyerVideo(file, limits, controller.signal);
    video().dispatchEvent(new Event("loadedmetadata"));
    await vi.waitFor(() => expect(source.inspect).toHaveBeenCalledTimes(1));
    controller.abort();
    await expect(result).rejects.toMatchObject({ name: "AbortError" });
    resolveMetadata!({ width: 1080, height: 608, durationSeconds: 9 });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:metadata-test");
  });
});

function unsupportedNativeVideo(duration = 9) {
  const original = document.createElement.bind(document);
  let target: HTMLVideoElement | undefined;
  vi.spyOn(document, "createElement").mockImplementation((tag, options) => {
    const element = original(tag, options);
    if (tag === "video") {
      target = element as HTMLVideoElement;
      Object.defineProperties(target, {
        duration: { value: duration },
        videoWidth: { value: 0 },
        videoHeight: { value: 0 },
      });
    }
    return element;
  });
  const file = new File(["test"], "gift.mp4", { type: "video/mp4" });
  Object.defineProperty(file, "arrayBuffer", { value: async () => new TextEncoder().encode("test").buffer });
  return { file, video: () => target! };
}
