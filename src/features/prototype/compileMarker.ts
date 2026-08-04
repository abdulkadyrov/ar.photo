const MAX_TRACKING_DIMENSION = 1280;

export async function compilePrototypeMarker(
  imageBlob: Blob,
  onProgress?: (progress: number) => void,
): Promise<{ blob: Blob; width: number; height: number }> {
  const image = await loadImage(imageBlob);
  const scale = Math.min(1, MAX_TRACKING_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Браузер не смог подготовить изображение для AR");
  context.drawImage(image, 0, 0, width, height);

  const { Compiler } = await import("mind-ar/src/image-target/compiler.js");
  const compiler = new Compiler();
  await compiler.compileImageTargets([canvas], (progress) => onProgress?.(Math.round(progress)));
  const bytes = compiler.exportData();
  if (!bytes.byteLength) throw new Error("Не удалось создать tracking-файл");
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return {
    blob: new Blob([arrayBuffer], { type: "application/octet-stream" }),
    width,
    height,
  };
}

export async function readPrototypeMarkerDimensions(imageBlob: Blob) {
  const image = await loadImage(imageBlob);
  return { width: image.naturalWidth, height: image.naturalHeight };
}

function loadImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось прочитать фотографию для AR"));
    };
    image.src = url;
  });
}
