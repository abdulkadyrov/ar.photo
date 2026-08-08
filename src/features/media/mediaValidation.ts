import type { MarkerMetadata, MediaKind, PreparedMedia, VideoMetadata } from "../../entities/media/model";
import { detectCoverFormat } from "../catalog/coverFile";
import {
  clientVideoHardLimitBytes,
  inspectVideoSource,
  optimizeVideoFile,
  VideoOptimizationUnavailableError,
} from "./videoOptimization";

// Keep the marker picker permissive because camera exports sometimes arrive
// without a reliable MIME type. The video picker is intentionally restricted:
// desktop and mobile file choosers should only offer videos for that slot.
export const markerAccept = "";
export const videoAccept = "video/*,.mp4,.mov,.m4v,.avi,.webm,.mkv,.mpeg,.mpg,.mts,.m2ts,.3gp,.3g2,.wmv,.flv";
export const mediaAccept = "";
export const markerMaxBytes = 25 * 1024 * 1024;
export const videoMaxBytes = 500 * 1024 * 1024;
export const markerTargetBytes = 4 * 1024 * 1024;
export const markerMaxDimension = 2560;

type ImageFormat = NonNullable<ReturnType<typeof detectCoverFormat>>;
type DecodedImage = {
  width: number;
  height: number;
  draw(sourceContext: CanvasRenderingContext2D, width: number, height: number): void;
  close(): void;
};
type DecodedVideoMetadata = {
  width: number;
  height: number;
  durationSeconds: number;
  videoCodec: "h264";
  audioCodec: "aac" | "none";
};

export type PrepareMediaOptions = {
  onProgress?: (progress: number) => void;
};

export class MediaValidationError extends Error {
  constructor(
    readonly code:
      | "empty"
      | "too_large"
      | "unsupported_type"
      | "spoofed_type"
      | "decode_failed"
      | "unsupported_codec"
      | "optimization_unavailable",
    message: string,
  ) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export function classifyMediaFile(file: File): MediaKind {
  if (file.type.toLowerCase().startsWith("video/")) return "video";
  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  return extension && videoExtensions.has(extension) ? "video" : "marker";
}

export function matchesMediaPickerKind(file: File, kind: "marker" | "video") {
  const mime = file.type.toLowerCase();
  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (kind === "video") {
    return mime.startsWith("video/") || Boolean(extension && videoExtensions.has(extension));
  }
  return mime.startsWith("image/") || Boolean(extension && markerExtensions.has(extension));
}

export async function prepareMediaFile(
  file: File,
  kind = classifyMediaFile(file),
  options: PrepareMediaOptions = {},
): Promise<PreparedMedia> {
  return kind === "marker" ? prepareMarker(file) : prepareVideo(file, options);
}

export async function prepareUnclassifiedMediaFile(
  file: File,
  options: PrepareMediaOptions = {},
): Promise<PreparedMedia> {
  const suggestedKind = classifyMediaFile(file);
  try {
    return await prepareMediaFile(file, suggestedKind, options);
  } catch (firstError) {
    const declaredKind = file.type.toLowerCase().split("/", 1)[0];
    if (declaredKind === "image" || declaredKind === "video") throw firstError;
    try {
      return await prepareMediaFile(file, suggestedKind === "marker" ? "video" : "marker", options);
    } catch {
      throw firstError;
    }
  }
}

export async function sha256Hex(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hasMp4Signature(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp";
}

export function inspectMp4CodecTokens(bytes: Uint8Array): Pick<VideoMetadata, "videoCodec" | "audioCodec"> | null {
  if (!hasAsciiToken(bytes, "avc1") && !hasAsciiToken(bytes, "avc3")) return null;
  return { videoCodec: "h264", audioCodec: hasAsciiToken(bytes, "mp4a") ? "aac" : "none" };
}

async function prepareMarker(file: File): Promise<PreparedMedia> {
  assertFileSize(file, markerMaxBytes, "Изображение-маркер должно быть не больше 25 МБ");
  const format = detectCoverFormat(new Uint8Array(await file.slice(0, 12).arrayBuffer()));

  const decoded = await decodeImage(file);
  try {
    if (decoded.width < 1 || decoded.height < 1 || decoded.width > 12_000 || decoded.height > 12_000) {
      throw new MediaValidationError("decode_failed", "Размер изображения не поддерживается");
    }
    const normalized = await optimizeMarkerImage(decoded, format, file);
    const savedBytes = Math.max(0, file.size - normalized.file.size);
    const metadata: MarkerMetadata = {
      width: normalized.width,
      height: normalized.height,
      exifStripped: true,
      optimization: {
        strategy: "adaptive-image",
        originalWidth: decoded.width,
        originalHeight: decoded.height,
        originalBytes: file.size,
        uploadBytes: normalized.file.size,
        savedBytes,
        reductionPercent: reductionPercent(file.size, normalized.file.size),
        optimized: savedBytes > 0,
      },
    };
    return { file: normalized.file, kind: "marker", sha256: await sha256Hex(normalized.file), metadata };
  } finally {
    decoded.close();
  }
}

async function prepareVideo(file: File, options: PrepareMediaOptions): Promise<PreparedMedia> {
  assertFileSize(file, videoMaxBytes, "Видео должно быть не больше 500 МБ");
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 2 * 1024 * 1024)).arrayBuffer());
  const tail =
    file.size > head.byteLength
      ? new Uint8Array(await file.slice(Math.max(0, file.size - 2 * 1024 * 1024)).arrayBuffer())
      : new Uint8Array();
  const codec = inspectMp4CodecTokens(concatBytes(head, tail));
  let inspected: Awaited<ReturnType<typeof inspectVideoSource>>;
  try {
    inspected = await inspectVideoSource(file);
  } catch (error) {
    const claimsMp4 = file.type.toLowerCase() === "video/mp4" || /\.mp4$/i.test(file.name);
    if (claimsMp4 && !hasMp4Signature(head)) {
      throw new MediaValidationError(
        "unsupported_codec",
        error instanceof Error ? error.message : "MP4-файл повреждён или имеет неверное расширение",
      );
    }
    return prepareServerTranscode(file);
  }
  const sourceIsCompatible =
    hasMp4Signature(head) &&
    inspected.videoCodec === "avc" &&
    (inspected.audioCodec === null || inspected.audioCodec === "aac") &&
    Boolean(codec);
  const normalizedSource = sourceIsCompatible
    ? new File([file], `${file.name.replace(/\.[^.]+$/, "") || "video"}.mp4`, {
        type: "video/mp4",
        lastModified: file.lastModified,
      })
    : file;
  const sourceMetadata: DecodedVideoMetadata = {
    width: inspected.width,
    height: inspected.height,
    durationSeconds: inspected.durationSeconds,
    videoCodec: "h264",
    audioCodec: inspected.audioCodec === null ? "none" : "aac",
  };
  let optimized;
  try {
    optimized = await optimizeVideoFile(normalizedSource, sourceMetadata, options.onProgress, !sourceIsCompatible);
  } catch (error) {
    if (
      sourceIsCompatible &&
      normalizedSource.size <= clientVideoHardLimitBytes &&
      error instanceof VideoOptimizationUnavailableError
    ) {
      optimized = { file: normalizedSource, strategy: "source-kept" as const };
    } else {
      return prepareServerTranscode(file, inspected);
    }
  }
  const optimizedMetadata =
    optimized.strategy === "source-kept"
      ? sourceMetadata
      : await validateOptimizedVideo(optimized.file, sourceMetadata.audioCodec);
  const savedBytes = Math.max(0, file.size - optimized.file.size);
  const metadata: VideoMetadata = {
    ...optimizedMetadata,
    optimization: {
      strategy: optimized.strategy,
      originalBytes: file.size,
      uploadBytes: optimized.file.size,
      savedBytes,
      reductionPercent: reductionPercent(file.size, optimized.file.size),
      optimized: optimized.strategy !== "source-kept",
    },
  };
  return { file: optimized.file, kind: "video", sha256: await sha256Hex(optimized.file), metadata };
}

async function prepareServerTranscode(
  file: File,
  inspected?: Awaited<ReturnType<typeof inspectVideoSource>>,
): Promise<PreparedMedia> {
  const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
  // Supabase Storage validates the declared upload MIME. The worker probes the
  // actual bytes with FFmpeg, so retaining the bytes while using the canonical
  // video MIME lets MOV/HEVC/WebM sources take the secure server fallback.
  const source = new File([file], `${baseName}.source.mp4`, {
    type: "video/mp4",
    lastModified: file.lastModified,
  });
  const metadata: VideoMetadata = {
    width: inspected?.width ?? null,
    height: inspected?.height ?? null,
    durationSeconds: inspected?.durationSeconds ?? null,
    videoCodec: "source",
    audioCodec: inspected?.audioCodec === null ? "none" : "source",
    serverTranscodeRequired: true,
    sourceVideoCodec: inspected?.videoCodec,
    sourceAudioCodec: inspected?.audioCodec,
    optimization: {
      strategy: "server-transcode",
      originalBytes: file.size,
      uploadBytes: source.size,
      savedBytes: 0,
      reductionPercent: 0,
      optimized: false,
    },
  };
  return { file: source, kind: "video", sha256: await sha256Hex(source), metadata };
}

function assertFileSize(file: File, maxBytes: number, message: string) {
  if (file.size === 0) throw new MediaValidationError("empty", "Файл пуст");
  if (file.size > maxBytes) throw new MediaValidationError("too_large", message);
}

async function decodeImage(file: File): Promise<DecodedImage> {
  try {
    if ("createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (context, width, height) => context.drawImage(bitmap, 0, 0, width, height),
        close: () => bitmap.close(),
      };
    }

    const image = await loadImage(file);
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (context, width, height) => context.drawImage(image, 0, 0, width, height),
      close: () => undefined,
    };
  } catch (error) {
    if (error instanceof MediaValidationError) throw error;
    throw new MediaValidationError("decode_failed", "Изображение повреждено или не декодируется");
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image decode failed"));
    };
    image.src = url;
  });
}

async function optimizeMarkerImage(decoded: DecodedImage, format: ImageFormat | null, originalFile: File) {
  const dimensions = containedDimensions(decoded.width, decoded.height, markerMaxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const outputMime = format?.mime === "image/jpeg" ? "image/jpeg" : "image/webp";
  const context = canvas.getContext("2d", { alpha: outputMime !== "image/jpeg" });
  if (!context) throw new MediaValidationError("decode_failed", "Браузер не поддерживает обработку изображения");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  decoded.draw(context, dimensions.width, dimensions.height);

  const qualities = outputMime === "image/jpeg" ? [0.9, 0.84, 0.78, 0.72] : [0.88, 0.82, 0.76, 0.7];
  let selected: Blob | undefined;
  for (const quality of qualities) {
    const candidate = await canvasBlob(canvas, outputMime, quality);
    if (!selected || candidate.size < selected.size) selected = candidate;
    if (candidate.size <= markerTargetBytes) {
      selected = candidate;
      break;
    }
  }
  if (!selected) throw new MediaValidationError("decode_failed", "Не удалось безопасно подготовить изображение");
  const actualMime = selected.type || outputMime;
  const extension = actualMime === "image/jpeg" ? "jpg" : actualMime === "image/webp" ? "webp" : "png";
  const baseName = originalFile.name.replace(/\.[^.]+$/, "") || "marker";
  return {
    file: new File([selected], `${baseName}.optimized.${extension}`, {
      type: actualMime,
      lastModified: Date.now(),
    }),
    ...dimensions,
  };
}

const markerExtensions = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif", "avif", "gif", "bmp", "tif", "tiff"]);
const videoExtensions = new Set([
  "mp4",
  "mov",
  "m4v",
  "mkv",
  "webm",
  "avi",
  "mpeg",
  "mpg",
  "mts",
  "m2ts",
  "3gp",
  "3g2",
  "wmv",
  "flv",
]);

async function validateOptimizedVideo(file: File, expectedAudioCodec: "aac" | "none") {
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 2 * 1024 * 1024)).arrayBuffer());
  const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 2 * 1024 * 1024)).arrayBuffer());
  const codec = inspectMp4CodecTokens(concatBytes(head, tail));
  if (!codec) throw new MediaValidationError("unsupported_codec", "После оптимизации не удалось подтвердить H.264");
  const inspected = await inspectVideoSource(file).catch(() => {
    throw new MediaValidationError("decode_failed", "После оптимизации видео не декодируется браузером");
  });
  if (inspected.videoCodec !== "avc") {
    throw new MediaValidationError("unsupported_codec", "После оптимизации не удалось подтвердить H.264");
  }
  if (expectedAudioCodec === "aac" && inspected.audioCodec !== "aac") {
    throw new MediaValidationError("unsupported_codec", "После оптимизации пропала аудиодорожка AAC");
  }
  return {
    width: inspected.width,
    height: inspected.height,
    durationSeconds: inspected.durationSeconds,
    ...codec,
  };
}

export function containedDimensions(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasBlob(canvas: HTMLCanvasElement, mime: string, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Canvas encoding failed"))), mime, quality),
  ).catch(() => {
    throw new MediaValidationError("decode_failed", "Не удалось безопасно подготовить изображение");
  });
}

function reductionPercent(originalBytes: number, uploadBytes: number) {
  if (originalBytes <= 0 || uploadBytes >= originalBytes) return 0;
  return Math.round(((originalBytes - uploadBytes) / originalBytes) * 1000) / 10;
}

function concatBytes(left: Uint8Array, right: Uint8Array) {
  const result = new Uint8Array(left.length + right.length);
  result.set(left);
  result.set(right, left.length);
  return result;
}

function ascii(bytes: Uint8Array, from: number, to: number) {
  return String.fromCharCode(...bytes.subarray(from, to));
}

function hasAsciiToken(bytes: Uint8Array, token: string) {
  const tokenBytes = new TextEncoder().encode(token);
  outer: for (let index = 0; index <= bytes.length - tokenBytes.length; index += 1) {
    for (let offset = 0; offset < tokenBytes.length; offset += 1) {
      if (bytes[index + offset] !== tokenBytes[offset]) continue outer;
    }
    return true;
  }
  return false;
}
