export type CropRect = { x: number; y: number; width: number; height: number };
export type VideoSegment = { start: number; end: number };
export type VideoEdits = { version: 1; crop?: CropRect; segments?: VideoSegment[] };
export type PairEdits = { markerCrop?: CropRect; video?: VideoEdits };
export type MediaSize = { width: number; height: number };
export const MAX_SEGMENTS = 32;
export const MIN_SEGMENT_SECONDS = 0.1;
export const fullCrop: CropRect = { x: 0, y: 0, width: 1, height: 1 };
export const aspectPresets = [
  { label: "А4 вертикальный", ratio: 210 / 297 },
  { label: "А4 горизонтальный", ratio: 297 / 210 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "4:5", ratio: 4 / 5 },
  { label: "1:1", ratio: 1 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "2:3", ratio: 2 / 3 },
  { label: "3:2", ratio: 3 / 2 },
];

export function cropForAspect(size: MediaSize, ratio: number, zoom = 1, x = 0.5, y = 0.5): CropRect {
  const sourceAspect = size.width / size.height;
  const width = Math.min(1, ratio / sourceAspect) / zoom;
  const height = Math.min(1, sourceAspect / ratio) / zoom;
  return { x: (1 - width) * x, y: (1 - height) * y, width, height };
}

export function editedAspect(size: MediaSize, crop = fullCrop) {
  return (size.width * crop.width) / (size.height * crop.height);
}

export function aspectsDiffer(a: number, b: number) {
  return Math.abs(Math.log(a / b)) > 0.015;
}

// This parser runs again on the worker. Only bounded numbers enter FFmpeg;
// client-supplied metadata never becomes a filter expression or shell command.
export function parseVideoEdits(value: unknown, duration: number): VideoEdits {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("Не удалось определить длительность видео");
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1)
    throw new Error("Некорректная версия монтажа");
  const result: VideoEdits = { version: 1 };
  if ("crop" in value && value.crop !== undefined) result.crop = parseCrop(value.crop);
  if ("segments" in value && value.segments !== undefined) {
    if (
      !Number.isFinite(duration) ||
      duration <= 0 ||
      !Array.isArray(value.segments) ||
      value.segments.length < 1 ||
      value.segments.length > MAX_SEGMENTS
    )
      throw new Error("Некорректные фрагменты видео");
    let previousEnd = 0;
    result.segments = value.segments.map((segment: unknown) => {
      if (
        !segment ||
        typeof segment !== "object" ||
        !("start" in segment) ||
        !("end" in segment) ||
        typeof segment.start !== "number" ||
        typeof segment.end !== "number" ||
        !Number.isFinite(segment.start + segment.end) ||
        segment.start < previousEnd - 0.00001 ||
        Math.min(segment.end, duration) - segment.start < MIN_SEGMENT_SECONDS - 0.00001 ||
        segment.end > duration + 0.1
      )
        throw new Error("Фрагмент выходит за границы видео или пересекается с другим");
      previousEnd = segment.end;
      return { start: segment.start, end: Math.min(segment.end, duration) };
    });
  }
  return result;
}

export function parseCrop(value: unknown): CropRect {
  if (!value || typeof value !== "object") throw new Error("Некорректный кадр");
  const crop = value as CropRect;
  if (
    ![crop.x, crop.y, crop.width, crop.height].every((n) => typeof n === "number" && Number.isFinite(n)) ||
    crop.x < 0 ||
    crop.y < 0 ||
    crop.width < 0.02 ||
    crop.height < 0.02 ||
    crop.x + crop.width > 1.000001 ||
    crop.y + crop.height > 1.000001
  )
    throw new Error("Кадр выходит за границы файла");
  return { x: crop.x, y: crop.y, width: crop.width, height: crop.height };
}

export function splitSegment(segments: VideoSegment[], time: number) {
  if (segments.length >= MAX_SEGMENTS) return segments;
  const index = segments.findIndex((s) => time - s.start >= MIN_SEGMENT_SECONDS && s.end - time >= MIN_SEGMENT_SECONDS);
  if (index < 0) return segments;
  const segment = segments[index];
  return [
    ...segments.slice(0, index),
    { start: segment.start, end: time },
    { start: time, end: segment.end },
    ...segments.slice(index + 1),
  ];
}

export function segmentsDuration(segments: VideoSegment[]) {
  return segments.reduce((sum, s) => sum + s.end - s.start, 0);
}
