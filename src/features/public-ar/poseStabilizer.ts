import type * as Three from "three";

// Times are milliseconds; distances are measured in marker widths, not camera
// pixels. Keep Three injected so opening the dashboard does not load WebGL.
export const POSE_HOLD_MS = 180;
type Anchor = {
  group: { matrix: Three.Matrix4; visible: boolean };
  visible: boolean;
  onTargetUpdate?: () => void;
};

export function createPoseStabilizer(three: typeof Three) {
  const position = new three.Vector3();
  const rotation = new three.Quaternion();
  const scale = new three.Vector3();
  const inputPosition = new three.Vector3();
  const inputRotation = new three.Quaternion();
  const inputScale = new three.Vector3();
  const candidatePosition = new three.Vector3();
  const candidateRotation = new three.Quaternion();
  const candidateScale = new three.Vector3();
  const matrix = new three.Matrix4();
  let lastAccepted: number | null = null;
  let lastSample: number | null = null;
  let candidateAt: number | null = null;

  const alpha = (dt: number, cutoff: number) => 1 - Math.exp((-2 * Math.PI * cutoff * dt) / 1000);
  const scaleDelta = (a: Three.Vector3, b: Three.Vector3) =>
    Math.max(Math.abs(Math.log(a.x / b.x)), Math.abs(Math.log(a.y / b.y)), Math.abs(Math.log(a.z / b.z)));

  return {
    matrix,
    reset() {
      lastAccepted = null;
      lastSample = null;
      candidateAt = null;
    },
    sample(input: Three.Matrix4, now: number) {
      if (!Number.isFinite(now) || (lastSample !== null && now <= lastSample)) return false;
      input.decompose(inputPosition, inputRotation, inputScale);
      if (
        ![
          inputPosition.x,
          inputPosition.y,
          inputPosition.z,
          inputRotation.x,
          inputRotation.y,
          inputRotation.z,
          inputRotation.w,
          inputScale.x,
          inputScale.y,
          inputScale.z,
        ].every(Number.isFinite) ||
        Math.min(inputScale.x, inputScale.y, inputScale.z) <= 0
      )
        return false;
      inputRotation.normalize();
      lastSample = now;
      if (lastAccepted === null || now - lastAccepted > POSE_HOLD_MS) {
        position.copy(inputPosition);
        rotation.copy(inputRotation);
        scale.copy(inputScale);
      } else {
        const dt = now - lastAccepted;
        const width = Math.max(scale.x, 0.000001);
        const distance = position.distanceTo(inputPosition) / width;
        const angle = rotation.angleTo(inputRotation);
        const resize = scaleDelta(inputScale, scale);
        // One bad solve must not throw the video across the page. A coherent
        // second sample confirms real movement instead of locking the anchor.
        if (distance > 0.2 || angle > 0.35 || resize > 0.18) {
          const confirmed =
            candidateAt !== null &&
            now - candidateAt <= 120 &&
            candidatePosition.distanceTo(inputPosition) / width < 0.15 &&
            candidateRotation.angleTo(inputRotation) < 0.2 &&
            scaleDelta(inputScale, candidateScale) < 0.12;
          if (!confirmed) {
            candidatePosition.copy(inputPosition);
            candidateRotation.copy(inputRotation);
            candidateScale.copy(inputScale);
            candidateAt = now;
            return false;
          }
        }
        // Quiet poses receive strong smoothing. Larger changes rapidly raise
        // the cutoff. Quaternion interpolation preserves a rigid rotation.
        position.lerp(inputPosition, alpha(dt, Math.min(30, 1.2 + Math.max(0, distance - 0.003) * 100)));
        rotation.slerp(inputRotation, alpha(dt, Math.min(30, 1 + Math.max(0, angle - 0.008) * 50)));
        scale.lerp(inputScale, alpha(dt, Math.min(20, 0.8 + Math.max(0, resize - 0.003) * 60)));
      }
      candidateAt = null;
      lastAccepted = now;
      matrix.compose(position, rotation, scale);
      return true;
    },
    fresh(now: number) {
      return lastAccepted !== null && now - lastAccepted <= POSE_HOLD_MS;
    },
  };
}

export function createStabilizedAnchor(options: {
  three: typeof Three;
  anchor: Anchor;
  scene: { add(object: unknown): void; remove(object: unknown): void };
  isTracking(): boolean;
  onFound(): void;
  onLost(): void;
  now?: () => number;
}) {
  const { three, anchor, scene } = options;
  const now = options.now ?? (() => performance.now());
  const stabilizer = createPoseStabilizer(three);
  const group = new three.Group();
  group.matrixAutoUpdate = false;
  group.visible = false;
  scene.add(group);
  const setVisible = (visible: boolean) => {
    if (group.visible === visible) return;
    group.visible = visible;
    if (visible) options.onFound();
    else options.onLost();
  };
  anchor.onTargetUpdate = () => {
    // MindAR repeats its last matrix during missTolerance. These repeats must
    // not count as fresh observations or keep an obsolete pose alive forever.
    if (!anchor.visible) {
      stabilizer.reset();
      setVisible(false);
      return;
    }
    if (options.isTracking() && stabilizer.sample(anchor.group.matrix, now())) {
      group.matrix.copy(stabilizer.matrix);
      setVisible(true);
    }
  };
  return {
    group,
    update() {
      if (!stabilizer.fresh(now())) setVisible(false);
    },
    dispose() {
      anchor.onTargetUpdate = undefined;
      scene.remove(group);
      stabilizer.reset();
    },
  };
}
