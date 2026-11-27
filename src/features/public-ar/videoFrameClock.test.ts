import { afterEach, describe, expect, it, vi } from "vitest";
import { createVideoFrameClock } from "./videoFrameClock";
afterEach(() => vi.restoreAllMocks());
describe("actual video frame clock", () => {
  it("does not treat advancing playback time as a new decoded frame, including Safari's zero mediaTime", () => {
    let callback: VideoFrameRequestCallback;
    const video = {
      currentTime: 1,
      requestVideoFrameCallback: vi.fn((cb) => {
        callback = cb;
        return 1;
      }),
      cancelVideoFrameCallback: vi.fn(),
    } as unknown as HTMLVideoElement;
    vi.spyOn(performance, "now").mockReturnValue(100);
    const controller = new AbortController();
    const clock = createVideoFrameClock(video, controller.signal);
    callback!(105, { presentedFrames: 10, mediaTime: 0 } as VideoFrameCallbackMetadata);
    expect(clock.read()).toBe(105);
    video.currentTime = 1.01;
    expect(clock.read()).toBe(105);
    callback!(115, { presentedFrames: 10, mediaTime: 0 } as VideoFrameCallbackMetadata);
    expect(clock.read()).toBe(105);
    callback!(138, { presentedFrames: 11, mediaTime: 0 } as VideoFrameCallbackMetadata);
    expect(clock.read()).toBe(138);
    controller.abort();
    expect(video.cancelVideoFrameCallback).toHaveBeenCalled();
    callback!(170, { presentedFrames: 12, mediaTime: 0 } as VideoFrameCallbackMetadata);
    expect(clock.read()).toBe(138);
  });
  it("preserves timestamp deduplication for canvas sources and browsers without frame callbacks", () => {
    const video = { currentTime: 0 } as HTMLVideoElement;
    const now = vi.spyOn(performance, "now").mockReturnValue(100);
    const clock = createVideoFrameClock(video, new AbortController().signal);
    now.mockReturnValue(120);
    expect(clock.read()).toBe(100);
    video.currentTime = 1 / 30;
    expect(clock.read()).toBe(120);
    now.mockReturnValue(140);
    expect(clock.read()).toBe(120);
    clock.dispose();
  });
});
