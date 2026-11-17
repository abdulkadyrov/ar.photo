import { describe, expect, it } from "vitest";
import { crmFrameFilter } from "./crmFrame.js";
describe("CRM A4 video frame", () => {
  it("preserves existing non-CRM videos", () => expect(crmFrameFilter(undefined)).toBe(""));
  it("crops both A4 orientations without stretching", () => {
    expect(crmFrameFilter("a4-portrait")).toContain("scale=1260:1782:force_original_aspect_ratio=increase");
    expect(crmFrameFilter("a4-portrait")).toContain("crop=1260:1782");
    expect(crmFrameFilter("a4-landscape")).toContain("crop=1782:1260");
  });
  it("rejects untrusted filter text", () => expect(() => crmFrameFilter("crop=1:1")).toThrow());
});
