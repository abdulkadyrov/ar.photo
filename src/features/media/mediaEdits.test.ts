import { describe, expect, it } from "vitest";
import {
  cropForAspect,
  editedAspect,
  parseVideoEdits,
  segmentsDuration,
  splitSegment,
  aspectPresets,
} from "./mediaEdits";

describe("media editing contract", () => {
  it("fits every format within both portrait and landscape sources without stretching", () => {
    for (const size of [
      { width: 1122, height: 1402 },
      { width: 1920, height: 1080 },
    ]) {
      for (const { ratio } of aspectPresets) {
        for (const zoom of [1, 2, 4]) {
          const crop = cropForAspect(size, ratio, zoom, 1, 0);
          expect(editedAspect(size, crop)).toBeCloseTo(ratio, 10);
          expect(crop.x + crop.width).toBeLessThanOrEqual(1);
          expect(crop.y + crop.height).toBeLessThanOrEqual(1);
          expect(() => parseVideoEdits({ version: 1, crop }, 10)).not.toThrow();
        }
      }
    }
  });
  it("cuts out a middle pause without changing the source time coordinates", () => {
    const parts = splitSegment(splitSegment([{ start: 0, end: 15 }], 4), 9);
    const remaining = parts.filter((_, i) => i !== 1);
    expect(remaining).toEqual([
      { start: 0, end: 4 },
      { start: 9, end: 15 },
    ]);
    expect(segmentsDuration(remaining)).toBe(10);
    expect(parseVideoEdits({ version: 1, segments: remaining }, 15).segments).toEqual(remaining);
  });
  it.each([
    { version: 2 },
    { version: 1, crop: { x: -1, y: 0, width: 1, height: 1 } },
    { version: 1, crop: { x: 0, y: 0, width: NaN, height: 1 } },
    { version: 1, crop: { x: "1;movie=secret", y: 0, width: 1, height: 1 } },
    { version: 1, segments: [] },
    { version: 1, segments: [{ start: 0, end: 11 }] },
    {
      version: 1,
      segments: [
        { start: 4, end: 6 },
        { start: 5, end: 8 },
      ],
    },
    { version: 1, segments: [{ start: 3, end: 3.01 }] },
  ])("rejects malformed edit instructions %#", (edits) => expect(() => parseVideoEdits(edits, 10)).toThrow());
});
