import { describe, expect, it } from "vitest";
import { coverTextureTransform, markerPlaneGeometry, publicArTrackingConfig } from "./mindArAdapter";

describe("public AR alignment contract", () => {
  it("places the plane exactly on the marker without a parallax offset", () => {
    expect(markerPlaneGeometry({ width: 1200, height: 1600 })).toEqual({ width: 1, height: 4 / 3, z: 0 });
    expect(markerPlaneGeometry({ width: 1600, height: 1200 })).toEqual({ width: 1, height: 0.75, z: 0 });
  });

  it("rejects invalid marker geometry", () => {
    expect(() => markerPlaneGeometry({ width: 0, height: 1200 })).toThrow("Invalid marker geometry");
    expect(() => markerPlaneGeometry({ width: Number.NaN, height: 1200 })).toThrow("Invalid marker geometry");
  });

  it("center-crops wide and tall video without stretching it", () => {
    expect(coverTextureTransform(16 / 9, 4 / 3)).toEqual({
      repeatX: 0.75,
      repeatY: 1,
      offsetX: 0.125,
      offsetY: 0,
    });
    expect(coverTextureTransform(3 / 4, 4 / 3)).toEqual({
      repeatX: 1,
      repeatY: 0.5625,
      offsetX: 0,
      offsetY: 0.21875,
    });
    expect(coverTextureTransform(4 / 3, 4 / 3)).toEqual({
      repeatX: 1,
      repeatY: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it("uses a bounded smoothing and visibility hysteresis profile", () => {
    expect(publicArTrackingConfig).toEqual({
      filterMinCF: 0.001,
      filterBeta: 100,
      warmupTolerance: 5,
      missTolerance: 5,
    });
    expect(publicArTrackingConfig.filterBeta).toBeLessThan(1000);
  });
});
