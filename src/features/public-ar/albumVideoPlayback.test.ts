import { afterEach, describe, expect, it, vi } from "vitest";
import { createAlbumVideoPlayback } from "./albumVideoPlayback";
import { createPublicArPlaybackVideos } from "./mindArAdapter";
import type { PublicArManifest, PublicArTarget } from "./publicManifest";
const target: PublicArTarget = {
  targetId: "target-0",
  title: "Photo",
  marker: { width: 640, height: 480, aspectRatio: 4 / 3 },
  behavior: { autoplay: true, loop: true, markerLost: "pause_hide", audioDefault: "muted" },
  fallbackEnabled: true,
  assets: {
    trackingAssetUrl: "https://album.test/marker.mind",
    videoUrl: "https://album.test/video.mp4",
    posterUrl: "https://album.test/poster.webp",
  },
};
function fixture(count = 50, lossPauseDelayMs?: number, mutedAutoplayFallback = false) {
  const video = document.createElement("video");
  let paused = true,
    ready = 0;
  Object.defineProperties(video, {
    paused: { get: () => paused },
    readyState: { get: () => ready },
    videoWidth: { get: () => (ready ? 640 : 0) },
    duration: { get: () => 60 },
  });
  const play = vi.spyOn(video, "play").mockImplementation(async () => {
    paused = false;
  });
  vi.spyOn(video, "pause").mockImplementation(() => {
    paused = true;
  });
  vi.spyOn(video, "load").mockImplementation(() => {
    ready = 0;
    video.currentTime = 0;
    queueMicrotask(() => {
      ready = 2;
      video.dispatchEvent(new Event("loadeddata"));
    });
  });
  let sequence = 0;
  const create = vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:album-${sequence++}`);
  const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  const load = vi.fn(async (index: number, signal: AbortSignal) => {
    void index;
    void signal;
    return new Blob(["video"]);
  });
  const onReady = vi.fn(),
    onState = vi.fn();
  let visible = true;
  const targets = Array.from({ length: count }, (_, index) => ({ ...target, targetId: `target-${index}` }));
  const onAutoplayBlocked = vi.fn();
  const player = createAlbumVideoPlayback({
    video,
    targets,
    load,
    visible: () => visible,
    onReady,
    onState,
    lossPauseDelayMs,
    mutedAutoplayFallback,
    onAutoplayBlocked,
  });
  return {
    video,
    player,
    load,
    onReady,
    onState,
    onAutoplayBlocked,
    create,
    revoke,
    play,
    targets,
    hide: () => {
      visible = false;
    },
    show: () => {
      visible = true;
    },
  };
}
describe("lazy album playback", () => {
  afterEach(() => vi.restoreAllMocks());
  it("creates one unloaded media element for a 50-photo album", () => {
    const manifest: PublicArManifest = {
      version: 2,
      ...target,
      targets: Array.from({ length: 50 }, (_, index) => ({ ...target, targetId: `target-${index}` })),
      signedUrlsExpireAt: "2026-11-26T00:00:00Z",
    };
    const videos = createPublicArPlaybackVideos(manifest, true);
    expect(videos).toHaveLength(1);
    expect(videos[0].getAttribute("src")).toBeNull();
    expect(videos[0].preload).toBe("none");
  });
  it("loads only recognized videos and reuses hot sources on return", async () => {
    const f = fixture();
    expect(f.load).not.toHaveBeenCalled();
    await f.player.select(49);
    await f.player.select(12);
    await f.player.select(49);
    expect(f.load.mock.calls.map(([index]) => index)).toEqual([49, 12]);
    expect(f.create).toHaveBeenCalledTimes(2);
    expect(f.onReady.mock.calls.map(([index]) => index)).toEqual([49, 12, 49]);
    f.player.dispose();
    expect(f.revoke).toHaveBeenCalledTimes(2);
  });
  it("ignores an old download that finishes after another photograph was selected", async () => {
    const f = fixture();
    let finish: ((blob: Blob) => void) | undefined;
    f.load.mockImplementationOnce(
      () =>
        new Promise<Blob>((resolve) => {
          finish = resolve;
        }),
    );
    const first = f.player.select(0);
    await f.player.select(1);
    expect(f.load.mock.calls[0][1].aborted).toBe(true);
    finish!(new Blob(["old"]));
    await first;
    expect(f.onReady).toHaveBeenCalledExactlyOnceWith(1);
    expect(f.create).toHaveBeenCalledTimes(1);
    f.player.dispose();
  });
  it("evicts the oldest compressed source and preserves playback positions", async () => {
    const f = fixture();
    await f.player.select(0);
    f.video.currentTime = 12;
    await f.player.select(1);
    await f.player.select(2);
    expect(f.revoke).toHaveBeenCalledWith("blob:album-0");
    await f.player.select(0);
    expect(f.load.mock.calls.map(([index]) => index)).toEqual([0, 1, 2, 0]);
    expect(f.video.currentTime).toBe(12);
    f.player.dispose();
  });
  it("does not autoplay after target loss and resumes without fetching again", async () => {
    const f = fixture();
    f.hide();
    await f.player.select(0);
    expect(f.play).not.toHaveBeenCalled();
    f.show();
    await f.player.select(0);
    expect(f.play).toHaveBeenCalledOnce();
    f.player.lost(0);
    expect(f.video.paused).toBe(true);
    await f.player.select(0);
    expect(f.load).toHaveBeenCalledOnce();
    f.player.dispose();
  });
  it("surfaces a failed download and supports an explicit retry", async () => {
    const f = fixture();
    f.load.mockRejectedValueOnce(new Error("network"));
    await f.player.select(0);
    expect(f.player.state).toBe("error");
    await f.player.retry();
    expect(f.player.state).toBe("ready");
    expect(f.load).toHaveBeenCalledTimes(2);
    f.player.dispose();
  });
  it("keeps audio and video running across brief postcard tracking loss", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const f = fixture(1, 320);
    try {
      await f.player.select(0);
      expect(f.video.preload).toBe("auto");
      f.hide();
      f.player.lost(0);
      await vi.advanceTimersByTimeAsync(150);
      expect(f.video.paused).toBe(false);
      f.show();
      await f.player.select(0);
      expect(f.play).toHaveBeenCalledOnce();
      f.hide();
      f.player.lost(0);
      await vi.advanceTimersByTimeAsync(320);
      expect(f.video.paused).toBe(true);
    } finally {
      f.player.dispose();
      vi.useRealTimers();
    }
  });
  it("reports when the browser requires a gesture for audio", async () => {
    const f = fixture(1);
    f.play.mockRejectedValueOnce(new DOMException("Autoplay blocked", "NotAllowedError"));
    await f.player.select(0);
    expect(f.onAutoplayBlocked).toHaveBeenCalledOnce();
    f.player.dispose();
  });
  it("starts a postcard silently when sound autoplay is blocked", async () => {
    const f = fixture(1, undefined, true);
    f.play.mockRejectedValueOnce(new DOMException("Autoplay blocked", "NotAllowedError"));
    await f.player.select(0);
    expect(f.video.muted).toBe(true);
    expect(f.video.paused).toBe(false);
    expect(f.play).toHaveBeenCalledTimes(2);
    expect(f.onAutoplayBlocked).toHaveBeenCalledOnce();
    f.player.dispose();
  });
  it("does not assign the previous video's position to a failed new target", async () => {
    const f = fixture();
    await f.player.select(0);
    f.video.currentTime = 12;
    f.load.mockRejectedValueOnce(new Error("network"));
    await f.player.select(1);
    await f.player.retry();
    expect(f.video.currentTime).toBe(0);
    f.player.dispose();
  });
  it("aborts pending work and never installs a source after disposal", async () => {
    const f = fixture();
    let finish: ((blob: Blob) => void) | undefined;
    f.load.mockImplementationOnce(
      () =>
        new Promise<Blob>((resolve) => {
          finish = resolve;
        }),
    );
    const pending = f.player.select(0);
    f.player.dispose();
    finish!(new Blob(["late"]));
    await pending;
    expect(f.create).not.toHaveBeenCalled();
    expect(f.onReady).not.toHaveBeenCalled();
  });
  it("reports a decoder failure after playback has started", async () => {
    const f = fixture();
    await f.player.select(0);
    f.video.dispatchEvent(new Event("error"));
    expect(f.player.state).toBe("error");
    f.player.dispose();
  });
  it("times out a stalled load and permits a new attempt", async () => {
    vi.useFakeTimers();
    const f = fixture();
    try {
      f.load.mockImplementationOnce(() => new Promise<Blob>(() => undefined));
      const pending = f.player.select(0);
      await vi.advanceTimersByTimeAsync(120000);
      await pending;
      expect(f.player.state).toBe("error");
      expect(f.load.mock.calls[0][1].aborted).toBe(true);
    } finally {
      f.player.dispose();
      vi.useRealTimers();
    }
  });
});
