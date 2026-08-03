export const MARKER_QUALITY_THRESHOLD = 60;

export type MarkerQualityReason =
  "too_dark" | "too_bright" | "low_contrast" | "low_detail" | "few_features" | "quality_below_threshold";

export type MarkerQualityMetrics = {
  brightness: number;
  contrast: number;
  sharpness: number;
  featureDensity: number;
  entropy: number;
};

export type MarkerQualityResult = {
  score: number;
  suitable: boolean;
  metrics: MarkerQualityMetrics;
  reasons: MarkerQualityReason[];
};

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const calculateEntropy = (histogram: Uint32Array, sampleCount: number) => {
  if (sampleCount === 0) {
    return 0;
  }

  let entropy = 0;
  for (const count of histogram) {
    if (count === 0) {
      continue;
    }

    const probability = count / sampleCount;
    entropy -= probability * Math.log2(probability);
  }

  return clampScore((entropy / 4) * 100);
};

export function analyzeMarkerPixels(pixels: ArrayLike<number>, width: number, height: number): MarkerQualityResult {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2) {
    throw new Error("Marker dimensions must be integers greater than one");
  }

  const pixelCount = width * height;
  if (pixels.length !== pixelCount * 4) {
    throw new Error("Marker pixels must contain exactly one RGBA value per pixel");
  }

  const luminance = new Float32Array(pixelCount);
  const histogram = new Uint32Array(16);
  let luminanceSum = 0;

  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * 4;
    const alpha = Number(pixels[offset + 3]) / 255;
    const red = Number(pixels[offset]) * alpha + 255 * (1 - alpha);
    const green = Number(pixels[offset + 1]) * alpha + 255 * (1 - alpha);
    const blue = Number(pixels[offset + 2]) * alpha + 255 * (1 - alpha);
    const value = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

    luminance[index] = value;
    luminanceSum += value;
    histogram[Math.min(15, Math.floor(value / 16))] += 1;
  }

  const mean = luminanceSum / pixelCount;
  let varianceSum = 0;
  let gradientSum = 0;
  let laplacianSum = 0;
  let featureCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const center = luminance[index];
      varianceSum += (center - mean) ** 2;

      if (x + 1 < width && y + 1 < height) {
        const horizontal = luminance[index + 1] - center;
        const vertical = luminance[index + width] - center;
        const gradient = Math.hypot(horizontal, vertical);
        gradientSum += gradient;
        if (gradient >= 24) {
          featureCount += 1;
        }
      }

      if (x > 0 && x + 1 < width && y > 0 && y + 1 < height) {
        const laplacian = Math.abs(
          luminance[index - 1] +
            luminance[index + 1] +
            luminance[index - width] +
            luminance[index + width] -
            center * 4,
        );
        laplacianSum += laplacian;
      }
    }
  }

  const gradientSamples = (width - 1) * (height - 1);
  const laplacianSamples = (width - 2) * (height - 2);
  const standardDeviation = Math.sqrt(varianceSum / pixelCount);
  const brightness = clampScore(100 - (Math.abs(mean - 127.5) / 127.5) * 100);
  const contrast = clampScore((standardDeviation / 64) * 100);
  const edgeStrength = gradientSamples === 0 ? 0 : gradientSum / gradientSamples;
  const laplacianStrength = laplacianSamples === 0 ? 0 : laplacianSum / laplacianSamples;
  const sharpness = clampScore((edgeStrength / 32) * 45 + (laplacianStrength / 96) * 55);
  const featureDensity = clampScore((featureCount / gradientSamples) * 250);
  const entropy = calculateEntropy(histogram, pixelCount);
  const score = clampScore(
    brightness * 0.15 + contrast * 0.25 + sharpness * 0.25 + featureDensity * 0.2 + entropy * 0.15,
  );
  const reasons: MarkerQualityReason[] = [];

  if (mean < 55) reasons.push("too_dark");
  if (mean > 200) reasons.push("too_bright");
  if (contrast < 35) reasons.push("low_contrast");
  if (sharpness < 35) reasons.push("low_detail");
  if (featureDensity < 30) reasons.push("few_features");
  if (score < MARKER_QUALITY_THRESHOLD && reasons.length === 0) reasons.push("quality_below_threshold");

  return {
    score,
    suitable: score >= MARKER_QUALITY_THRESHOLD,
    metrics: { brightness, contrast, sharpness, featureDensity, entropy },
    reasons,
  };
}

const loadImageElement = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(source);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("Marker image could not be decoded"));
    };
    image.src = source;
  });

export async function analyzeMarkerFile(file: File, maxDimension = 512): Promise<MarkerQualityResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Marker must be an image");
  }
  if (!Number.isInteger(maxDimension) || maxDimension < 64) {
    throw new Error("Maximum marker dimension must be at least 64 pixels");
  }

  const image = typeof createImageBitmap === "function" ? await createImageBitmap(file) : await loadImageElement(file);
  const sourceWidth = image.width;
  const sourceHeight = image.height;
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(2, Math.round(sourceWidth * scale));
  const height = Math.max(2, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    if ("close" in image && typeof image.close === "function") image.close();
    throw new Error("Marker analysis canvas is unavailable");
  }

  context.drawImage(image, 0, 0, width, height);
  if ("close" in image && typeof image.close === "function") image.close();
  const data = context.getImageData(0, 0, width, height).data;
  return analyzeMarkerPixels(data, width, height);
}
