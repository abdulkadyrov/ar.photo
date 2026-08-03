import { describe, expect, it } from "vitest";
import { classifyMediaFile, hasMp4Signature, inspectMp4CodecTokens, prepareMediaFile } from "./mediaValidation";

describe("media validation", () => {
  it("classifies MP4 separately from marker images", () => {
    expect(classifyMediaFile(new File(["x"], "clip.mp4", { type: "video/mp4" }))).toBe("video");
    expect(classifyMediaFile(new File(["x"], "photo.jpg", { type: "image/jpeg" }))).toBe("marker");
  });

  it("recognizes an ISO BMFF signature and H.264/AAC tokens", () => {
    const bytes = new TextEncoder().encode("....ftypisom....avc1....mp4a");
    expect(hasMp4Signature(bytes)).toBe(true);
    expect(inspectMp4CodecTokens(bytes)).toEqual({ videoCodec: "h264", audioCodec: "aac" });
    expect(inspectMp4CodecTokens(new TextEncoder().encode("....hvc1....mp4a"))).toBeNull();
  });

  it("rejects a spoofed MP4 before browser decoding", async () => {
    const file = new File(["not-an-mp4"], "clip.mp4", { type: "video/mp4" });
    await expect(prepareMediaFile(file)).rejects.toMatchObject({
      code: "spoofed_type",
    });
  });

  it("rejects MIME spoofing for markers", async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "marker.png", { type: "image/png" });
    await expect(prepareMediaFile(file)).rejects.toMatchObject({
      code: "spoofed_type",
    });
  });
});
