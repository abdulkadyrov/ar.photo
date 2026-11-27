import { describe, expect, it } from "vitest";
import { sampleMotion } from "./motion";

describe("repeatable source-camera motion", () => {
  it("is deterministic regardless of prior scenario sampling", () => {
    const expected = sampleMotion("hand", 2.41, 1, 1.23);
    sampleMotion("fast", 17.2, 3);
    expect(sampleMotion("hand", 2.41, 1, 1.23)).toEqual(expected);
    expect(sampleMotion("hand", 2.45, 1, 1.27)).not.toEqual(expected);
  });
  it.each(["hand", "fast", "pan", "tilt", "zoom"])("zero strength makes %s stationary", (scenario) => {
    const first = sampleMotion(scenario, 0, 0);
    for (const time of [0.01, 0.8, 1.65, 3.2, 33.7]) {
      const actual = sampleMotion(scenario, time, 0)!;
      for (const key of Object.keys(actual) as (keyof typeof actual)[])
        expect(actual[key]).toBeCloseTo(first![key], 12);
    }
  });
  it.each(["hand", "fast", "pan", "tilt", "zoom"])(
    "keeps %s bounded across slow and fast source clocks",
    (scenario) => {
      for (const speed of [0.25, 1, 4])
        for (const strength of [0, 1, 3])
          for (let frame = 0; frame < 600; frame++) {
            const wall = frame / 30;
            const pose = sampleMotion(scenario, wall * speed, strength, wall * Math.min(speed, 12 / 11.1))!;
            expect(Object.values(pose).every(Number.isFinite)).toBe(true);
            expect(Math.abs(pose.pitch)).toBeLessThanOrEqual(65);
            expect(Math.abs(pose.yaw)).toBeLessThanOrEqual(45);
            expect(Math.abs(pose.roll)).toBeLessThanOrEqual(20);
            expect(Math.abs(pose.offset)).toBeLessThanOrEqual(0.65);
            expect(pose.distance).toBeGreaterThanOrEqual(2.1);
            expect(pose.distance).toBeLessThanOrEqual(5);
          }
    },
  );
  it("fast reversals include holds and do not jump at the repeat seam", () => {
    expect(sampleMotion("fast", 0.1)).toEqual(sampleMotion("fast", 0.5));
    expect(sampleMotion("fast", 1.1)).toEqual(sampleMotion("fast", 1.3));
    expect(sampleMotion("fast", 1.8)?.offset).toBeLessThan(0);
    expect(sampleMotion("fast", 3.2 - 1e-6)).toEqual(sampleMotion("fast", 3.2 + 1e-6));
  });
});
