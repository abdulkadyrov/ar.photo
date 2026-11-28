import { describe, expect, it } from "vitest";
import { createHybridPlanarTracker } from "./hybridPlanarTracking";
import type { GrayFrame } from "./opticalFlow";
import type { Quad } from "./planarTracking";

const width = 240,
  height = 320;
const quad: Quad = [
  { x: 0.12, y: 0.12 },
  { x: 0.88, y: 0.12 },
  { x: 0.88, y: 0.88 },
  { x: 0.12, y: 0.88 },
];
function frame(dx = 0, dy = 0): GrayFrame {
  return {
    width,
    height,
    data: Float32Array.from({ length: width * height }, (_, i) => {
      const x = (i % width) - dx,
        y = Math.floor(i / width) - dy;
      return (
        128 +
        37 * Math.sin(x * 0.43 + y * 0.13) +
        34 * Math.sin(y * 0.57 - x * 0.12) +
        27 * Math.cos(x * 0.23 + y * 0.39)
      );
    }),
  };
}
const shifted = (dx: number, dy: number): Quad =>
  quad.map((p) => ({ x: p.x + dx / width, y: p.y + dy / height })) as Quad;
function maximumError(a: Quad, b: Quad) {
  return Math.max(...a.map((p, i) => Math.hypot((p.x - b[i].x) * width, (p.y - b[i].y) * height)));
}

describe("hybrid planar tracker", () => {
  it("requires a recognized reference for acquisition, and reset discards its identity", () => {
    const tracker = createHybridPlanarTracker();
    expect(tracker.sample(frame(), 0, null)).toBeNull();
    expect(tracker.sample(frame(), 33, quad)?.source).toBe("reference");
    tracker.reset();
    expect(tracker.sample(frame(), 66, null)).toBeNull();
  });

  it("moves with the camera through a brief reference loss instead of freezing the old quad", () => {
    const tracker = createHybridPlanarTracker();
    tracker.sample(frame(), 0, quad);
    const result = tracker.sample(frame(2.4, -1.7), 33, null);
    expect(result?.source).toBe("flow");
    expect(result!.flowPoints).toBeGreaterThan(20);
    expect(maximumError(result!.corners, shifted(2.4, -1.7))).toBeLessThan(0.45);
    expect(maximumError(result!.corners, quad)).toBeGreaterThan(2);
  });

  it("consumes each captured image once and refuses backward timestamps", () => {
    const tracker = createHybridPlanarTracker();
    const result = tracker.sample(frame(), 100, quad);
    expect(tracker.sample(frame(20), 100, shifted(20, 0))).toBe(result);
    expect(tracker.sample(frame(20), 50, shifted(20, 0))).toBe(result);
    const next = tracker.sample(frame(2), 133, null);
    expect(maximumError(next!.corners, shifted(2, 0))).toBeLessThan(0.45);
  });

  it("expires a smoothly tracked but unverified target rather than drifting indefinitely", () => {
    const tracker = createHybridPlanarTracker({ maxUnverifiedMs: 80 });
    tracker.sample(frame(), 0, quad);
    expect(tracker.sample(frame(1), 33, null)).not.toBeNull();
    expect(tracker.sample(frame(2), 66, null)).not.toBeNull();
    expect(tracker.sample(frame(3), 99, null)).toBeNull();
    expect(tracker.sample(frame(4), 132, null)).toBeNull();
    expect(tracker.sample(frame(4), 165, shifted(4, 0))?.source).toBe("reference");
  });

  it("drops flow across a camera interruption or complete image occlusion", () => {
    const tracker = createHybridPlanarTracker();
    tracker.sample(frame(), 0, quad);
    expect(tracker.sample(frame(2), 200, null)).toBeNull();
    tracker.sample(frame(), 233, quad);
    const hidden = { width, height, data: new Float32Array(width * height).fill(100) };
    expect(tracker.sample(hidden, 266, null)).toBeNull();
  });

  it("gently corrects a small reference discrepancy without jumping directly to it", () => {
    const tracker = createHybridPlanarTracker();
    tracker.sample(frame(), 0, quad);
    const result = tracker.sample(frame(), 33, shifted(5, 0));
    expect(result?.source).toBe("flow");
    expect(maximumError(result!.corners, quad)).toBeLessThan(1);
    expect(maximumError(result!.corners, shifted(5, 0))).toBeGreaterThan(4);
  });

  it("treats an expired flow fallback as a fresh reference, allowing a new verification window", () => {
    const tracker = createHybridPlanarTracker({ maxUnverifiedMs: 50 });
    tracker.sample(frame(), 0, quad);
    tracker.sample(frame(), 33, null);
    const reacquired = tracker.sample(frame(), 66, shifted(16, 0));
    expect(reacquired?.source).toBe("reference");
    expect(maximumError(reacquired!.corners, shifted(16, 0))).toBeLessThan(0.01);
    expect(tracker.sample(frame(), 99, null)).not.toBeNull();
  });
});
