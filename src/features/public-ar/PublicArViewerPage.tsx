import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./PublicArViewerPage.css";
import { AlertTriangle, Camera, Check, Download, LoaderCircle, Play, ScanLine, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "../../shared/ui";
import { saveArRecording, type ArRecording } from "./arRecording";
import {
  cachePublicArProject,
  loadCachedPublicArProject,
  materializeCachedPublicArProject,
  type CachedPublicArProject,
  type MaterializedPublicArProject,
} from "./publicArCache";
import {
  initialArMuted,
  loadPublicManifest,
  manifestRefreshDelay,
  PublicManifestError,
  type PublicArManifest,
} from "./publicManifest";
import {
  createPublicArPlaybackVideo,
  startPublicMindAr,
  type PublicArSession,
  type PublicArTrackingState,
} from "./mindArAdapter";
import { startQrCamera, stopMediaStream, waitForMatchingProjectQr } from "./qrProjectScanner";
import { capabilityMessage, classifyViewerError, detectViewerCapabilities } from "./viewerCapabilities";
import { createPublicArTelemetry, videoMilestones, viewerErrorCode } from "./telemetry";

type ViewerMode =
  "loading" | "intro" | "pairing" | "caching" | "starting" | "searching" | "tracking" | "fallback" | "error";

export function PublicArViewerRoute() {
  const { publicSlug = "" } = useParams<{ publicSlug: string }>();
  const [manifest, setManifest] = useState<PublicArManifest | null>(null);
  const [cachedProject, setCachedProject] = useState<CachedPublicArProject | null>(null);
  const [mode, setMode] = useState<ViewerMode>("loading");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [cacheStep, setCacheStep] = useState<1 | 2 | 3 | 4>(1);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingNotice, setRecordingNotice] = useState("");
  const [pendingRecording, setPendingRecording] = useState<ArRecording | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerVideoRef = useRef<HTMLVideoElement>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<PublicArSession | null>(null);
  const materializedRef = useRef<MaterializedPublicArProject | null>(null);
  const preparedVideoRef = useRef<HTMLVideoElement | null>(null);
  const flowControllerRef = useRef<AbortController | null>(null);
  const telemetry = useMemo(() => createPublicArTelemetry(publicSlug), [publicSlug]);

  const refreshManifest = useCallback(
    async (signal?: AbortSignal) => {
      const next = await loadPublicManifest(publicSlug, signal);
      setManifest(next);
      return next;
    },
    [publicSlug],
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setManifest(null);
      setCachedProject(null);
      setMode("loading");
      refreshManifest(controller.signal)
        .then(async (next) => {
          const cached = await loadCachedPublicArProject(publicSlug, next);
          if (controller.signal.aborted) return;
          setMuted(initialArMuted(next));
          setCachedProject(cached);
          telemetry.track("page_open");
          setMode("intro");
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          setMode("error");
          setMessage(publicManifestMessage(error));
        });
    });
    return () => controller.abort();
  }, [publicSlug, refreshManifest, telemetry]);

  useEffect(() => {
    if (!manifest) return;
    const delay = manifestRefreshDelay(manifest.signedUrlsExpireAt);
    const timeout = window.setTimeout(() => refreshManifest().catch(() => undefined), Math.max(1_000, delay));
    return () => window.clearTimeout(timeout);
  }, [manifest, refreshManifest]);

  useEffect(() => {
    if (!recording) return;
    const started = Date.now() - recordingSeconds * 1_000;
    const timer = window.setInterval(() => setRecordingSeconds(Math.floor((Date.now() - started) / 1_000)), 1_000);
    return () => window.clearInterval(timer);
  }, [recording, recordingSeconds]);

  useEffect(
    () => () => {
      flowControllerRef.current?.abort();
      stopMediaStream(scannerStreamRef.current);
      scannerStreamRef.current = null;
      sessionRef.current?.stop();
      sessionRef.current = null;
      materializedRef.current?.dispose();
      materializedRef.current = null;
      releasePreparedVideo(preparedVideoRef.current);
      preparedVideoRef.current = null;
    },
    [],
  );

  const startViewer = async () => {
    if (!manifest || !containerRef.current) return;
    const capabilities = detectViewerCapabilities();
    if (!capabilities.supported) {
      setMode("error");
      setMessage(capabilities.issues.map(capabilityMessage).join(" "));
      telemetry.track("error", null, capabilities.issues[0] ?? "camera_unavailable");
      return;
    }

    flowControllerRef.current?.abort();
    const controller = new AbortController();
    flowControllerRef.current = controller;
    setMessage("");
    setRecordingNotice("");
    telemetry.track("camera_started");
    const playbackVideo = createPublicArPlaybackVideo(manifest, muted);
    preparedVideoRef.current = playbackVideo;

    try {
      let project = cachedProject;
      if (!project) {
        setMode("pairing");
        await nextPaint();
        const scannerVideo = scannerVideoRef.current;
        if (!scannerVideo) throw new Error("QR camera is not ready");
        const stream = await startQrCamera(scannerVideo, controller.signal);
        scannerStreamRef.current = stream;
        await waitForMatchingProjectQr(scannerVideo, publicSlug, {
          signal: controller.signal,
          onMismatch: () => setMessage("Это QR-код другого проекта"),
        });
        setMessage("");
        setMode("caching");
        project = await cachePublicArProject(publicSlug, manifest, setCacheStep, controller.signal);
        setCachedProject(project);
        stopMediaStream(stream);
        scannerStreamRef.current = null;
        scannerVideo.srcObject = null;
      }
      await beginAr(project, playbackVideo);
    } catch (error) {
      if (controller.signal.aborted) return;
      stopMediaStream(scannerStreamRef.current);
      scannerStreamRef.current = null;
      releasePreparedVideo(playbackVideo);
      if (preparedVideoRef.current === playbackVideo) preparedVideoRef.current = null;
      sessionRef.current?.stop();
      sessionRef.current = null;
      materializedRef.current?.dispose();
      materializedRef.current = null;
      setMode("error");
      setMessage(classifyViewerError(error));
      telemetry.track("error", null, viewerErrorCode(error));
    }
  };

  const beginAr = async (project: CachedPublicArProject, playbackVideo: HTMLVideoElement) => {
    if (!manifest || !containerRef.current) return;
    setMode("starting");
    sessionRef.current?.stop();
    sessionRef.current = null;
    materializedRef.current?.dispose();
    const materialized = materializeCachedPublicArProject(manifest, project);
    materializedRef.current = materialized;
    sessionRef.current = await startPublicMindAr({
      container: containerRef.current,
      manifest: materialized.manifest,
      muted,
      playbackVideo,
      onTrackingState: (state: PublicArTrackingState) => {
        setMode(state);
        if (state === "tracking") telemetry.track("marker_detected");
      },
      onPlaybackEvent: (event, valueSeconds, errorCode) => telemetry.track(event, valueSeconds, errorCode),
    });
  };

  const openFallback = () => {
    flowControllerRef.current?.abort();
    sessionRef.current?.stop();
    sessionRef.current = null;
    materializedRef.current?.dispose();
    materializedRef.current = null;
    setRecording(false);
    setMode("fallback");
  };

  const toggleRecording = async () => {
    const session = sessionRef.current;
    if (!session) return;
    setRecordingNotice("");
    if (!recording) {
      if (!session.recordingSupported) {
        setRecordingNotice("Этот браузер не умеет записывать AR. Используйте системную запись экрана.");
        return;
      }
      try {
        session.startRecording();
        setPendingRecording(null);
        setRecordingSeconds(0);
        setRecording(true);
      } catch {
        setRecordingNotice("Не удалось начать запись. Используйте системную запись экрана.");
      }
      return;
    }

    try {
      const result = await session.stopRecording();
      setRecording(false);
      setPendingRecording(result);
      setRecordingNotice("Запись готова");
      await saveArRecording(result, manifest?.title ?? "AR Photo");
      setPendingRecording(null);
      setRecordingNotice("Запись передана для сохранения");
    } catch (error) {
      setRecording(false);
      if (error instanceof DOMException && error.name === "AbortError") return;
      setRecordingNotice("Запись готова — нажмите «Сохранить»");
    }
  };

  const savePendingRecording = async () => {
    if (!pendingRecording) return;
    try {
      await saveArRecording(pendingRecording, manifest?.title ?? "AR Photo");
      setPendingRecording(null);
      setRecordingNotice("Запись передана для сохранения");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setRecordingNotice("Не удалось открыть сохранение. Попробуйте ещё раз.");
      }
    }
  };

  if (mode === "loading") return <ViewerNotice title="Открываем AR Photo" text="Подготавливаем проект…" />;
  if (!manifest) return <ViewerNotice title="AR-фотография недоступна" text={message} error />;

  const active = mode === "starting" || mode === "searching" || mode === "tracking";
  const pairing = mode === "pairing" || mode === "caching";
  return (
    <main className="ar-viewer" data-mode={mode}>
      <div ref={containerRef} className={active ? "ar-viewer-stage" : "hidden"} aria-hidden={!active} />

      {mode === "intro" || mode === "error" ? (
        <ViewerIntro
          manifest={manifest}
          cached={Boolean(cachedProject)}
          error={mode === "error" ? message : ""}
          onStart={() => void startViewer()}
          onFallback={manifest.fallbackEnabled ? openFallback : undefined}
        />
      ) : null}

      {pairing ? (
        <section className="ar-pairing" aria-live="polite">
          <video ref={scannerVideoRef} className="ar-pairing-camera" autoPlay muted playsInline aria-hidden="true" />
          <div className="ar-pairing-shade" />
          {mode === "pairing" ? (
            <>
              <CornerGuide className="ar-qr-guide" />
              <div className="ar-pairing-card">
                <ScanLine size={23} />
                <h1>Наведите камеру на QR-код</h1>
                <p>Проект сохранится на этом устройстве</p>
                {message ? <span className="ar-pairing-warning">{message}</span> : null}
              </div>
            </>
          ) : (
            <div className="ar-cache-progress" role="status" aria-label={`Загрузка проекта: этап ${cacheStep} из 4`}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="52" />
                <circle
                  className="ar-cache-progress-value"
                  cx="60"
                  cy="60"
                  r="52"
                  pathLength="4"
                  style={{ strokeDashoffset: 4 - cacheStep }}
                />
              </svg>
              <strong>{cacheStep}/4</strong>
            </div>
          )}
        </section>
      ) : null}

      {active ? (
        <>
          <div className="ar-status-pill" role="status">
            <span className={mode === "tracking" ? "ar-status-dot ar-status-dot-live" : "ar-status-dot"} />
            {mode === "starting" ? "Готовим камеру" : mode === "tracking" ? "Фото найдено" : "Наведите камеру на фото"}
          </div>
          {mode !== "tracking" ? <CornerGuide className="ar-photo-guide" testId="marker-scan-guide" /> : null}
          {mode !== "starting" ? (
            <div className="ar-record-wrap">
              {recording ? <span className="ar-record-timer">{formatDuration(recordingSeconds)}</span> : null}
              <button
                type="button"
                className={`ar-record-button ${recording ? "ar-record-button-active" : ""}`}
                aria-label={recording ? "Остановить запись AR" : "Записать AR-видео"}
                aria-pressed={recording}
                onClick={() => void toggleRecording()}
              >
                <span />
              </button>
            </div>
          ) : null}
          {recordingNotice ? (
            <div className="ar-record-notice" role="status">
              <span>{recordingNotice}</span>
              {pendingRecording ? (
                <button type="button" onClick={() => void savePendingRecording()}>
                  <Download size={16} /> Сохранить
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      {mode === "fallback" ? (
        <section className="ar-fallback">
          <header>
            <div>
              <span>Обычное видео</span>
              <h1>{manifest.title}</h1>
            </div>
            <Button type="button" variant="ghost" onClick={() => setMode("intro")} icon={<Camera size={17} />}>
              AR
            </Button>
          </header>
          <video
            data-testid="public-ar-fallback-video"
            src={manifest.assets.videoUrl}
            poster={manifest.assets.posterUrl}
            controls
            playsInline
            preload="metadata"
            onPlay={(event) => telemetry.track("playback_started", event.currentTarget.currentTime)}
            onTimeUpdate={(event) => {
              for (const milestone of videoMilestones(event.currentTarget.currentTime, event.currentTarget.duration)) {
                telemetry.track(milestone, event.currentTarget.currentTime);
              }
            }}
            onEnded={(event) =>
              telemetry.track("completed", event.currentTarget.duration || event.currentTarget.currentTime)
            }
            onError={() => telemetry.track("error", null, "asset_failed")}
          />
        </section>
      ) : null}
    </main>
  );
}

function ViewerIntro({
  manifest,
  cached,
  error,
  onStart,
  onFallback,
}: {
  manifest: PublicArManifest;
  cached: boolean;
  error: string;
  onStart(): void;
  onFallback?: () => void;
}) {
  return (
    <section className="ar-intro">
      <img src={manifest.assets.posterUrl} alt="" />
      <div className="ar-intro-shade" />
      <div className="ar-intro-card">
        <span className="ar-intro-icon">{cached ? <Check size={22} /> : <ScanLine size={22} />}</span>
        <span className="ar-intro-label">AR Photo</span>
        <h1>{error ? "Не удалось открыть AR" : cached ? "Проект сохранён" : "Отсканируйте QR-код"}</h1>
        <p>
          {error
            ? error
            : cached
              ? "Можно сразу навести камеру на фотографию."
              : "Включите камеру и наведите её на QR-код ещё раз — дальше он не понадобится."}
        </p>
        <Button type="button" onClick={onStart} icon={<Camera size={18} />} full>
          {error ? "Повторить" : cached ? "Открыть AR" : "Включить камеру"}
        </Button>
        {error && onFallback ? (
          <button className="ar-intro-fallback" type="button" onClick={onFallback}>
            <Play size={17} /> Смотреть обычное видео
          </button>
        ) : null}
        <span className="ar-intro-privacy">
          <ShieldCheck size={15} /> Камера обрабатывается только на устройстве
        </span>
      </div>
    </section>
  );
}

function CornerGuide({ className, testId }: { className: string; testId?: string }) {
  return (
    <div className={className} data-testid={testId} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function PublicArPrivacyRoute() {
  return (
    <ViewerNotice
      title="Камера и приватность"
      text="AR Photo обрабатывает изображение камеры на устройстве для поиска маркера. Кадры не загружаются и не сохраняются без нажатия кнопки записи."
    />
  );
}

export function PublicArUnsupportedRoute() {
  return (
    <ViewerNotice
      title="AR не поддерживается"
      text="Откройте QR-ссылку в актуальном Safari или Chrome либо используйте обычный просмотр видео."
      error
    />
  );
}

function ViewerNotice({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-black px-5 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.06] p-6 text-center">
        <span
          className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${error ? "bg-amber-300/10 text-amber-200" : "bg-violet-400/10 text-violet-300"}`}
        >
          {error ? <AlertTriangle /> : <LoaderCircle className="animate-spin" />}
        </span>
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
      </div>
    </main>
  );
}

function publicManifestMessage(error: unknown) {
  if (error instanceof PublicManifestError) return error.message;
  return "AR-фотография временно недоступна";
}

function nextPaint() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

function releasePreparedVideo(video?: HTMLVideoElement | null) {
  if (!video) return;
  video.pause();
  video.removeAttribute("src");
  video.load();
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
