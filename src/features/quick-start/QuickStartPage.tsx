import { useQuery } from "@tanstack/react-query";
import {
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileVideo2,
  ImagePlus,
  LockKeyhole,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { ArItem, QrCode as QrCodeRecord } from "../../entities/ar-item/model";
import { Button, Input } from "../../shared/ui";
import { getArItemRepository } from "../ar-items/arItemRepository";
import { useAuth } from "../auth/authContext";
import { getMediaRepository } from "../media/mediaRepository";
import { markerAccept, prepareMediaFile, videoAccept } from "../media/mediaValidation";
import { resolvePublicBaseUrl } from "../qr/qrDesign";
import {
  clearPendingQuickStart,
  getPendingQuickStart,
  getQuickStartWorkspace,
  savePendingQuickStart,
  type QuickStartWorkspace,
} from "./quickStartRepository";

const mediaRepository = getMediaRepository();
const arItemRepository = getArItemRepository();

type QuickStage =
  "form" | "preparing" | "uploading-marker" | "uploading-video" | "processing" | "publishing" | "done" | "error";

export function QuickStartRoute() {
  const auth = useAuth();
  if (auth.status === "loading") {
    return <CenteredState title="Подготавливаем создание…" text="Проверяем рабочее пространство" />;
  }
  if (!auth.session) {
    return (
      <CenteredState
        title="Войдите, чтобы создать AR-фото"
        text="Создание и готовые QR-коды сохраняются в вашем личном кабинете."
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
  const restoredAttempt = useMemo(() => getPendingQuickStart(userId), [userId]);
  const [title, setTitle] = useState(restoredAttempt?.title ?? "");
  const [markerFile, setMarkerFile] = useState<File>();
  const [videoFile, setVideoFile] = useState<File>();
  const [stage, setStage] = useState<QuickStage>(restoredAttempt ? "processing" : "form");
  const [, setStageProgress] = useState(0);
  const [itemId, setItemId] = useState(restoredAttempt?.itemId ?? "");
  const [result, setResult] = useState<QrCodeRecord>();
  const [error, setError] = useState("");
  const [pickerVersion, setPickerVersion] = useState(0);
  const requestId = useRef(crypto.randomUUID());
  const activeItemId = useRef(restoredAttempt?.itemId ?? "");
  const uploadController = useRef<AbortController | undefined>(undefined);
  const finishingItemId = useRef("");

  const workspaceQuery = useQuery({
    queryKey: ["quick-start", "workspace", userId],
    queryFn: () => getQuickStartWorkspace(userId),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const itemQuery = useQuery({
    queryKey: ["quick-start", "item", workspaceQuery.data?.accountId, itemId],
    queryFn: () => arItemRepository.getItem(workspaceQuery.data!.accountId, itemId),
    enabled: Boolean(workspaceQuery.data?.accountId && itemId),
    refetchInterval: (query) =>
      query.state.data && ["ready", "published", "failed"].includes(query.state.data.status) ? false : 2_500,
  });
  const markerPreview = useObjectUrl(markerFile);
  const videoPreview = useObjectUrl(videoFile);
  const itemFailed = itemQuery.data?.status === "failed";
  const itemLookupError = itemId ? itemQuery.error : null;
  const visibleStage: QuickStage = itemFailed || itemLookupError ? "error" : stage;
  const processing = !["form", "done", "error"].includes(visibleStage);
  const canSubmit = Boolean(title.trim().length >= 2 && markerFile && videoFile && workspaceQuery.data && !processing);
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

  useEffect(() => {
    const workspace = workspaceQuery.data;
    const item = itemQuery.data;
    if (!workspace || !item || item.id !== itemId || finishingItemId.current === item.id) return;
    if (item.status !== "ready" && item.status !== "published") return;

    finishingItemId.current = item.id;
    void (async () => {
      setStage("publishing");
      try {
        const qr =
          item.status === "published"
            ? await arItemRepository.getQrCode(workspace.accountId, item.id)
            : await arItemRepository.publish(workspace.accountId, item.id, resolvePublicBaseUrl());
        if (!qr) throw new Error("QR-код не создан");
        setResult(qr);
        setStage("done");
        clearPendingQuickStart(userId);
      } catch (publishError) {
        setStage("error");
        setError(readableError(publishError));
      } finally {
        finishingItemId.current = "";
      }
    })();
  }, [itemId, itemQuery.data, userId, workspaceQuery.data]);

  const submit = async () => {
    const workspace = workspaceQuery.data;
    if (!workspace || !markerFile || !videoFile || !canSubmit) return;
    setError("");
    setStage("preparing");
    setStageProgress(0);
    const controller = new AbortController();
    uploadController.current = controller;
    try {
      const preparedMarker = await prepareMediaFile(markerFile, "marker");
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
        audioDefault: "user_enabled",
        fallbackEnabled: true,
      });
      savePendingQuickStart({
        userId,
        ...workspace,
        itemId: item.id,
        title: title.trim(),
      });
      setItemId(item.id);
      setStage("processing");
      setStageProgress(0);
      try {
        await arItemRepository.overrideMarkerQuality(
          workspace.accountId,
          item.id,
          "Быстрое создание: пользователь запустил автоматическую обработку и подтвердил продолжение с выбранной фотографией",
        );
      } catch (overrideError) {
        // Analysis can finish between prepare() and this RPC. A strong marker
        // no longer needs an override; a successfully persisted override also
        // makes a lost RPC response safe to continue.
        const latestItem = await arItemRepository.getItem(workspace.accountId, item.id);
        const overrideSatisfied =
          Boolean(latestItem.marker_quality_overridden_at) ||
          (latestItem.marker_quality_score !== null && latestItem.marker_quality_score >= 60);
        if (!overrideSatisfied) throw overrideError;
      }
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
      await itemQuery.refetch();
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
    clearPendingQuickStart(userId);
    setPickerVersion((current) => current + 1);
    requestId.current = crypto.randomUUID();
    activeItemId.current = "";
  };

  if (workspaceQuery.isPending) {
    return <CenteredState title="Открываем создание…" text="Готовим ваше рабочее пространство" />;
  }
  if (workspaceQuery.error) {
    return (
      <CenteredState
        title="Создание пока недоступно"
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
    return (
      <QuickResult
        title={title}
        markerPreview={markerPreview}
        videoPreview={videoPreview}
        qr={result}
        onReset={reset}
      />
    );
  }

  const progressStep = quickProgressStep(visibleStage);
  return (
    <QuickShell
      currentStep={visibleStage === "form" ? 1 : 2}
      eyebrow={visibleStage === "form" ? "Новый AR-момент" : "Обработка запущена"}
      title={visibleStage === "form" ? "Оживите фотографию" : "Создаём ваше AR-фото"}
      description={
        visibleStage === "form"
          ? "Добавьте фотографию и видео — обработку и QR-код мы подготовим автоматически."
          : "Можно оставить страницу открытой или вернуться позже — незавершённая работа восстановится автоматически."
      }
    >
      <section className="quick-create-card" aria-label="Создание AR-фото">
        <label className="quick-title-field">
          <span>Название</span>
          <Input
            value={title}
            onValueChange={setTitle}
            placeholder="Например, Наш семейный момент"
            maxLength={160}
            disabled={processing || Boolean(itemId)}
          />
        </label>

        <div className="quick-media-pair">
          <MediaPicker
            key={`marker-${pickerVersion}`}
            kind="marker"
            file={markerFile}
            previewUrl={markerPreview}
            disabled={processing || Boolean(itemId)}
            onPick={setMarkerFile}
          />
          <span className="quick-media-link" aria-hidden="true">
            <ArrowRightLeft size={20} />
          </span>
          <MediaPicker
            key={`video-${pickerVersion}`}
            kind="video"
            file={videoFile}
            previewUrl={videoPreview}
            disabled={processing || Boolean(itemId)}
            onPick={setVideoFile}
          />
        </div>

        {visibleStage !== "form" && visibleStage !== "error" ? <ProgressStatus step={progressStep} /> : null}
        {visibleStage === "error" ? (
          <div className="quick-error" role="alert">
            <strong>Обработка остановилась</strong>
            <span>
              {error ||
                (itemLookupError ? readableError(itemLookupError) : undefined) ||
                "Нажмите «Повторить обработку» — загружать файлы заново не нужно."}
            </span>
          </div>
        ) : null}

        <div className="quick-form-actions">
          {visibleStage === "error" && itemId ? (
            <Button full onClick={() => void retryProcessing()}>
              <RefreshCw size={18} /> Повторить обработку
            </Button>
          ) : (
            <Button full disabled={!canSubmit} onClick={() => void submit()}>
              {processing ? <LoaderCircle className="animate-spin" size={19} /> : <Sparkles size={19} />}
              {processing ? "Создаём AR…" : "Оживить фото"}
            </Button>
          )}
          <Button full variant="quiet" disabled={processing} onClick={reset}>
            Очистить
          </Button>
        </div>
      </section>

      <div className="quick-privacy-note">
        <ShieldCheck size={17} />
        <span>Файлы доступны только вашему аккаунту. Публичная ссылка защищена случайным идентификатором.</span>
      </div>
    </QuickShell>
  );
}

export function MediaPicker({
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
      className={`quick-media-picker ${file ? "quick-media-picker-ready" : ""} ${disabled ? "quick-media-picker-disabled" : ""}`}
    >
      <span className="quick-media-picker-heading">
        <span>
          <small>{marker ? "Маркер" : "Контент"}</small>
          <strong>{marker ? "Фотография" : "Видео"}</strong>
        </span>
        {file ? (
          <span className="quick-added-badge">
            <Check size={13} /> Добавлено
          </span>
        ) : null}
      </span>

      <span className="quick-media-preview">
        {previewUrl ? (
          marker ? (
            <img src={previewUrl} alt={`Предпросмотр фотографии ${file?.name ?? ""}`} />
          ) : (
            <video
              src={previewUrl}
              muted
              playsInline
              preload="metadata"
              aria-label={`Предпросмотр видео ${file?.name ?? ""}`}
            />
          )
        ) : (
          <span className="quick-media-empty">
            <span className="quick-media-icon">{marker ? <ImagePlus size={29} /> : <FileVideo2 size={29} />}</span>
            <strong>{marker ? "Выберите фотографию" : "Выберите видео"}</strong>
            <span>{marker ? "JPG, PNG или WebP" : "MP4, MOV или WebM"}</span>
          </span>
        )}

        {file ? (
          <span className="quick-media-file">
            <span>
              <strong>{file.name}</strong>
              <small>{formatBytes(file.size)}</small>
            </span>
            <span className="quick-replace-file">
              <Upload size={15} /> Заменить
            </span>
          </span>
        ) : (
          <span className="quick-pick-file">
            <Upload size={16} /> Добавить файл
          </span>
        )}
      </span>

      <span className="quick-media-hint">
        <LockKeyhole size={14} />
        <span>{marker ? "Чёткое фото без бликов даст лучший трекинг" : "Звук и цвет сохранятся после обработки"}</span>
      </span>
      <input
        aria-label={marker ? "Выбрать фотографию-маркер" : "Выбрать видео"}
        className="sr-only"
        type="file"
        accept={marker ? markerAccept : videoAccept}
        disabled={disabled}
        onChange={(event) => onPick(event.currentTarget.files?.[0])}
      />
    </label>
  );
}

export function ProgressStatus({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div
      className="quick-progress quick-progress-simple"
      role="status"
      aria-live="polite"
      aria-label={`Этап ${step} из 4`}
    >
      <span className="quick-progress-spinner" aria-hidden="true">
        <LoaderCircle className="animate-spin" size={21} />
      </span>
      <strong>{step}/4</strong>
      <span className="sr-only">Создаём AR-фото, этап {step} из 4</span>
    </div>
  );
}

export function QuickResult({
  title,
  markerPreview,
  videoPreview,
  qr,
  onReset,
}: {
  title: string;
  markerPreview?: string;
  videoPreview?: string;
  qr: QrCodeRecord;
  onReset(): void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
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
  const copyUrl = async () => {
    await navigator.clipboard.writeText(qr.public_url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2_000);
  };
  return (
    <QuickShell
      currentStep={3}
      eyebrow="Готово к просмотру"
      title="Всё готово"
      description="Фотография ожила. Скачайте QR-код или сразу откройте AR, чтобы проверить результат."
    >
      <div className="quick-result-grid">
        <section className="quick-result-card quick-result-media" aria-labelledby="quick-result-title">
          <div className="quick-result-card-heading">
            <div>
              <span className="quick-section-label">Ваш AR-момент</span>
              <h2 id="quick-result-title">{title}</h2>
            </div>
            <span className="quick-ready-badge">
              <CheckCircle2 size={16} /> Готово к просмотру
            </span>
          </div>

          <div className="quick-result-previews">
            <figure>
              <figcaption>Маркер</figcaption>
              <div className="quick-result-preview">
                {markerPreview ? (
                  <img src={markerPreview} alt={`Фотография-маркер ${title}`} />
                ) : (
                  <ImagePlus size={34} />
                )}
              </div>
            </figure>
            <figure>
              <figcaption>Видео</figcaption>
              <div className="quick-result-preview">
                {videoPreview ? (
                  <video src={videoPreview} controls playsInline preload="metadata" aria-label={`Видео для ${title}`} />
                ) : (
                  <FileVideo2 size={34} />
                )}
              </div>
            </figure>
          </div>

          <div className="quick-result-instruction">
            <ScanLine size={20} />
            <div>
              <strong>Как проверить</strong>
              <span>Откройте AR на телефоне, разрешите камеру и наведите её на фотографию целиком.</span>
            </div>
          </div>
        </section>

        <aside className="quick-result-card quick-qr-card" aria-label="QR-код AR-фото">
          <span className="quick-qr-icon">
            <QrCode size={21} />
          </span>
          <h2>Ваш QR-код</h2>
          <p>Он уже опубликован и ведёт прямо в камеру AR Photo.</p>
          <div className="quick-qr-canvas">
            <QRCodeSVG
              ref={svgRef}
              value={qr.public_url}
              size={320}
              level="H"
              marginSize={4}
              className="h-auto w-full"
              title={`QR: ${title}`}
            />
            <span className="quick-qr-brand" aria-hidden="true">
              <Sparkles size={18} />
            </span>
          </div>

          <div className="quick-public-url">
            <span>{qr.public_url}</span>
            <button aria-label="Копировать публичную ссылку" onClick={() => void copyUrl()} type="button">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <span className="quick-copy-status" aria-live="polite">
            {copied ? "Ссылка скопирована" : " "}
          </span>

          <div className="quick-result-actions">
            <Button
              className="quick-open-ar"
              onClick={() => window.open(qr.public_url, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink size={18} /> Открыть AR
            </Button>
            <Button variant="ghost" onClick={downloadQr}>
              <Download size={18} /> Скачать QR
            </Button>
          </div>
        </aside>
      </div>

      <Button className="quick-create-more" variant="quiet" onClick={onReset}>
        <Sparkles size={17} /> Создать ещё
      </Button>
    </QuickShell>
  );
}

function QuickShell({
  currentStep,
  eyebrow,
  title,
  description,
  children,
}: {
  currentStep: 1 | 2 | 3;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="quick-flow">
      <QuickHeader />
      <div className="quick-flow-content">
        <QuickStepper currentStep={currentStep} />
        <header className="quick-page-heading">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
      </div>
      <footer className="quick-footer">
        <span>AR Photo · личный кабинет</span>
        <span>Фото превращается в воспоминание, которое можно услышать</span>
      </footer>
    </main>
  );
}

function QuickHeader() {
  return (
    <header className="quick-header">
      <a className="quick-brand" aria-label="AR Photo — на главную" href={`${import.meta.env.BASE_URL}dashboard`}>
        <span className="quick-brand-symbol">
          <ScanLine size={24} />
          <Sparkles size={13} />
        </span>
        <strong>AR Photo</strong>
      </a>
      <div className="quick-header-badges">
        <span>
          <ShieldCheck size={15} /> Защищено
        </span>
        <span className="quick-test-badge">Личный кабинет</span>
      </div>
    </header>
  );
}

export function QuickStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = ["Добавьте файлы", "Создаём AR", "Получите QR"];
  return (
    <nav className="quick-stepper" aria-label="Этапы создания AR-фото">
      <ol>
        {steps.map((label, index) => {
          const number = (index + 1) as 1 | 2 | 3;
          const completed = number < currentStep || currentStep === 3;
          const active = number === currentStep;
          return (
            <li
              aria-current={active ? "step" : undefined}
              className={`${active ? "quick-step-active" : ""} ${completed ? "quick-step-complete" : ""}`}
              key={label}
            >
              <span className="quick-step-number" aria-hidden="true">
                {completed ? <Check size={15} /> : number}
              </span>
              <span>
                <small>Шаг {number}</small>
                <strong>{label}</strong>
              </span>
              {number < 3 ? <i aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CenteredState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <main className="quick-flow quick-centered-flow">
      <QuickHeader />
      <section className="quick-centered-card" role="status">
        <span className="quick-progress-spinner">
          <LoaderCircle className="animate-spin" size={24} />
        </span>
        <h1>{title}</h1>
        <p>{text}</p>
        {action ? <div className="quick-centered-action">{action}</div> : null}
      </section>
    </main>
  );
}

function quickProgressStep(stage: QuickStage): 1 | 2 | 3 | 4 {
  if (stage === "preparing" || stage === "uploading-marker") return 1;
  if (stage === "uploading-video") return 2;
  if (stage === "processing") return 3;
  return 4;
}

function useObjectUrl(file?: File) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

function percent(uploaded: number, total: number) {
  return total > 0 ? Math.round((uploaded / total) * 100) : 0;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function safeFileName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "ar-photo"
  );
}

function readableError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") return "Загрузка отменена";
  if (error instanceof Error) return error.message;
  return "Не удалось завершить создание AR-фото";
}
