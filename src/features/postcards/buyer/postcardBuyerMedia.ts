import type { BuyerVideoMetadata } from "./postcardBuyerApi";

class NativeMetadataUnavailable extends Error {}
class BuyerVideoConstraintError extends Error {}
type VideoDimensions = { width: number; height: number; durationSeconds: number };
export const postcardVideoMaxBytes = 15 * 1024 * 1024;

export async function compressBuyerVideo(
  file: File,
  metadata: BuyerVideoMetadata,
  maxBytes: number,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
) {
  const maxDimension = 640;
  const bitrate = Math.min(650_000, Math.floor((maxBytes * 8 * 0.85) / metadata.durationSeconds) - 160_000);
  if (
    file.size <= maxBytes &&
    metadata.mimeType === "video/mp4" &&
    Math.max(metadata.width, metadata.height) <= maxDimension &&
    (file.size * 8) / metadata.durationSeconds <= bitrate + 160_000
  )
    return file;
  onProgress(0);
  try {
    const { optimizeVideoFile } = await import("../../media/videoOptimization");
    signal.throwIfAborted();
    const compressed = await optimizeVideoFile(file, { ...metadata, audioCodec: "aac" }, onProgress, true, {
      maxDimension,
      maxBytes,
      bitrate: Math.max(80_000, bitrate),
      signal,
    });
    if (file.size <= maxBytes && metadata.mimeType === "video/mp4" && compressed.file.size >= file.size) return file;
    return compressed.file;
  } catch {
    signal.throwIfAborted();
    if (file.size <= maxBytes) return file;
    throw new Error("Этот браузер не смог сжать видео до лимита. Выберите более короткое видео или MP4 до 15 МБ.");
  }
}

function abortError() {
  return new DOMException("Aborted", "AbortError");
}
function validateDimensions(metadata: VideoDimensions, maxVideoSeconds: number) {
  if (Number.isFinite(metadata.durationSeconds) && metadata.durationSeconds > maxVideoSeconds)
    throw new BuyerVideoConstraintError(
      `Длительность видео должна быть не больше ${Math.floor(maxVideoSeconds)} секунд.`,
    );
  if (
    !Number.isFinite(metadata.durationSeconds) ||
    metadata.durationSeconds <= 0 ||
    !Number.isInteger(metadata.width) ||
    !Number.isInteger(metadata.height) ||
    metadata.width <= 0 ||
    metadata.height <= 0
  )
    throw new NativeMetadataUnavailable("Не удалось определить длительность и размер видео. Выберите другой файл.");
  if (metadata.width > 16384 || metadata.height > 16384)
    throw new BuyerVideoConstraintError("Размер кадра видео не должен превышать 16384 × 16384 пикселей.");
  return { width: metadata.width, height: metadata.height, durationSeconds: metadata.durationSeconds };
}
function withAbort<T>(pending: Promise<T>, signal?: AbortSignal) {
  return new Promise<T>((resolve, reject) => {
    const aborted = () => reject(abortError());
    pending.then(
      (value) => {
        signal?.removeEventListener("abort", aborted);
        resolve(value);
      },
      (error) => {
        signal?.removeEventListener("abort", aborted);
        reject(error);
      },
    );
    if (signal?.aborted) {
      aborted();
      return;
    }
    signal?.addEventListener("abort", aborted, { once: true });
  });
}

async function inspectContainer(file: File, maxVideoSeconds: number, signal?: AbortSignal) {
  if (signal?.aborted) throw abortError();
  const { inspectVideoSource } = await import("../../media/videoOptimization");
  if (signal?.aborted) throw abortError();
  let metadata: VideoDimensions;
  try {
    metadata = await withAbort(inspectVideoSource(file, false), signal);
  } catch {
    if (signal?.aborted) throw abortError();
    throw new NativeMetadataUnavailable("Не удалось прочитать видеодорожку файла. Выберите другое видео.");
  }
  if (signal?.aborted) throw abortError();
  return validateDimensions(metadata, maxVideoSeconds);
}

export function videoMimeType(file: File): BuyerVideoMetadata["mimeType"] | null {
  if (file.type === "video/mp4" || file.type === "video/quicktime" || file.type === "video/webm") return file.type;
  if (file.type && file.type !== "application/octet-stream") return null;
  const extension = file.name.toLowerCase().split(".").at(-1);
  return extension === "mov"
    ? "video/quicktime"
    : extension === "webm"
      ? "video/webm"
      : extension === "mp4" || extension === "m4v"
        ? "video/mp4"
        : null;
}

export function inspectBuyerVideo(
  file: File,
  limits: { maxVideoBytes: number; maxVideoSeconds: number },
  signal?: AbortSignal,
) {
  if (file.size <= 0) return Promise.reject(new Error("Выбранный файл пуст. Выберите другое видео."));
  if (file.size > limits.maxVideoBytes)
    return Promise.reject(
      new Error(`Видео должно быть не больше ${Math.floor(limits.maxVideoBytes / 1024 / 1024)} МБ.`),
    );
  const mimeType = videoMimeType(file);
  if (!mimeType) return Promise.reject(new Error("Выберите видео MP4, MOV или WebM."));
  return new Promise<Omit<BuyerVideoMetadata, "sha256">>((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    let finished = false;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      signal?.removeEventListener("abort", aborted);
      video.onloadedmetadata = video.onerror = null;
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      if (error) reject(error);
    };
    const aborted = () => finish(new DOMException("Aborted", "AbortError"));
    const timeout = setTimeout(
      () => finish(new NativeMetadataUnavailable("Браузер не смог прочитать параметры видео.")),
      20_000,
    );
    video.onloadedmetadata = () => {
      try {
        validateDimensions(
          { width: video.videoWidth, height: video.videoHeight, durationSeconds: video.duration },
          limits.maxVideoSeconds,
        );
      } catch (error) {
        finish(error instanceof Error ? error : new NativeMetadataUnavailable("Не удалось прочитать параметры видео."));
        return;
      }
      const metadata = {
        name: file.name,
        mimeType,
        sizeBytes: file.size,
        width: video.videoWidth,
        height: video.videoHeight,
        durationSeconds: video.duration,
      };
      finish();
      resolve(metadata);
    };
    video.onerror = () => finish(new NativeMetadataUnavailable("Браузер не смог прочитать параметры видео."));
    if (signal?.aborted) {
      aborted();
      return;
    }
    signal?.addEventListener("abort", aborted, { once: true });
    video.preload = "metadata";
    video.src = url;
  })
    .catch(async (error: unknown) => {
      if (!(error instanceof NativeMetadataUnavailable)) throw error;
      const dimensions = await inspectContainer(file, limits.maxVideoSeconds, signal);
      return { name: file.name, mimeType, sizeBytes: file.size, ...dimensions };
    })
    .then(async (metadata) => {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      return {
        ...metadata,
        sha256: Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""),
      };
    });
}
