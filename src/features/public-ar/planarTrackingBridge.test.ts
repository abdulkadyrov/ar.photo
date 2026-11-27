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
      inputLoader: { loadInput: vi.fn((input: HTMLVideoElement) => ({ input })) },
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
      const clock = vi.spyOn(performance, "now").mockReturnValue(100);
      const tensor = controller.inputLoader.loadInput(video);
      clock.mockReturnValue(150);
      controller.tracker.track(tensor, null, 0);
      const observation = read(0)!;
      expect(observation).toBeDefined();
      expect(observation.frameTime).toBe(100);
      expect(observation.time).toBe(150);
      corners.forEach((p, i) => {
        expect(observation.corners[i].x).toBeCloseTo(rotated ? p.y : p.x, 5);
        expect(observation.corners[i].y).toBeCloseTo(rotated ? 1 - p.x : p.y, 5);
      });
      // A second tracker iteration over the same camera frame is not new data.
      const repeated = controller.inputLoader.loadInput(video);
      controller.tracker.track(repeated, null, 0);
      expect(read(0)!.frameTime).toBe(100);
      video.currentTime = 1 / 30;
      const fresh = controller.inputLoader.loadInput(video);
      controller.tracker.track(fresh, null, 0);
      expect(read(0)!.frameTime).toBe(150);
      expect(controller.dummyRun()).toBeUndefined();
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });

  it("renders fresh feature coordinates before the worker callback, preserving acquisition and stale limits", () => {
    let time = 10;
    const anchor: { visible: boolean; onTargetUpdate?: () => void } = { visible: false };
    const container = document.createElement("div");
    Object.defineProperties(container, { clientWidth: { value: 390 }, clientHeight: { value: 844 } });
    let sample: PlanarObservation = {
      corners,
      time,
      frameTime: time - 80,
      input: { width: 640, height: 480 },
      aspect: 4 / 3,
    };
    const found = vi.fn(),
      lost = vi.fn();
    const runtime = createPlanarAnchor({
      three: Three,
      anchor,
      container,
      camera: { projectionMatrix: new Three.Matrix4(), projectionMatrixInverse: new Three.Matrix4() },
      scene: { add: vi.fn(), remove: vi.fn() },
      readObservation: () => sample,
      isTracking: () => true,
      onFound: found,
      onLost: lost,
      now: () => time,
    });
    runtime.update();
    expect(runtime.group.visible).toBe(false); // vendor warmup is still required
    anchor.visible = true;
    anchor.onTargetUpdate?.();
    const first = [...runtime.group.matrix.elements];
    time += 33;
    sample = {
      ...sample,
      time,
      frameTime: time - 80,
      corners: corners.map((p) => ({ x: p.x + 0.02, y: p.y })) as Quad,
    };
    runtime.update(); // no onTargetUpdate: the vendor worker is still busy
    expect(runtime.group.matrix.elements).not.toEqual(first);
    const early = [...runtime.group.matrix.elements];
    anchor.onTargetUpdate?.();
    expect(runtime.group.matrix.elements).toEqual(early); // never filter twice
    expect(found).toHaveBeenCalledOnce();
    time += 70;
    sample = { ...sample, time }; // same camera frame, later processing iteration
    runtime.update();
    expect(runtime.group.visible).toBe(true); // full grace after data became available
    expect(runtime.group.matrix.elements).toEqual(early);
    time += PLANAR_HOLD_MS + 1;
    // A delayed, previously unseen result cannot briefly make stale video visible.
    sample = { ...sample, time: sample.time + 1, frameTime: sample.frameTime! + 1 };
    time++;
    runtime.update();
    expect(runtime.group.visible).toBe(false);
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(false);
    expect(lost).toHaveBeenCalledOnce();
    expect(found).toHaveBeenCalledOnce();
    runtime.dispose();
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
    sample = { ...sample!, partial: true };
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(false);
    sample = { ...sample, time: ++time, partial: false };
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(true);
    time += PLANAR_HOLD_MS - 1;
    sample = { ...sample, time, partial: true };
    runtime.update();
    time += 2;
    runtime.update();
    expect(runtime.group.visible).toBe(true);
    time += PLANAR_HOLD_MS + 1;
    anchor.onTargetUpdate?.();
    runtime.update();
    expect(runtime.group.visible).toBe(false);
    expect(lost).toHaveBeenCalledOnce();
    sample = { ...sample!, time: time + 1, partial: true };
    time++;
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(false);
    sample = { ...sample, time: time + 1, partial: false };
    time++;
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(true);
    expect(found).toHaveBeenCalledTimes(2);
    runtime.dispose();
    expect(anchor.onTargetUpdate).toBeUndefined();
  });
});
