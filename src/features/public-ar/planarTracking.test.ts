import { describe, expect, it } from "vitest";
import * as Three from "three";
import {
  cornerProjectionMatrix,
  createCornerFilter,
  estimatePlanarQuad,
  fitHomography,
  PLANAR_HOLD_MS,
  projectPoint,
  type Quad,
} from "./planarTracking";

const source: Quad = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];
const tilted: Quad = [
  { x: 0.22, y: 0.19 },
  { x: 0.66, y: 0.31 },
  { x: 0.79, y: 0.88 },
  { x: 0.14, y: 0.7 },
];
const marker = { width: 1200, height: 1800 },
  input = { width: 720, height: 1280 };
const error = (a: Quad, b: Quad) =>
  Math.max(...a.map((p, i) => Math.hypot((p.x - b[i].x) * input.width, (p.y - b[i].y) * input.height)));

function measurements(corners = tilted) {
  const h = fitHomography(source, corners)!;
  const world = Array.from({ length: 48 }, (_, i) => ({
    x: (0.07 + (i % 6) * 0.16) * marker.width,
    y: (0.06 + Math.floor(i / 6) * 0.12) * marker.height,
  }));
  const screen = world.map((p, i) => {
    const projected = projectPoint(h, { x: p.x / marker.width, y: p.y / marker.height });
    return {
      x: projected.x * input.width + Math.sin(i * 13) * 0.4,
      y: projected.y * input.height + Math.cos(i * 17) * 0.4,
    };
  });
  return { world, screen };
}

describe("four-corner planar tracking", () => {
  it("recovers all corners under perspective from noisy feature measurements and 25% outliers", () => {
    const { world, screen } = measurements();
    for (let i = 0; i < 12; i++) screen[i] = { x: 650 - i * 10, y: 150 + i * 3 };
    const quad = estimatePlanarQuad(world, screen, marker, input);
    expect(quad).not.toBeNull();
    expect(error(quad!, tilted)).toBeLessThan(2);
  });

  it("rejects collinear, clustered, insufficient and inconsistent measurements", () => {
    const { world, screen } = measurements();
    expect(estimatePlanarQuad(world.slice(0, 4), screen.slice(0, 4), marker, input)).toBeNull();
    expect(
      estimatePlanarQuad(
        world.map((p) => ({ ...p, y: 100 })),
        screen,
        marker,
        input,
      ),
    ).toBeNull();
    expect(
      estimatePlanarQuad(
        world.map((p) => ({ x: p.x * 0.1, y: p.y * 0.1 })),
        screen,
        marker,
        input,
      ),
    ).toBeNull();
    expect(
      estimatePlanarQuad(
        world,
        screen.map((p, i) => ({ x: (i * 193) % 720, y: (i * 311) % 1280 })),
        marker,
        input,
      ),
    ).toBeNull();
  });

  it.each([
    { width: 393, height: 700 },
    { width: 900, height: 420 },
  ])("projects corners and interior UVs exactly with cover cropping in $width x $height", (viewport) => {
    const matrix = cornerProjectionMatrix(Three, tilted, marker.width / marker.height, input, viewport)!;
    const h = fitHomography(source, tilted)!;
    const cover = Math.max(viewport.width / input.width, viewport.height / input.height);
    for (const uv of [...source, { x: 0.35, y: 0.6 }, { x: 0.7, y: 0.2 }]) {
      const x = uv.x - 0.5,
        y = ((0.5 - uv.y) * marker.height) / marker.width;
      const m = matrix.elements;
      const w = m[3] * x + m[7] * y + m[15];
      const pixel = {
        x: (((m[0] * x + m[4] * y + m[12]) / w + 1) * viewport.width) / 2,
        y: ((1 - (m[1] * x + m[5] * y + m[13]) / w) * viewport.height) / 2,
      };
      const expected = projectPoint(h, uv);
      expect(pixel.x).toBeCloseTo(expected.x * input.width * cover - (input.width * cover - viewport.width) / 2, 5);
      expect(pixel.y).toBeCloseTo(expected.y * input.height * cover - (input.height * cover - viewport.height) / 2, 5);
    }
  });

  it.each([15, 30, 60])("reduces quiet noise and follows changing perspective without trailing at %i Hz", (fps) => {
    const filter = createCornerFilter();
    filter.sample(tilted, 0);
    let noise = 0;
    for (let i = 1; i < 90; i++) {
      const sample = tilted.map((p) => ({ x: p.x + (i % 2 ? 0.001 : -0.001), y: p.y })) as Quad;
      noise += error(filter.sample(sample, (i * 1000) / fps)!, tilted);
    }
    expect(noise / 89).toBeLessThan(0.45);
    for (let i = 90; i < 120; i++) {
      const next = tilted.map((p, j) => ({
        x: p.x + (i - 90) * 0.008,
        y: p.y + (i - 90) * (j < 2 ? 0.001 : -0.001),
      })) as Quad;
      const actual = filter.sample(next, (i * 1000) / fps)!;
      expect(actual).not.toBeNull();
      expect(error(actual, next)).toBeLessThan(2);
    }
  });

  it.each([30, 60])("damps corner wobble while approaching the photo at %i Hz", (fps) => {
    const filter = createCornerFilter();
    filter.sample(tilted, 0);
    let rawError = 0,
      outputError = 0;
    for (let frame = 1; frame <= 90; frame++) {
      const scale = 1 + frame * 0.012;
      const expected = tilted.map((p) => ({ x: 0.5 + (p.x - 0.5) * scale, y: 0.5 + (p.y - 0.5) * scale })) as Quad;
      const noisy = expected.map((p, i) => ({
        x: p.x + Math.sin(frame * 2.1 + i * 2) * 0.004 * scale,
        y: p.y + Math.cos(frame * 2.4 + i * 2.7) * 0.004 * scale,
      })) as Quad;
      const actual = filter.sample(noisy, (frame * 1000) / fps);
      expect(actual).not.toBeNull();
      if (frame > 10) {
        rawError += error(noisy, expected);
        outputError += error(actual!, expected);
      }
    }
    expect(outputError / rawError).toBeLessThan(0.72);
  });

  it("rejects a single corner slipping while the other three stay in place", () => {
    const filter = createCornerFilter();
    filter.sample(tilted, 0);
    const slipped = tilted.map((p) => ({ ...p })) as Quad;
    slipped[0].x += 0.06;
    expect(filter.sample(slipped, 33)).toBeNull();
    expect(filter.sample(tilted, 66)).toEqual(tilted);
  });

  it("rejects one bad frame, expires stale observations, and reacquires without interpolating from an old pose", () => {
    const filter = createCornerFilter();
    filter.sample(tilted, 0);
    const jumped = tilted.map((p) => ({ x: p.x + 0.5, y: p.y })) as Quad;
    expect(filter.sample(jumped, 33)).toBeNull();
    expect(filter.sample(tilted, 66)).not.toBeNull();
    expect(filter.fresh(67 + PLANAR_HOLD_MS)).toBe(false);
    expect(filter.sample(jumped, 68 + PLANAR_HOLD_MS)).toEqual(jumped);
  });
});
