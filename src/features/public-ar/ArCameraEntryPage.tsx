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
        onInvalid: () => setMessage("Это не QR-код KHANZAMA"),
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
      <section className="ar-public-intro">
        <header>
          <strong>KHANZAMA</strong>
          <span>AR-камера</span>
        </header>
        <div className="ar-public-content">
          <div className="grid aspect-[4/3] place-items-center rounded-xl border border-line bg-card text-primary">
            <Camera size={84} aria-hidden="true" />
          </div>
          <div>
            <span className="ar-public-tag">AR-просмотр</span>
            <h1>{mode === "error" ? "Камера не запустилась" : "Оживите печатную фотографию"}</h1>
            <p>
              {mode === "error"
                ? message
                : "Откройте проект по QR-коду. Затем наведите камеру на саму фотографию — на ней появится связанное видео."}
            </p>
            <div className="ar-public-buttons">
              <Button type="button" onClick={() => void startScanning()} icon={<Camera size={18} />} full>
                {mode === "error" ? "Повторить" : "Разрешить камеру"}
              </Button>
            </div>
            <p className="ar-public-note">
              <ShieldCheck size={22} /> Камера обрабатывается только на вашем устройстве.
            </p>
          </div>
        </div>
        <div className="ar-public-help">
          <h2>Только фотография и ваше видео</h2>
          <p>
            QR-код открывает проект. Для распознавания используется само изображение напечатанной фотографии, без
            специальных меток.
          </p>
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
