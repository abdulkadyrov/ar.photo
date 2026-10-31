import type * as Three from "three";
import {
  createCornerFilter,
  cornerProjectionMatrix,
  estimatePlanarQuad,
  type Point2,
  type Quad,
} from "./planarTracking";

// Adapter boundary for pinned MindAR 1.2.5. Keep observation access here, rather
// than deriving the corners from its ambiguous, assumed-focal-length 3D pose.
type Controller = {
  inputWidth: number;
  inputHeight: number;
  markerDimensions?: [number, number][];
  addImageTargets(url: string): Promise<unknown>;
  addImageTargetsFromBuffer(buffer: ArrayBuffer): unknown;
  dummyRun(input: HTMLVideoElement): unknown;
  tracker?: { track(input: unknown, pose: unknown, index: number): { worldCoords: Point2[]; screenCoords: Point2[] } };
};
export type PlanarObservation = {
  corners: Quad;
  time: number;
  input: { width: number; height: number };
  aspect: number;
};

export function installPlanarObservations(
  runtime: { video?: HTMLVideoElement },
  signal: AbortSignal,
  skipWarmup: boolean,
  onError?: (error: unknown) => void,
) {
  let controller: Controller | undefined;
  const observations = new Map<number, PlanarObservation>();
  Object.defineProperty(runtime, "controller", {
    configurable: true,
    get: () => controller,
    set(next: Controller) {
      controller = next;
      if (skipWarmup) next.dummyRun = () => undefined;
      next.addImageTargets = async (url) => {
        try {
          const response = await fetch(url, { signal });
          if (!response.ok) throw new DOMException("Tracking data unavailable", "NetworkError");
          const buffer = await response.arrayBuffer();
          signal.throwIfAborted();
          const result = next.addImageTargetsFromBuffer(buffer);
          const tracker = next.tracker;
          if (!tracker) throw new Error("MindAR observation contract unavailable");
          const track = tracker.track.bind(tracker);
          tracker.track = (input, pose, index) => {
            const sample = track(input, pose, index);
            const dimensions = next.markerDimensions?.[index];
            observations.delete(index);
            if (dimensions && !signal.aborted) {
              const inputSize = { width: next.inputWidth, height: next.inputHeight };
              const corners = estimatePlanarQuad(
                sample.worldCoords,
                sample.screenCoords,
                { width: dimensions[0], height: dimensions[1] },
                inputSize,
              );
              if (corners)
                observations.set(index, {
                  // InputLoader rotates +90 degrees when the element dimensions
                  // are swapped (also true for square inputs). Undo that before
                  // mapping observations onto the displayed camera image.
                  corners: isRotatedInput(runtime.video, inputSize)
                    ? (corners.map((p) => ({ x: p.y, y: 1 - p.x })) as Quad)
                    : corners,
                  time: performance.now(),
                  input: isRotatedInput(runtime.video, inputSize)
                    ? { width: inputSize.height, height: inputSize.width }
                    : inputSize,
                  aspect: dimensions[0] / dimensions[1],
                });
            }
            return sample;
          };
          return result;
        } catch (error) {
          // The vendor uses an async Promise executor, which loses rejections.
          // Reject our cancellable startup boundary and leave its executor idle.
          onError?.(error);
          return new Promise<never>(() => undefined);
        }
      };
    },
  });
  return (index: number) => observations.get(index);
}

export function createPlanarAnchor(options: {
  three: typeof Three;
  anchor: { visible: boolean; onTargetUpdate?: () => void };
  scene: { add(object: unknown): void; remove(object: unknown): void };
  camera: Three.Camera;
  container: HTMLElement;
  readObservation(): PlanarObservation | undefined;
  isTracking(): boolean;
  onFound(): void;
  onLost(): void;
  now?: () => number;
}) {
  const now = options.now ?? (() => performance.now());
  const cornerFilter = createCornerFilter();
  const group = new options.three.Group();
  group.matrixAutoUpdate = false;
  group.visible = false;
  options.scene.add(group);
  let lastSample = -Infinity;
  let current: PlanarObservation | null = null;
  const setVisible = (visible: boolean) => {
    if (group.visible === visible) return;
    group.visible = visible;
    if (visible) options.onFound();
    else options.onLost();
  };
  const updateMatrix = () => {
    if (!current) return;
    const width = options.container.clientWidth,
      height = options.container.clientHeight;
    if (!width || !height) return;
    const clip = cornerProjectionMatrix(options.three, current.corners, current.aspect, current.input, {
      width,
      height,
    });
    if (!clip) return;
    group.matrix.multiplyMatrices(options.camera.projectionMatrixInverse, clip);
  };
  options.anchor.onTargetUpdate = () => {
    if (!options.anchor.visible) {
      cornerFilter.reset();
      current = null;
      setVisible(false);
      return;
    }
    const sample = options.readObservation();
    if (!options.isTracking() || !sample || sample.time <= lastSample) return;
    lastSample = sample.time;
    const corners = cornerFilter.sample(sample.corners, sample.time);
    if (!corners) return;
    current = { ...sample, corners };
    updateMatrix();
    setVisible(true);
  };
  return {
    group,
    update() {
      if (!cornerFilter.fresh(now())) {
        setVisible(false);
        current = null;
      } else updateMatrix(); // viewport changes do not require a new recognition
    },
    dispose() {
      options.anchor.onTargetUpdate = undefined;
      options.scene.remove(group);
      cornerFilter.reset();
    },
  };
}

function isRotatedInput(video: HTMLVideoElement | undefined, input: { width: number; height: number }) {
  return video?.width === input.height && video.height === input.width;
}
