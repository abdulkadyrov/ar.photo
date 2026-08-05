import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Download,
  ExternalLink,
  FileVideo2,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ArItem, ProcessingJob, QrCode as QrCodeRecord } from "../../entities/ar-item/model";
import { Button, Input, Panel } from "../../shared/ui";
import { getArItemRepository } from "../ar-items/arItemRepository";
import { analyzeMarkerFile } from "../ar-items/markerQuality";
import { useAuth } from "../auth/authContext";
import { getMediaRepository } from "../media/mediaRepository";
import { markerAccept, prepareMediaFile, videoAccept } from "../media/mediaValidation";
import { resolvePublicBaseUrl } from "../qr/qrDesign";
import { getQuickStartWorkspace, type QuickStartWorkspace } from "./quickStartRepository";

const mediaRepository = getMediaRepository();
const arItemRepository = getArItemRepository();

type QuickStage =
  | "form"
  | "preparing"
  | "uploading-marker"
  | "uploading-video"
  | "processing"
  | "publishing"
  | "done"
  | "error";

const jobLabels: Partial<Record<ProcessingJob["type"], string>> = {
  marker_analysis: "Проверяем фотографию",
  video_inspection: "Проверяем видео",
  video_transcode: "Подготавливаем видео для телефона",
  marker_compilation: "Создаём точный target.mind",
  thumbnail_generation: "Создаём превью",
};

export function QuickStartRoute() {
  const auth = useAuth();
  if (auth.status === "loading") {
    return <CenteredState title="Подготавливаем тестовый режим…" text="Регистрация не требуется" />;
  }
  if (!auth.session) {
    return (
      <CenteredState
        title="Не удалось открыть тестовый режим"
        text="Обновите страницу — AR Photo попробует создать новую гостевую сессию."
        action={
          <Button onClick={() => window.location.reload()}>
            <RefreshCw size={17} /> Повторить
          </Button>
        }
      />
    );
  }
  return <QuickCreatePage userId={auth.session.user.id} />;
}

function QuickCreatePage({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [markerFile, setMarkerFile] = useState<File>();
  const [videoFile, setVideoFile] = useState<File>();
  const [stage, setStage] = useState<QuickStage>("form");
  const [stageProgress, setStageProgress] = useState(0);
  const [itemId, setItemId] = useState("");
  const [result, setResult] = useState<QrCodeRecord>();
  const [error, setError] = useState("");
  const [pickerVersion, setPickerVersion] = useState(0);
  const requestId = useRef(crypto.randomUUID());
  const activeItemId = useRef("");
  const uploadController = useRef<AbortController | undefined>(undefined);

  const workspaceQuery = useQuery({
    queryKey: ["quick-start", "workspace", userId],
    queryFn: getQuickStartWorkspace,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const itemQuery = useQuery({
    queryKey: ["quick-start", "item", workspaceQuery.data?.accountId, itemId],
    queryFn: () => arItemRepository.getItem(workspaceQuery.data!.accountId, itemId),
    enabled: Boolean(workspaceQuery.data?.accountId && itemId),
    refetchInterval: (query) =>
      query.state.data && ["ready", "published", "failed"].includes(query.state.data.status) ? false : 2_500,
  });
  const jobsQuery = useQuery({
    queryKey: ["quick-start", "jobs", workspaceQuery.data?.accountId, itemId],
    queryFn: () => arItemRepository.listJobs(workspaceQuery.data!.accountId, itemId),
    enabled: Boolean(workspaceQuery.data?.accountId && itemId),
    refetchInterval: stage === "processing" ? 2_500 : false,
  });

  const markerPreview = useObjectUrl(markerFile);
  const itemFailed = itemQuery.data?.status === "failed";
  const visibleStage: QuickStage = itemFailed ? "error" : stage;
  const processing = !["form", "done", "error"].includes(visibleStage);
  const canSubmit = Boolean(title.trim().length >= 2 && markerFile && videoFile && workspaceQuery.data && !processing);
  const jobs = jobsQuery.data ?? [];
  const runningJob = jobs.find((job) => job.status === "running") ?? jobs.find((job) => job.status === "queued");
  const processingProgress = jobs.length
    ? Math.round(jobs.reduce((total, job) => total + (job.status === "succeeded" ? 100 : job.progress), 0) / jobs.length)
    : 5;

  function showError(cause: unknown) {
    setStage("error");
    setError(readableError(cause));
  }

  useEffect(
    () => () => {
      uploadController.current?.abort();
    },
    [],
  );

  const submit = async () => {
    const workspace = workspaceQuery.data;
    if (!workspace || !markerFile || !videoFile || !canSubmit) return;
    setError("");
    setStage("preparing");
    setStageProgress(0);
    const controller = new AbortController();
    uploadController.current = controller;
    try {
      const [preparedMarker, markerQuality] = await Promise.all([
        prepareMediaFile(markerFile, "marker"),
        analyzeMarkerFile(markerFile),
      ]);
      const preparedVideo = await prepareMediaFile(videoFile, "video", {
        onProgress: (progress) => setStageProgress(Math.round(progress * 0.35)),
      });
      const item = await ensureDraft(workspace);

      setStage("uploading-marker");
      const marker = await mediaRepository.upload(
        {
          ...workspace,
          kind: "marker",
          file: preparedMarker.file,
          requestId: crypto.randomUUID(),
        },
        preparedMarker,
        ({ uploadedBytes, totalBytes }) => setStageProgress(percent(uploadedBytes, totalBytes)),
        controller.signal,
      );

      setStage("uploading-video");
      setStageProgress(0);
      const video = await mediaRepository.upload(
        {
          ...workspace,
          kind: "video",
          file: preparedVideo.file,
          requestId: crypto.randomUUID(),
        },
        preparedVideo,
        ({ uploadedBytes, totalBytes }) => setStageProgress(percent(uploadedBytes, totalBytes)),
        controller.signal,
      );

      await arItemRepository.prepare(workspace.accountId, item.id, {
        markerAssetId: marker.id,
        videoAssetId: video.id,
        autoplay: true,
        loopVideo: true,
        markerLostBehavior: "pause_hide",
        audioDefault: "muted",
        fallbackEnabled: true,
      });
      setItemId(item.id);
      setStage("processing");
      setStageProgress(0);
      if (!markerQuality.suitable) {
        await arItemRepository.overrideMarkerQuality(
          workspace.accountId,
          item.id,
          "Автоматический тестовый режим: пользователь выбрал продолжить обработку фотографии",
        );
      }
      await waitForResult(workspace, item.id);
    } catch (submitError) {
      showError(submitError);
    }
  };

  const ensureDraft = async (workspace: QuickStartWorkspace): Promise<ArItem> => {
    if (activeItemId.current) return arItemRepository.getItem(workspace.accountId, activeItemId.current);
    const item = await arItemRepository.createDraft(workspace.accountId, {
      projectId: workspace.projectId,
      groupId: workspace.groupId,
      title: title.trim(),
      description: "",
      requestId: requestId.current,
    });
    activeItemId.current = item.id;
    return item;
  };

  const retryProcessing = async () => {
    const workspace = workspaceQuery.data;
    if (!workspace || !itemId) return;
    setError("");
    setStage("processing");
    try {
      await arItemRepository.retry(workspace.accountId, itemId);
      await Promise.all([itemQuery.refetch(), jobsQuery.refetch()]);
      await waitForResult(workspace, itemId);
    } catch (retryError) {
      showError(retryError);
    }
  };

  const reset = () => {
    uploadController.current?.abort();
    setTitle("");
    setMarkerFile(undefined);
    setVideoFile(undefined);
    setStage("form");
    setStageProgress(0);
    setItemId("");
    setResult(undefined);
    setError("");
    setPickerVersion((current) => current + 1);
    requestId.current = crypto.randomUUID();
    activeItemId.current = "";
  };

  const waitForResult = async (workspace: QuickStartWorkspace, targetItemId: string) => {
    for (let attempt = 0; attempt < 240; attempt += 1) {
      const item = await arItemRepository.getItem(workspace.accountId, targetItemId);
      if (item.status === "failed") {
        throw new Error("Обработка не завершилась. Нажмите «Повторить обработку» — загружать файлы заново не нужно.");
      }
      if (item.status === "ready" || item.status === "published") {
        setStage("publishing");
        const qr =
          item.status === "published"
            ? await arItemRepository.getQrCode(workspace.accountId, targetItemId)
            : await arItemRepository.publish(workspace.accountId, targetItemId, resolvePublicBaseUrl());
        if (!qr) throw new Error("QR-код не создан");
        setResult(qr);
        setStage("done");
        return;
      }
      await delay(2_500);
    }
    throw new Error("Обработка занимает слишком много времени. Нажмите «Повторить обработку» — загружать файлы заново не нужно.");
  };

  if (workspaceQuery.isPending) {
    return <CenteredState title="Открываем тестовый режим…" text="Создаём изолированное рабочее пространство" />;
  }
  if (workspaceQuery.error) {
    return (
      <CenteredState
        title="Тестовый режим пока недоступен"
        text={readableError(workspaceQuery.error)}
        action={
          <Button onClick={() => void workspaceQuery.refetch()}>
            <RefreshCw size={17} /> Повторить
          </Button>
        }
      />
    );
  }

  if (visibleStage === "done" && result) {
    return <QuickResult title={title} qr={result} onReset={reset} />;
  }

  const status = quickStatus(visibleStage, stageProgress, processingProgress, runningJob);
  return (
    <main className="min-h-[100dvh] bg-background px-4 py-5 text-ink sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 text-center sm:mb-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles size={28} />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">AR Photo · тест</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Оживите фотографию</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
            Без регистрации, проектов и групп. Добавьте название, фотографию и видео — остальное сделаем автоматически.
          </p>
        </header>

        <Panel className="p-5 sm:p-7">
          <div className="grid gap-6">
            <label className="grid gap-2 text-sm font-semibold">
              Название
              <Input
                value={title}
                onValueChange={setTitle}
                placeholder="Например, Семейная фотография"
                maxLength={160}
                disabled={processing || Boolean(itemId)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <MediaPicker
                key={`marker-${pickerVersion}`}
                kind="marker"
                file={markerFile}
                previewUrl={markerPreview}
                disabled={processing || Boolean(itemId)}
                onPick={setMarkerFile}
              />
              <MediaPicker
                key={`video-${pickerVersion}`}
                kind="video"
                file={videoFile}
                disabled={processing || Boolean(itemId)}
                onPick={setVideoFile}
              />
            </div>

            {visibleStage !== "form" && visibleStage !== "error" ? <ProgressStatus {...status} /> : null}
            {visibleStage === "error" ? (
              <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm leading-6 text-rose-100" role="alert">
                {error || "Обработка не завершилась. Нажмите «Повторить обработку» — загружать файлы заново не нужно."}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {visibleStage === "error" && itemId ? (
                <Button full onClick={() => void retryProcessing()}>
                  <RefreshCw size={17} /> Повторить обработку
                </Button>
              ) : (
                <Button full disabled={!canSubmit} onClick={() => void submit()}>
                  {processing ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {processing ? "Создаём AR…" : "Оживить фото"}
                </Button>
              )}
              <Button full variant="quiet" disabled={processing} onClick={reset}>
                Очистить
              </Button>
            </div>
          </div>
        </Panel>

        <p className="mt-5 text-center text-xs leading-5 text-muted">
          Файлы доступны только вашей гостевой сессии. Готовая публичная ссылка содержит случайный защищённый идентификатор.
        </p>
      </div>
    </main>
  );
}

function MediaPicker({
  kind,
  file,
  previewUrl,
  disabled,
  onPick,
}: {
  kind: "marker" | "video";
  file?: File;
  previewUrl?: string;
  disabled: boolean;
  onPick(file?: File): void;
}) {
  const marker = kind === "marker";
  return (
    <label
      className={`group relative grid min-h-56 overflow-hidden rounded-2xl border border-dashed p-4 transition ${
        disabled ? "cursor-not-allowed opacity-65" : "cursor-pointer hover:border-primary hover:bg-primary/5"
      } ${file ? "border-emerald-400/45 bg-emerald-400/5" : "border-line bg-black/10"}`}
    >
      {marker && previewUrl ? (
        <img className="absolute inset-0 h-full w-full object-cover opacity-35" src={previewUrl} alt="" />
      ) : null}
      <span className="relative z-10 m-auto grid place-items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-primary">
          {file ? <Check size={27} /> : marker ? <ImagePlus size={27} /> : <FileVideo2 size={27} />}
        </span>
        <strong className="mt-4">{marker ? "Фотография" : "Видео"}</strong>
        <span className="mt-2 max-w-56 break-words text-xs leading-5 text-muted">
          {file ? `${file.name} · ${formatBytes(file.size)}` : marker ? "Выберите фотографию-маркер" : "Выберите видео для воспроизведения"}
        </span>
        {!file ? (
          <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold">
            <Upload size={15} /> Добавить файл
          </span>
        ) : null}
      </span>
      <input
        className="sr-only"
        type="file"
        accept={marker ? markerAccept : videoAccept}
        disabled={disabled}
        onChange={(event) => onPick(event.currentTarget.files?.[0])}
      />
    </label>
  );
}

function ProgressStatus({ label, detail, progress }: { label: string; detail: string; progress: number }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <LoaderCircle className="mt-0.5 shrink-0 animate-spin text-primary" size={20} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
        </div>
        <span className="text-sm font-semibold text-primary">{Math.max(0, Math.min(100, progress))}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(3, progress)}%` }} />
      </div>
    </div>
  );
}

function QuickResult({ title, qr, onReset }: { title: string; qr: QrCodeRecord; onReset(): void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const downloadQr = () => {
    if (!svgRef.current) return;
    const source = new XMLSerializer().serializeToString(svgRef.current);
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeFileName(title)}-qr.svg`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-4 py-8 text-ink">
      <Panel className="w-full max-w-xl p-6 text-center sm:p-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
          <Check size={28} />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Готово</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">QR-код уже опубликован. Откройте его на другом устройстве и наведите камеру на фотографию.</p>
        <div className="mx-auto mt-6 w-full max-w-[340px] rounded-3xl bg-white p-4">
          <QRCodeSVG ref={svgRef} value={qr.public_url} size={320} level="H" marginSize={4} className="h-auto w-full" title={`QR: ${title}`} />
        </div>
        <p className="mt-5 break-all font-mono text-xs leading-5 text-muted">{qr.public_url}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button variant="ghost" onClick={downloadQr}>
            <Download size={17} /> Скачать QR
          </Button>
          <Button variant="ghost" onClick={() => window.open(qr.public_url, "_blank", "noopener,noreferrer")}>
            <ExternalLink size={17} /> Открыть
          </Button>
          <Button onClick={onReset}>
            <Sparkles size={17} /> Создать ещё
          </Button>
        </div>
      </Panel>
    </main>
  );
}

function CenteredState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-background px-5 text-ink">
      <Panel className="w-full max-w-md p-6 text-center">
        <LoaderCircle className="mx-auto animate-spin text-primary" size={30} />
        <h1 className="mt-5 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </Panel>
    </main>
  );
}

function quickStatus(stage: QuickStage, stageProgress: number, processingProgress: number, job?: ProcessingJob) {
  if (stage === "preparing") return { label: "Подготавливаем файлы", detail: "Проверяем форматы и оптимизируем видео", progress: stageProgress };
  if (stage === "uploading-marker") return { label: "Загружаем фотографию", detail: "Безопасно передаём подготовленный маркер", progress: stageProgress };
  if (stage === "uploading-video") return { label: "Загружаем видео", detail: "Большой файл может загружаться несколько минут", progress: stageProgress };
  if (stage === "publishing") return { label: "Создаём QR-код", detail: "Публикуем защищённую AR-ссылку", progress: 96 };
  return {
    label: job ? (jobLabels[job.type] ?? "Обрабатываем AR-фото") : "Запускаем обработку",
    detail: "Создаём target.mind, превью и совместимое видео",
    progress: processingProgress,
  };
}

function useObjectUrl(file?: File) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
}

function percent(uploaded: number, total: number) {
  return total > 0 ? Math.round((uploaded / total) * 100) : 0;
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function safeFileName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "ar-photo";
}

function readableError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return "Загрузка отменена";
  if (error instanceof Error) return error.message;
  return "Не удалось завершить создание AR-фото";
}
