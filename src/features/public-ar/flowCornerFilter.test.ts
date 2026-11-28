import { describe, expect, it } from "vitest";
import { createCornerFilter, type Quad } from "./planarTracking";

const tilted: Quad = [
  { x: 0.22, y: 0.19 },
  { x: 0.66, y: 0.31 },
  { x: 0.79, y: 0.88 },
  { x: 0.14, y: 0.7 },
];
const distance = (a: Quad, b: Quad) => Math.max(...a.map((p, i) => Math.hypot(p.x - b[i].x, p.y - b[i].y)));

describe("corner filter with independently verified flow continuity", () => {
  it("accepts a bounded perspective change that the raw one-corner slip gate rejects", () => {
    const raw = createCornerFilter(),
      flow = createCornerFilter();
    raw.sample(tilted, 0);
    flow.sample(tilted, 0);
    const changed = tilted.map((p, i) => ({ x: p.x + (i === 0 ? 0.07 : 0.001), y: p.y })) as Quad;
    expect(raw.sample(changed, 33)).toBeNull();
    const accepted = flow.sample(changed, 33, true);
    expect(accepted).not.toBeNull();
    expect(distance(accepted!, tilted)).toBeGreaterThan(0.005);
    // Continuity bypasses rejection, not the perspective smoothing stage.
    expect(distance(accepted!, changed)).toBeGreaterThan(0.01);
    expect(flow.fresh(33)).toBe(true);
  });

  it("does not use trusted flow as permission for a large discontinuity", () => {
    const filter = createCornerFilter();
    filter.sample(tilted, 0);
    const jump = tilted.map((p) => ({ x: p.x + 0.5, y: p.y })) as Quad;
    expect(filter.sample(jump, 33, true)).toBeNull();
    // A rejected observation must not refresh the old pose's visibility clock.
    expect(filter.fresh(121)).toBe(false);
  });

  it("still rejects folded, non-finite, duplicate-time and backward-time observations", () => {
    const filter = createCornerFilter();
    filter.sample(tilted, 100);
    const folded = [tilted[0], tilted[2], tilted[1], tilted[3]] as Quad;
    expect(filter.sample(folded, 133, true)).toBeNull();
    const invalid = tilted.map((p, i) => ({ x: i === 0 ? NaN : p.x, y: p.y })) as Quad;
    expect(filter.sample(invalid, 133, true)).toBeNull();
    expect(filter.sample(tilted, NaN, true)).toBeNull();
    expect(filter.sample(tilted, 100, true)).toBeNull();
    expect(filter.sample(tilted, 90, true)).toBeNull();
    expect(filter.sample(tilted, 133, true)).not.toBeNull();
  });

  it("preserves suppression of alternating perspective noise even with flow continuity", () => {
    const filter = createCornerFilter();
    const baseline = createCornerFilter();
    filter.sample(tilted, 0);
    baseline.sample(tilted, 0);
    let rawEnergy = 0,
      outputEnergy = 0;
    for (let i = 1; i <= 90; i++) {
      const noise = (i % 2 ? 1 : -1) * 0.012;
      const next = tilted.map((p, index) => ({
        x: p.x + (index < 2 ? noise : -noise),
        y: p.y + (index % 2 ? noise : -noise),
      })) as Quad;
      const result = filter.sample(next, i * 33, true)!;
      expect(result).not.toBeNull();
      expect(result).toEqual(baseline.sample(next, i * 33));
      rawEnergy += distance(next, tilted) ** 2;
      outputEnergy += distance(result, tilted) ** 2;
    }
    expect(outputEnergy / rawEnergy).toBeLessThan(0.3);
  });
});
