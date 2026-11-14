import { Camera, ImageIcon, Info, Play, ScanLine, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicRuntimeConfig } from "../../shared/config/env";
import { Button } from "../../shared/ui";
import { classifyViewerError } from "./viewerCapabilities";
import { startQrCamera, stopMediaStream, waitForPublicProjectQr } from "./qrProjectScanner";
import "./PublicArViewerPage.css";

type CameraEntryMode = "intro" | "scanning" | "error";

export function ArCameraEntryRoute() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CameraEntryMode>("intro");
  const [message, setMessage] = useState("");
  const [permissionVisible, setPermissionVisible] = useState(true);
  const demo = getPublicRuntimeConfig().authMode === "demo";
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
      <section className="ar-public-intro ar-camera-intro">
        <header>
          <strong>KHANZAMA</strong>
          <span>AR-камера</span>
          <small>Живые фотографии в дополненной реальности</small>
        </header>
        <div className="ar-camera-intro-grid">
          <div className="ar-camera-explanation">
            <span className="ar-public-tag">AR-просмотр</span>
            <h1>{mode === "error" ? "Камера не запустилась" : "Оживите печатную фотографию"}</h1>
            <p>
              {mode === "error"
                ? message
                : "Откройте проект по QR-коду. Затем наведите камеру на напечатанную фотографию — на её изображении появится связанное видео."}
            </p>
            <div className="ar-camera-feature">
              <ImageIcon size={30} />
              <div>
                <h2>Только фотография</h2>
                <p>Определение по самому изображению, без специальных меток.</p>
              </div>
            </div>
            <div className="ar-camera-feature">
              <Play size={30} />
              <div>
                <h2>Видео на фотографии</h2>
                <p>Связанное видео появится прямо на изображении после его распознавания.</p>
              </div>
            </div>
            <p className="ar-camera-disclaimer">
              <Info size={22} />
              QR-код открывает проект. Для распознавания используется сама фотография.
            </p>
          </div>
          <div className="ar-camera-permission-stage">
            {demo ? (
              <div className="ar-camera-example">
                <img src={`${import.meta.env.BASE_URL}test-assets/test.jpg`} alt="Пример фотографии для AR" />
                <span>Пример AR-фото · камера ещё не включена</span>
              </div>
            ) : (
              <div className="ar-camera-illustration">
                <ImageIcon size={100} />
                <span>Фото оживёт после распознавания</span>
              </div>
            )}
            <div className="ar-camera-stage-label">
              <ScanLine size={20} />
              Наведите камеру на фотографию
            </div>
            {permissionVisible ? (
              <div className="ar-camera-permission-card" aria-labelledby="ar-camera-permission-title">
                <Camera size={40} />
                <h2 id="ar-camera-permission-title">Разрешить камеру?</h2>
                <p>
                  Камера найдёт AR-проект по QR-коду, а затем распознает фотографию, чтобы показать связанное видео.
                </p>
                <Button type="button" full onClick={() => void startScanning()}>
                  {mode === "error" ? "Повторить" : "Разрешить камеру"}
                </Button>
                <Button type="button" variant="quiet" full onClick={() => setPermissionVisible(false)}>
                  Не сейчас
                </Button>
              </div>
            ) : (
              <div className="ar-camera-start">
                <Button type="button" onClick={() => void startScanning()} icon={<Camera size={18} />}>
                  Открыть камеру
                </Button>
              </div>
            )}
            <div className="ar-camera-private">
              <ShieldCheck size={17} />
              Кадры обрабатываются на устройстве
            </div>
          </div>
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
