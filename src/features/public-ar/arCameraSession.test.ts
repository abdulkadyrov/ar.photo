import { describe, expect, it, vi } from "vitest";
import { constructWithManagedResize, prepareArCamera, waitForCameraFrame } from "./arCameraSession";

function readyVideo() {
  const video = document.createElement("video");
  Object.defineProperties(video, {
    videoWidth: { value: 720, configurable: true },
    videoHeight: { value: 1280, configurable: true },
    readyState: { value: 2, configurable: true },
  });
  vi.spyOn(video, "play").mockResolvedValue();
  return video;
}
function camera() {
  const stop = vi.fn();
  return { stream: { getTracks: () => [{ stop }] } as unknown as MediaStream, stop };
}

describe("AR camera lifecycle", () => {
  it("hands the QR stream to a full-screen camera video without another permission request or metadata event", async () => {
    const { stream, stop } = camera();
    const video = readyVideo();
    const lifetime = new AbortController();
    await prepareArCamera({ video, stream, constraints: {}, signal: lifetime.signal });
    expect(video.srcObject).toBe(stream);
    expect(video.style.width).toBe("100%");
    expect(video.style.height).toBe("100%");
    expect(video.muted && video.playsInline).toBe(true);
    expect(video.width).toBe(720);
    expect(video.height).toBe(1280);
    expect(stop).not.toHaveBeenCalled();
    lifetime.abort();
    expect(stop).toHaveBeenCalledOnce();
    expect(video.srcObject).toBeNull();
  });

  it("waits for usable pixels when metadata initially reports zero dimensions", async () => {
    vi.useFakeTimers();
    try {
      const video = readyVideo();
      Object.defineProperty(video, "videoWidth", { value: 0, configurable: true });
      const done = vi.fn();
      const waiting = waitForCameraFrame(video, new AbortController().signal).then(done);
      await vi.advanceTimersByTimeAsync(32);
      expect(done).not.toHaveBeenCalled();
      Object.defineProperty(video, "videoWidth", { value: 720 });
      await vi.advanceTimersByTimeAsync(32);
      await waiting;
      expect(done).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it("releases a camera granted after cancellation and permits a clean retry", async () => {
    const { stream, stop } = camera();
    let grant!: (stream: MediaStream) => void;
    const devices = {
      getUserMedia: vi.fn(
        () =>
          new Promise<MediaStream>((resolve) => {
            grant = resolve;
          }),
      ),
    };
    vi.stubGlobal("navigator", { mediaDevices: devices });
    try {
      const lifetime = new AbortController();
      const pending = prepareArCamera({ video: readyVideo(), constraints: {}, signal: lifetime.signal });
      const rejected = expect(pending).rejects.toMatchObject({ name: "AbortError" });
      lifetime.abort();
      await rejected;
      grant(stream);
      await Promise.resolve();
      expect(stop).toHaveBeenCalledOnce();
      const next = camera();
      await prepareArCamera({
        video: readyVideo(),
        stream: next.stream,
        constraints: {},
        signal: new AbortController().signal,
      });
      expect(next.stop).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("preserves permission errors and restores the browser event API after construction fails", async () => {
    const video = readyVideo();
    vi.mocked(video.play).mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    const { stream, stop } = camera();
    await expect(
      prepareArCamera({ video, stream, constraints: {}, signal: new AbortController().signal }),
    ).rejects.toMatchObject({ name: "NotAllowedError" });
    expect(stop).toHaveBeenCalledOnce();
    const original = window.addEventListener;
    expect(() =>
      constructWithManagedResize(() => {
        throw new Error("WebGL");
      }),
    ).toThrow("WebGL");
    expect(window.addEventListener).toBe(original);
  });
});
