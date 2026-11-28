import { describe, expect, it } from "vitest";
import { createPyramid, trackOpticalFlow, type GrayFrame } from "./opticalFlow";

const texture = (x: number, y: number) =>
  128 + 32 * Math.sin(x * 0.43 + y * 0.13) + 30 * Math.sin(y * 0.57 - x * 0.12) + 25 * Math.cos(x * 0.23 + y * 0.39);
function frame(sample = texture): GrayFrame {
  const width = 192,
    height = 240;
  return {
    width,
    height,
    data: Float32Array.from({ length: width * height }, (_, i) => sample(i % width, Math.floor(i / width))),
  };
}
const points = Array.from({ length: 48 }, (_, i) => ({ x: 40 + (i % 6) * 22, y: 36 + Math.floor(i / 6) * 22 }));
describe("pyramidal optical flow", () => {
  it("tracks subpixel translation beyond a single-level patch, including exposure offset", () => {
    const dx = 7.4,
      dy = -4.7;
    const matches = trackOpticalFlow(
      createPyramid(frame()),
      createPyramid(frame((x, y) => texture(x - dx, y - dy) + 12)),
      points,
    );
    expect(matches.length).toBeGreaterThan(36);
    const errors = matches.map(({ source, destination }) =>
      Math.hypot(destination.x - source.x - dx, destination.y - source.y - dy),
    );
    expect(Math.max(...errors)).toBeLessThan(0.35);
  });
  it("follows mild perspective-like affine shape change without freezing the corners", () => {
    const a = 1.012,
      b = 0.018,
      c = -0.01,
      d = 0.985,
      tx = 2,
      ty = 1.5,
      det = a * d - b * c;
    const warped = frame((x, y) => texture((d * (x - tx) - b * (y - ty)) / det, (-c * (x - tx) + a * (y - ty)) / det));
    const matches = trackOpticalFlow(createPyramid(frame()), createPyramid(warped), points);
    expect(matches.length).toBeGreaterThan(36);
    for (const { source, destination } of matches)
      expect(
        Math.hypot(
          destination.x - (a * source.x + b * source.y + tx),
          destination.y - (c * source.x + d * source.y + ty),
        ),
      ).toBeLessThan(0.4);
  });
  it("rejects textureless patches and patches hidden by an occlusion", () => {
    expect(trackOpticalFlow(createPyramid(frame(() => 100)), createPyramid(frame(() => 100)), points)).toEqual([]);
    const matches = trackOpticalFlow(
      createPyramid(frame()),
      createPyramid(frame((x, y) => (x > 80 && x < 125 && y > 70 && y < 160 ? 100 : texture(x, y)))),
      points,
    );
    expect(matches.filter(({ source }) => source.x > 86 && source.x < 119 && source.y > 76 && source.y < 154)).toEqual(
      [],
    );
    expect(matches.length).toBeGreaterThan(20);
  });
  it("does not mutate source frames or track incompatible dimensions", () => {
    const source = frame(),
      copy = source.data.slice();
    const pyramid = createPyramid(source);
    expect(source.data).toEqual(copy);
    expect(pyramid.map(({ width, height }) => [width, height])).toEqual([
      [192, 240],
      [96, 120],
      [48, 60],
    ]);
    expect(trackOpticalFlow(pyramid, [], points)).toEqual([]);
    expect(
      trackOpticalFlow(pyramid, pyramid, [
        { x: 1, y: 1 },
        { x: NaN, y: 3 },
      ]),
    ).toEqual([]);
  });
});
