import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Camera, Expand, Play, RotateCcw, ScanLine, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../shared/ui";
import {
  isManifestFresh,
  loadPublicManifest,
  manifestRefreshDelay,
  PublicManifestError,
  type PublicArManifest,
} from "./publicManifest";
import type { PublicArSession, PublicArTrackingState } from "./mindArAdapter";
import { capabilityMessage, classifyViewerError, detectViewerCapabilities } from "./viewerCapabilities";
import { createPublicArTelemetry, videoMilestones, viewerErrorCode } from "./telemetry";

type ViewerMode = "loading" | "intro" | "starting" | "searching" | "tracking" | "fallback" | "error";

export function PublicArViewerRoute() {
  const { publicSlug = "" } = useParams<{ publicSlug: string }>();
  const [manifest, setManifest] = useState<PublicArManifest | null>(null);
  const [mode, setMode] = useState<ViewerMode>("loading");
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<PublicArSession | null>(null);
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
      setMode("loading");
      refreshManifest(controller.signal)
        .then(() => {
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
  }, [refreshManifest, telemetry]);

  useEffect(() => {
    if (!manifest) return;
    const delay = manifestRefreshDelay(manifest.signedUrlsExpireAt);
    const timeout = window.setTimeout(() => refreshManifest().catch(() => undefined), Math.max(1_000, delay));
    return () => window.clearTimeout(timeout);
  }, [manifest, refreshManifest]);

  useEffect(
    () => () => {
      sessionRef.current?.stop();
      sessionRef.current = null;
    },
    [],
  );

  const startAr = async () => {
    if (!manifest || !containerRef.current) return;
    const capabilities = detectViewerCapabilities();
    if (!capabilities.supported) {
      setMode("error");
      setMessage(capabilities.issues.map(capabilityMessage).join(" "));
      telemetry.track("error", null, capabilities.issues[0] ?? "camera_unavailable");
      return;
    }

    telemetry.track("camera_started");
    setMode("starting");
    setMessage("");
    sessionRef.current?.stop();
    sessionRef.current = null;
    try {
      const current = isManifestFresh(manifest) ? manifest : await refreshManifest();
      const { startPublicMindAr } = await import("./mindArAdapter");
      sessionRef.current = await startPublicMindAr({
        container: containerRef.current,
        manifest: current,
        muted,
        onTrackingState: (state: PublicArTrackingState) => {
          setMode(state);
          setPlaying(state === "tracking" && current.behavior.autoplay);
          if (state === "tracking") telemetry.track("marker_detected");
        },
        onPlaybackEvent: (event, valueSeconds, errorCode) => telemetry.track(event, valueSeconds, errorCode),
      });
    } catch (error) {
      sessionRef.current?.stop();
      sessionRef.current = null;
      setMode("error");
      setMessage(classifyViewerError(error));
      telemetry.track("error", null, viewerErrorCode(error));
    }
  };

  const openFallback = () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setPlaying(false);
    setMode("fallback");
  };

  const toggleMuted = () => {
    const next = !muted;
    setMuted(next);
    sessionRef.current?.setMuted(next);
  };

  const togglePlayback = async () => {
    try {
      const next = await sessionRef.current?.togglePlayback();
      if (typeof next === "boolean") setPlaying(next);
    } catch {
      setMessage("Браузер заблокировал воспроизведение. Нажмите ещё раз после включения звука.");
      telemetry.track("error", null, "playback_failed");
    }
  };

  if (mode === "loading")
    return <ViewerNotice title="Загружаем AR Photo" text="Проверяем безопасную публичную ссылку…" />;
  if (!manifest) return <ViewerNotice title="AR-фотография недоступна" text={message} error />;

  const active = mode === "starting" || mode === "searching" || mode === "tracking";
  const allowFallback = manifest.fallbackEnabled || mode === "error";
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-black text-white">
      <div ref={containerRef} className={active ? "absolute inset-0" : "hidden"} aria-hidden={!active} />

      {(mode === "intro" || mode === "error") && (
        <section className="relative grid min-h-[100dvh] place-items-end overflow-hidden px-5 py-7 sm:place-items-center">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-55 blur-[2px]"
            src={manifest.assets.posterUrl}
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/95" />
          <div className="relative w-full max-w-md rounded-[28px] border border-white/15 bg-black/65 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              <ScanLine size={17} /> AR Photo
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">{manifest.title}</h1>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Наведите камеру на фотографию — видео появится точно поверх неё.
            </p>
            {mode === "error" && (
              <div className="mt-4 flex gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                <AlertTriangle className="mt-0.5 shrink-0" size={18} /> {message}
              </div>
            )}
            <div className="mt-6 grid gap-3">
              <Button
                type="button"
                onClick={startAr}
                icon={mode === "error" ? <RotateCcw size={18} /> : <Camera size={18} />}
                full
              >
                {mode === "error" ? "Повторить AR" : "Начать AR"}
              </Button>
              {allowFallback && (
                <Button type="button" variant="ghost" onClick={openFallback} icon={<Play size={18} />} full>
                  Смотреть обычное видео
                </Button>
              )}
            </div>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-white/55">
              <ShieldCheck className="mt-0.5 shrink-0" size={15} /> Камера запускается только после нажатия и не
              записывает кадры.
            </p>
            <Link
              className="mt-3 inline-flex text-xs font-semibold text-violet-200 underline-offset-4 hover:underline"
              to="/privacy"
            >
              Подробнее о камере и приватности
            </Link>
          </div>
        </section>
      )}

      {active && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-[3/4] w-[78vw] max-w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border-2 border-dashed border-white/65 bg-white/[0.025] shadow-[0_30px_90px_rgba(0,0,0,0.3)]" />
          <div className="absolute inset-x-4 top-4 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {mode === "tracking" ? <Play size={17} /> : <Camera size={17} />}
              {mode === "starting"
                ? "Подготавливаем камеру…"
                : mode === "tracking"
                  ? "Фотография найдена"
                  : "Наведите камеру на фотографию"}
            </div>
            <p className="mt-1 text-xs text-white/65">
              {mode === "tracking" ? "Видео привязано к маркеру" : "Держите всю фотографию внутри рамки"}
            </p>
          </div>
          <div className="absolute inset-x-4 bottom-4 grid grid-cols-4 gap-2">
            <ViewerControl
              label={muted ? "Звук" : "Без звука"}
              onClick={toggleMuted}
              icon={muted ? <Volume2 /> : <VolumeX />}
            />
            <ViewerControl
              label={playing ? "Пауза" : "Видео"}
              onClick={togglePlayback}
              icon={playing ? <RotateCcw /> : <Play />}
            />
            <ViewerControl
              label="Экран"
              onClick={() => document.documentElement.requestFullscreen?.()}
              icon={<Expand />}
            />
            <ViewerControl label="Обычно" onClick={openFallback} icon={<ScanLine />} />
          </div>
        </>
      )}

      {mode === "fallback" && (
        <section className="grid min-h-[100dvh] grid-rows-[auto_1fr_auto] bg-black">
          <header className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Обычный просмотр</p>
              <h1 className="mt-1 font-semibold">{manifest.title}</h1>
            </div>
            <Button type="button" variant="ghost" onClick={() => setMode("intro")} icon={<Camera size={17} />}>
              AR
            </Button>
          </header>
          <div className="grid place-items-center px-4">
            <video
              data-testid="public-ar-fallback-video"
              className="max-h-[72dvh] w-full max-w-3xl rounded-2xl bg-black object-contain shadow-2xl"
              src={manifest.assets.videoUrl}
              poster={manifest.assets.posterUrl}
              controls
              playsInline
              preload="metadata"
              onPlay={(event) => telemetry.track("playback_started", event.currentTarget.currentTime)}
              onTimeUpdate={(event) => {
                for (const milestone of videoMilestones(
                  event.currentTarget.currentTime,
                  event.currentTarget.duration,
                )) {
                  telemetry.track(milestone, event.currentTarget.currentTime);
                }
              }}
              onEnded={(event) =>
                telemetry.track("completed", event.currentTarget.duration || event.currentTarget.currentTime)
              }
              onError={() => telemetry.track("error", null, "asset_failed")}
            />
          </div>
          <p className="p-4 text-center text-xs leading-5 text-white/55">Видео доступно без камеры и image tracking.</p>
        </section>
      )}
    </main>
  );
}

export function PublicArPrivacyRoute() {
  return (
    <ViewerNotice
      title="Камера и приватность"
      text="AR Photo обрабатывает изображение камеры на устройстве для поиска маркера. Кадры не загружаются и не сохраняются."
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

function ViewerControl({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      className="grid min-h-14 place-items-center gap-1 rounded-2xl bg-white/92 px-2 py-2 text-xs font-semibold text-slate-950"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ViewerNotice({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-black px-5 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.06] p-6 text-center">
        <span
          className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${error ? "bg-amber-300/10 text-amber-200" : "bg-violet-400/10 text-violet-300"}`}
        >
          {error ? <AlertTriangle /> : <ScanLine />}
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
