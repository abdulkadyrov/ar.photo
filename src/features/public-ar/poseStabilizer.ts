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
  const boundedPosition = new three.Vector3();
  const boundedRotation = new three.Quaternion();
  const boundedScale = new three.Vector3();
  const matrix = new three.Matrix4();
  let lastAccepted: number | null = null;
  let lastSample: number | null = null;
  let candidateAt: number | null = null;
  let candidateSamples = 0;

  const alpha = (dt: number, cutoff: number) => 1 - Math.exp((-2 * Math.PI * cutoff * dt) / 1000);
  const scaleDelta = (a: Three.Vector3, b: Three.Vector3) =>
    Math.max(Math.abs(Math.log(a.x / b.x)), Math.abs(Math.log(a.y / b.y)), Math.abs(Math.log(a.z / b.z)));

  return {
    matrix,
    reset() {
      lastAccepted = null;
      lastSample = null;
      candidateAt = null;
      candidateSamples = 0;
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
      if (lastAccepted === null) {
        position.copy(inputPosition);
        rotation.copy(inputRotation);
        scale.copy(inputScale);
      } else {
        const dt = now - lastAccepted;
        const width = Math.max(scale.x, 0.000001);
        const distance = position.distanceTo(inputPosition) / width;
        const angle = rotation.angleTo(inputRotation);
        const resize = scaleDelta(inputScale, scale);
        let confirmedDiscontinuity = false;
        // One bad solve must not throw the video across the page. A coherent
        // second sample confirms real movement instead of locking the anchor.
        if (distance > 0.2 || angle > 0.35 || resize > 0.18) {
          const consistentCandidate =
            candidateAt !== null &&
            now - candidateAt <= 120 &&
            candidatePosition.distanceTo(inputPosition) / width < 0.15 &&
            candidateRotation.angleTo(inputRotation) < 0.2 &&
            scaleDelta(inputScale, candidateScale) < 0.12;
          if (!consistentCandidate) {
            candidatePosition.copy(inputPosition);
            candidateRotation.copy(inputRotation);
            candidateScale.copy(inputScale);
            candidateAt = now;
            candidateSamples = 1;
            return false;
          }
          candidateSamples += 1;
          candidatePosition.copy(inputPosition);
          candidateRotation.copy(inputRotation);
          candidateScale.copy(inputScale);
          if (candidateSamples < 3 || now - (candidateAt ?? now) < 45) return false;
          confirmedDiscontinuity = true;
        }
        boundedPosition.copy(inputPosition);
        boundedRotation.copy(inputRotation);
        boundedScale.copy(inputScale);
        if (confirmedDiscontinuity) {
          const boundedDt = Math.min(dt, 50);
          const maxPositionStep = width * (0.02 + (2 * boundedDt) / 1000);
          const positionStep = position.distanceTo(inputPosition);
          boundedPosition.copy(position).lerp(inputPosition, Math.min(1, maxPositionStep / positionStep));
          const maxRotationStep = 0.02 + (2 * boundedDt) / 1000;
          const rotationStep = rotation.angleTo(inputRotation);
          boundedRotation.copy(rotation).slerp(inputRotation, Math.min(1, maxRotationStep / rotationStep));
          const maxScaleLogStep = 0.02 + boundedDt / 1000;
          boundedScale.set(
            scale.x * Math.exp(Math.max(-maxScaleLogStep, Math.min(maxScaleLogStep, Math.log(inputScale.x / scale.x)))),
            scale.y * Math.exp(Math.max(-maxScaleLogStep, Math.min(maxScaleLogStep, Math.log(inputScale.y / scale.y)))),
            scale.z * Math.exp(Math.max(-maxScaleLogStep, Math.min(maxScaleLogStep, Math.log(inputScale.z / scale.z)))),
          );
        }
        // Quiet poses receive strong smoothing. Larger changes rapidly raise
        // the cutoff. Continuous camera motion follows almost immediately;
        // rate limiting is reserved for confirmed discontinuities only.
        const positionCutoff = distance > 0.02 ? 30 : 1.2 + Math.max(0, distance - 0.003) * 100;
        const rotationCutoff =
          distance > 0.02 || resize > 0.02 || angle > 0.03 ? 30 : 1 + Math.max(0, angle - 0.008) * 50;
        const scaleCutoff = resize > 0.02 ? 20 : 0.8 + Math.max(0, resize - 0.003) * 60;
        position.lerp(boundedPosition, alpha(dt, positionCutoff));
        rotation.slerp(boundedRotation, alpha(dt, rotationCutoff));
        scale.lerp(boundedScale, alpha(dt, scaleCutoff));
      }
      candidateAt = null;
      candidateSamples = 0;
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
      if (!stabilizer.fresh(now())) {
        setVisible(false);
        if (!options.isTracking()) stabilizer.reset();
      }
    },
    dispose() {
      anchor.onTargetUpdate = undefined;
      scene.remove(group);
      stabilizer.reset();
    },
  };
}
