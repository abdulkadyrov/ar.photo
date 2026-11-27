import { Blob as NodeBlob } from "node:buffer";
import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createArDiagnostics,
  DIAGNOSTIC_DURATION_MS,
  sanitizeDiagnosticSample,
  type ArDiagnosticState,
} from "./arDiagnostics";

class FakeRecorder {
  static isTypeSupported(value: string) {
    return value === "video/mp4";
  }
  static last: FakeRecorder;
  state = "inactive";
  mimeType = "video/mp4";
  ondataavailable?: ((event: { data: Blob }) => void) | null;
  onstop?: (() => void) | null;
  onerror?: (() => void) | null;
  constructor(readonly stream: { tracks: unknown[] }) {
    FakeRecorder.last = this;
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["encoded camera pixels"]) });
    this.onstop?.();
  }
}
function setup() {
  vi.stubGlobal("Blob", NodeBlob);
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal(
    "MediaStream",
    class {
      constructor(readonly tracks: unknown[]) {}
    },
  );
  const track = Object.assign(new EventTarget(), {
    readyState: "live",
    stop: vi.fn(),
    getSettings: () => ({ width: 640, height: 480, deviceId: "private-camera-id", frameRate: 30 }),
  });
  const camera = document.createElement("video");
  Object.defineProperty(camera, "srcObject", {
    value: { getVideoTracks: () => [track], getAudioTracks: () => [{ kind: "audio" }] },
  });
  const playback = document.createElement("video");
  const states: ArDiagnosticState[] = [];
  const engine = createArDiagnostics({
    cameraVideo: camera,
    playbackVideo: playback,
    onState: (state) => states.push(state),
    trackingAssets: [new Blob(["mind target"])],
    metadata: { targets: [{ width: 100, height: 150 }] },
  });
  return { engine, camera, playback, track, states };
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("local AR diagnostic recording", () => {
  it("exports only allowlisted finite geometry and strips URLs or extra nested data", () => {
    const result = sanitizeDiagnosticSample({
      found: true,
      cameraTime: 2,
      frameTime: NaN,
      targetIndex: Infinity,
      viewport: { width: 390, height: 844, url: "secret" },
      corners: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
      renderedMatrix: Array(16).fill(1),
      projectionMatrix: Array(16).fill(2),
      token: "secret",
    } as Parameters<typeof sanitizeDiagnosticSample>[0]);
    expect(result.frameTime).toBeUndefined();
    expect(result.targetIndex).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(result.viewport).toEqual({ width: 390, height: 844 });
    expect(result.projectionMatrix).toHaveLength(16);
  });

  it("bundles raw camera, target and playback telemetry without audio or source track shutdown", async () => {
    const { engine, track, playback, states } = setup();
    engine.start();
    expect(FakeRecorder.last.stream.tracks).toEqual([track]);
    engine.addSample({
      found: true,
      cameraTime: 1,
      frameTime: performance.now(),
      corners: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
    });
    playback.dispatchEvent(new Event("waiting"));
    const recording = await engine.stop();
    const zip = await JSZip.loadAsync(new Uint8Array(await recording.blob.arrayBuffer()));
    expect(Object.keys(zip.files)).toEqual(["camera.mp4", "target-0.mind", "diagnostics.json"]);
    const metadata = JSON.parse(await zip.file("diagnostics.json")!.async("string"));
    expect(metadata.samples).toHaveLength(1);
    expect(metadata.playbackEvents[0].event).toBe("waiting");
    expect(metadata.clock.recordingStart).toBeTypeOf("number");
    expect(JSON.stringify(metadata)).not.toContain("private-camera-id");
    expect(states.at(-1)?.status).toBe("ready");
    expect(track.stop).not.toHaveBeenCalled();
    engine.dispose();
    expect(track.stop).not.toHaveBeenCalled();
  });

  it("automatically stops at the duration limit and rate-limits samples", async () => {
    vi.useFakeTimers();
    const { engine, track } = setup();
    engine.start();
    for (let i = 0; i < 100; i++) engine.addSample({ found: true });
    vi.advanceTimersByTime(DIAGNOSTIC_DURATION_MS);
    expect(engine.active).toBe(false);
    // JSZip schedules generation work; keep real timers for that final archive step.
    vi.useRealTimers();
    const result = await engine.stop();
    const zip = await JSZip.loadAsync(new Uint8Array(await result.blob.arrayBuffer()));
    const metadata = JSON.parse(await zip.file("diagnostics.json")!.async("string"));
    expect(metadata.samples).toHaveLength(1);
    expect(metadata.stoppedBecause).toBe("duration");
    expect(track.stop).not.toHaveBeenCalled();
    engine.dispose();
  });

  it("rejects oversized chunks instead of exporting a truncated recording", () => {
    const { engine, track, states } = setup();
    engine.start();
    FakeRecorder.last.ondataavailable?.({ data: { size: 41 * 1024 * 1024 } as Blob });
    expect(engine.active).toBe(false);
    expect(states.at(-1)?.status).toBe("error");
    expect(states.at(-1)?.result).toBeUndefined();
    expect(track.stop).not.toHaveBeenCalled();
    engine.dispose();
  });

  it("releases listeners and discards recording on disposal without stopping the camera", () => {
    const { engine, track, states } = setup();
    engine.start();
    engine.dispose();
    expect(FakeRecorder.last.state).toBe("inactive");
    expect(track.stop).not.toHaveBeenCalled();
    expect(states.at(-1)?.status).toBe("recording");
    expect(() => engine.start()).toThrow("закрыта");
  });
});
