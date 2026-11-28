/** Deterministic SOURCE poses. Never supplies observations to the recognizer. */
export type CameraPose = { pitch: number; yaw: number; roll: number; offset: number; distance: number };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wave = (time: number, hz: number, phase = 0) => Math.sin(2 * Math.PI * hz * time + phase);

export function sampleMotion(scenario: string, time: number, strength = 1, tremorTime = time): CameraPose | null {
  const amount = clamp(strength, 0, 3);
  let pose: CameraPose;
  if (scenario === "hand") {
    // Small 8–11 Hz tremor plus <1 Hz drift. A plausible synthetic stress model,
    // not a claim of fitting the user's hand or the iPhone's sensor statistics.
    pose = {
      pitch:
        30 + amount * (0.45 * wave(time, 0.19) + 0.12 * wave(tremorTime, 8.2) + 0.07 * wave(tremorTime, 11.1, 0.8)),
      yaw: amount * (0.35 * wave(time, 0.23, 0.4) + 0.1 * wave(tremorTime, 9.3, 0.7)),
      roll: amount * (0.2 * wave(time, 0.17, 0.8) + 0.06 * wave(tremorTime, 8.8, 1.2)),
      offset: amount * (0.012 * wave(time, 0.21) + 0.0015 * wave(tremorTime, 9.1, 0.3)),
      distance: 3 + amount * (0.02 * wave(time, 0.15, 0.2) + 0.0015 * wave(tremorTime, 7.4)),
    };
  } else if (scenario === "fast") {
    // Holds, quick sweeps, reversals, then return; endpoints and velocity match
    // at the repeat seam. Speed is applied by the caller's continuous clock.
    const keys = [
      { t: 0, offset: 0, pitch: 30, yaw: 0, roll: 0, distance: 3 },
      { t: 0.6, offset: 0, pitch: 30, yaw: 0, roll: 0, distance: 3 },
      { t: 1, offset: 0.3, pitch: 45, yaw: 12, roll: 3, distance: 2.8 },
      { t: 1.4, offset: 0.3, pitch: 45, yaw: 12, roll: 3, distance: 2.8 },
      { t: 1.65, offset: -0.3, pitch: 15, yaw: -12, roll: -3, distance: 3.2 },
      { t: 2.15, offset: -0.3, pitch: 15, yaw: -12, roll: -3, distance: 3.2 },
      { t: 2.5, offset: 0, pitch: 30, yaw: 0, roll: 0, distance: 3 },
      { t: 3.2, offset: 0, pitch: 30, yaw: 0, roll: 0, distance: 3 },
    ];
    const phase = ((time % 3.2) + 3.2) % 3.2;
    const end = keys.findIndex((key) => key.t > phase);
    const a = keys[Math.max(0, end - 1)],
      b = keys[end];
    const fraction = clamp((phase - a.t) / (b.t - a.t), 0, 1);
    const ease = fraction * fraction * (3 - 2 * fraction);
    const value = (name: keyof CameraPose, center: number) =>
      center + amount * (a[name] + (b[name] - a[name]) * ease - center);
    pose = {
      pitch: value("pitch", 30),
      yaw: value("yaw", 0),
      roll: value("roll", 0),
      offset: value("offset", 0),
      distance: value("distance", 3),
    };
  } else if (scenario === "pan") {
    pose = { pitch: 30, yaw: 0, roll: 0, offset: Math.sin(time * 0.6) * 0.4 * amount, distance: 3 };
  } else if (scenario === "tilt") {
    pose = { pitch: 25 + Math.sin(time * 0.5) * 25 * amount, yaw: 0, roll: 0, offset: 0, distance: 3 };
  } else if (scenario === "zoom") {
    pose = { pitch: 30, yaw: 0, roll: 0, offset: 0, distance: 3 + Math.sin(time * 0.6) * 0.7 * amount };
  } else return null;
  return {
    pitch: clamp(pose.pitch, -65, 65),
    yaw: clamp(pose.yaw, -45, 45),
    roll: clamp(pose.roll, -20, 20),
    offset: clamp(pose.offset, -0.65, 0.65),
    distance: clamp(pose.distance, 2.1, 5),
  };
}
