/** Opt-in, local-only capture. Never persists signed asset URLs or microphone audio. */
export const DIAGNOSTIC_DURATION_MS = 45_000;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const MAX_TRACKING_BYTES = 20 * 1024 * 1024;
const MAX_SAMPLES = 1000;

type Point = { x: number; y: number };
type Size = { width: number; height: number };
export type ArDiagnosticSample = {
  corners?: readonly Point[];
  filteredCorners?: readonly Point[];
  renderedMatrix?: readonly number[];
  projectionMatrix?: readonly number[];
  viewport?: Size;
  input?: Size;
  cameraTime?: number;
  frameTime?: number;
  processingMs?: number;
  found?: boolean;
  partial?: boolean;
  targetIndex?: number;
};
export type ArDiagnosticRecording = { blob: Blob; durationMs: number; fileName: string };
export type ArDiagnosticState = {
  status: "idle" | "recording" | "processing" | "ready" | "error";
  elapsedMs: number;
  bytes: number;
  result?: ArDiagnosticRecording;
  message?: string;
};
export type ArDiagnosticsEngine = {
  readonly supported: boolean;
  readonly active: boolean;
  start(): void;
  stop(): Promise<ArDiagnosticRecording>;
  addSample(sample: ArDiagnosticSample): void;
  dispose(): void;
};
type TargetGeometry = Size & {
  videoViewport?: { x: number; y: number; width: number; height: number; radius?: number };
};
type TimedSample = ArDiagnosticSample & { elapsedMs: number };
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const size = (value?: Size) =>
  value && finite(value.width) && finite(value.height) ? { width: value.width, height: value.height } : undefined;
const points = (value?: readonly Point[]) =>
  value?.length === 4 && value.every((p) => finite(p.x) && finite(p.y))
    ? value.map(({ x, y }) => ({ x, y }))
    : undefined;

/** Explicit allowlist: callers cannot accidentally export tokens, URLs, or arbitrary objects. */
export function sanitizeDiagnosticSample(sample: ArDiagnosticSample): ArDiagnosticSample {
  const result: ArDiagnosticSample = {};
  for (const key of ["cameraTime", "frameTime", "processingMs", "targetIndex"] as const) {
    if (finite(sample[key])) result[key] = sample[key];
  }
  for (const key of ["found", "partial"] as const) if (typeof sample[key] === "boolean") result[key] = sample[key];
  for (const key of ["viewport", "input"] as const) {
    const value = size(sample[key]);
    if (value) result[key] = value;
  }
  for (const key of ["corners", "filteredCorners"] as const) {
    const value = points(sample[key]);
    if (value) result[key] = value;
  }
  for (const key of ["renderedMatrix", "projectionMatrix"] as const) {
    if (sample[key]?.length === 16 && sample[key].every(finite)) result[key] = [...sample[key]];
  }
  return result;
}

export function diagnosticRecordingMimeType(recorder = globalThis.MediaRecorder) {
  if (!recorder) return null;
  return (
    ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp8", "video/webm"].find((value) =>
      recorder.isTypeSupported(value),
    ) ?? ""
  );
}

export function createArDiagnostics(options: {
  cameraVideo: HTMLVideoElement;
  playbackVideo: HTMLVideoElement;
  trackingAssets?: Blob[];
  metadata?: { targets: TargetGeometry[] };
  onState?: (state: ArDiagnosticState) => void;
}): ArDiagnosticsEngine {
  const mimeType = diagnosticRecordingMimeType();
  let recorder: MediaRecorder | undefined;
  let disposed = false;
  let state: ArDiagnosticState["status"] = "idle";
  let startedAt = 0;
  let durationMs = 0;
  let bytes = 0;
  let chunks: Blob[] = [];
  let samples: TimedSample[] = [];
  let frames: Array<{ elapsedMs: number; mediaTime: number; presentedFrames: number }> = [];
  let events: Array<{ elapsedMs: number; event: string; videoTime: number; readyState: number }> = [];
  let timer: ReturnType<typeof setInterval> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let stopTimeout: ReturnType<typeof setTimeout> | undefined;
  let frameRequest: number | undefined;
  let lastSample = -Infinity;
  let lastFrame = -Infinity;
  let completion: Promise<ArDiagnosticRecording> | undefined;
  let resolveCompletion: ((value: ArDiagnosticRecording) => void) | undefined;
  let rejectCompletion: ((reason: Error) => void) | undefined;
  let result: ArDiagnosticRecording | undefined;
  let stoppedBecause: "user" | "duration" | "size" | "camera-ended" | "page-hidden" = "user";
  const playback = options.playbackVideo;
  const camera = options.cameraVideo;
  let sourceTrack: MediaStreamTrack | undefined;
  const elapsed = () => Math.max(0, performance.now() - startedAt);
  const emit = (message?: string) =>
    options.onState?.({
      status: state,
      elapsedMs: state === "recording" ? elapsed() : durationMs,
      bytes,
      result,
      message,
    });
  const playbackEvent = (event: Event) => {
    if (state !== "recording" || events.length >= MAX_SAMPLES) return;
    events.push({
      elapsedMs: elapsed(),
      event: event.type,
      videoTime: playback.currentTime,
      readyState: playback.readyState,
    });
  };
  const playbackEvents = ["play", "playing", "pause", "waiting", "stalled", "seeking", "seeked", "ended", "error"];
  const cameraEnded = () => {
    stoppedBecause = "camera-ended";
    void stop().catch(() => undefined);
  };
  const visibilityChanged = () => {
    if (document.hidden && state === "recording") {
      stoppedBecause = "page-hidden";
      void stop().catch(() => undefined);
    }
  };
  const cleanupSampling = () => {
    clearInterval(timer);
    clearTimeout(deadline);
    timer = undefined;
    deadline = undefined;
    if (frameRequest !== undefined) camera.cancelVideoFrameCallback?.(frameRequest);
    frameRequest = undefined;
    playbackEvents.forEach((event) => playback.removeEventListener(event, playbackEvent));
    sourceTrack?.removeEventListener("ended", cameraEnded);
    document.removeEventListener("visibilitychange", visibilityChanged);
  };
  const fail = (message: string) => {
    cleanupSampling();
    clearTimeout(stopTimeout);
    const current = recorder;
    recorder = undefined;
    if (current) {
      current.onstop = null;
      current.ondataavailable = null;
      current.onerror = null;
      if (current.state !== "inactive") current.stop();
    }
    chunks = [];
    state = "error";
    rejectCompletion?.(new Error(message));
    if (!disposed) emit(message);
  };
  const finish = async () => {
    clearTimeout(stopTimeout);
    cleanupSampling();
    if (disposed || state === "error") return;
    state = "processing";
    emit();
    try {
      if (!bytes) throw new Error("empty");
      const type = recorder?.mimeType || mimeType || "video/webm";
      const extension = type.includes("mp4") ? "mp4" : "webm";
      const videoBlob = new Blob(chunks, { type });
      chunks = [];
      const { default: JSZip } = await import("jszip");
      if (disposed) return;
      const zip = new JSZip();
      zip.file(`camera.${extension}`, new Uint8Array(await videoBlob.arrayBuffer()));
      for (const [index, asset] of (options.trackingAssets ?? []).entries()) {
        zip.file(`target-${index}.mind`, new Uint8Array(await asset.arrayBuffer()));
      }
      const settings = sourceTrack?.getSettings?.() ?? {};
      const targets = options.metadata?.targets.slice(0, 100).map((target) => {
        const viewport = target.videoViewport;
        return {
          ...size(target),
          ...(viewport
            ? {
                videoViewport: {
                  ...size(viewport),
                  x: finite(viewport.x) ? viewport.x : 0,
                  y: finite(viewport.y) ? viewport.y : 0,
                  ...(finite(viewport.radius) ? { radius: viewport.radius } : {}),
                },
              }
            : {}),
        };
      });
      zip.file(
        "diagnostics.json",
        JSON.stringify({
          version: 1,
          source: "native-camera-track-no-overlay-no-audio",
          clock: {
            unit: "milliseconds",
            samples: "relative-to-recording-start",
            frameTime: "performance.now",
            recordingStart: startedAt,
          },
          durationMs,
          stoppedBecause,
          mimeType: type,
          camera: {
            width: camera.videoWidth,
            height: camera.videoHeight,
            ...(finite(settings.frameRate) ? { frameRate: settings.frameRate } : {}),
          },
          initialCameraTime: cameraStartTime,
          initialPlaybackTime: playbackStartTime,
          frameTimingAvailable: typeof camera.requestVideoFrameCallback === "function",
          targets,
          samples,
          frames,
          playbackEvents: events,
          limits: { durationMs: DIAGNOSTIC_DURATION_MS, samplingHz: 15, maxSamples: MAX_SAMPLES },
          note: "Video encoding can influence device load. MediaRecorder and camera frame clocks are approximate, not frame-exact synchronization.",
        }),
      );
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
      if (disposed) return;
      result = { blob, durationMs, fileName: "khanzama-ar-diagnostics.zip" };
      state = "ready";
      recorder = undefined;
      resolveCompletion?.(result);
      emit();
    } catch {
      fail("Не удалось сохранить диагностику. Повторите запись покороче.");
    }
  };
  let cameraStartTime = 0;
  let playbackStartTime = 0;
  const captureFrame: VideoFrameRequestCallback = (_now, metadata) => {
    if (state !== "recording" || disposed) return;
    const time = elapsed();
    if (time - lastFrame >= 1000 / 15 && frames.length < MAX_SAMPLES) {
      lastFrame = time;
      frames.push({ elapsedMs: time, mediaTime: metadata.mediaTime, presentedFrames: metadata.presentedFrames });
    }
    frameRequest = camera.requestVideoFrameCallback(captureFrame);
  };
  function stop(): Promise<ArDiagnosticRecording> {
    if (result) return Promise.resolve(result);
    if (!completion || disposed || state === "idle" || state === "error") {
      return Promise.reject(new Error("Сначала начните запись диагностики."));
    }
    if (state === "recording") {
      durationMs = elapsed();
      state = "processing";
      cleanupSampling();
      emit();
      stopTimeout = setTimeout(() => fail("Запись не завершилась. Повторите попытку."), 15_000);
      if (recorder?.state !== "inactive") recorder?.stop();
      else void finish();
    }
    return completion;
  }
  return {
    get supported() {
      return mimeType !== null && typeof globalThis.MediaStream === "function";
    },
    get active() {
      return state === "recording";
    },
    start() {
      if (disposed) throw new Error("Диагностика закрыта.");
      if (state === "recording" || state === "processing") return;
      if (mimeType === null)
        throw new Error("Запись камеры не поддерживается этим браузером. Откройте страницу в Safari.");
      const source = camera.srcObject as MediaStream | null;
      sourceTrack = source?.getVideoTracks?.().find((track) => track.readyState === "live");
      if (!sourceTrack) throw new Error("Дождитесь запуска камеры.");
      if ((options.trackingAssets ?? []).reduce((sum, blob) => sum + blob.size, 0) > MAX_TRACKING_BYTES) {
        throw new Error("Для диагностики выберите одну открытку вместо большого альбома.");
      }
      // New container, same video track: no microphone and no track.stop() on shared AR camera.
      recorder = new MediaRecorder(new MediaStream([sourceTrack]), {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 2_500_000,
      });
      bytes = 0;
      chunks = [];
      samples = [];
      frames = [];
      events = [];
      result = undefined;
      lastSample = -Infinity;
      lastFrame = -Infinity;
      stoppedBecause = "user";
      startedAt = performance.now();
      durationMs = 0;
      cameraStartTime = camera.currentTime;
      playbackStartTime = playback.currentTime;
      completion = new Promise((resolve, reject) => {
        resolveCompletion = resolve;
        rejectCompletion = reject;
      });
      // Automatic stop/error can precede a user awaiting stop().
      void completion.catch(() => undefined);
      recorder.ondataavailable = (event) => {
        if (disposed || state === "error" || !event.data.size) return;
        if (bytes + event.data.size > MAX_VIDEO_BYTES) {
          fail("Запись получилась слишком большой. Повторите запись покороче.");
          return;
        }
        chunks.push(event.data);
        bytes += event.data.size;
        if (bytes >= MAX_VIDEO_BYTES * 0.8 && state === "recording") {
          stoppedBecause = "size";
          void stop().catch(() => undefined);
        }
      };
      recorder.onstop = () => {
        void finish();
      };
      recorder.onerror = () => fail("Запись камеры прервалась. Повторите попытку.");
      state = "recording";
      try {
        recorder.start(1000);
      } catch {
        fail("Не удалось начать запись камеры.");
        return;
      }
      playbackEvents.forEach((event) => playback.addEventListener(event, playbackEvent));
      sourceTrack.addEventListener("ended", cameraEnded);
      document.addEventListener("visibilitychange", visibilityChanged);
      if (typeof camera.requestVideoFrameCallback === "function")
        frameRequest = camera.requestVideoFrameCallback(captureFrame);
      timer = setInterval(() => emit(), 1000);
      deadline = setTimeout(() => {
        stoppedBecause = "duration";
        void stop().catch(() => undefined);
      }, DIAGNOSTIC_DURATION_MS);
      emit();
    },
    stop,
    addSample(sample) {
      if (state !== "recording" || samples.length >= MAX_SAMPLES) return;
      const time = elapsed();
      if (time - lastSample < 1000 / 15) return;
      lastSample = time;
      samples.push({ ...sanitizeDiagnosticSample(sample), elapsedMs: time });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cleanupSampling();
      clearTimeout(stopTimeout);
      if (recorder) {
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.ondataavailable = null;
        if (recorder.state !== "inactive") recorder.stop();
      }
      recorder = undefined;
      chunks = [];
      samples = [];
      frames = [];
      events = [];
      rejectCompletion?.(new DOMException("Диагностика закрыта.", "AbortError"));
    },
  };
}
