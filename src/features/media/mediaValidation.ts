import type { MarkerMetadata, MediaKind, PreparedMedia, VideoMetadata } from "../../entities/media/model";
import { detectCoverFormat } from "../catalog/coverFile";

export const markerAccept = "image/jpeg,image/png,image/webp";
export const mediaAccept = `${markerAccept},video/mp4`;
export const markerMaxBytes = 25 * 1024 * 1024;
export const videoMaxBytes = 500 * 1024 * 1024;

type ImageFormat = NonNullable<ReturnType<typeof detectCoverFormat>>;
type DecodedImage = {
  width: number;
  height: number;
  draw(sourceContext: CanvasRenderingContext2D): void;
  close(): void;
};

export class MediaValidationError extends Error {
  constructor(
    readonly code: "empty" | "too_large" | "unsupported_type" | "spoofed_type" | "decode_failed" | "unsupported_codec",
    message: string,
  ) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export function classifyMediaFile(file: File): MediaKind {
  return file.type === "video/mp4" ? "video" : "marker";
}

export async function prepareMediaFile(file: File, kind = classifyMediaFile(file)): Promise<PreparedMedia> {
  return kind === "marker" ? prepareMarker(file) : prepareVideo(file);
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
  if (!format) {
    throw new MediaValidationError("unsupported_type", "Поддерживаются только корректные JPEG, PNG и WebP");
  }
  if (file.type !== format.mime) {
    throw new MediaValidationError("spoofed_type", "Тип файла не совпадает с содержимым изображения");
  }

  const decoded = await decodeImage(file);
  try {
    if (decoded.width < 1 || decoded.height < 1 || decoded.width > 12_000 || decoded.height > 12_000) {
      throw new MediaValidationError("decode_failed", "Размер изображения не поддерживается");
    }
    const normalized = await stripImageMetadata(decoded, format, file.name);
    const metadata: MarkerMetadata = { width: decoded.width, height: decoded.height, exifStripped: true };
    return { file: normalized, kind: "marker", sha256: await sha256Hex(normalized), metadata };
  } finally {
    decoded.close();
  }
}

async function prepareVideo(file: File): Promise<PreparedMedia> {
  assertFileSize(file, videoMaxBytes, "Видео должно быть не больше 500 МБ");
  if (file.type !== "video/mp4") {
    throw new MediaValidationError("unsupported_type", "Поддерживается только MP4-видео с H.264");
  }
  const head = new Uint8Array(await file.slice(0, Math.min(file.size, 2 * 1024 * 1024)).arrayBuffer());
  if (!hasMp4Signature(head)) {
    throw new MediaValidationError("spoofed_type", "Файл не является корректным MP4");
  }
  const tail =
    file.size > head.byteLength
      ? new Uint8Array(await file.slice(Math.max(0, file.size - 2 * 1024 * 1024)).arrayBuffer())
      : new Uint8Array();
  const codec = inspectMp4CodecTokens(concatBytes(head, tail));
  if (!codec) {
    throw new MediaValidationError("unsupported_codec", "Видео должно использовать кодек H.264");
  }
  const metadata = await decodeVideoMetadata(file, codec);
  return { file, kind: "video", sha256: await sha256Hex(file), metadata };
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
        draw: (context) => context.drawImage(bitmap, 0, 0),
        close: () => bitmap.close(),
      };
    }

    const image = await loadImage(file);
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (context) => context.drawImage(image, 0, 0),
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

async function stripImageMetadata(decoded: DecodedImage, format: ImageFormat, originalName: string): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = decoded.width;
  canvas.height = decoded.height;
  const context = canvas.getContext("2d", { alpha: format.mime !== "image/jpeg" });
  if (!context) throw new MediaValidationError("decode_failed", "Браузер не поддерживает обработку изображения");
  decoded.draw(context);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Canvas encoding failed"))),
      format.mime,
      format.mime === "image/jpeg" || format.mime === "image/webp" ? 0.95 : undefined,
    ),
  ).catch(() => {
    throw new MediaValidationError("decode_failed", "Не удалось безопасно подготовить изображение");
  });
  const baseName = originalName.replace(/\.[^.]+$/, "") || "marker";
  return new File([blob], `${baseName}.${format.extension}`, { type: format.mime, lastModified: Date.now() });
}

function decodeVideoMetadata(
  file: File,
  codec: Pick<VideoMetadata, "videoCodec" | "audioCodec">,
): Promise<VideoMetadata> {
  return new Promise<VideoMetadata>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const timeout = window.setTimeout(() => finish(() => reject(new Error("timeout"))), 15_000);
    const finish = (callback: () => void) => {
      window.clearTimeout(timeout);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      callback();
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const { duration, videoWidth: width, videoHeight: height } = video;
      if (!Number.isFinite(duration) || duration <= 0 || width < 1 || height < 1) {
        finish(() => reject(new Error("invalid metadata")));
        return;
      }
      finish(() => resolve({ width, height, durationSeconds: duration, ...codec }));
    };
    video.onerror = () => finish(() => reject(new Error("decode failed")));
    video.src = url;
  }).catch(() => {
    throw new MediaValidationError("decode_failed", "Видео повреждено или не декодируется браузером");
  });
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
