import { describe, expect, it, vi } from "vitest";
import * as Three from "three";
import { createPlanarAnchor, installPlanarObservations, type PlanarObservation } from "./planarTrackingBridge";
import { PLANAR_HOLD_MS, type Quad } from "./planarTracking";

const corners: Quad = [
  { x: 0.1, y: 0.2 },
  { x: 0.8, y: 0.2 },
  { x: 0.8, y: 0.8 },
  { x: 0.1, y: 0.8 },
];

describe("pinned MindAR planar observation bridge", () => {
  it.each([
    [640, 480],
    [480, 640],
    [720, 720],
  ])("maps %i x %i video coordinates back from the tracker input", async (width, height) => {
    const video = document.createElement("video");
    video.width = width;
    video.height = height;
    const inputWidth = width === 720 ? 720 : 640,
      inputHeight = width === 720 ? 720 : 480;
    const rotated = width === inputHeight && height === inputWidth;
    const worldCoords = Array.from({ length: 20 }, (_, i) => ({ x: (i % 5) * 100, y: Math.floor(i / 5) * 100 }));
    const screenCoords = worldCoords.map((p) => ({
      x: (0.1 + (p.x / 400) * 0.7) * inputWidth,
      y: (0.2 + (p.y / 300) * 0.6) * inputHeight,
    }));
    const runtime: { video: HTMLVideoElement; controller?: unknown } = { video };
    const read = installPlanarObservations(runtime, new AbortController().signal, true);
    const controller = {
      inputWidth,
      inputHeight,
      markerDimensions: [[400, 300]],
      tracker: {
        track: vi.fn((...args: unknown[]) => {
          void args;
          return { worldCoords, screenCoords };
        }),
      },
      dummyRun: vi.fn(),
      addImageTargets: async (url: string): Promise<unknown> => {
        void url;
        return null;
      },
      addImageTargetsFromBuffer: vi.fn(() => ({ dimensions: [[400, 300]] })),
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) })),
    );
    try {
      runtime.controller = controller;
      await controller.addImageTargets("blob:fixture");
      controller.tracker.track(null, null, 0);
      const observation = read(0)!;
      expect(observation).toBeDefined();
      corners.forEach((p, i) => {
        expect(observation.corners[i].x).toBeCloseTo(rotated ? p.y : p.x, 5);
        expect(observation.corners[i].y).toBeCloseTo(rotated ? 1 - p.x : p.y, 5);
      });
      expect(controller.dummyRun()).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does not refresh stale geometry with repeated library matrices and reacquires independently", () => {
    let time = 10;
    const anchor: { visible: boolean; onTargetUpdate?: () => void } = { visible: true };
    const container = document.createElement("div");
    Object.defineProperties(container, { clientWidth: { value: 393 }, clientHeight: { value: 700 } });
    let sample: PlanarObservation | undefined = { corners, time, input: { width: 640, height: 480 }, aspect: 4 / 3 };
    const found = vi.fn(),
      lost = vi.fn();
    const scene = { add: vi.fn(), remove: vi.fn() };
    const runtime = createPlanarAnchor({
      three: Three,
      anchor,
      container,
      camera: { projectionMatrix: new Three.Matrix4(), projectionMatrixInverse: new Three.Matrix4() },
      scene,
      readObservation: () => sample,
      isTracking: () => true,
      onFound: found,
      onLost: lost,
      now: () => time,
    });
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(true);
    time += PLANAR_HOLD_MS + 1;
    anchor.onTargetUpdate?.();
    runtime.update();
    expect(runtime.group.visible).toBe(false);
    expect(lost).toHaveBeenCalledOnce();
    sample = { ...sample!, time: time + 1 };
    time++;
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(true);
    expect(found).toHaveBeenCalledTimes(2);
    runtime.dispose();
    expect(anchor.onTargetUpdate).toBeUndefined();
  });
});
