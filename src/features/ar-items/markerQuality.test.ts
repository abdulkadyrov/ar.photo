import { describe, expect, it } from "vitest";
import { MARKER_QUALITY_THRESHOLD, analyzeMarkerPixels } from "./markerQuality";

const WIDTH = 64;
const HEIGHT = 64;

type PixelFactory = (x: number, y: number) => [number, number, number, number?];

const createPixels = (factory: PixelFactory) => {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const [red, green, blue, alpha = 255] = factory(x, y);
      const offset = (y * WIDTH + x) * 4;
      pixels.set([red, green, blue, alpha], offset);
    }
  }
  return pixels;
};

const gray = (value: number): [number, number, number] => [value, value, value];

describe("analyzeMarkerPixels", () => {
  it.each([
    ["solid black", 0, "too_dark"],
    ["solid white", 255, "too_bright"],
    ["solid middle gray", 128, "low_contrast"],
  ])("rejects a %s marker", (_name, value, reason) => {
    const result = analyzeMarkerPixels(
      createPixels(() => gray(value)),
      WIDTH,
      HEIGHT,
    );

    expect(result.suitable).toBe(false);
    expect(result.score).toBeLessThan(MARKER_QUALITY_THRESHOLD);
    expect(result.reasons).toContain(reason);
  });

  it("rejects a smooth gradient with too few local features", () => {
    const result = analyzeMarkerPixels(
      createPixels((x) => gray((x / (WIDTH - 1)) * 255)),
      WIDTH,
      HEIGHT,
    );

    expect(result.suitable).toBe(false);
    expect(result.reasons).toContain("few_features");
  });

  it("rejects a low-contrast textured marker", () => {
    const result = analyzeMarkerPixels(
      createPixels((x, y) => gray(118 + ((x * 7 + y * 11) % 18))),
      WIDTH,
      HEIGHT,
    );

    expect(result.suitable).toBe(false);
    expect(result.reasons).toContain("low_contrast");
  });

  it.each([
    ["checkerboard", (x: number, y: number) => gray((x + y) % 2 === 0 ? 24 : 232)],
    ["fine vertical bars", (x: number) => gray(Math.floor(x / 2) % 2 === 0 ? 20 : 235)],
    ["cross-hatched detail", (x: number, y: number) => gray(x % 5 === 0 || y % 7 === 0 ? 18 : 220)],
    [
      "deterministic color texture",
      (x: number, y: number): [number, number, number] => [
        (x * 41 + y * 17) % 256,
        (x * 13 + y * 53) % 256,
        (x * 67 + y * 7) % 256,
      ],
    ],
    ["mixed geometric detail", (x: number, y: number) => gray(((x >> 2) ^ (y >> 2)) % 2 === 0 ? 35 : 225)],
  ])("accepts a detailed %s marker", (_name, factory) => {
    const result = analyzeMarkerPixels(createPixels(factory), WIDTH, HEIGHT);

    expect(result.suitable).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(MARKER_QUALITY_THRESHOLD);
    expect(result.metrics.featureDensity).toBeGreaterThanOrEqual(30);
  });

  it("composites transparent pixels onto white before scoring", () => {
    const transparentBlack = analyzeMarkerPixels(
      createPixels(() => [0, 0, 0, 0]),
      WIDTH,
      HEIGHT,
    );
    const white = analyzeMarkerPixels(
      createPixels(() => [255, 255, 255, 255]),
      WIDTH,
      HEIGHT,
    );

    expect(transparentBlack).toEqual(white);
  });

  it("returns deterministic scores for the same pixels", () => {
    const pixels = createPixels((x, y) => gray((x * 31 + y * 19) % 256));

    expect(analyzeMarkerPixels(pixels, WIDTH, HEIGHT)).toEqual(analyzeMarkerPixels(pixels, WIDTH, HEIGHT));
  });

  it("rejects malformed pixel buffers and dimensions", () => {
    expect(() => analyzeMarkerPixels(new Uint8ClampedArray(8), 1, 2)).toThrow(/dimensions/i);
    expect(() => analyzeMarkerPixels(new Uint8ClampedArray(8), 2, 2)).toThrow(/RGBA/i);
  });
});
