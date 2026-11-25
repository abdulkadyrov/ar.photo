import type { PublicArTarget } from "./publicManifest";
import { abortable } from "./arCameraSession";

export type AlbumVideoState = "idle" | "loading" | "ready" | "error";
const HOT_VIDEO_BYTES = 64 * 1024 * 1024;

// One media decoder for the entire album. Only two compressed object URLs are
// kept warm; the durable per-asset cache owns the rest, outside the player.
export function createAlbumVideoPlayback(options: {
  video: HTMLVideoElement;
  targets: PublicArTarget[];
  load(index: number, signal: AbortSignal): Promise<Blob>;
  visible(index: number): boolean;
  onReady(index: number): void;
  onState(state: AlbumVideoState): void;
}) {
  const { video, targets } = options;
  const hot = new Map<number, { url: string; bytes: number }>();
  const positions = new Map<number, number>();
  let selected = -1,
    loadedIndex = -1,
    generation = 0,
    disposed = false;
  let controller: AbortController | undefined;
  let state: AlbumVideoState = "idle";
  const change = (next: AlbumVideoState) => {
    if (state === next) return;
    state = next;
    options.onState(next);
  };
  const failed = () => {
    if (!disposed && selected >= 0) change("error");
  };
  video.addEventListener("error", failed);
  const announce = (index: number) => {
    change("ready");
    options.onReady(index);
    if (options.visible(index) && targets[index].behavior.autoplay) void video.play().catch(() => undefined);
  };
  const setSource = async (index: number, entry: { url: string; bytes: number }, signal: AbortSignal) => {
    hot.delete(index);
    hot.set(index, entry);
    let bytes = [...hot.values()].reduce((sum, value) => sum + value.bytes, 0);
    for (const [key, value] of hot) {
      if (hot.size <= 2 && bytes <= HOT_VIDEO_BYTES) break;
      if (key !== index) {
        URL.revokeObjectURL(value.url);
        hot.delete(key);
        bytes -= value.bytes;
      }
    }
    video.loop = targets[index].behavior.loop;
    const ready = waitForVideoData(video, signal);
    video.src = entry.url;
    video.load();
    await ready;
    signal.throwIfAborted();
    const position = positions.get(index) ?? 0;
    if (position > 0 && Number.isFinite(video.duration) && position < video.duration) video.currentTime = position;
  };
  const select = async (index: number) => {
    if (disposed || !targets[index]) return;
    if (selected === index && state === "loading") return;
    if (selected === index && state === "ready") {
      announce(index);
      return;
    }
    if (selected >= 0 && loadedIndex === selected) positions.set(selected, video.currentTime);
    selected = index;
    const request = ++generation;
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const requestController = controller;
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      requestController.abort(new DOMException("Video loading timed out", "TimeoutError"));
    }, 120_000);
    video.pause();
    change("loading");
    try {
      let entry = hot.get(index);
      if (!entry) {
        const blob = await abortable(options.load(index, signal), signal);
        signal.throwIfAborted();
        if (disposed || request !== generation) return;
        entry = { url: URL.createObjectURL(blob), bytes: blob.size };
        hot.set(index, entry);
      }
      await setSource(index, entry, signal);
      if (!disposed && request === generation) {
        loadedIndex = index;
        announce(index);
      }
    } catch {
      if ((!signal.aborted || timedOut) && !disposed && request === generation) change("error");
    } finally {
      clearTimeout(timeout);
    }
  };
  return {
    video,
    select,
    get state() {
      return state;
    },
    lost(index: number) {
      if (selected !== index) return;
      const behavior = targets[index].behavior.markerLost;
      if (behavior !== "continue_audio_hide") video.pause();
      if (behavior === "stop_reset") {
        positions.set(index, 0);
        video.currentTime = 0;
      }
    },
    retry() {
      return select(selected);
    },
    dispose() {
      disposed = true;
      generation++;
      controller?.abort();
      video.removeEventListener("error", failed);
      video.pause();
      video.removeAttribute("src");
      video.load();
      for (const entry of hot.values()) URL.revokeObjectURL(entry.url);
      hot.clear();
      positions.clear();
    },
  };
}

function waitForVideoData(video: HTMLVideoElement, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const clean = () => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("canplay", ready);
      video.removeEventListener("error", error);
      signal.removeEventListener("abort", abort);
    };
    const ready = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        clean();
        resolve();
      }
    };
    const error = () => {
      clean();
      reject(new DOMException("Video could not be decoded", "NotSupportedError"));
    };
    const abort = () => {
      clean();
      reject(signal.reason);
    };
    const timer = setTimeout(error, 15_000);
    video.addEventListener("loadeddata", ready);
    video.addEventListener("canplay", ready);
    video.addEventListener("error", error);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}
