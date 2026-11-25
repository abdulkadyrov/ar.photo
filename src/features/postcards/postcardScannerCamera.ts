const SCAN_INTERVAL_MS = 140;
const QR_ABSENCE_RESET_MS = 650;
export type PostcardScanResult = { accepted: boolean; message: string };

export function postcardCameraError(error: unknown) {
  const name =
    error && typeof error === "object" && "name" in error && typeof error.name === "string" ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Доступ к камере не разрешён. Разрешите его в настройках браузера или введите номер открытки вручную.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "Камера не найдена. Можно выбрать экземпляры из списка или ввести номер открытки вручную.";
  if (name === "NotReadableError" || name === "TrackStartError")
    return "Камера занята другим приложением. Закройте его и повторите или введите номер вручную.";
  if (name === "TimeoutError")
    return "Камера не ответила. Закройте запрос разрешения и повторите или введите номер вручную.";
  return "Не удалось запустить сканирование в этом браузере. Попробуйте ещё раз или введите номер открытки вручную.";
}

/** Runs locally only; decoded contents are returned unchanged for the cabinet to validate. */
export async function startPostcardScanner(
  video: HTMLVideoElement,
  options: {
    signal: AbortSignal;
    onDetected: (code: string) => void;
    onReady?: () => void;
    onError?: (error: unknown) => void;
  },
): Promise<() => void> {
  let stopped = false;
  let stream: MediaStream | null = null;
  let animationFrame = 0;
  let startupTimer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    stopped = true;
    if (startupTimer) clearTimeout(startupTimer);
    window.cancelAnimationFrame(animationFrame);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      if (video.srcObject === stream) {
        video.pause();
        video.srcObject = null;
      }
      stream = null;
    }
    options.signal.removeEventListener("abort", stop);
  };
  if (options.signal.aborted) throw new DOMException("Scan cancelled", "AbortError");
  if (!navigator.mediaDevices?.getUserMedia) throw new DOMException("Camera unavailable", "NotFoundError");
  options.signal.addEventListener("abort", stop, { once: true });
  try {
    const { default: decodeQr } = await import("jsqr");
    if (stopped || options.signal.aborted) throw new DOMException("Scan cancelled", "AbortError");
    const capture = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 24, max: 30 },
        },
      })
      .then((captured) => {
        if (stopped || options.signal.aborted) {
          captured.getTracks().forEach((track) => track.stop());
          throw new DOMException("Scan cancelled", "AbortError");
        }
        return captured;
      });
    stream = await Promise.race([
      capture,
      new Promise<never>((_resolve, reject) => {
        startupTimer = setTimeout(() => reject(new DOMException("Camera timed out", "TimeoutError")), 30_000);
      }),
    ]);
    if (startupTimer) clearTimeout(startupTimer);
    if (stopped || options.signal.aborted) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
      throw new DOMException("Scan cancelled", "AbortError");
    }
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    if (stopped || options.signal.aborted) throw new DOMException("Scan cancelled", "AbortError");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new DOMException("Scanner unavailable", "NotSupportedError");
    let lastScan = -SCAN_INTERVAL_MS;
    let lastCode: string | null = null;
    let absentSince: number | null = null;
    const scan = (time: number) => {
      if (stopped) return;
      animationFrame = window.requestAnimationFrame(scan);
      if (
        time - lastScan < SCAN_INTERVAL_MS ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        !video.videoWidth ||
        !video.videoHeight
      )
        return;
      lastScan = time;
      const scale = Math.min(1, 720 / video.videoWidth, 960 / video.videoHeight);
      const width = Math.max(1, Math.round(video.videoWidth * scale));
      const height = Math.max(1, Math.round(video.videoHeight * scale));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      try {
        context.drawImage(video, 0, 0, width, height);
        const pixels = context.getImageData(0, 0, width, height);
        const decoded = decodeQr(pixels.data, pixels.width, pixels.height, { inversionAttempts: "attemptBoth" });
        if (!decoded?.data) {
          absentSince ??= time;
          if (time - absentSince >= QR_ABSENCE_RESET_MS) lastCode = null;
          return;
        }
        absentSince = null;
        if (decoded.data === lastCode) return;
        lastCode = decoded.data;
        options.onDetected(decoded.data);
      } catch (error) {
        stop();
        options.onError?.(error);
      }
    };
    animationFrame = window.requestAnimationFrame(scan);
    options.onReady?.();
    return stop;
  } catch (error) {
    stop();
    throw error;
  }
}
