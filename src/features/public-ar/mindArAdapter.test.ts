import { describe, expect, it, vi } from "vitest";
import {
  coverTextureTransform,
  keepCameraVisible,
  markerPlaneGeometry,
  publicArTrackingConfig,
  resolveMarkerDimensions,
  startMindArWithVisibleCamera,
} from "./mindArAdapter";

describe("public AR alignment contract", () => {
  it("places the plane exactly on the marker without a parallax offset", () => {
    expect(markerPlaneGeometry({ width: 1200, height: 1600 })).toEqual({ width: 1, height: 4 / 3, z: 0 });
    expect(markerPlaneGeometry({ width: 1600, height: 1200 })).toEqual({ width: 1, height: 0.75, z: 0 });
  });

  it("rejects invalid marker geometry", () => {
    expect(() => markerPlaneGeometry({ width: 0, height: 1200 })).toThrow("Invalid marker geometry");
    expect(() => markerPlaneGeometry({ width: Number.NaN, height: 1200 })).toThrow("Invalid marker geometry");
  });

  it("uses the compiled tracking target as the authoritative marker format", () => {
    expect(resolveMarkerDimensions({ width: 1200, height: 1600 }, [[2742, 1542]])).toEqual({
      width: 2742,
      height: 1542,
    });
    expect(resolveMarkerDimensions({ width: 1200, height: 1600 }, [[0, 1542]])).toEqual({
      width: 1200,
      height: 1600,
    });
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

  it("keeps the camera video visible below transparent AR renderers", () => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const cssLayer = document.createElement("div");
    const setClearColor = vi.fn();

    keepCameraVisible({
      video,
      renderer: { domElement: canvas, setClearColor },
      cssRenderer: { domElement: cssLayer },
    });

    expect(video.style.zIndex).toBe("0");
    expect(video.style.opacity).toBe("1");
    expect(canvas.style.zIndex).toBe("1");
    expect(canvas.style.background).toBe("transparent");
    expect(cssLayer.style.zIndex).toBe("2");
    expect(cssLayer.style.pointerEvents).toBe("none");
    expect(setClearColor).toHaveBeenCalledWith(0x000000, 0);
  });

  it("reveals the camera before MindAR finishes preparing the tracker", async () => {
    const video = document.createElement("video");
    video.style.zIndex = "-2";
    let finishStart: (() => void) | undefined;
    const start = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishStart = resolve;
        }),
    );
    const mindar = { video, renderer: {}, start };

    const started = startMindArWithVisibleCamera(mindar);

    expect(start).toHaveBeenCalledOnce();
    expect(video.style.zIndex).toBe("0");
    finishStart?.();
    await started;
    expect(video.style.zIndex).toBe("0");
  });
});
