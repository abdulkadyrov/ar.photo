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
  Maximize2,
  Plus,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Timer,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import type { ArItem, QrCode as QrCodeRecord } from "../../entities/ar-item/model";
import { Button, Input } from "../../shared/ui";
import { getArItemRepository } from "../ar-items/arItemRepository";
import { useAuth } from "../auth/authContext";
import { getMediaRepository } from "../media/mediaRepository";
import { markerAccept, matchesMediaPickerKind, prepareMediaFile, videoAccept } from "../media/mediaValidation";
import { resolvePublicBaseUrl } from "../qr/qrDesign";
import {
  clearPendingQuickStart,
  getPendingQuickStart,
  getQuickStartWorkspace,
  savePendingQuickStart,
  type QuickStartWorkspace,
} from "./quickStartRepository";
import { currentTimestamp, formatElapsedTime } from "./quickStartTimer";
import "./QuickStartPage.css";

const mediaRepository = getMediaRepository();
const arItemRepository = getArItemRepository();
const MAX_QUICK_AR_PHOTOS = 10;

type QuickMediaPair = {
  id: string;
  markerFile?: File;
  videoFile?: File;
};

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
  const [additionalPairs, setAdditionalPairs] = useState<QuickMediaPair[]>([]);
  const [stage, setStage] = useState<QuickStage>(restoredAttempt ? "processing" : "form");
  const [, setStageProgress] = useState(0);
  const [itemIds, setItemIds] = useState<string[]>(
    restoredAttempt?.itemIds ?? (restoredAttempt?.itemId ? [restoredAttempt.itemId] : []),
  );
  const itemId = itemIds[0] ?? "";
  const [result, setResult] = useState<QrCodeRecord>();
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState<number | undefined>(restoredAttempt?.startedAt);
  const [finishedAt, setFinishedAt] = useState<number | undefined>();
  const [pickerVersion, setPickerVersion] = useState(0);
  const requestIds = useRef<string[]>([crypto.randomUUID()]);
  const activeItemIds = useRef<string[]>(
    restoredAttempt?.itemIds ?? (restoredAttempt?.itemId ? [restoredAttempt.itemId] : []),
  );
  const uploadController = useRef<AbortController | undefined>(undefined);
  const finishingBundleId = useRef("");

  const workspaceQuery = useQuery({
    queryKey: ["quick-start", "workspace", userId],
    queryFn: () => getQuickStartWorkspace(userId),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const itemsQuery = useQuery({
    queryKey: ["quick-start", "items", workspaceQuery.data?.accountId, itemIds],
    queryFn: () => Promise.all(itemIds.map((id) => arItemRepository.getItem(workspaceQuery.data!.accountId, id))),
    enabled: Boolean(workspaceQuery.data?.accountId && itemIds.length),
    refetchInterval: (query) =>
      query.state.data?.every((item) => ["ready", "published", "failed"].includes(item.status)) ? false : 2_500,
  });
  const markerPreview = useObjectUrl(markerFile);
  const videoPreview = useObjectUrl(videoFile);
  const itemFailed = itemsQuery.data?.some((item) => item.status === "failed");
  const itemLookupError = itemId ? itemsQuery.error : null;
  const visibleStage: QuickStage = itemFailed || itemLookupError ? "error" : stage;
  const processing = !["form", "done", "error"].includes(visibleStage);
  const mediaPairs = [{ markerFile, videoFile }, ...additionalPairs];
  const canSubmit = Boolean(
    title.trim().length >= 2 &&
    workspaceQuery.data &&
    !processing &&
    mediaPairs.every((pair) => pair.markerFile && pair.videoFile),
  );
  const elapsedSeconds = useElapsedSeconds(startedAt, finishedAt);
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
    const items = itemsQuery.data;
    if (!workspace || !items?.length || !itemId || finishingBundleId.current === itemId) return;
    if (!items.every((item) => item.status === "ready" || item.status === "published")) return;

    finishingBundleId.current = itemId;
    void (async () => {
      setStage("publishing");
      try {
        const rootItem = items.find((item) => item.id === itemId);
        const qr =
          rootItem?.status === "published" && items.every((item) => item.status === "published")
            ? await arItemRepository.getQrCode(workspace.accountId, itemId)
            : await arItemRepository.publishBundle(workspace.accountId, itemId, resolvePublicBaseUrl());
        if (!qr) throw new Error("QR-код не создан");
        setFinishedAt(currentTimestamp());
        setResult(qr);
        setStage("done");
        clearPendingQuickStart(userId);
      } catch (publishError) {
        setStage("error");
        setError(readableError(publishError));
      } finally {
        finishingBundleId.current = "";
      }
    })();
  }, [itemId, itemsQuery.data, userId, workspaceQuery.data]);

  const submit = async () => {
    if (!workspaceQuery.data || !canSubmit) return;
    const attemptStartedAt = currentTimestamp();
    setStartedAt(attemptStartedAt);
    setFinishedAt(undefined);
    setError("");
    setStage("preparing");
    setStageProgress(0);
    const controller = new AbortController();
    uploadController.current = controller;
    try {
      // Bootstrap again at the action boundary. The system Quick Start project
      // may have been archived/deleted after this page first loaded; the RPC
      // restores it and prevents uploads from targeting stale group ids.
      const workspace = await getQuickStartWorkspace(userId);
      const createdItemIds: string[] = [];
      let bundleRootItemId = activeItemIds.current[0];
      for (const [pairIndex, pair] of mediaPairs.entries()) {
        if (!pair.markerFile || !pair.videoFile) throw new Error("Добавьте фото и видео для каждого AR-фото");
        const preparedMarker = await prepareMediaFile(pair.markerFile, "marker");
        const preparedVideo = await prepareMediaFile(pair.videoFile, "video", {
          onProgress: (progress) =>
            setStageProgress(Math.round(((pairIndex + progress * 0.35) / mediaPairs.length) * 100)),
        });
        const item = await ensureDraft(workspace, pairIndex, bundleRootItemId);
        bundleRootItemId ??= item.id;

        setStage("uploading-marker");
        const marker = await mediaRepository.upload(
          {
            ...workspace,
            kind: "marker",
            file: preparedMarker.file,
            requestId: crypto.randomUUID(),
          },
          preparedMarker,
          ({ uploadedBytes, totalBytes }) =>
            setStageProgress(
              Math.round(((pairIndex + percent(uploadedBytes, totalBytes) / 100) / mediaPairs.length) * 100),
            ),
          controller.signal,
        );

        setStage("uploading-video");
        const video = await mediaRepository.upload(
          {
            ...workspace,
            kind: "video",
            file: preparedVideo.file,
            requestId: crypto.randomUUID(),
          },
          preparedVideo,
          ({ uploadedBytes, totalBytes }) =>
            setStageProgress(
              Math.round(((pairIndex + percent(uploadedBytes, totalBytes) / 100) / mediaPairs.length) * 100),
            ),
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
        createdItemIds.push(item.id);
        try {
          await arItemRepository.overrideMarkerQuality(
            workspace.accountId,
            item.id,
            "Быстрое создание: пользователь запустил автоматическую обработку и подтвердил продолжение с выбранной фотографией",
          );
        } catch (overrideError) {
          const latestItem = await arItemRepository.getItem(workspace.accountId, item.id);
          const overrideSatisfied =
            Boolean(latestItem.marker_quality_overridden_at) ||
            (latestItem.marker_quality_score !== null && latestItem.marker_quality_score >= 60);
          if (!overrideSatisfied) throw overrideError;
        }
      }
      savePendingQuickStart({
        userId,
        ...workspace,
        itemId: createdItemIds[0],
        itemIds: createdItemIds,
        title: title.trim(),
        startedAt: attemptStartedAt,
      });
      setItemIds(createdItemIds);
      setStage("processing");
      setStageProgress(0);
    } catch (submitError) {
      showError(submitError);
    }
  };

  const ensureDraft = async (
    workspace: QuickStartWorkspace,
    pairIndex: number,
    bundleRootItemId?: string,
  ): Promise<ArItem> => {
    if (activeItemIds.current[pairIndex]) {
      return arItemRepository.getItem(workspace.accountId, activeItemIds.current[pairIndex]);
    }
    requestIds.current[pairIndex] ??= crypto.randomUUID();
    const item = await arItemRepository.createDraft(workspace.accountId, {
      projectId: workspace.projectId,
      groupId: workspace.groupId,
      bundleRootItemId: pairIndex ? bundleRootItemId : undefined,
      title: pairIndex ? `${title.trim()} · фото ${pairIndex + 1}` : title.trim(),
      description: "",
      requestId: requestIds.current[pairIndex],
    });
    activeItemIds.current[pairIndex] = item.id;
    return item;
  };

  const retryProcessing = async () => {
    if (!workspaceQuery.data || !itemId) return;
    setError("");
    setStage("processing");
    try {
      const workspace = await getQuickStartWorkspace(userId);
      const failedItemIds = itemsQuery.data?.filter((item) => item.status === "failed").map((item) => item.id) ?? [];
      await Promise.all(
        (failedItemIds.length ? failedItemIds : [itemId]).map((id) => arItemRepository.retry(workspace.accountId, id)),
      );
      await itemsQuery.refetch();
    } catch (retryError) {
      showError(retryError);
    }
  };

  const reset = () => {
    uploadController.current?.abort();
    setTitle("");
    setMarkerFile(undefined);
    setVideoFile(undefined);
    setAdditionalPairs([]);
    setStage("form");
    setStageProgress(0);
    setItemIds([]);
    setResult(undefined);
    setError("");
    setStartedAt(undefined);
    setFinishedAt(undefined);
    clearPendingQuickStart(userId);
    setPickerVersion((current) => current + 1);
    requestIds.current = [crypto.randomUUID()];
    activeItemIds.current = [];
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
        itemCount={itemIds.length}
        elapsedSeconds={elapsedSeconds}
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

        <div className="quick-ar-photo-list">
          <section className="quick-ar-photo-block" aria-labelledby="quick-ar-photo-1">
            <header className="quick-ar-photo-heading">
              <div>
                <span id="quick-ar-photo-1">AR-фото 1</span>
                <small>Основное</small>
              </div>
            </header>
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
          </section>

          {additionalPairs.map((pair, index) => (
            <AdditionalArPhotoPair
              key={pair.id}
              index={index + 2}
              pair={pair}
              disabled={processing || Boolean(itemId)}
              onChange={(nextPair) =>
                setAdditionalPairs((current) =>
                  current.map((candidate) => (candidate.id === pair.id ? nextPair : candidate)),
                )
              }
              onRemove={() => setAdditionalPairs((current) => current.filter((candidate) => candidate.id !== pair.id))}
            />
          ))}
        </div>

        {visibleStage === "form" && additionalPairs.length + 1 < MAX_QUICK_AR_PHOTOS ? (
          <button
            className="quick-add-ar-photo"
            type="button"
            disabled={processing || Boolean(itemId)}
            onClick={() => setAdditionalPairs((current) => [...current, { id: crypto.randomUUID() }])}
          >
            <Plus size={18} />
            <span>
              <strong>Добавить ещё AR-фото</strong>
              <small>Ещё одна фотография и своё видео — в том же QR-коде</small>
            </span>
          </button>
        ) : null}

        {startedAt ? <QuickStopwatch elapsedSeconds={elapsedSeconds} running={!finishedAt} /> : null}
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

export function AdditionalArPhotoPair({
  index,
  pair,
  disabled,
  onChange,
  onRemove,
}: {
  index: number;
  pair: QuickMediaPair;
  disabled: boolean;
  onChange(pair: QuickMediaPair): void;
  onRemove(): void;
}) {
  const markerPreview = useObjectUrl(pair.markerFile);
  const videoPreview = useObjectUrl(pair.videoFile);
  const headingId = useId();
  return (
    <section className="quick-ar-photo-block quick-ar-photo-block-extra" aria-labelledby={headingId}>
      <header className="quick-ar-photo-heading">
        <div>
          <span id={headingId}>AR-фото {index}</span>
          <small>Тот же QR-код</small>
        </div>
        <button type="button" disabled={disabled} onClick={onRemove} aria-label={`Удалить AR-фото ${index}`}>
          <X size={17} /> Удалить
        </button>
      </header>
      <div className="quick-media-pair">
        <MediaPicker
          kind="marker"
          file={pair.markerFile}
          previewUrl={markerPreview}
          disabled={disabled}
          onPick={(file) => onChange({ ...pair, markerFile: file })}
        />
        <span className="quick-media-link" aria-hidden="true">
          <ArrowRightLeft size={20} />
        </span>
        <MediaPicker
          kind="video"
          file={pair.videoFile}
          previewUrl={videoPreview}
          disabled={disabled}
          onPick={(file) => onChange({ ...pair, videoFile: file })}
        />
      </div>
    </section>
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
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [pickerError, setPickerError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const chooseFile = (candidate?: File) => {
    setPickerError("");
    if (!candidate) {
      onPick(undefined);
      return;
    }
    if (!matchesMediaPickerKind(candidate, kind)) {
      setPickerError(marker ? "Выберите файл изображения" : "Выберите видеофайл");
      return;
    }
    onPick(candidate);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const candidate = Array.from(event.dataTransfer.files).find((droppedFile) =>
      matchesMediaPickerKind(droppedFile, kind),
    );
    if (!candidate) {
      setPickerError(marker ? "Перетащите сюда фотографию" : "Перетащите сюда видеофайл");
      return;
    }
    chooseFile(candidate);
  };

  return (
    <>
      <div
        className={`quick-media-picker ${file ? "quick-media-picker-ready" : ""} ${disabled ? "quick-media-picker-disabled" : ""} ${dragging ? "quick-media-picker-dragging" : ""}`}
        data-testid={`${kind}-media-picker`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && event.dataTransfer.types.includes("Files")) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleDrop}
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
            <button
              aria-label={`Просмотреть ${marker ? "фотографию" : "видео"} ${file?.name ?? ""}`}
              className="quick-media-open"
              type="button"
              onClick={() => setPreviewOpen(true)}
            >
              {marker ? (
                <img src={previewUrl} alt={`Предпросмотр фотографии ${file?.name ?? ""}`} />
              ) : (
                <video
                  src={previewUrl}
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={`Предпросмотр видео ${file?.name ?? ""}`}
                />
              )}
              <span className="quick-media-view-badge">
                <Maximize2 size={14} /> Просмотреть
              </span>
            </button>
          ) : (
            <label className="quick-media-select-surface" htmlFor={disabled ? undefined : inputId}>
              <span className="quick-media-empty">
                <span className="quick-media-icon">{marker ? <ImagePlus size={29} /> : <FileVideo2 size={29} />}</span>
                <strong>{marker ? "Выберите фотографию" : "Выберите видео"}</strong>
                <span>{marker ? "JPG, PNG или WebP" : "MP4, MOV, AVI и другие видеоформаты"}</span>
              </span>
              <span className="quick-pick-file">
                <Upload size={16} /> Добавить файл
              </span>
            </label>
          )}

          {file ? (
            <span className="quick-media-file">
              <span>
                <strong>{file.name}</strong>
                <small>{formatBytes(file.size)}</small>
              </span>
              <label className="quick-replace-file" htmlFor={disabled ? undefined : inputId}>
                <Upload size={15} /> <span>Заменить</span>
              </label>
            </span>
          ) : null}
          {dragging ? (
            <span className="quick-media-drop-overlay">
              <Upload size={24} /> Отпустите файл здесь
            </span>
          ) : null}
        </span>

        <span className="quick-media-hint">
          <LockKeyhole size={14} />
          <span>
            {marker ? "Чёткое фото без бликов даст лучший трекинг" : "Звук и цвет сохранятся после обработки"}
          </span>
        </span>
        {pickerError ? (
          <span className="quick-media-picker-error" role="alert">
            {pickerError}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-label={marker ? "Выбрать фотографию-маркер" : "Выбрать видео"}
          className="sr-only"
          type="file"
          accept={marker ? markerAccept : videoAccept}
          disabled={disabled}
          onChange={(event) => {
            chooseFile(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </div>
      {previewOpen && previewUrl && file ? (
        <MediaPreviewDialog kind={kind} file={file} previewUrl={previewUrl} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </>
  );
}

function MediaPreviewDialog({
  kind,
  file,
  previewUrl,
  onClose,
}: {
  kind: "marker" | "video";
  file: File;
  previewUrl: string;
  onClose(): void;
}) {
  const titleId = useId();
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className="quick-media-dialog-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="quick-media-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <small>{kind === "marker" ? "Фотография" : "Видео"}</small>
            <h2 id={titleId}>{file.name}</h2>
          </div>
          <button ref={closeButton} type="button" aria-label="Закрыть предпросмотр" onClick={onClose}>
            <X size={22} />
          </button>
        </header>
        <div className="quick-media-dialog-content">
          {kind === "marker" ? (
            <img src={previewUrl} alt={`Фотография ${file.name}`} />
          ) : (
            <video src={previewUrl} controls playsInline preload="metadata" aria-label={`Видео ${file.name}`} />
          )}
        </div>
      </section>
    </div>,
    document.body,
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

export function QuickStopwatch({ elapsedSeconds, running }: { elapsedSeconds: number; running: boolean }) {
  return (
    <div className="quick-stopwatch" role="timer" aria-label={`Прошло ${formatElapsedTime(elapsedSeconds)}`}>
      <span>
        <Timer size={18} /> Время создания
      </span>
      <strong>{formatElapsedTime(elapsedSeconds)}</strong>
      <small>{running ? "идёт" : "готово"}</small>
    </div>
  );
}

export function QuickResult({
  title,
  markerPreview,
  videoPreview,
  qr,
  itemCount = 1,
  elapsedSeconds,
  onReset,
}: {
  title: string;
  markerPreview?: string;
  videoPreview?: string;
  qr: QrCodeRecord;
  itemCount?: number;
  elapsedSeconds?: number;
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
      description={
        itemCount > 1
          ? `${itemCount} AR-фото привязаны к одному QR-коду. Наведите камеру на любое из них.`
          : "Фотография ожила. Скачайте QR-код или сразу откройте AR, чтобы проверить результат."
      }
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
          {elapsedSeconds !== undefined ? (
            <div className="quick-result-duration">
              <Timer size={18} />
              <span>Подготовлено и опубликовано за</span>
              <strong>{formatElapsedTime(elapsedSeconds)}</strong>
            </div>
          ) : null}
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

function useElapsedSeconds(startedAt?: number, finishedAt?: number) {
  const [now, setNow] = useState(() => finishedAt ?? startedAt ?? 0);
  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const timer = window.setInterval(() => setNow(currentTimestamp()), 1_000);
    return () => window.clearInterval(timer);
  }, [finishedAt, startedAt]);
  if (!startedAt) return 0;
  return Math.max(0, Math.floor(((finishedAt ?? now) - startedAt) / 1_000));
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
  if (error instanceof Error) {
    if (/active project group not found/i.test(error.message)) {
      return "Системный проект был удалён или архивирован. Нажмите «Оживить фото» ещё раз — AR Photo восстановит его автоматически.";
    }
    return error.message;
  }
  return "Не удалось завершить создание AR-фото";
}
