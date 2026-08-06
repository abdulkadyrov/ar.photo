import { describe, expect, it } from "vitest";
import { preferredRecordingMimeType, recordingCanvasSize } from "./arRecording";

describe("AR screen recording", () => {
  it("prefers an iPhone-friendly MP4 recording when available", () => {
    const recorder = {
      isTypeSupported: (value: string) => value === "video/mp4",
    } as unknown as typeof MediaRecorder;

    expect(preferredRecordingMimeType(recorder)).toBe("video/mp4");
  });

  it("falls back to WebM and bounds portrait recording resolution", () => {
    const recorder = {
      isTypeSupported: (value: string) => value === "video/webm;codecs=vp8,opus",
    } as unknown as typeof MediaRecorder;

    expect(preferredRecordingMimeType(recorder)).toBe("video/webm;codecs=vp8,opus");
    expect(recordingCanvasSize(390, 844, 3)).toEqual({ width: 780, height: 1688 });
  });
});
