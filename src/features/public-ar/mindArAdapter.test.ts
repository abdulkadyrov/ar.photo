import { describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { decode } from "@msgpack/msgpack";
import {
  boundedCameraConstraints,
  configureSrgbVideoOutput,
  coverTextureTransform,
  installMindArColorCompatibility,
  isIosWebKit,
  keepCameraVisible,
  markerPlaneGeometry,
  mergeTrackingAssets,
  publicArTrackingConfig,
  resolveMarkerDimensions,
  startMindArWithVisibleCamera,
} from "./mindArAdapter";

describe("public AR alignment contract", () => {
  it("bridges MindAR's legacy renderer encoding to the current Three.js color space", () => {
    class Renderer {
      outputColorSpace = "linear-srgb";

      get outputEncoding() {
        return 3000;
      }

      set outputEncoding(_encoding: number) {
        this.outputColorSpace = "legacy-write";
      }
    }
    const Three = {
      WebGLRenderer: Renderer,
      sRGBEncoding: 3001,
      LinearEncoding: 3000,
      SRGBColorSpace: "srgb",
      LinearSRGBColorSpace: "linear-srgb",
    };

    expect(installMindArColorCompatibility(Three)).toBe(true);
    expect(installMindArColorCompatibility(Three)).toBe(false);
    const renderer = new Renderer();
    renderer.outputEncoding = Three.sRGBEncoding;

    expect(renderer.outputColorSpace).toBe(Three.SRGBColorSpace);
    expect(renderer.outputEncoding).toBe(Three.sRGBEncoding);
  });

  it("keeps decoded video input and WebGL output in the same sRGB space", () => {
    const renderer = { outputColorSpace: "" };
    const texture = { colorSpace: "" };

    configureSrgbVideoOutput(renderer, texture, "srgb");

    expect(renderer.outputColorSpace).toBe("srgb");
    expect(texture.colorSpace).toBe("srgb");
  });

  it("bounds camera capture work on mobile devices", () => {
    expect(boundedCameraConstraints({ audio: false, video: { facingMode: "environment" } })).toEqual({
      audio: false,
      video: {
        facingMode: "environment",
        width: { ideal: 1280, max: 1280 },
        height: { ideal: 720, max: 720 },
        frameRate: { ideal: 30, max: 30 },
      },
    });
    expect(boundedCameraConstraints({ video: false })).toEqual({ video: false });
  });

  it("recognizes iOS and iPad desktop user agents for the WebKit workaround", () => {
    expect(isIosWebKit("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", 5)).toBe(true);
    expect(isIosWebKit("Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/605.1.15", 5)).toBe(true);
    expect(isIosWebKit("Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/605.1.15", 0)).toBe(false);
    expect(isIosWebKit("Mozilla/5.0 (Linux; Android 15) Chrome/140", 5)).toBe(false);
  });

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

  it("merges separately processed photos into one ordered MindAR dataset", async () => {
    const bytes = await readFile(resolve(process.cwd(), "public/test-assets/test.mind"));
    const source = new Blob([new Uint8Array(bytes).buffer]);
    const merged = await mergeTrackingAssets([source, source]);
    const content = decode(new Uint8Array(await merged.arrayBuffer())) as { dataList: Array<{ targetImage: unknown }> };

    expect(content.dataList).toHaveLength(2);
    expect(content.dataList[0].targetImage).toEqual(content.dataList[1].targetImage);
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

  it("uses the proven stable smoothing and visibility hysteresis profile", () => {
    expect(publicArTrackingConfig).toEqual({
      filterMinCF: 0.001,
      filterBeta: 20,
      warmupTolerance: 7,
      missTolerance: 10,
    });
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

  it("does not leave the viewer stuck while tracker startup is stalled", async () => {
    vi.useFakeTimers();
    try {
      const video = document.createElement("video");
      const started = startMindArWithVisibleCamera(
        { video, renderer: {}, start: () => new Promise<void>(() => undefined) },
        25,
      );
      const rejection = expect(started).rejects.toMatchObject({ name: "TimeoutError" });

      await vi.advanceTimersByTimeAsync(25);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });
});
