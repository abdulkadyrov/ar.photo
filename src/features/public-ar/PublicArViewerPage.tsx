import { flushSync } from "react-dom";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from "react";
import "./PublicArViewerPage.css";
import { PrivacyRoute } from "./PrivacyPage";
import {
  AlertTriangle,
  Camera,
  Download,
  Expand,
  LoaderCircle,
  Pause,
  Play,
  ScanLine,
  ShieldCheck,
  Volume2,
  VolumeX,
  ImageIcon,
  Smartphone,
  Info,
  CameraOff,
  Chrome,
  Compass,
  Clipboard,
} from "lucide-react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Button } from "../../shared/ui";
import { saveArRecording, type ArRecording } from "./arRecording";
import {
  cachePublicArProject,
  loadPublicArVideo,
  publicArAssetFingerprint,
  refreshedPlaybackTarget,
  loadCachedPublicArProject,
  type CachedPublicArProject,
} from "./publicArCache";
import {
  loadPublicManifest,
  manifestRefreshDelay,
  publicArTargets,
  PublicManifestError,
  type PublicArManifest,
} from "./publicManifest";
import {
  createPublicArPlaybackVideos,
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
  const [publicParams] = useSearchParams();
  const ordinaryVideo = publicParams.get("view") === "video";
  const [manifest, setManifest] = useState<PublicArManifest | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [cachedProject, setCachedProject] = useState<CachedPublicArProject | null>(null);
  const [mode, setMode] = useState<ViewerMode>("loading");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [cacheUnavailable, setCacheUnavailable] = useState(false);
  const [videoState, setVideoState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const latestManifestRef = useRef<PublicArManifest | null>(null);
  const [cacheStep, setCacheStep] = useState<1 | 2 | 3 | 4>(1);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingNotice, setRecordingNotice] = useState("");
  const [pendingRecording, setPendingRecording] = useState<ArRecording | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerVideoRef = useRef<HTMLVideoElement>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<PublicArSession | null>(null);
  const preparedVideosRef = useRef<HTMLVideoElement[]>([]);
  const flowControllerRef = useRef<AbortController | null>(null);
  const telemetry = useMemo(() => createPublicArTelemetry(publicSlug), [publicSlug]);

  const refreshManifest = useCallback(
    async (signal?: AbortSignal) => {
      const next = await loadPublicManifest(publicSlug, signal);
      latestManifestRef.current = next;
      setManifest(next);
      return next;
    },
    [publicSlug],
  );

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      flowControllerRef.current?.abort();
      sessionRef.current?.stop();
      sessionRef.current = null;
      stopMediaStream(scannerStreamRef.current);
      scannerStreamRef.current = null;
      releasePreparedVideos(preparedVideosRef.current);
      preparedVideosRef.current = [];
      latestManifestRef.current = null;
      setManifest(null);
      setNotFound(false);
      setCachedProject(null);
      setMode("loading");
      refreshManifest(controller.signal)
        .then(async (next) => {
          const cached = await loadCachedPublicArProject(publicSlug, next);
          if (controller.signal.aborted) return;
          // Automatic camera entry has no audio gesture; start muted for Safari autoplay.
          setMuted(true);
          setCachedProject(cached);
          telemetry.track("page_open");
          setMode(ordinaryVideo && next.fallbackEnabled ? "fallback" : "intro");
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          setMode("error");
          setNotFound(error instanceof PublicManifestError && error.code === "not_found");
          setMessage(publicManifestMessage(error));
        });
    });
    return () => controller.abort();
  }, [ordinaryVideo, publicSlug, refreshManifest, telemetry]);

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
      releasePreparedVideos(preparedVideosRef.current);
      preparedVideosRef.current = [];
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
    setVideoState("idle");
    setCacheUnavailable(false);
    setRecordingNotice("");
    telemetry.track("camera_started");
    const playbackVideos = createPublicArPlaybackVideos(manifest, muted);
    preparedVideosRef.current = playbackVideos;

    try {
      let project = cachedProject;
      if (!project && manifest.version === 1 && manifest.videoViewport) {
        setMode("caching");
        project = await cachePublicArProject(publicSlug, manifest, setCacheStep, controller.signal);
        setCachedProject(project);
      }
      if (!project) {
        flushSync(() => setMode("pairing"));
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
        // Transfer the existing stream to AR; do not stop/reopen the iPhone camera.
        scannerVideo.srcObject = null;
      }
      const stream = scannerStreamRef.current ?? undefined;
      await beginAr(project, playbackVideos, controller.signal, stream);
      scannerStreamRef.current = null;
    } catch (error) {
      if (controller.signal.aborted) return;
      stopMediaStream(scannerStreamRef.current);
      scannerStreamRef.current = null;
      releasePreparedVideos(playbackVideos);
      if (preparedVideosRef.current === playbackVideos) preparedVideosRef.current = [];
      sessionRef.current?.stop();
      sessionRef.current = null;
      setMode("error");
      setMessage(classifyViewerError(error));
      telemetry.track("error", null, viewerErrorCode(error));
    }
  };

  const beginAr = async (
    project: CachedPublicArProject,
    playbackVideos: HTMLVideoElement[],
    signal: AbortSignal,
    cameraStream?: MediaStream,
  ) => {
    if (!manifest || !containerRef.current) return;
    setMode("starting");
    await nextPaint();
    signal.throwIfAborted();
    sessionRef.current?.stop();
    sessionRef.current = null;
    const session = await startPublicMindAr({
      container: containerRef.current,
      manifest,
      muted,
      playbackVideos,
      cameraStream,
      signal,
      trackingAssets: project.targets.map((target) => target.trackingAsset),
      async loadVideo(index, loadSignal) {
        const original = publicArTargets(manifest)[index];
        const load = (current: PublicArManifest) => {
          const target = refreshedPlaybackTarget(current, original);
          if (!target) {
            setRecordingNotice("Альбом обновлён. Откройте QR-код заново.");
            throw new DOMException("Photo is no longer published", "NotFoundError");
          }
          const legacy =
            publicArAssetFingerprint(current) === project.fingerprint ? project.targets[index]?.video : undefined;
          return loadPublicArVideo(target.assets.videoUrl, loadSignal, legacy, () => setCacheUnavailable(true));
        };
        try {
          return await load(latestManifestRef.current ?? manifest);
        } catch (error) {
          loadSignal.throwIfAborted();
          if (!(error instanceof DOMException) || !("status" in error) || ![401, 403].includes(Number(error.status)))
            throw error;
          return load(await refreshManifest(loadSignal));
        }
      },
      onMediaState(state) {
        setVideoState(state);
        if (state !== "idle") setPaused(true);
      },
      onTrackingState: (state: PublicArTrackingState) => {
        setMode(state);
        if (state === "tracking") telemetry.track("marker_detected");
      },
      onPlaybackEvent: (event, valueSeconds, errorCode) => {
        if (event === "playback_started") setPaused(false);
        telemetry.track(event, valueSeconds, errorCode);
      },
    });
    if (signal.aborted) {
      session.stop();
      return;
    }
    sessionRef.current = session;
  };

  const autoStartViewer = useEffectEvent(() => void startViewer());
  useEffect(() => {
    if (mode !== "intro") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) autoStartViewer();
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const openFallback = () => {
    flowControllerRef.current?.abort();
    sessionRef.current?.stop();
    sessionRef.current = null;
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

  if (mode === "loading") return <ViewerNotice title="Открываем KHANZAMA" text="Подготавливаем проект…" />;
  if (!manifest && notFound)
    return (
      <PublicInfo
        title="Страница не найдена"
        description="Возможно, ссылка изменилась, работа была удалена или введён неверный адрес."
      >
        <div className="py-6 text-center">
          <strong className="text-6xl font-semibold text-primary">404</strong>
          <p className="my-5 text-sm text-muted">Проверьте ссылку или отсканируйте QR-код ещё раз.</p>
          <Link className="btn btn-primary" to="/camera">
            <ScanLine size={18} /> Открыть другой QR
          </Link>
        </div>
      </PublicInfo>
    );
  if (!manifest) return <ViewerNotice title="AR-фотография недоступна" text={message} error />;

  const active = mode === "starting" || mode === "searching" || mode === "tracking";
  const pairing = mode === "pairing" || mode === "caching";
  return (
    <main className="ar-viewer" data-mode={mode}>
      <div ref={containerRef} className={active ? "ar-viewer-stage" : "hidden"} aria-hidden={!active} />

      {mode === "intro" ? (
        <div className="ar-camera-launch" role="status">
          <h1>Хан Зама</h1>
          <p>Открываем камеру…</p>
        </div>
      ) : null}
      {mode === "error" ? (
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
                <p>Просмотренные видео сохранятся на устройстве</p>
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
            {mode === "starting"
              ? "Готовим камеру"
              : mode === "tracking"
                ? videoState === "loading"
                  ? "Загружаем видео…"
                  : videoState === "error"
                    ? "Видео не загрузилось"
                    : "Фото найдено"
                : "Наведите камеру на фото"}
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
                disabled={!recording && videoState !== "ready"}
                onClick={() => void toggleRecording()}
              >
                <span />
              </button>
            </div>
          ) : null}
          <div className="ar-viewer-controls" aria-label="Управление AR-видео">
            <button
              type="button"
              aria-pressed={!muted}
              onClick={() => {
                sessionRef.current?.setMuted(!muted);
                setMuted(!muted);
              }}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />} Звук
            </button>
            <button
              type="button"
              disabled={mode !== "tracking" || videoState === "loading" || videoState === "idle"}
              onClick={() => {
                void sessionRef.current
                  ?.togglePlayback()
                  .then((playing) => setPaused(!playing))
                  .catch(() => setRecordingNotice("Не удалось изменить воспроизведение"));
              }}
            >
              {paused ? <Play size={18} /> : <Pause size={18} />}{" "}
              {videoState === "error" ? "Повторить загрузку" : paused ? "Продолжить" : "Пауза"}
            </button>
            {typeof document.documentElement.requestFullscreen === "function" ? (
              <button
                type="button"
                aria-label="Полный экран"
                onClick={() => {
                  void (
                    document.fullscreenElement
                      ? document.exitFullscreen()
                      : document.documentElement.requestFullscreen()
                  ).catch(() => setRecordingNotice("Полный экран недоступен в этом браузере"));
                }}
              >
                <Expand size={18} />
              </button>
            ) : null}
          </div>
          {recordingNotice || cacheUnavailable ? (
            <div className="ar-record-notice" role="status">
              <span>
                {recordingNotice ||
                  "Не удалось сохранить видео на устройстве. Для повторного просмотра может понадобиться интернет."}
              </span>
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
  const location = useLocation();
  return (
    <section className="ar-public-intro">
      <header>
        <strong>KHANZAMA</strong>
        <span>AR-живые фото</span>
        <small>Просмотр без регистрации</small>
      </header>
      <div className="ar-public-content">
        <img src={manifest.assets.posterUrl} alt={manifest.title} />
        <div>
          <span className="ar-public-tag">AR-живое фото</span>
          <h1>{manifest.title}</h1>
          <p role={error ? "alert" : undefined}>
            {error ||
              "Оживите напечатанное фото: откройте камеру и наведите её на фотографию, чтобы увидеть видео в дополненной реальности."}
          </p>
          <div className="ar-public-buttons">
            <Button type="button" onClick={onStart} icon={<Camera size={18} />} full>
              {error ? "Повторить" : "Открыть AR-камеру"}
            </Button>
            {onFallback ? (
              <Button variant="quiet" type="button" onClick={onFallback} full>
                <Play size={17} /> Смотреть видео
              </Button>
            ) : null}
          </div>
          <p className="ar-public-note">
            <Smartphone size={25} />
            <span>
              <strong>Установка приложения не нужна</strong>
              <small>Работает в браузере на телефоне и компьютере.</small>
            </span>
          </p>
        </div>
      </div>
      <div className="ar-public-help">
        <h2>Как это работает</h2>
        <ol>
          <li>
            <b>1</b>
            <i>
              <Camera size={24} />
            </i>
            <div>
              <strong>Разрешите камеру</strong>
              <span>Браузер запросит доступ — нажмите «Разрешить».</span>
            </div>
          </li>
          <li>
            <b>2</b>
            <i>
              <ImageIcon size={24} />
            </i>
            <div>
              <strong>Наведите на фото</strong>
              <span>
                {cached
                  ? "Направьте камеру на напечатанную фотографию."
                  : "Сначала подтвердите проект по QR, затем наведите камеру на фотографию."}
              </span>
            </div>
          </li>
          <li>
            <b>3</b>
            <i>
              <Play size={24} />
            </i>
            <div>
              <strong>Смотрите</strong>
              <span>Фотография оживёт, и видео появится прямо на ней.</span>
            </div>
          </li>
        </ol>
        <p>
          <Info size={22} />
          <span>
            <strong>Важно:</strong> распознаётся само изображение на фотографии, без специальных меток. QR-код открывает
            проект.
          </span>
        </p>
        <Link className="ar-public-privacy-link" to="/privacy" state={{ viewerPath: location.pathname }}>
          Камера и конфиденциальность
        </Link>
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
  return <PrivacyRoute />;
}

export function PublicArUnsupportedRoute() {
  const [params] = useSearchParams();
  const slug = params.get("publicSlug") ?? "";
  const validSlug = /^(demo|[a-f0-9]{36})$/.test(slug);
  const [manifest, setManifest] = useState<PublicArManifest | null>(null);
  const [copyNotice, setCopyNotice] = useState("");
  useEffect(() => {
    if (!validSlug) return;
    const controller = new AbortController();
    void loadPublicManifest(slug, controller.signal)
      .then(setManifest)
      .catch(() => {});
    return () => controller.abort();
  }, [slug, validSlug]);
  const workUrl = validSlug
    ? new URL(`${import.meta.env.BASE_URL}ar/${encodeURIComponent(slug)}`, window.location.origin).toString()
    : "";
  return (
    <main className="ar-unsupported-page">
      <header>
        <strong>KHANZAMA</strong>
        <span>AR-живые фотографии</span>
        <small>Просмотр по ссылке или QR</small>
      </header>
      <section className="ar-unsupported-card">
        <div className="ar-unsupported-illustration" aria-hidden="true">
          <svg viewBox="0 0 160 110">
            <rect x="14" y="12" width="126" height="85" rx="14" fill="#f1edfc" stroke="#a294cb" strokeWidth="4" />
            <path d="M15 34h124" stroke="#a294cb" strokeWidth="3" />
            <circle cx="30" cy="24" r="3" fill="#7657c2" />
            <circle cx="44" cy="24" r="3" fill="#7657c2" />
            <circle cx="58" cy="24" r="3" fill="#7657c2" />
          </svg>
          <CameraOff size={58} />
        </div>
        <h1>Откройте в другом браузере</h1>
        <p className="ar-unsupported-description">
          В этом браузере невозможно запустить AR-камеру. Он не поддерживает нужные возможности для дополненной
          реальности.
        </p>
        {validSlug ? (
          <div className="ar-unsupported-actions">
            {manifest?.fallbackEnabled ? (
              <Link className="btn btn-primary" to={`/ar/${slug}?view=video`}>
                <Play size={18} />
                Смотреть видео
              </Link>
            ) : null}
            <Button
              variant="quiet"
              onClick={() =>
                void navigator.clipboard
                  .writeText(workUrl)
                  .then(() => setCopyNotice("Ссылка скопирована"))
                  .catch(() => setCopyNotice("Не удалось скопировать ссылку"))
              }
            >
              <Clipboard size={18} />
              Скопировать ссылку
            </Button>
          </div>
        ) : null}
        {copyNotice ? (
          <p role="status" className="ar-unsupported-copy">
            {copyNotice}
          </p>
        ) : null}
        <section className="ar-browser-guidance">
          <h2>
            <span>Как открыть</span>Попробуйте открыть эту же ссылку в Safari или Chrome:
          </h2>
          <div>
            <p>
              <Compass size={32} />
              <span>
                <strong>Safari</strong>
                <small>на iPhone или Mac</small>
              </span>
            </p>
            <p>
              <Chrome size={32} />
              <span>
                <strong>Chrome</strong>
                <small>на Android, Windows или Mac</small>
              </span>
            </p>
          </div>
        </section>
        <div className="ar-unsupported-features">
          <InfoCard icon={<Camera size={25} />} title="Доступ к камере">
            Для просмотра AR понадобится разрешить доступ к камере в выбранном браузере.
          </InfoCard>
          <InfoCard icon={<ImageIcon size={25} />} title="По настоящему фото">
            Видео запускается на самом напечатанном фото: распознаётся изображение фотографии.
          </InfoCard>
          <InfoCard icon={<ScanLine size={25} />} title="Роль QR">
            QR только открывает проект. Специальные метки на фотографии не нужны.
          </InfoCard>
        </div>
        <p className="ar-unsupported-footer">
          <Info size={20} />
          Возможности AR зависят от устройства и браузера. Обычный просмотр видео доступен, если его разрешил автор
          работы.
        </p>
      </section>
    </main>
  );
}

function PublicInfo({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-surface px-4 py-5 text-ink">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
          <strong className="text-xl font-bold text-primary">KHANZAMA</strong>
          <span className="text-sm text-muted">AR-живые фото</span>
        </header>
        <section className="mt-6 rounded-2xl border border-line bg-card p-5 sm:p-7">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mb-5 mt-3 text-sm leading-6 text-muted">{description}</p>
          <div className="grid gap-3">{children}</div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="flex items-start gap-4 rounded-xl border border-line p-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted">{children}</p>
      </div>
    </article>
  );
}

function ViewerNotice({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-surface px-5 text-ink">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 text-center">
        <p className="mb-5 text-sm font-bold tracking-wide text-primary">KHANZAMA · AR-живые фото</p>
        <span
          className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${error ? "bg-amber-50 text-amber-800" : "bg-primary/10 text-primary"}`}
        >
          {error ? (
            <AlertTriangle />
          ) : title.startsWith("Открываем") ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ShieldCheck />
          )}
        </span>
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
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

function releasePreparedVideos(videos: HTMLVideoElement[]) {
  for (const video of videos) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
