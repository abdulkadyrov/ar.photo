export const clientVideoTargetBytes = 48 * 1024 * 1024;
export const clientVideoHardLimitBytes = 50 * 1024 * 1024;
export const clientVideoMaxDimension = 1920;

export type VideoOptimizationInput = {
  width: number;
  height: number;
  durationSeconds: number;
};

export type VideoOptimizationResult = {
  file: File;
  strategy: "source-kept" | "webcodecs-h264";
};

export class VideoOptimizationUnavailableError extends Error {
  constructor(message = "Браузер не поддерживает локальное сжатие этого MP4/H.264") {
    super(message);
    this.name = "VideoOptimizationUnavailableError";
  }
}

export function targetVideoBitrate({ width, height }: Pick<VideoOptimizationInput, "width" | "height">) {
  const pixels = width * height;
  if (pixels <= 1280 * 720) return 1_500_000;
  if (pixels <= 1920 * 1080) return 2_800_000;
  return 4_000_000;
}

export function shouldOptimizeVideo(file: File, metadata: VideoOptimizationInput) {
  const averageBitrate = (file.size * 8) / metadata.durationSeconds;
  const targetBitrate = targetVideoBitrate(metadata) + 128_000;
  return (
    file.size > clientVideoTargetBytes ||
    Math.max(metadata.width, metadata.height) > clientVideoMaxDimension ||
    (file.size > 8 * 1024 * 1024 && averageBitrate > targetBitrate * 1.25)
  );
}

export async function optimizeVideoFile(
  file: File,
  metadata: VideoOptimizationInput,
  onProgress?: (progress: number) => void,
): Promise<VideoOptimizationResult> {
  if (!shouldOptimizeVideo(file, metadata)) return { file, strategy: "source-kept" };

  try {
    const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } =
      await import("mediabunny");
    const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
    const target = new BufferTarget();
    const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target });
    const resize = containedVideoSize(metadata.width, metadata.height, clientVideoMaxDimension);
    const conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      video: {
        codec: "avc",
        width: resize.width,
        height: resize.height,
        fit: "contain",
        bitrate: targetVideoBitrate(resize),
        keyFrameInterval: 2,
        allowRotationMetadata: false,
        forceTranscode: true,
      },
      audio: {
        codec: "aac",
        bitrate: 128_000,
        forceTranscode: true,
      },
      tags: {},
      showWarnings: false,
    });

    if (!conversion.isValid || conversion.discardedTracks.some(({ track }) => track.isVideoTrack())) {
      input.dispose();
      throw new VideoOptimizationUnavailableError();
    }

    conversion.onProgress = (progress) => onProgress?.(Math.max(0, Math.min(1, progress)));
    try {
      await conversion.execute();
    } finally {
      input.dispose();
    }
    if (!target.buffer) throw new VideoOptimizationUnavailableError("Браузер не создал оптимизированный MP4");

    const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
    const optimized = new File([target.buffer], `${baseName}.optimized.mp4`, {
      type: "video/mp4",
      lastModified: Date.now(),
    });
    if (optimized.size >= file.size || optimized.size > clientVideoHardLimitBytes) {
      if (file.size <= clientVideoHardLimitBytes) return { file, strategy: "source-kept" };
      throw new VideoOptimizationUnavailableError("Не удалось уменьшить видео до лимита 50 МБ");
    }
    onProgress?.(1);
    return { file: optimized, strategy: "webcodecs-h264" };
  } catch (error) {
    if (error instanceof VideoOptimizationUnavailableError) throw error;
    throw new VideoOptimizationUnavailableError(
      error instanceof Error ? `Локальное сжатие недоступно: ${error.message}` : undefined,
    );
  }
}

export function containedVideoSize(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: makeEven(Math.max(2, Math.round(width * scale))),
    height: makeEven(Math.max(2, Math.round(height * scale))),
  };
}

function makeEven(value: number) {
  return value % 2 === 0 ? value : value - 1;
}
