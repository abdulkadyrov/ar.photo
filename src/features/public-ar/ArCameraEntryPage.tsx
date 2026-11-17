import { Camera, ScanLine, ShieldCheck } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { classifyViewerError } from "./viewerCapabilities";
import { startQrCamera, stopMediaStream, waitForPublicProjectQr } from "./qrProjectScanner";
import "./PublicArViewerPage.css";

type CameraEntryMode = "starting" | "scanning" | "error";

export function ArCameraEntryRoute() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CameraEntryMode>("starting");
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const startScanning = async () => {
    controllerRef.current?.abort();
    stopMediaStream(streamRef.current);
    const controller = new AbortController();
    controllerRef.current = controller;
    setMessage("");
    setMode("starting");
    try {
      const video = videoRef.current;
      if (!video) throw new DOMException("QR camera unavailable", "NotFoundError");
      const stream = await startQrCamera(video, controller.signal);
      if (controller.signal.aborted) {
        stopMediaStream(stream);
        return;
      }
      streamRef.current = stream;
      setMode("scanning");
      const result = await waitForPublicProjectQr(video, {
        signal: controller.signal,
        onInvalid: () => setMessage("Это не QR-код Хан Зама"),
      });
      stopMediaStream(stream);
      streamRef.current = null;
      navigate(`/ar/${encodeURIComponent(result.publicSlug)}`);
    } catch (error) {
      if (controller.signal.aborted) return;
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      setMessage(classifyViewerError(error).replace(/ Можно открыть обычное видео\.| или откройте обычное видео/g, ""));
      setMode("error");
    }
  };
  const autoStart = useEffectEvent(() => void startScanning());
  useEffect(() => {
    // Defer until after StrictMode's setup/cleanup probe to request permission once.
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) autoStart();
    });
    return () => {
      cancelled = true;
      controllerRef.current?.abort();
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  return (
    <main className="ar-viewer ar-camera-live" data-mode={mode}>
      <video ref={videoRef} className="ar-pairing-camera" autoPlay muted playsInline aria-hidden="true" />
      <div className="ar-camera-vignette" aria-hidden="true" />
      <header className="ar-camera-brand">
        <strong>Хан Зама</strong>
        <span>Живые фотографии</span>
      </header>
      {mode === "starting" ? (
        <div className="ar-camera-launch" role="status">
          <Camera size={36} aria-hidden="true" />
          <h1>Хан Зама</h1>
          <p>Открываем камеру…</p>
          <small>Разрешите доступ в запросе браузера</small>
        </div>
      ) : null}
      {mode === "scanning" ? (
        <>
          <div className="ar-qr-guide" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="ar-camera-instruction" role="status">
            <ScanLine size={24} aria-hidden="true" />
            <h1>Наведите на QR-код</h1>
            <p>Затем наведите камеру на фотографию</p>
            {message ? <p className="ar-pairing-warning">{message}</p> : null}
          </div>
        </>
      ) : null}
      {mode === "error" ? (
        <div className="ar-camera-launch ar-camera-error" role="alert">
          <Camera size={36} aria-hidden="true" />
          <h1>Камера не запустилась</h1>
          <p>{message}</p>
          <Button type="button" onClick={() => void startScanning()}>
            Повторить
          </Button>
        </div>
      ) : null}
      <footer className="ar-camera-footnote">
        <ShieldCheck size={16} aria-hidden="true" />
        Кадры остаются на устройстве
      </footer>
    </main>
  );
}
