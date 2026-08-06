import jsQR from "jsqr";

const SCAN_INTERVAL_MS = 120;
const MAX_SCAN_WIDTH = 720;

export function publicSlugFromQr(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    const segments = url.pathname.split("/").filter(Boolean);
    const arIndex = segments.lastIndexOf("ar");
    if (arIndex < 0 || arIndex + 1 >= segments.length) return null;
    return decodeURIComponent(segments[arIndex + 1] ?? "");
  } catch {
    return null;
  }
}

export function matchesPublicProjectQr(value: string, publicSlug: string) {
  return publicSlugFromQr(value) === publicSlug;
}

export async function startQrCamera(video: HTMLVideoElement, signal?: AbortSignal) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new DOMException("Camera unavailable", "NotFoundError");
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 },
    },
  });
  if (signal?.aborted) {
    stopMediaStream(stream);
    throw new DOMException("QR scan cancelled", "AbortError");
  }
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("webkit-playsinline", "");
  await video.play();
  return stream;
}

export function waitForMatchingProjectQr(
  video: HTMLVideoElement,
  publicSlug: string,
  options: { signal?: AbortSignal; onMismatch?(value: string): void } = {},
) {
  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      reject(new DOMException("QR scanner unavailable", "NotSupportedError"));
      return;
    }
    let animationFrame = 0;
    let lastScan = 0;
    let settled = false;

    const finish = (error?: unknown, value?: string) => {
      if (settled) return;
      settled = true;
      window.cancelAnimationFrame(animationFrame);
      options.signal?.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve(value ?? "");
    };
    const abort = () => finish(new DOMException("QR scan cancelled", "AbortError"));
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) {
      abort();
      return;
    }

    const scan = (time: number) => {
      if (settled) return;
      animationFrame = window.requestAnimationFrame(scan);
      if (time - lastScan < SCAN_INTERVAL_MS || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      lastScan = time;
      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      if (!sourceWidth || !sourceHeight) return;
      const scale = Math.min(1, MAX_SCAN_WIDTH / sourceWidth);
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: "attemptBoth" });
      if (!result?.data) return;
      if (matchesPublicProjectQr(result.data, publicSlug)) finish(undefined, result.data);
      else options.onMismatch?.(result.data);
    };
    animationFrame = window.requestAnimationFrame(scan);
  });
}

export function stopMediaStream(stream?: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
