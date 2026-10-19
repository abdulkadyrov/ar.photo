import { describe, expect, it, vi } from "vitest";
import * as Three from "three";
import { createPoseStabilizer, createStabilizedAnchor, POSE_HOLD_MS } from "./poseStabilizer";

function pose(x = 0, angle = 0, size = 1) {
  return new Three.Matrix4().compose(
    new Three.Vector3(x, 0, -5),
    new Three.Quaternion().setFromAxisAngle(new Three.Vector3(0, 1, 0), angle),
    new Three.Vector3(size, size, size),
  );
}

function unpack(matrix: Three.Matrix4) {
  const p = new Three.Vector3();
  const q = new Three.Quaternion();
  const s = new Three.Vector3();
  matrix.decompose(p, q, s);
  return { p, q, s };
}

describe("AR pose stabilization", () => {
  it.each([15, 30, 60])("reduces stationary position and rotation noise at %i Hz", (hz) => {
    const filter = createPoseStabilizer(Three);
    filter.sample(pose(), 0);
    let inputEnergy = 0;
    let outputEnergy = 0;
    let rotationEnergy = 0;
    for (let i = 1; i <= 120; i++) {
      const sign = i % 2 ? 1 : -1;
      filter.sample(pose(sign * 0.006, sign * 0.015), (i * 1000) / hz);
      const { p, q } = unpack(filter.matrix);
      inputEnergy += 0.006 ** 2;
      outputEnergy += p.x ** 2;
      rotationEnergy += q.angleTo(new Three.Quaternion()) ** 2;
    }
    expect(Math.sqrt(outputEnergy / inputEnergy)).toBeLessThan(0.4);
    expect(Math.sqrt(rotationEnergy / 120)).toBeLessThan(0.006);
  });

  it("tracks sustained motion without accumulating a long trailing offset", () => {
    const filter = createPoseStabilizer(Three);
    filter.sample(pose(), 0);
    for (let i = 1; i <= 60; i++) {
      filter.sample(pose(i * 0.03, i * 0.01), i * (1000 / 30));
      expect(Math.abs(unpack(filter.matrix).p.x - i * 0.03)).toBeLessThan(0.05);
    }
  });

  it("rejects one-frame translation, rotation and scale spikes", () => {
    for (const badPose of [pose(2), pose(0, 1), pose(0, 0, 2)]) {
      const filter = createPoseStabilizer(Three);
      filter.sample(pose(), 0);
      expect(filter.sample(badPose, 33)).toBe(false);
      expect(filter.matrix.elements).toEqual(pose().elements);
      expect(filter.sample(pose(), 66)).toBe(true);
      expect(unpack(filter.matrix).p.x).toBe(0);
    }
  });

  it("accepts a confirmed large move and catches up promptly", () => {
    const filter = createPoseStabilizer(Three);
    filter.sample(pose(), 0);
    expect(filter.sample(pose(0.8, 0.6), 33)).toBe(false);
    expect(filter.sample(pose(0.81, 0.61), 66)).toBe(true);
    expect(unpack(filter.matrix).p.x).toBeCloseTo(0.81, 2);
  });

  it("does not let rejected samples refresh the hold deadline", () => {
    const filter = createPoseStabilizer(Three);
    filter.sample(pose(), 0);
    filter.sample(pose(5), 100);
    expect(filter.fresh(POSE_HOLD_MS + 1)).toBe(false);
    expect(filter.sample(pose(-2), POSE_HOLD_MS + 2)).toBe(true);
    expect(unpack(filter.matrix).p.x).toBe(-2);
  });

  it("ignores invalid matrices and duplicate or backwards timestamps", () => {
    const filter = createPoseStabilizer(Three);
    filter.sample(pose(), 20);
    const broken = pose();
    broken.elements[12] = Number.NaN;
    expect(filter.sample(broken, 30)).toBe(false);
    expect(filter.sample(pose(1), 20)).toBe(false);
    expect(filter.sample(pose(1), 10)).toBe(false);
    expect(filter.sample(pose(1), Number.NaN)).toBe(false);
    expect(filter.matrix.elements).toEqual(pose().elements);
  });

  it("resets on reacquisition and keeps target filters independent", () => {
    const first = createPoseStabilizer(Three);
    const second = createPoseStabilizer(Three);
    first.sample(pose(0), 0);
    second.sample(pose(10), 0);
    first.reset();
    first.sample(pose(-4), 33);
    expect(unpack(first.matrix).p.x).toBe(-4);
    expect(unpack(second.matrix).p.x).toBe(10);
  });

  it("expires repeated lost-tracking matrices, resumes once, and detaches on disposal", () => {
    let time = 0;
    let tracking = true;
    const anchor = {
      group: { matrix: pose(), visible: true },
      visible: true,
      onTargetUpdate: undefined as (() => void) | undefined,
    };
    const onFound = vi.fn();
    const onLost = vi.fn();
    const scene = { add: vi.fn(), remove: vi.fn() };
    const runtime = createStabilizedAnchor({
      three: Three,
      anchor,
      scene,
      onFound,
      onLost,
      isTracking: () => tracking,
      now: () => time,
    });
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(true);
    tracking = false;
    time = 100;
    anchor.onTargetUpdate?.();
    runtime.update();
    expect(runtime.group.visible).toBe(true);
    time = POSE_HOLD_MS + 1;
    anchor.onTargetUpdate?.();
    runtime.update();
    runtime.update();
    expect(runtime.group.visible).toBe(false);
    expect(onLost).toHaveBeenCalledTimes(1);
    tracking = true;
    anchor.group.matrix = pose(4);
    time += 33;
    anchor.onTargetUpdate?.();
    expect(runtime.group.visible).toBe(true);
    expect(unpack(runtime.group.matrix).p.x).toBe(4);
    expect(onFound).toHaveBeenCalledTimes(2);
    anchor.visible = false;
    anchor.onTargetUpdate?.();
    expect(onLost).toHaveBeenCalledTimes(2);
    runtime.dispose();
    expect(anchor.onTargetUpdate).toBeUndefined();
    expect(scene.remove).toHaveBeenCalledWith(runtime.group);
  });
});
