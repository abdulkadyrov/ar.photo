import { Camera, ScanLine, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui";
import { classifyViewerError } from "./viewerCapabilities";
import { startQrCamera, stopMediaStream, waitForPublicProjectQr } from "./qrProjectScanner";
import "./PublicArViewerPage.css";

type CameraEntryMode = "intro" | "scanning" | "error";

export function ArCameraEntryRoute() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CameraEntryMode>("intro");
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    },
    [],
  );

  const startScanning = async () => {
    controllerRef.current?.abort();
    stopMediaStream(streamRef.current);
    const controller = new AbortController();
    controllerRef.current = controller;
    setMessage("");
    setMode("scanning");
    await nextPaint();

    try {
      const video = videoRef.current;
      if (!video) throw new DOMException("QR camera unavailable", "NotFoundError");
      const stream = await startQrCamera(video, controller.signal);
      streamRef.current = stream;
      const result = await waitForPublicProjectQr(video, {
        signal: controller.signal,
        onInvalid: () => setMessage("Это не QR-код AR Photo"),
      });
      stopMediaStream(stream);
      streamRef.current = null;
      navigate(`/ar/${encodeURIComponent(result.publicSlug)}`);
    } catch (error) {
      if (controller.signal.aborted) return;
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      setMessage(classifyViewerError(error));
      setMode("error");
    }
  };

  if (mode === "scanning") {
    return (
      <main className="ar-viewer" data-mode="camera-entry">
        <section className="ar-pairing" aria-live="polite">
          <video ref={videoRef} className="ar-pairing-camera" autoPlay muted playsInline aria-hidden="true" />
          <div className="ar-pairing-shade" />
          <CornerGuide />
          <div className="ar-pairing-card">
            <ScanLine size={23} />
            <h1>Наведите камеру на QR-код</h1>
            <p>После распознавания откроется нужная AR-фотография</p>
            {message ? <span className="ar-pairing-warning">{message}</span> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="ar-viewer" data-mode="camera-entry">
      <section className="ar-intro ar-camera-entry-intro">
        <div className="ar-camera-entry-backdrop" />
        <div className="ar-intro-shade" />
        <div className="ar-intro-card">
          <span className="ar-intro-icon">{mode === "error" ? <Camera size={22} /> : <ScanLine size={22} />}</span>
          <span className="ar-intro-label">AR Photo</span>
          <h1>{mode === "error" ? "Камера не запустилась" : "Сканируйте QR-код"}</h1>
          <p>
            {mode === "error"
              ? message
              : "Наведите камеру на QR проекта. Затем AR Photo загрузит материалы и попросит навести камеру на фотографию."}
          </p>
          <Button type="button" onClick={() => void startScanning()} icon={<Camera size={18} />} full>
            {mode === "error" ? "Повторить" : "Включить камеру"}
          </Button>
          <span className="ar-intro-privacy">
            <ShieldCheck size={15} /> Камера обрабатывается только на устройстве
          </span>
        </div>
      </section>
    </main>
  );
}

function CornerGuide() {
  return (
    <div className="ar-qr-guide" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

function nextPaint() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}
