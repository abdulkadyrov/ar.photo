import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Eye,
  List,
  Grid2X2,
  Search,
  CircleAlert,
  FileImage,
  Film,
  LoaderCircle,
  Pause,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import "./MediaUploadPage.css";
import type { MediaAsset, PreparedMedia } from "../../entities/media/model";
import { AppShell } from "../../app/layout/AppShell";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { Button, ErrorState, FileDropzone, Input, Modal, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { getMediaRepository, MediaRepositoryError } from "./mediaRepository";
import { classifyMediaFile, mediaAccept, prepareUnclassifiedMediaFile } from "./mediaValidation";
import {
  listPreparedUploads,
  persistPreparedUpload,
  removePreparedUpload,
  type PreparedUploadQueueItem,
} from "./uploadQueueDb";

type QueueStatus = "validating" | "ready" | "uploading" | "failed" | "cancelled" | "completed";
type QueueItem = {
  id: string;
  requestId: string;
  ownerId: string;
  accountId: string;
  projectId: string;
  groupId: string;
  createdAt: number;
  sourceFile: File;
  prepared?: PreparedMedia;
  previewUrl?: string;
  status: QueueStatus;
  progress: number;
  persistence: "saving" | "saved" | "memory-only";
  persistenceError?: string;
  error?: string;
  asset?: MediaAsset;
};

const catalogRepository = getCatalogRepository();
const mediaRepository = getMediaRepository();

export function MediaUploadRoute() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const libraryProjectId = params.get("projectId") ?? "";
  const search = params.get("q") ?? "";
  const fileKind = params.get("type") ?? "";
  const status = params.get("status") ?? "";
  const sort = params.get("sort") ?? "newest";
  const layout = params.get("layout") ?? "list";
  const [uploadOpen, setUploadOpen] = useState(false);
  const setFilter = (name: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true, state: location.state });
  };
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [notice, setNotice] = useState<{ title: string; message?: string; tone: "success" | "error" }>();
  const queueRef = useRef(queue);
  const controllers = useRef(new Map<string, AbortController>());
  const restoredOwnerRef = useRef<string | undefined>(undefined);

  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const accountId = workspaceQuery.data?.accountId;
  const projectsQuery = useQuery({
    queryKey: ["catalog", "media-project-options", accountId],
    queryFn: () => catalogRepository.listProjectOptions(accountId!),
    enabled: Boolean(accountId),
  });
  const projectId = (projectsQuery.data ?? []).some((project) => project.id === selectedProjectId)
    ? selectedProjectId
    : (projectsQuery.data?.[0]?.id ?? "");
  const groupsQuery = useQuery({
    queryKey: ["catalog", "media-group-options", accountId, projectId],
    queryFn: () => catalogRepository.listGroups(accountId!, projectId),
    enabled: Boolean(accountId && projectId),
  });
  const groupId = (groupsQuery.data ?? []).some((group) => group.id === selectedGroupId)
    ? selectedGroupId
    : (groupsQuery.data?.[0]?.id ?? "");
  const assetsQuery = useQuery({
    queryKey: ["media", "assets", accountId, libraryProjectId || "all"],
    queryFn: () => mediaRepository.listAssets(accountId!, libraryProjectId || undefined),
    enabled: Boolean(accountId),
  });

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(
    () => () => {
      controllers.current.forEach((controller) => controller.abort());
      queueRef.current.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    },
    [],
  );

  useEffect(() => {
    const ownerId = auth.session!.user.id;
    if (!accountId || restoredOwnerRef.current === ownerId) return;
    restoredOwnerRef.current = ownerId;
    let active = true;
    void listPreparedUploads(ownerId)
      .then((items) => {
        if (!active) return;
        const restored = items
          .filter((item) => item.accountId === accountId)
          .map<QueueItem>((item) => ({
            id: item.id,
            requestId: item.requestId,
            ownerId: item.ownerId,
            accountId: item.accountId,
            projectId: item.projectId,
            groupId: item.groupId,
            createdAt: item.createdAt,
            sourceFile: item.prepared.file,
            prepared: item.prepared,
            previewUrl: URL.createObjectURL(item.prepared.file),
            status: "ready",
            progress: 0,
            persistence: "saved",
          }));
        setQueue((current) => {
          const knownIds = new Set(current.map((item) => item.id));
          const additions = restored.filter((item) => !knownIds.has(item.id));
          queueRef.current = [...current, ...additions];
          return queueRef.current;
        });
        if (restored.length) {
          setNotice({
            title: "Локальная очередь восстановлена",
            message: `${restored.length} ${pluralFiles(restored.length)} готовы к продолжению`,
            tone: "success",
          });
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setNotice({ title: "IndexedDB недоступен", message: readableError(error), tone: "error" });
      });
    return () => {
      active = false;
    };
  }, [accountId, auth.session]);

  const addFiles = (files: File[]) => {
    const ownerId = auth.session!.user.id;
    if (!accountId || !projectId || !groupId) return;
    const additions = files.map<QueueItem>((file, index) => ({
      id: crypto.randomUUID(),
      requestId: crypto.randomUUID(),
      ownerId,
      accountId,
      projectId,
      groupId,
      createdAt: Date.now() + index,
      sourceFile: file,
      status: "validating",
      progress: 0,
      persistence: "saving",
    }));
    setQueue((current) => {
      queueRef.current = [...current, ...additions];
      return queueRef.current;
    });
    additions.forEach((item) => void validateItem(item));
  };

  const validateItem = async (item: QueueItem) => {
    try {
      const prepared = await prepareUnclassifiedMediaFile(item.sourceFile, {
        onProgress: (progress) => patchQueue(item.id, { progress: Math.round(progress * 100) }),
      });
      const previewUrl = URL.createObjectURL(prepared.file);
      if (!queueRef.current.some((candidate) => candidate.id === item.id)) {
        URL.revokeObjectURL(previewUrl);
        return;
      }
      const preparedItem = { ...item, prepared };
      let persistence: QueueItem["persistence"] = "saved";
      let persistenceError: string | undefined;
      try {
        await persistPreparedUpload(toPersistedItem(preparedItem));
      } catch (error) {
        persistence = "memory-only";
        persistenceError = readableError(error);
      }
      patchQueue(item.id, {
        prepared,
        previewUrl,
        status: "ready",
        progress: 0,
        persistence,
        persistenceError,
        error: undefined,
      });
    } catch (error) {
      patchQueue(item.id, { status: "failed", persistence: "memory-only", error: readableError(error) });
    }
  };

  const uploadItem = async (item: QueueItem) => {
    const workspace = workspaceQuery.data;
    if (!workspace || !item.prepared) return;
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    patchQueue(item.id, { status: "uploading", progress: 0, error: undefined });
    try {
      const asset = await mediaRepository.upload(
        {
          accountId: item.accountId,
          projectId: item.projectId,
          groupId: item.groupId,
          kind: item.prepared.kind,
          file: item.prepared.file,
          requestId: item.requestId,
        },
        item.prepared,
        ({ uploadedBytes, totalBytes }) =>
          patchQueue(item.id, { progress: totalBytes ? Math.round((uploadedBytes / totalBytes) * 100) : 0 }),
        controller.signal,
      );
      patchQueue(item.id, { status: "completed", progress: 100, asset });
      await removePreparedUpload(item.id).catch(() => undefined);
      await queryClient.invalidateQueries({ queryKey: ["media", "assets"] });
      const needsServerTranscode =
        item.prepared.kind === "video" && item.prepared.metadata.serverTranscodeRequired === true;
      setNotice({
        title: "Файл загружен",
        message: needsServerTranscode
          ? "Видео принято. Совместимая версия H.264/AAC будет подготовлена сервером при создании AR-работы."
          : item.prepared.file.name,
        tone: "success",
      });
    } catch (error) {
      const cancelled =
        (error instanceof MediaRepositoryError && error.code === "cancelled") ||
        (error instanceof DOMException && error.name === "AbortError");
      patchQueue(item.id, {
        status: cancelled ? "cancelled" : "failed",
        error: readableError(error),
      });
    } finally {
      controllers.current.delete(item.id);
    }
  };

  const uploadReady = async () => {
    const candidates = queueRef.current.filter((item) => item.status === "ready" || item.status === "failed");
    for (const item of candidates) {
      if (!item.prepared) continue;
      await uploadItem(item);
    }
  };

  const retryItem = (item: QueueItem) => {
    if (!item.prepared) {
      patchQueue(item.id, { status: "validating", error: undefined });
      void validateItem(item);
      return;
    }
    const next = item.status === "cancelled" ? { ...item, requestId: crypto.randomUUID() } : item;
    if (next !== item) {
      patchQueue(item.id, { requestId: next.requestId });
      if (next.prepared && next.persistence === "saved") {
        void persistPreparedUpload(toPersistedItem({ ...next, prepared: next.prepared })).catch(() =>
          patchQueue(item.id, {
            persistence: "memory-only",
            persistenceError: "Не удалось обновить локальную очередь",
          }),
        );
      }
    }
    void uploadItem(next);
  };

  const removeItem = (item: QueueItem) => {
    controllers.current.get(item.id)?.abort();
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setQueue((current) => {
      queueRef.current = current.filter((candidate) => candidate.id !== item.id);
      return queueRef.current;
    });
    void removePreparedUpload(item.id).catch(() => undefined);
  };

  if (workspaceQuery.isPending) return <MediaLoading />;
  if (workspaceQuery.error) {
    return (
      <AppShell title="Медиа" description="Защищённая загрузка фото и видео">
        <div className="mt-6">
          <ErrorState text={readableError(workspaceQuery.error)} />
        </div>
      </AppShell>
    );
  }

  const workspace = workspaceQuery.data;
  const readyCount = queue.filter(
    (item) => item.status === "ready" || (item.status === "failed" && Boolean(item.prepared)),
  ).length;
  const uploadDisabled = !workspace.canWrite || !projectId || !groupId;

  const visibleAssets = (assetsQuery.data ?? [])
    .filter(
      (asset) =>
        (!fileKind || (fileKind === "video" ? asset.kind === "video" : asset.kind !== "video")) &&
        (!status || status === "ready") &&
        (asset.original_file_name ?? "").toLocaleLowerCase("ru-RU").includes(search.trim().toLocaleLowerCase("ru-RU")),
    )
    .sort((left, right) => (sort === "oldest" ? 1 : -1) * left.created_at.localeCompare(right.created_at));
  const visibleQueue = queue.filter(
    (item) =>
      (!libraryProjectId || item.projectId === libraryProjectId) &&
      (!status ||
        (status === "failed"
          ? item.status === "failed"
          : status === "uploading"
            ? item.status === "uploading" || item.status === "validating"
            : item.status === "completed")),
  );
  return (
    <AppShell
      title="Медиа и загрузки"
      description="Моя медиатека: фото и видео для проектов AR-фото"
      showDescriptionOnMobile
      actions={
        <Button
          disabled={!workspace.canWrite}
          icon={<UploadCloud size={17} />}
          onClick={() => setUploadOpen((open) => !open)}
        >
          Загрузить файлы
        </Button>
      }
    >
      <div className="media-library">
        {uploadOpen ? (
          <Panel className="media-upload-panel">
            <h2>Загрузить фото и видео</h2>
            <div className="media-upload-destination">
              <Select
                label="Проект загрузки"
                value={projectId}
                disabled={projectsQuery.isPending || !projectsQuery.data?.length}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setSelectedGroupId("");
                }}
                options={(projectsQuery.data ?? []).map((project) => ({ label: project.name, value: project.id }))}
              />
              <Select
                label="Группа загрузки"
                value={groupId}
                disabled={groupsQuery.isPending || !groupsQuery.data?.length}
                onChange={(event) => setSelectedGroupId(event.target.value)}
                options={(groupsQuery.data ?? []).map((group) => ({ label: group.name, value: group.id }))}
              />
            </div>
            {!projectId || !groupId ? (
              <p className="text-sm text-muted">Сначала создайте проект и группу в разделе «Проекты».</p>
            ) : null}
            <FileDropzone
              accept={mediaAccept}
              disabled={uploadDisabled}
              hint="Фото и видео будут автоматически подготовлены перед загрузкой."
              onPick={addFiles}
            />
            {readyCount ? (
              <Button disabled={uploadDisabled} icon={<UploadCloud size={17} />} onClick={() => void uploadReady()}>
                Загрузить готовые · {readyCount}
              </Button>
            ) : null}
            <p className="media-upload-help">
              Загрузку можно продолжить после перезагрузки страницы.
              {auth.mode === "demo" ? " Демо: файлы сохраняются только в этом браузере." : ""}
            </p>
          </Panel>
        ) : null}
        <Panel className="media-library-filters">
          <Select
            label="Проект"
            value={libraryProjectId}
            onChange={(event) => setFilter("projectId", event.target.value)}
            options={[
              { label: "Все проекты", value: "" },
              ...(projectsQuery.data ?? []).map((project) => ({ label: project.name, value: project.id })),
            ]}
          />
          <Select
            label="Тип файла"
            value={fileKind}
            onChange={(event) => setFilter("type", event.target.value)}
            options={[
              { label: "Все файлы", value: "" },
              { label: "Фото", value: "image" },
              { label: "Видео", value: "video" },
            ]}
          />
          <Select
            label="Статус"
            value={status}
            onChange={(event) => setFilter("status", event.target.value)}
            options={[
              { label: "Все статусы", value: "" },
              { label: "Готово", value: "ready" },
              { label: "Загружается", value: "uploading" },
              { label: "Ошибка загрузки", value: "failed" },
            ]}
          />
          <label className="media-library-search">
            <span className="sr-only">Поиск по названию</span>
            <Search size={17} />
            <Input
              value={search}
              onValueChange={(value) => setFilter("q", value)}
              placeholder="Поиск по названию файла…"
            />
          </label>
        </Panel>
        <div className="media-library-heading">
          <h2>Файлы ({visibleAssets.length})</h2>
          <div>
            <Select
              label="Порядок файлов"
              aria-label="Порядок файлов"
              value={sort}
              onChange={(event) => setFilter("sort", event.target.value)}
              options={[
                { label: "Сначала новые", value: "newest" },
                { label: "Сначала старые", value: "oldest" },
              ]}
            />
            <button
              type="button"
              aria-label="Список файлов"
              aria-pressed={layout !== "grid"}
              onClick={() => setFilter("layout", "list")}
            >
              <List size={18} />
            </button>
            <button
              type="button"
              aria-label="Сетка файлов"
              aria-pressed={layout === "grid"}
              onClick={() => setFilter("layout", "grid")}
            >
              <Grid2X2 size={18} />
            </button>
          </div>
        </div>
        {visibleQueue.length ? (
          <div className="media-queue-list" aria-label="Очередь загрузки">
            {visibleQueue.map((item) => (
              <UploadQueueCard
                key={item.id}
                item={item}
                onCancel={() => controllers.current.get(item.id)?.abort()}
                onRemove={() => removeItem(item)}
                onRetry={() => retryItem(item)}
                onUpload={() => void uploadItem(item)}
              />
            ))}
          </div>
        ) : null}
        {assetsQuery.isPending ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : assetsQuery.error ? (
          <ErrorState
            text={readableError(assetsQuery.error)}
            action={<Button onClick={() => void assetsQuery.refetch()}>Повторить</Button>}
          />
        ) : visibleAssets.length ? (
          <section
            className={`media-library-files ${layout === "grid" ? "media-library-grid" : ""}`}
            aria-label="Загруженные файлы"
          >
            <div className="media-library-table-head" aria-hidden="true">
              <span>Файл</span>
              <span>Проект</span>
              <span>Размер</span>
              <span>Статус</span>
              <span>Действие</span>
            </div>
            {visibleAssets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                projectName={projectsQuery.data?.find((project) => project.id === asset.project_id)?.name}
              />
            ))}
          </section>
        ) : (
          <Panel className="media-library-empty">
            <FileImage size={30} />
            <h2>{(assetsQuery.data?.length ?? 0) ? "Файлы не найдены" : "В медиатеке пока нет файлов"}</h2>
            <p>
              {(assetsQuery.data?.length ?? 0)
                ? "Измените поиск или фильтры."
                : "Добавьте фото и видео для своих AR-работ."}
            </p>
          </Panel>
        )}
      </div>

      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6">
          <Toast {...notice} onDismiss={() => setNotice(undefined)} />
        </div>
      ) : null}
    </AppShell>
  );

  function patchQueue(id: string, patch: Partial<QueueItem>) {
    setQueue((current) => {
      queueRef.current = current.map((item) => (item.id === id ? { ...item, ...patch } : item));
      return queueRef.current;
    });
  }
}

function UploadQueueCard({
  item,
  onUpload,
  onCancel,
  onRetry,
  onRemove,
}: {
  item: QueueItem;
  onUpload: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const isVideo = item.prepared?.kind === "video" || classifyMediaFile(item.sourceFile) === "video";
  return (
    <article className="rounded-2xl border border-line bg-white/[0.025] p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 text-primary">
          {item.previewUrl && !isVideo ? (
            <img alt="" className="h-full w-full object-cover" src={item.previewUrl} />
          ) : isVideo ? (
            <Film size={22} />
          ) : (
            <FileImage size={22} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold" title={item.sourceFile.name}>
                {item.sourceFile.name}
              </p>
              <p className="mt-1 text-xs text-muted">
                {item.prepared && item.prepared.file.size !== item.sourceFile.size
                  ? `${formatBytes(item.sourceFile.size)} → ${formatBytes(item.prepared.file.size)}`
                  : formatBytes(item.prepared?.file.size ?? item.sourceFile.size)}{" "}
                · {queueStatusLabel[item.status]}
              </p>
            </div>
            <StatusIcon status={item.status} />
          </div>
          {item.prepared ? <MetadataLine prepared={item.prepared} /> : null}
          {item.persistence === "saved" && item.status !== "completed" ? (
            <p className="mt-1 text-[11px] text-emerald-300">Сохранено локально · очередь переживёт перезагрузку</p>
          ) : null}
          {item.persistenceError ? (
            <p className="mt-1 text-[11px] leading-5 text-amber-200">
              Только в памяти до закрытия вкладки: {item.persistenceError}
            </p>
          ) : null}
          {item.status === "uploading" || (item.status === "validating" && item.progress > 0) ? (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
              </div>
              <p className="mt-1 text-right text-[11px] text-muted">
                {item.status === "validating" ? "Локальная оптимизация · " : ""}
                {item.progress}%
              </p>
            </div>
          ) : null}
          {item.error ? <p className="mt-2 text-xs leading-5 text-rose-300">{item.error}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {item.status === "ready" ? (
              <Button className="min-h-8 px-3 py-1.5 text-xs" onClick={onUpload}>
                Загрузить
              </Button>
            ) : null}
            {item.status === "uploading" ? (
              <Button
                className="min-h-8 px-3 py-1.5 text-xs"
                icon={<Pause size={14} />}
                variant="quiet"
                onClick={onCancel}
              >
                Отменить
              </Button>
            ) : null}
            {item.status === "failed" || item.status === "cancelled" ? (
              <Button
                className="min-h-8 px-3 py-1.5 text-xs"
                icon={<RefreshCw size={14} />}
                variant="quiet"
                onClick={onRetry}
              >
                Повторить
              </Button>
            ) : null}
            {item.status !== "uploading" ? (
              <Button
                aria-label={`Убрать ${item.sourceFile.name} из очереди`}
                className="min-h-8 px-3 py-1.5 text-xs"
                icon={<Trash2 size={14} />}
                variant="quiet"
                onClick={onRemove}
              >
                Убрать
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusIcon({ status }: { status: QueueStatus }) {
  if (status === "validating" || status === "uploading") {
    return <LoaderCircle aria-label="Выполняется" className="animate-spin text-primary" size={18} />;
  }
  if (status === "completed") return <Check aria-label="Готово" className="text-emerald-300" size={18} />;
  if (status === "failed") return <CircleAlert aria-label="Ошибка" className="text-rose-300" size={18} />;
  return null;
}

function MetadataLine({ prepared }: { prepared: PreparedMedia }) {
  const dimensions = `${prepared.metadata.width}×${prepared.metadata.height}`;
  const optimization = prepared.metadata.optimization;
  const savings =
    optimization.savedBytes > 0
      ? ` · меньше на ${optimization.reductionPercent}%`
      : optimization.optimized
        ? " · преобразовано"
        : " · уже оптимально";
  const details =
    prepared.kind === "video"
      ? prepared.metadata.serverTranscodeRequired
        ? `${prepared.metadata.width && prepared.metadata.height ? `${dimensions} · ` : ""}${prepared.metadata.durationSeconds ? `${prepared.metadata.durationSeconds.toFixed(1)} сек · ` : ""}сервер подготовит H.264/AAC`
        : `${dimensions} · ${(prepared.metadata.durationSeconds ?? 0).toFixed(1)} сек · H.264/${prepared.metadata.audioCodec === "aac" ? "AAC" : "без аудио"}${savings}`
      : `${dimensions} · EXIF удалён${savings}`;
  return <p className="mt-2 text-[11px] leading-5 text-muted">{details}</p>;
}

function AssetRow({ asset, projectName }: { asset: MediaAsset; projectName?: string }) {
  const isVideo = asset.kind === "video";
  const [viewing, setViewing] = useState(false);
  const urlQuery = useQuery({
    queryKey: ["media-preview", asset.id, asset.version],
    queryFn: () => mediaRepository.getAssetUrl(asset),
    staleTime: 8 * 60_000,
  });
  const name = asset.original_file_name ?? (isVideo ? "Видео" : "Фото");
  return (
    <>
      <div className="media-asset-row">
        <div className="media-asset-main">
          <span className="media-asset-thumbnail">
            {urlQuery.data ? (
              isVideo ? (
                <video src={urlQuery.data} muted playsInline preload="metadata" />
              ) : (
                <img src={urlQuery.data} alt="" loading="lazy" />
              )
            ) : isVideo ? (
              <Film size={22} />
            ) : (
              <FileImage size={22} />
            )}
          </span>
          <div>
            <h3 title={name}>{name}</h3>
            <p>
              {isVideo ? "Видео" : "Фото"} · {asset.mime_type.split("/")[1]?.toUpperCase()}
            </p>
            <p className="media-asset-mobile-meta">
              {projectName ?? "—"} · {formatBytes(asset.size_bytes)}
            </p>
          </div>
        </div>
        <span className="media-asset-project">{projectName ?? "—"}</span>
        <span className="media-asset-size">{formatBytes(asset.size_bytes)}</span>
        <span className="media-asset-status">
          <Check size={13} /> Готово
        </span>
        <Button
          variant="quiet"
          aria-label={`Просмотр ${name}`}
          disabled={!urlQuery.data}
          onClick={() => setViewing(true)}
        >
          <Eye size={16} />
          <span>Просмотр</span>
        </Button>
      </div>
      <Modal open={viewing} title={name} onClose={() => setViewing(false)}>
        {viewing && urlQuery.data ? (
          isVideo ? (
            <video src={urlQuery.data} controls playsInline className="max-h-[65dvh] w-full rounded-lg" />
          ) : (
            <img src={urlQuery.data} alt={name} className="max-h-[65dvh] w-full rounded-lg object-contain" />
          )
        ) : null}
      </Modal>
    </>
  );
}

function MediaLoading() {
  return (
    <AppShell title="Медиа" description="Подготавливаем защищённую очередь загрузки">
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-96 rounded-card" />
        <Skeleton className="h-96 rounded-card" />
      </div>
    </AppShell>
  );
}

const queueStatusLabel: Record<QueueStatus, string> = {
  validating: "проверяем и оптимизируем",
  ready: "готов к загрузке",
  uploading: "загружается",
  failed: "нужна проверка",
  cancelled: "отменено",
  completed: "загружено",
};

function readableError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Не удалось выполнить операцию";
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function toPersistedItem(item: QueueItem & { prepared: PreparedMedia }): PreparedUploadQueueItem {
  return {
    id: item.id,
    ownerId: item.ownerId,
    accountId: item.accountId,
    projectId: item.projectId,
    groupId: item.groupId,
    requestId: item.requestId,
    prepared: item.prepared,
    createdAt: item.createdAt,
  };
}

function pluralFiles(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "файлов";
  if (last === 1) return "файл";
  if (last >= 2 && last <= 4) return "файла";
  return "файлов";
}
