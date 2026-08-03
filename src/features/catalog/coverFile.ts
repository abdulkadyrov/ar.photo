export const coverFileAccept = "image/jpeg,image/png,image/webp";
export const coverFileMaxBytes = 10 * 1024 * 1024;

type CoverFormat = { mime: "image/jpeg" | "image/png" | "image/webp"; extension: "jpg" | "png" | "webp" };

export class CoverFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoverFileError";
  }
}

export async function validateCoverFile(file: File): Promise<CoverFormat> {
  if (file.size === 0) throw new CoverFileError("Файл обложки пуст");
  if (file.size > coverFileMaxBytes) throw new CoverFileError("Обложка должна быть не больше 10 МБ");

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const format = detectCoverFormat(bytes);
  if (!format) throw new CoverFileError("Поддерживаются только корректные JPEG, PNG и WebP");
  if (file.type !== format.mime) throw new CoverFileError("Тип файла не совпадает с содержимым изображения");
  return format;
}

export function detectCoverFormat(bytes: Uint8Array): CoverFormat | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mime: "image/png", extension: "png" };
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return { mime: "image/webp", extension: "webp" };
  }
  return null;
}

function ascii(bytes: Uint8Array, from: number, to: number) {
  return String.fromCharCode(...bytes.slice(from, to));
}
