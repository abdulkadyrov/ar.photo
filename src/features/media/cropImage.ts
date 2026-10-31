import { parseCrop, type CropRect } from "./mediaEdits";

export async function cropImageFile(file: File, value: CropRect): Promise<File> {
  const crop = parseCrop(value);
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const width = image.naturalWidth * crop.width,
      height = image.naturalHeight * crop.height;
    if (Math.min(width, height) < 16) throw new Error("Кадр слишком маленький. Уменьшите увеличение.");
    const scale = Math.min(1, 2560 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Не удалось подготовить фото");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      crop.x * image.naturalWidth,
      crop.y * image.naturalHeight,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Не удалось сохранить фото"))), "image/png"),
    );
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.crop.png`, { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
}
