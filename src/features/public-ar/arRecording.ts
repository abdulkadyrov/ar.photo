export type ArRecording = {
  blob: Blob;
  durationMs: number;
  extension: "mp4" | "webm";
};

export type ArRecordingEngine = {
  readonly supported: boolean;
  readonly active: boolean;
  drawFrame(): void;
  start(): void;
  stop(): Promise<ArRecording>;
  dispose(): void;
};

type CaptureStreamVideo = HTMLVideoElement & { captureStream?: () => MediaStream };

export function preferredRecordingMimeType(recorder = globalThis.MediaRecorder) {
  if (!recorder) return null;
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((candidate) => recorder.isTypeSupported(candidate)) ?? "";
}

export function recordingCanvasSize(viewportWidth: number, viewportHeight: number, pixelRatio = 1) {
  const safeWidth = Math.max(1, viewportWidth);
  const safeHeight = Math.max(1, viewportHeight);
  const ratio = safeWidth / safeHeight;
  if (ratio <= 1) {
    const height = Math.min(1920, Math.max(720, Math.round(safeHeight * Math.min(pixelRatio, 2))));
    return { width: Math.round(height * ratio), height };
  }
  const width = Math.min(1920, Math.max(720, Math.round(safeWidth * Math.min(pixelRatio, 2))));
  return { width, height: Math.round(width / ratio) };
}

export function createArRecordingEngine(options: {
  cameraVideo: HTMLVideoElement;
  rendererCanvas: HTMLCanvasElement;
  playbackVideo: HTMLVideoElement | (() => HTMLVideoElement);
}): ArRecordingEngine {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const mimeType = preferredRecordingMimeType();
  const supported = Boolean(
    context &&
    mimeType !== null &&
    typeof canvas.captureStream === "function" &&
    typeof globalThis.MediaRecorder === "function",
  );
  let recorder: MediaRecorder | null = null;
  let outputStream: MediaStream | null = null;
  let chunks: Blob[] = [];
  let startedAt = 0;

  const resize = () => {
    if (canvas.width && canvas.height) return;
    const size = recordingCanvasSize(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1);
    canvas.width = size.width;
    canvas.height = size.height;
  };

  return {
    get supported() {
      return supported;
    },
    get active() {
      return recorder?.state === "recording";
    },
    drawFrame() {
      if (!context || recorder?.state !== "recording") return;
      resize();
      drawVideoCover(context, options.cameraVideo, canvas.width, canvas.height);
      context.drawImage(options.rendererCanvas, 0, 0, canvas.width, canvas.height);
    },
    start() {
      if (!supported || mimeType === null) {
        throw new DOMException("Screen recording unavailable", "NotSupportedError");
      }
      if (recorder?.state === "recording") return;
      resize();
      chunks = [];
      outputStream = canvas.captureStream(30);
      const playbackVideo =
        typeof options.playbackVideo === "function" ? options.playbackVideo() : options.playbackVideo;
      const playbackStream = (playbackVideo as CaptureStreamVideo).captureStream?.();
      for (const track of playbackStream?.getAudioTracks() ?? []) outputStream.addTrack(track);
      recorder = new MediaRecorder(outputStream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 8_000_000,
        audioBitsPerSecond: 192_000,
      });
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      startedAt = performance.now();
      recorder.start(500);
    },
    stop() {
      if (!recorder || recorder.state !== "recording") {
        return Promise.reject(new DOMException("Recording is not active", "InvalidStateError"));
      }
      const currentRecorder = recorder;
      const durationMs = Math.max(0, performance.now() - startedAt);
      return new Promise<ArRecording>((resolve, reject) => {
        currentRecorder.onerror = () => reject(new Error("Recording failed"));
        currentRecorder.onstop = () => {
          const type = currentRecorder.mimeType || mimeType || "video/webm";
          const extension = type.includes("mp4") ? "mp4" : "webm";
          const blob = new Blob(chunks, { type });
          outputStream?.getTracks().forEach((track) => track.stop());
          outputStream = null;
          recorder = null;
          resolve({ blob, durationMs, extension });
        };
        currentRecorder.stop();
      });
    },
    dispose() {
      if (recorder?.state === "recording") recorder.stop();
      outputStream?.getTracks().forEach((track) => track.stop());
      outputStream = null;
      recorder = null;
      chunks = [];
    },
  };
}

export async function saveArRecording(recording: ArRecording, title: string) {
  const fileName = `${safeFileName(title)}-ar.${recording.extension}`;
  const file = new File([recording.blob], fileName, { type: recording.blob.type });
  if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "AR Photo" });
    return "shared" as const;
  }
  const url = URL.createObjectURL(recording.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return "downloaded" as const;
}

function drawVideoCover(context: CanvasRenderingContext2D, video: HTMLVideoElement, width: number, height: number) {
  const sourceWidth = video.videoWidth || width;
  const sourceHeight = video.videoHeight || height;
  const sourceAspect = sourceWidth / sourceHeight;
  const targetAspect = width / height;
  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;
  if (sourceAspect > targetAspect) {
    sw = sourceHeight * targetAspect;
    sx = (sourceWidth - sw) / 2;
  } else if (sourceAspect < targetAspect) {
    sh = sourceWidth / targetAspect;
    sy = (sourceHeight - sh) / 2;
  }
  context.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
}

function safeFileName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "ar-photo"
  );
}
