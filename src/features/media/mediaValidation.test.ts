import { describe, expect, it } from "vitest";
import {
  classifyMediaFile,
  containedDimensions,
  hasMp4Signature,
  inspectMp4CodecTokens,
  prepareMediaFile,
} from "./mediaValidation";

describe("media validation", () => {
  it("classifies videos by MIME or extension without requiring MP4", () => {
    expect(classifyMediaFile(new File(["x"], "clip.mp4", { type: "video/mp4" }))).toBe("video");
    expect(classifyMediaFile(new File(["x"], "clip.mov", { type: "video/quicktime" }))).toBe("video");
    expect(classifyMediaFile(new File(["x"], "clip.mkv", { type: "" }))).toBe("video");
    expect(classifyMediaFile(new File(["x"], "photo.jpg", { type: "image/jpeg" }))).toBe("marker");
  });

  it("recognizes an ISO BMFF signature and H.264/AAC tokens", () => {
    const bytes = new TextEncoder().encode("....ftypisom....avc1....mp4a");
    expect(hasMp4Signature(bytes)).toBe(true);
    expect(inspectMp4CodecTokens(bytes)).toEqual({ videoCodec: "h264", audioCodec: "aac" });
    expect(inspectMp4CodecTokens(new TextEncoder().encode("....hvc1....mp4a"))).toBeNull();
  });

  it("rejects a file that cannot be parsed as video", async () => {
    const file = new File(["not-an-mp4"], "clip.mp4", { type: "video/mp4" });
    await expect(prepareMediaFile(file)).rejects.toMatchObject({
      code: "unsupported_codec",
    });
  });

  it("downscales marker dimensions without changing their aspect ratio", () => {
    expect(containedDimensions(6000, 4000, 2560)).toEqual({ width: 2560, height: 1707 });
    expect(containedDimensions(640, 480, 2560)).toEqual({ width: 640, height: 480 });
  });
});
