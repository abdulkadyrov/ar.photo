import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  ExternalLink,
  FileVideo2,
  ImageIcon,
  LoaderCircle,
  Play,
  Plus,
  RefreshCw,
  ScanLine,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import type { ArItem, ArItemSettings, MediaAsset, ProcessingJob } from "../../entities/ar-item/model";
import { Button, ErrorState, Input, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getMediaRepository } from "../media/mediaRepository";
import { markerAccept, prepareMediaFile, videoAccept } from "../media/mediaValidation";
import { resolvePublicBaseUrl } from "../qr/qrDesign";
import { getArItemRepository } from "./arItemRepository";
import { analyzeMarkerFile, type MarkerQualityResult } from "./markerQuality";
import "./ArItemPages.css";

const catalogRepository = getCatalogRepository();
const mediaRepository = getMediaRepository();
const arItemRepository = getArItemRepository();

const wizardSteps = ["Проект", "Описание", "Фото, видео и поведение", "Публикация"] as const;

const statusLabels = {
  draft: "Черновик",
  processing: "Обрабатывается",
  ready: "Готово",
  published: "Опубликовано",
  failed: "Ошибка",
  suspended: "Приостановлено",
  archived: "В архиве",
} as const;

const jobLabels: Partial<Record<ProcessingJob["type"], string>> = {
  marker_analysis: "Анализ маркера",
  video_inspection: "Проверка видео",
  video_transcode: "Подготовка H.264/AAC",
  marker_compilation: "Компиляция tracking dataset",
  thumbnail_generation: "Превью видео",
};

const defaultSettings: ArItemSettings = {
  autoplay: true,
  loopVideo: true,
  markerLostBehavior: "pause_hide",
  audioDefault: "muted",
  fallbackEnabled: true,
};

export function ArItemsRoute() {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId")?.trim() || undefined;
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const accountId = workspaceQuery.data?.accountId;
  const projectQuery = useQuery({
    queryKey: ["catalog", "project", accountId, projectId],
    queryFn: () => catalogRepository.getProject(accountId!, projectId!),
    enabled: Boolean(accountId && projectId),
  });
  const groupsQuery = useQuery({
    queryKey: ["catalog", "groups", accountId, projectId],
    queryFn: () => catalogRepository.listGroups(accountId!, projectId!),
    enabled: Boolean(accountId && projectId),
  });
  const itemsQuery = useQuery({
    queryKey: ["ar-items", accountId, projectId ?? "all"],
    queryFn: () => arItemRepository.listItems(accountId!, projectId),
    enabled: Boolean(accountId),
  });
  const assetsQuery = useQuery({
    queryKey: ["media-assets", accountId, projectId ?? "all"],
    queryFn: () => mediaRepository.listAssets(accountId!, projectId),
    enabled: Boolean(accountId),
  });

  if (workspaceQuery.error || projectQuery.error || groupsQuery.error || itemsQuery.error || assetsQuery.error) {
    return (
      <AppShell title="AR-работы" description="Связанные фотографии и видео">
        <div className="mt-6">
          <ErrorState
            text={readableError(
              workspaceQuery.error ?? projectQuery.error ?? groupsQuery.error ?? itemsQuery.error ?? assetsQuery.error,
            )}
          />
        </div>
      </AppShell>
    );
  }
  if (
    workspaceQuery.isPending ||
    itemsQuery.isPending ||
    assetsQuery.isPending ||
    (projectId && (projectQuery.isPending || groupsQuery.isPending))
  ) {
    return <ItemsLoading />;
  }

  const groups = groupsQuery.data ?? [];
  const groupById = new Map(groups.map((group) => [group.id, group.name]));
  const contextLabel = projectId
    ? `${groups.length === 1 ? groups[0].name : `${groups.length} групп`} · ${itemsQuery.data.length} AR-работ`
    : `${itemsQuery.data.length} AR-работ`;

  return (
    <AppShell
      title={projectQuery.data?.name ?? "AR-работы"}
      description={contextLabel}
      compactMobile
      showDescriptionOnMobile
      actions={
        <>
          {projectId ? (
            <Link className="btn btn-quiet ar-items-back" to="/projects">
              <ArrowLeft size={17} /> <span>Проекты</span>
            </Link>
          ) : null}
          <Link
            className="btn btn-primary ar-items-create"
            to={projectId ? `/items/new?projectId=${encodeURIComponent(projectId)}` : "/items/new"}
          >
            <Plus size={17} /> <span>Новая AR-работа</span>
          </Link>
        </>
      }
    >
      {itemsQuery.data.length ? (
        <section className="ar-items-grid" aria-label="Список AR-работ">
          {itemsQuery.data.map((item) => {
            const marker = assetsQuery.data.find((asset) => asset.id === item.marker_asset_id);
            return <ArItemCard groupName={groupById.get(item.group_id)} item={item} marker={marker} key={item.id} />;
          })}
        </section>
      ) : (
        <Panel className="mt-6 py-12 text-center">
          <span className="metric-icon mx-auto">
            <Sparkles size={24} />
          </span>
          <h2 className="mt-4 text-2xl font-semibold">Создайте первую AR-работу</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Нужны проект, группа, фотография-маркер и видео. Исходные форматы будут автоматически подготовлены.
          </p>
          <Link className="btn btn-primary mt-5" to="/items/new">
            <Plus size={17} /> Начать
          </Link>
        </Panel>
      )}
    </AppShell>
  );
}

export function ArItemDetailRoute() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { itemId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [completionBusy, setCompletionBusy] = useState(false);
  const [completionError, setCompletionError] = useState("");
  const completionAttempt = useRef("");
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const accountId = workspaceQuery.data?.accountId;
  const itemQuery = useQuery({
    queryKey: ["ar-item", accountId, itemId],
    queryFn: () => arItemRepository.getItem(accountId!, itemId),
    enabled: Boolean(accountId && itemId),
    refetchInterval: (query) => (query.state.data?.status === "processing" ? 3_000 : false),
  });
  const assetsQuery = useQuery({
    queryKey: ["media-assets", accountId, itemQuery.data?.project_id],
    queryFn: () => mediaRepository.listAssets(accountId!, itemQuery.data!.project_id),
    enabled: Boolean(accountId && itemQuery.data?.project_id),
  });
  const qrQuery = useQuery({
    queryKey: ["ar-item", "qr", accountId, itemId],
    queryFn: () => arItemRepository.getQrCode(accountId!, itemId),
    enabled: Boolean(accountId && itemId),
  });

  useEffect(() => {
    const item = itemQuery.data;
    if (!accountId || !item || item.status !== "ready" || qrQuery.data) return;
    const attemptKey = `${item.id}:${item.version}`;
    if (completionAttempt.current === attemptKey) return;
    completionAttempt.current = attemptKey;
    setCompletionBusy(true);
    setCompletionError("");
    void arItemRepository
      .publish(accountId, item.id, resolvePublicBaseUrl())
      .then(async (qr) => {
        queryClient.setQueryData(["ar-item", "qr", accountId, item.id], qr);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["ar-item", accountId, item.id] }),
          queryClient.invalidateQueries({ queryKey: ["ar-items"] }),
        ]);
      })
      .catch((error: unknown) => setCompletionError(readableError(error)))
      .finally(() => setCompletionBusy(false));
  }, [accountId, itemQuery.data, qrQuery.data, queryClient]);

  if (workspaceQuery.error || itemQuery.error || assetsQuery.error || qrQuery.error) {
    return (
      <AppShell title="AR-работа">
        <div className="mt-6">
          <ErrorState
            text={readableError(workspaceQuery.error ?? itemQuery.error ?? assetsQuery.error ?? qrQuery.error)}
          />
        </div>
      </AppShell>
    );
  }
  if (workspaceQuery.isPending || itemQuery.isPending || assetsQuery.isPending || qrQuery.isPending) {
    return <ItemDetailLoading />;
  }

  const item = itemQuery.data;
  const marker = assetsQuery.data.find((asset) => asset.id === item.marker_asset_id);
  const video = assetsQuery.data.find((asset) => asset.id === item.video_asset_id);
  const qrCode = qrQuery.data;
  const canReturnToItems = Boolean((location.state as { fromArItems?: unknown } | null)?.fromArItems);
  const copyPublicUrl = async () => {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode.public_url);
      setNotice("Ссылка скопирована");
    } catch {
      setNotice("Не удалось скопировать ссылку");
    }
  };
  const sharePublicUrl = async () => {
    if (!qrCode) return;
    if (!navigator.share) {
      await copyPublicUrl();
      return;
    }
    try {
      await navigator.share({ title: item.title, url: qrCode.public_url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice("Не удалось поделиться ссылкой");
    }
  };
  const retryBackgroundWork = async () => {
    setCompletionBusy(true);
    setCompletionError("");
    try {
      if (item.status === "failed") {
        await arItemRepository.retry(accountId!, item.id);
        completionAttempt.current = "";
        await itemQuery.refetch();
      } else {
        const qr = await arItemRepository.publish(accountId!, item.id, resolvePublicBaseUrl());
        queryClient.setQueryData(["ar-item", "qr", accountId, item.id], qr);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["ar-item", accountId, item.id] }),
          queryClient.invalidateQueries({ queryKey: ["ar-items"] }),
        ]);
      }
    } catch (error) {
      setCompletionError(readableError(error));
    } finally {
      setCompletionBusy(false);
    }
  };

  return (
    <AppShell
      title={item.title}
      compactMobile
      actions={
        canReturnToItems ? (
          <button
            className="btn btn-quiet ar-items-back"
            aria-label="Вернуться к AR-работам"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={17} /> <span>AR-работы</span>
          </button>
        ) : (
          <Link className="btn btn-quiet ar-items-back" to={`/items?projectId=${encodeURIComponent(item.project_id)}`}>
            <ArrowLeft size={17} /> <span>AR-работы</span>
          </Link>
        )
      }
    >
      <main className="ar-item-detail">
        <section className="ar-item-media-section" aria-labelledby="ar-item-photo-title">
          <h2 id="ar-item-photo-title">Фото</h2>
          <SignedMedia asset={marker} kind="image" label="Фотография-маркер" />
        </section>
        <section className="ar-item-media-section" aria-labelledby="ar-item-video-title">
          <h2 id="ar-item-video-title">Видео</h2>
          <SignedMedia asset={video} kind="video" label="Видео AR-работы" />
        </section>
        <section className="ar-item-publication" aria-labelledby="ar-item-qr-title">
          <div className="ar-item-qr-summary">
            <div className="ar-item-qr-code">
              {qrCode ? (
                <QRCodeSVG value={qrCode.public_url} size={220} level="H" marginSize={2} title={`QR: ${item.title}`} />
              ) : (
                <ScanLine aria-hidden="true" size={36} />
              )}
            </div>
            <div>
              <h2 id="ar-item-qr-title">QR-код</h2>
              <p>{qrCode ? "Для открытия работы в AR" : "Появится после публикации"}</p>
            </div>
          </div>
          <label htmlFor="ar-item-public-url">Публичная ссылка</label>
          <div className="ar-item-public-link">
            <p id="ar-item-public-url" title={qrCode?.public_url}>
              {qrCode?.public_url ?? "Ссылка ещё не создана"}
            </p>
            <button disabled={!qrCode} aria-label="Копировать публичную ссылку" onClick={() => void copyPublicUrl()}>
              <Clipboard size={18} />
            </button>
          </div>
          <div className="ar-item-public-actions">
            <button disabled={!qrCode} onClick={() => void copyPublicUrl()} type="button">
              <Clipboard size={16} /> Копировать
            </button>
            <button disabled={!qrCode} onClick={() => void sharePublicUrl()} type="button">
              <Share2 size={16} /> Поделиться
            </button>
            {qrCode ? (
              <a href={qrCode.public_url} target="_blank" rel="noreferrer" aria-label="Открыть публичную ссылку">
                <ExternalLink size={16} /> Открыть
              </a>
            ) : (
              <span aria-disabled="true">
                <ExternalLink size={16} /> Открыть
              </span>
            )}
          </div>
          {!qrCode && item.status === "processing" ? (
            <div
              className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted"
              role="status"
            >
              <LoaderCircle className="mt-0.5 shrink-0 animate-spin text-primary" size={18} />
              <span>
                Фото обрабатывается на сервере. Можно закрыть страницу — при следующем открытии готовый QR-код создастся
                автоматически.
              </span>
            </div>
          ) : null}
          {!qrCode && (completionBusy || (item.status === "ready" && !completionError)) ? (
            <div
              className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted"
              role="status"
            >
              <LoaderCircle className="mt-0.5 shrink-0 animate-spin text-primary" size={18} />
              <span>Обработка готова. Публикуем AR-фото и создаём QR-код автоматически…</span>
            </div>
          ) : null}
          {!qrCode && (item.status === "failed" || completionError) ? (
            <div
              className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-50 p-4 text-sm text-rose-800"
              role="alert"
            >
              <strong className="block">Автоматическая подготовка остановилась</strong>
              <span className="mt-1 block">
                {completionError || "Повторите обработку — загружать фото и видео заново не нужно."}
              </span>
              <Button className="mt-3" disabled={completionBusy} onClick={() => void retryBackgroundWork()}>
                <RefreshCw size={16} /> {item.status === "failed" ? "Повторить обработку" : "Повторить создание QR"}
              </Button>
            </div>
          ) : null}
        </section>
      </main>
      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6">
          <Toast
            title={notice}
            tone={notice.startsWith("Не удалось") ? "error" : "success"}
            onDismiss={() => setNotice(null)}
          />
        </div>
      ) : null}
    </AppShell>
  );
}

function ArItemCard({ item, marker, groupName }: { item: ArItem; marker?: MediaAsset; groupName?: string }) {
  const previewQuery = useAssetUrl(marker);
  return (
    <article className="ar-item-card">
      <Link to={`/items/${item.id}`} state={{ fromArItems: true }} aria-label={`Открыть AR-работу «${item.title}»`}>
        <div className="ar-item-card-preview">
          {previewQuery.data ? <img src={previewQuery.data} alt="" /> : <ImageIcon size={26} aria-hidden="true" />}
        </div>
        {groupName ? <span className="ar-item-card-group">{groupName}</span> : null}
        <div className="ar-item-card-copy">
          <h2>{item.title}</h2>
          <time dateTime={item.updated_at}>{formatArItemDate(item.updated_at)}</time>
        </div>
        <ChevronRight size={22} aria-hidden="true" />
      </Link>
    </article>
  );
}

function SignedMedia({ asset, kind, label }: { asset?: MediaAsset; kind: "image" | "video"; label: string }) {
  const urlQuery = useAssetUrl(asset);
  if (!asset) return <div className="ar-item-empty-preview">Файл не добавлен</div>;
  if (urlQuery.isPending) return <Skeleton className="ar-item-media-preview" />;
  if (!urlQuery.data) return <div className="ar-item-empty-preview">Файл недоступен</div>;
  if (kind === "video") {
    return (
      <video
        className="ar-item-media-preview"
        src={urlQuery.data}
        controls
        playsInline
        preload="metadata"
        aria-label={label}
      />
    );
  }
  return <img className="ar-item-media-preview" src={urlQuery.data} alt={label} />;
}

function useAssetUrl(asset?: MediaAsset) {
  return useQuery({
    queryKey: ["media-asset-url", asset?.id, asset?.storage_path],
    queryFn: () => mediaRepository.getAssetUrl(asset!),
    enabled: Boolean(asset),
    staleTime: 8 * 60_000,
  });
}

function ItemDetailLoading() {
  return (
    <AppShell title="AR-работа">
      <div className="ar-item-detail">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </AppShell>
  );
}

function formatArItemDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(value))
    .replace(" г.", "");
}

export function NewArItemRoute() {
  return <ArItemWizard />;
}

export function EditArItemRoute() {
  return <ArItemWizard />;
}

function ArItemWizard() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { itemId: routeItemId } = useParams();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(() => {
    const resumeStep = (location.state as { resumeStep?: unknown } | null)?.resumeStep;
    if (typeof resumeStep !== "number") return 1;
    if (resumeStep >= 7) return 4;
    if (resumeStep >= 3) return 3;
    return resumeStep === 2 ? 2 : 1;
  });
  const [currentItemId, setCurrentItemId] = useState(routeItemId ?? "");
  const [projectId, setProjectId] = useState(searchParams.get("projectId") ?? "");
  const [groupId, setGroupId] = useState(searchParams.get("groupId") ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [markerAssetId, setMarkerAssetId] = useState("");
  const [videoAssetId, setVideoAssetId] = useState("");
  const [settings, setSettings] = useState(defaultSettings);
  const [quality, setQuality] = useState<MarkerQualityResult | null>(null);
  const [uploadState, setUploadState] = useState<{ kind: "marker" | "video"; progress: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message?: string; tone: "error" | "success" } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const requestId = useRef(crypto.randomUUID());
  const uploadedFiles = useRef(new Map<string, File>());
  const initializedItemId = useRef("");
  const autoPublicationAttempt = useRef("");

  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const accountId = workspaceQuery.data?.accountId;
  const projectsQuery = useQuery({
    queryKey: ["catalog", "project-options", accountId],
    queryFn: () => catalogRepository.listProjectOptions(accountId!),
    enabled: Boolean(accountId),
  });
  const groupsQuery = useQuery({
    queryKey: ["catalog", "groups", accountId, projectId],
    queryFn: () => catalogRepository.listGroups(accountId!, projectId),
    enabled: Boolean(accountId && projectId),
  });
  const itemQuery = useQuery({
    queryKey: ["ar-item", accountId, currentItemId],
    queryFn: () => arItemRepository.getItem(accountId!, currentItemId),
    enabled: Boolean(accountId && currentItemId),
    refetchInterval: (query) => (step === 4 && query.state.data?.status === "processing" ? 3_000 : false),
  });
  const assetsQuery = useQuery({
    queryKey: ["media", "assets", accountId, projectId, groupId],
    queryFn: () => mediaRepository.listAssets(accountId!, projectId, groupId),
    enabled: Boolean(accountId && projectId && groupId),
  });
  const jobsQuery = useQuery({
    queryKey: ["ar-item", "jobs", accountId, currentItemId],
    queryFn: () => arItemRepository.listJobs(accountId!, currentItemId),
    enabled: Boolean(accountId && currentItemId && step === 4),
    refetchInterval: step === 4 && itemQuery.data?.status === "processing" ? 3_000 : false,
  });

  useEffect(() => {
    const item = itemQuery.data;
    if (!item || initializedItemId.current === item.id) return;
    initializedItemId.current = item.id;
    setProjectId(item.project_id);
    setGroupId(item.group_id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setMarkerAssetId(item.marker_asset_id ?? "");
    setVideoAssetId(item.video_asset_id ?? "");
    setSettings({
      autoplay: item.autoplay,
      loopVideo: item.loop_video,
      markerLostBehavior: item.marker_lost_behavior,
      audioDefault: item.audio_default as "muted" | "user_enabled",
      fallbackEnabled: item.fallback_enabled,
    });
    if (["processing", "ready", "published", "failed"].includes(item.status)) setStep(4);
  }, [itemQuery.data]);

  const assets = assetsQuery.data ?? [];
  const markers = assets.filter((asset) => asset.kind === "marker");
  const videos = assets.filter((asset) => asset.kind === "video");
  const selectedMarker = markers.find((asset) => asset.id === markerAssetId);
  const selectedVideo = videos.find((asset) => asset.id === videoAssetId);
  const currentItem = itemQuery.data;
  const latestJobs = useMemo(
    () => (jobsQuery.data ?? []).filter((job) => jobRevision(job) === currentItem?.version),
    [currentItem?.version, jobsQuery.data],
  );

  useEffect(() => {
    const item = itemQuery.data;
    if (!item?.video_asset_id || item.video_asset_id === videoAssetId) return;
    if (item.status !== "ready" && item.status !== "published") return;
    setVideoAssetId(item.video_asset_id);
    void queryClient.invalidateQueries({ queryKey: ["media", "assets", accountId, item.project_id, item.group_id] });
  }, [accountId, itemQuery.data, queryClient, videoAssetId]);

  const showError = (error: unknown) =>
    setNotice({ title: "Действие не выполнено", message: readableError(error), tone: "error" });

  const saveDescription = async () => {
    if (!accountId || !projectId || !groupId) return false;
    if (title.trim().length < 2 || title.trim().length > 160) {
      setNotice({ title: "Проверьте название", message: "Нужно от 2 до 160 символов", tone: "error" });
      return false;
    }
    setBusy(true);
    try {
      const saved = currentItemId
        ? await arItemRepository.updateDraft(accountId, currentItemId, title, description)
        : await arItemRepository.createDraft(accountId, {
            projectId,
            groupId,
            title,
            description,
            requestId: requestId.current,
          });
      if (!currentItemId) {
        setCurrentItemId(saved.id);
        navigate(`/items/${saved.id}/edit`, { replace: true, state: { resumeStep: 3 } });
      }
      await queryClient.invalidateQueries({ queryKey: ["ar-items"] });
      return true;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const uploadFile = async (file: File | undefined, kind: "marker" | "video") => {
    if (!file || !accountId || !projectId || !groupId) return;
    setUploadState({ kind, progress: 0 });
    try {
      const prepared = await prepareMediaFile(file, kind);
      const asset = await mediaRepository.upload(
        { accountId, projectId, groupId, kind, file: prepared.file, requestId: crypto.randomUUID() },
        prepared,
        ({ uploadedBytes, totalBytes }) =>
          setUploadState({ kind, progress: totalBytes ? Math.round((uploadedBytes / totalBytes) * 100) : 0 }),
        new AbortController().signal,
      );
      uploadedFiles.current.set(asset.id, prepared.file);
      if (kind === "marker") {
        setMarkerAssetId(asset.id);
        setQuality(null);
      } else setVideoAssetId(asset.id);
      await queryClient.invalidateQueries({ queryKey: ["media", "assets", accountId, projectId, groupId] });
      setNotice({
        title: kind === "marker" ? "Маркер загружен" : "Видео загружено",
        message:
          kind === "video" && prepared.kind === "video" && prepared.metadata.serverTranscodeRequired
            ? "Телефон передал исходник. Сервер автоматически подготовит H.264/AAC перед просмотром."
            : undefined,
        tone: "success",
      });
    } catch (error) {
      showError(error);
    } finally {
      setUploadState(null);
    }
  };

  const analyzeSelectedMarker = async () => {
    if (!selectedMarker) throw new Error("Добавьте фотографию-маркер");
    let file = uploadedFiles.current.get(selectedMarker.id);
    if (!file) {
      const url = await mediaRepository.getAssetUrl(selectedMarker);
      if (!url) throw new Error("Оригинал маркера недоступен. Загрузите файл повторно.");
      const response = await fetch(url);
      if (!response.ok) throw new Error("Не удалось скачать маркер для анализа");
      file = new File([await response.blob()], selectedMarker.original_file_name ?? "marker", {
        type: selectedMarker.mime_type,
      });
    }
    return analyzeMarkerFile(file);
  };

  const startProcessing = async () => {
    if (!accountId || !currentItemId || !markerAssetId || !videoAssetId) return;
    setBusy(true);
    try {
      const markerQuality = quality ?? (await analyzeSelectedMarker());
      setQuality(markerQuality);
      await arItemRepository.prepare(accountId, currentItemId, { ...settings, markerAssetId, videoAssetId });
      if (!markerQuality.suitable) {
        await arItemRepository.overrideMarkerQuality(
          accountId,
          currentItemId,
          "Пользователь выбрал автоматическую обработку фотографии",
        );
      }
      setStep(4);
      await Promise.all([itemQuery.refetch(), jobsQuery.refetch()]);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const publishCurrentItem = async () => {
    if (!accountId || !currentItemId) return;
    if (currentItem?.status === "published") {
      navigate(`/items/${currentItemId}/qr`);
      return;
    }
    setBusy(true);
    try {
      await arItemRepository.publish(accountId, currentItemId, resolvePublicBaseUrl());
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ar-item", accountId, currentItemId] }),
        queryClient.invalidateQueries({ queryKey: ["ar-item", "qr", accountId, currentItemId] }),
        queryClient.invalidateQueries({ queryKey: ["ar-items"] }),
      ]);
      navigate(`/items/${currentItemId}/qr`);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!accountId || !currentItemId || currentItem?.status !== "ready") return;
    const attemptKey = `${currentItem.id}:${currentItem.version}`;
    if (autoPublicationAttempt.current === attemptKey) return;
    autoPublicationAttempt.current = attemptKey;
    setBusy(true);
    void arItemRepository
      .publish(accountId, currentItemId, resolvePublicBaseUrl())
      .then(async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["ar-item", accountId, currentItemId] }),
          queryClient.invalidateQueries({ queryKey: ["ar-item", "qr", accountId, currentItemId] }),
          queryClient.invalidateQueries({ queryKey: ["ar-items"] }),
        ]);
        navigate(`/items/${currentItemId}/qr`);
      })
      .catch((error: unknown) =>
        setNotice({ title: "QR не создался автоматически", message: readableError(error), tone: "error" }),
      )
      .finally(() => setBusy(false));
  }, [accountId, currentItem, currentItemId, navigate, queryClient]);

  const next = async () => {
    if (step === 1) {
      if (!projectId || !groupId) {
        setNotice({ title: "Выберите проект и группу", tone: "error" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (await saveDescription()) setStep(3);
    } else if (step === 3) {
      if (!markerAssetId) setNotice({ title: "Добавьте фотографию", tone: "error" });
      else if (!videoAssetId) setNotice({ title: "Добавьте видео", tone: "error" });
      else await startProcessing();
    }
  };

  if (workspaceQuery.isPending || projectsQuery.isPending || (routeItemId && itemQuery.isPending)) {
    return <ItemsLoading />;
  }
  if (workspaceQuery.error || projectsQuery.error || itemQuery.error) {
    return (
      <AppShell title="Мастер AR-работы">
        <div className="mt-6">
          <ErrorState text={readableError(workspaceQuery.error ?? projectsQuery.error ?? itemQuery.error)} />
        </div>
      </AppShell>
    );
  }

  const canGoBack = step > 1 && step < 4;
  const nextLabel = step === 3 ? "Обработать и продолжить" : "Продолжить";

  return (
    <AppShell
      eyebrow="AR Item Workflow"
      title={currentItem?.title || "Новая AR-работа"}
      description="Четыре шага: выберите проект, добавьте данные, загрузите фото и видео, затем опубликуйте."
      actions={
        <Link className="btn btn-quiet" to="/items">
          <ArrowLeft size={17} /> AR-работы
        </Link>
      }
    >
      <WizardProgress current={step} />
      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_340px]">
        <Panel>
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Шаг {step} из 4</p>
              <h2 className="mt-2 text-2xl font-semibold">{wizardSteps[step - 1]}</h2>
            </div>
            {currentItem ? <ItemStatus status={currentItem.status} /> : null}
          </div>

          {step === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Проект"
                options={[
                  { label: "Выберите проект", value: "" },
                  ...(projectsQuery.data ?? []).map((project) => ({ label: project.name, value: project.id })),
                ]}
                value={projectId}
                disabled={Boolean(currentItemId)}
                onChange={(event) => {
                  setProjectId(event.target.value);
                  setGroupId("");
                }}
              />
              <Select
                label="Группа"
                options={[
                  { label: "Выберите группу", value: "" },
                  ...(groupsQuery.data ?? []).map((group) => ({ label: group.name, value: group.id })),
                ]}
                value={groupId}
                disabled={!projectId || Boolean(currentItemId)}
                onChange={(event) => setGroupId(event.target.value)}
              />
              {!projectsQuery.data?.length ? (
                <p className="sm:col-span-2 rounded-xl border border-line bg-white/[0.025] p-4 text-sm text-muted">
                  Сначала создайте проект и группу в разделе «Проекты».
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-5">
              <Field label="Название">
                <Input placeholder="Например, Портрет Алексея" value={title} onValueChange={setTitle} maxLength={160} />
              </Field>
              <Field label="Описание">
                <textarea
                  className="field-control min-h-28 resize-y"
                  maxLength={2000}
                  placeholder="Что происходит в видео и для кого эта работа"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-8">
              <section>
                <h3 className="mb-3 text-lg font-semibold">Фотография</h3>
                <MediaStep
                  kind="marker"
                  assets={markers}
                  selectedId={markerAssetId}
                  uploadState={uploadState}
                  onSelect={(id) => {
                    setMarkerAssetId(id);
                    setQuality(null);
                  }}
                  onUpload={(file) => void uploadFile(file, "marker")}
                />
              </section>
              <section className="border-t border-line pt-7">
                <h3 className="mb-3 text-lg font-semibold">Видео</h3>
                <MediaStep
                  kind="video"
                  assets={videos}
                  selectedId={videoAssetId}
                  uploadState={uploadState}
                  onSelect={setVideoAssetId}
                  onUpload={(file) => void uploadFile(file, "video")}
                />
              </section>
              <section className="border-t border-line pt-7">
                <h3 className="mb-3 text-lg font-semibold">Поведение ожившего фото</h3>
                <SettingsStep settings={settings} onChange={setSettings} />
              </section>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-6">
              <ProcessingStep
                item={currentItem}
                jobs={latestJobs}
                overrideReason={overrideReason}
                onOverrideReason={setOverrideReason}
                onOverride={async () => {
                  if (!accountId || !currentItemId) return;
                  setBusy(true);
                  try {
                    await arItemRepository.overrideMarkerQuality(accountId, currentItemId, overrideReason);
                    await itemQuery.refetch();
                  } catch (error) {
                    showError(error);
                  } finally {
                    setBusy(false);
                  }
                }}
                onRetry={async () => {
                  if (!accountId || !currentItemId) return;
                  setBusy(true);
                  try {
                    await arItemRepository.retry(accountId, currentItemId);
                    await Promise.all([itemQuery.refetch(), jobsQuery.refetch()]);
                  } catch (error) {
                    showError(error);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              {currentItem?.status === "ready" || currentItem?.status === "published" ? (
                <PublicationStep
                  busy={busy}
                  published={currentItem.status === "published"}
                  onPublish={publishCurrentItem}
                />
              ) : null}
            </div>
          ) : null}

          {step < 4 ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button variant="quiet" disabled={!canGoBack || busy} onClick={() => setStep((current) => current - 1)}>
                <ArrowLeft size={16} /> Назад
              </Button>
              <Button disabled={busy || Boolean(uploadState)} onClick={() => void next()}>
                {busy ? <LoaderCircle className="animate-spin" size={16} /> : null}
                {nextLabel} <ArrowRight size={16} />
              </Button>
            </div>
          ) : null}
        </Panel>

        <WizardSummary
          projectName={projectsQuery.data?.find((project) => project.id === projectId)?.name}
          groupName={groupsQuery.data?.find((group) => group.id === groupId)?.name}
          marker={selectedMarker}
          video={selectedVideo}
          quality={quality}
          settings={settings}
        />
      </div>
      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6">
          <Toast {...notice} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}
    </AppShell>
  );
}

function WizardProgress({ current }: { current: number }) {
  return (
    <ol className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Шаги создания AR-работы">
      {wizardSteps.map((label, index) => {
        const number = index + 1;
        const complete = number < current;
        return (
          <li
            key={label}
            aria-current={number === current ? "step" : undefined}
            className={`rounded-xl border px-3 py-3 text-xs ${number === current ? "border-primary bg-primary/10 text-ink" : "border-line text-muted"}`}
          >
            <span
              className={`mb-2 grid h-6 w-6 place-items-center rounded-full ${complete ? "bg-emerald-400 text-black" : "bg-white/5"}`}
            >
              {complete ? <Check size={14} /> : number}
            </span>
            <span className="font-semibold">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function MediaStep({
  kind,
  assets,
  selectedId,
  uploadState,
  onSelect,
  onUpload,
}: {
  kind: "marker" | "video";
  assets: MediaAsset[];
  selectedId: string;
  uploadState: { kind: "marker" | "video"; progress: number } | null;
  onSelect: (id: string) => void;
  onUpload: (file?: File) => void;
}) {
  const marker = kind === "marker";
  return (
    <div>
      <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
        <span className="metric-icon mx-auto">{marker ? <ImageIcon size={22} /> : <FileVideo2 size={22} />}</span>
        <h3 className="mt-3 font-semibold">
          {marker ? "Фото любого расширения до 25 МБ" : "Видео любого расширения до 500 МБ"}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {marker
            ? "Фото будет безопасно декодировано и подготовлено как AR-маркер."
            : "Видео автоматически преобразуется в формат, совместимый с телефонами."}
        </p>
        <label className="btn btn-ghost mt-4 cursor-pointer">
          <Upload size={16} /> {uploadState?.kind === kind ? `Загрузка ${uploadState.progress}%` : "Выбрать файл"}
          <input
            className="hidden"
            type="file"
            accept={marker ? markerAccept : videoAccept}
            disabled={Boolean(uploadState)}
            onChange={(event) => onUpload(event.currentTarget.files?.[0])}
          />
        </label>
      </div>
      <div className="mt-5 grid gap-3">
        {assets.map((asset) => (
          <label
            key={asset.id}
            className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 ${asset.id === selectedId ? "border-primary bg-primary/10" : "border-line bg-white/[0.02]"}`}
          >
            <input
              type="radio"
              name={`${kind}-asset`}
              checked={asset.id === selectedId}
              onChange={() => onSelect(asset.id)}
            />
            <span className="metric-icon">{marker ? <ImageIcon size={18} /> : <Play size={18} />}</span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm">
                {asset.original_file_name ?? `${kind} v${asset.version}`}
              </strong>
              <span className="mt-1 block text-xs text-muted">{assetMeta(asset)}</span>
            </span>
            <span className="text-xs font-semibold text-primary">v{asset.version}</span>
          </label>
        ))}
        {!assets.length ? (
          <p className="rounded-xl border border-line p-4 text-sm text-muted">
            Подходящих файлов в этой группе пока нет.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SettingsStep({ settings, onChange }: { settings: ArItemSettings; onChange: (next: ArItemSettings) => void }) {
  const toggle = (key: "autoplay" | "loopVideo" | "fallbackEnabled") =>
    onChange({ ...settings, [key]: !settings[key] });
  return (
    <div className="grid gap-4">
      <ToggleRow
        label="Автозапуск после распознавания"
        checked={settings.autoplay}
        onChange={() => toggle("autoplay")}
      />
      <ToggleRow label="Повторять видео по кругу" checked={settings.loopVideo} onChange={() => toggle("loopVideo")} />
      <ToggleRow
        label="Разрешить обычный просмотр без AR"
        checked={settings.fallbackEnabled}
        onChange={() => toggle("fallbackEnabled")}
      />
      <Select
        label="При потере маркера"
        value={settings.markerLostBehavior}
        onChange={(event) =>
          onChange({ ...settings, markerLostBehavior: event.target.value as ArItemSettings["markerLostBehavior"] })
        }
        options={[
          { value: "pause_hide", label: "Пауза и скрыть видео" },
          { value: "continue_audio_hide", label: "Скрыть, звук продолжить" },
          { value: "stop_reset", label: "Остановить и начать сначала" },
        ]}
      />
      <Select
        label="Звук по умолчанию"
        value={settings.audioDefault}
        onChange={(event) => onChange({ ...settings, audioDefault: event.target.value as "muted" | "user_enabled" })}
        options={[
          { value: "muted", label: "Выключен — совместимо с autoplay" },
          { value: "user_enabled", label: "Включён после действия пользователя" },
        ]}
      />
      <div className="rounded-xl border border-line bg-white/[0.025] p-4 text-sm leading-6 text-muted">
        Перед запуском будут созданы задания анализа маркера, проверки кодеков, компиляции `.mind` и WebP-превью. Если
        телефону недоступно преобразование, сервер дополнительно подготовит H.264/AAC.
      </div>
    </div>
  );
}

function ProcessingStep({
  item,
  jobs,
  overrideReason,
  onOverrideReason,
  onOverride,
  onRetry,
}: {
  item: ArItem | undefined;
  jobs: ProcessingJob[];
  overrideReason: string;
  onOverrideReason: (value: string) => void;
  onOverride: () => void;
  onRetry: () => void;
}) {
  return (
    <div>
      {item?.status === "processing" ? (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-muted">
          Обработка выполняется автоматически и обычно занимает несколько минут. Эту страницу можно оставить открытой —
          статусы обновятся сами.
        </div>
      ) : null}
      <div className="grid gap-3">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-line bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <strong>{jobLabels[job.type] ?? job.type}</strong>
              <span
                className={
                  job.status === "failed"
                    ? "text-red-300"
                    : job.status === "succeeded"
                      ? "text-emerald-300"
                      : "text-primary"
                }
              >
                {jobStatusLabel(job.status)}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${job.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
      {!jobs.length ? <p className="text-sm text-muted">Ожидаем постановки заданий в очередь…</p> : null}
      {item?.status === "ready" ? (
        <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
          <CheckCircle2 className="text-emerald-300" />
          <h3 className="mt-3 text-xl font-semibold">Все артефакты готовы</h3>
          <p className="mt-2 text-sm text-muted">
            Фото и видео готовы. Публикуем работу и создаём QR-код автоматически.
          </p>
        </div>
      ) : null}
      {item?.status === "failed" ? (
        <Button className="mt-5" variant="ghost" onClick={onRetry} icon={<RefreshCw size={16} />}>
          Повторить обработку
        </Button>
      ) : null}
      {item && "tracking_status" in item && item.tracking_status === "unsuitable" ? (
        <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5">
          <h3 className="font-semibold">Маркер не прошёл серверный порог</h3>
          <Field label="Причина ручного подтверждения">
            <Input value={overrideReason} onValueChange={onOverrideReason} placeholder="Не менее 10 символов" />
          </Field>
          <Button className="mt-4" variant="ghost" disabled={overrideReason.trim().length < 10} onClick={onOverride}>
            Подтвердить риск
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function PublicationStep({ busy, published, onPublish }: { busy: boolean; published: boolean; onPublish: () => void }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-8 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
        <CheckCircle2 size={34} />
      </span>
      <h3 className="mt-5 text-2xl font-semibold">
        {published ? "AR-работа опубликована" : busy ? "Создаём QR-код автоматически" : "Готово к публикации"}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
        {published
          ? "Откройте готовый QR-код, чтобы скачать, распечатать или проверить ожившее фото."
          : busy
            ? "Ничего нажимать не нужно — после публикации готовый QR откроется сам."
            : "Автоматическая публикация не завершилась. Можно безопасно повторить: файлы уже загружены."}
      </p>
      <Button className="mt-5" disabled={busy} onClick={onPublish}>
        {busy ? <LoaderCircle className="animate-spin" size={16} /> : <ScanLine size={16} />}
        {published ? "Открыть QR" : "Повторить создание QR"}
      </Button>
    </div>
  );
}

function WizardSummary({
  projectName,
  groupName,
  marker,
  video,
  quality,
  settings,
}: {
  projectName?: string;
  groupName?: string;
  marker?: MediaAsset;
  video?: MediaAsset;
  quality: MarkerQualityResult | null;
  settings: ArItemSettings;
}) {
  return (
    <Panel className="h-fit xl:sticky xl:top-6">
      <h2 className="text-lg font-semibold">Сводка</h2>
      <dl className="mt-5 grid gap-4 text-sm">
        <SummaryLine label="Проект" value={projectName ?? "Не выбран"} />
        <SummaryLine label="Группа" value={groupName ?? "Не выбрана"} />
        <SummaryLine label="Маркер" value={marker?.original_file_name ?? "Не выбран"} />
        <SummaryLine label="Качество" value={quality ? `${quality.score}/100` : "Не проверено"} />
        <SummaryLine label="Видео" value={video?.original_file_name ?? "Не выбрано"} />
        <SummaryLine label="Потеря маркера" value={lostBehaviorLabel(settings.markerLostBehavior)} />
        <SummaryLine label="Fallback" value={settings.fallbackEnabled ? "Включён" : "Выключен"} />
      </dl>
    </Panel>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line p-4 text-sm font-semibold">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line pb-3 last:border-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 break-words font-semibold">{value}</dd>
    </div>
  );
}

function ItemStatus({ status }: { status: keyof typeof statusLabels }) {
  const ready = status === "ready" || status === "published";
  const failed = status === "failed";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${ready ? "bg-emerald-400/15 text-emerald-300" : failed ? "bg-red-400/15 text-red-300" : "bg-primary/15 text-primary"}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function ItemsLoading() {
  return (
    <AppShell title="AR-работы" description="Загружаем workflow">
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Panel key={item}>
            <Skeleton className="h-36" />
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}

function assetMeta(asset: MediaAsset) {
  const metadata =
    typeof asset.metadata === "object" && asset.metadata && !Array.isArray(asset.metadata) ? asset.metadata : {};
  const width = Number(metadata.width);
  const height = Number(metadata.height);
  const duration = Number(metadata.durationSeconds);
  const size = `${(asset.size_bytes / 1024 / 1024).toFixed(1)} МБ`;
  return Number.isFinite(duration)
    ? `${duration.toFixed(1)} сек · ${size}`
    : Number.isFinite(width) && Number.isFinite(height)
      ? `${width}×${height} · ${size}`
      : size;
}

function jobRevision(job: ProcessingJob) {
  if (typeof job.input_metadata !== "object" || !job.input_metadata || Array.isArray(job.input_metadata)) return 0;
  return Number(job.input_metadata.revision);
}

function jobStatusLabel(status: ProcessingJob["status"]) {
  return { queued: "В очереди", running: "Выполняется", succeeded: "Готово", failed: "Ошибка", cancelled: "Отменено" }[
    status
  ];
}

function lostBehaviorLabel(value: ArItemSettings["markerLostBehavior"]) {
  return { pause_hide: "Пауза и скрытие", continue_audio_hide: "Продолжить звук", stop_reset: "Стоп и сброс" }[value];
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
