import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CircleAlert, FileImage, Film, LoaderCircle, Pause, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import type { MediaAsset, PreparedMedia } from "../../entities/media/model";
import { AppShell } from "../../app/layout/AppShell";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { Button, ErrorState, FileDropzone, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { getMediaRepository, MediaRepositoryError } from "./mediaRepository";
import { classifyMediaFile, mediaAccept, prepareMediaFile } from "./mediaValidation";

type QueueStatus = "validating" | "ready" | "uploading" | "failed" | "cancelled" | "completed";
type QueueItem = {
  id: string;
  requestId: string;
  sourceFile: File;
  prepared?: PreparedMedia;
  previewUrl?: string;
  status: QueueStatus;
  progress: number;
  error?: string;
  asset?: MediaAsset;
};

const catalogRepository = getCatalogRepository();
const mediaRepository = getMediaRepository();

export function MediaUploadRoute() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [notice, setNotice] = useState<{ title: string; message?: string; tone: "success" | "error" }>();
  const queueRef = useRef(queue);
  const controllers = useRef(new Map<string, AbortController>());

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
    queryKey: ["media", "assets", accountId, projectId, groupId],
    queryFn: () => mediaRepository.listAssets(accountId!, projectId, groupId || undefined),
    enabled: Boolean(accountId && projectId && groupId),
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

  const addFiles = (files: File[]) => {
    const additions = files.map<QueueItem>((file) => ({
      id: crypto.randomUUID(),
      requestId: crypto.randomUUID(),
      sourceFile: file,
      status: "validating",
      progress: 0,
    }));
    setQueue((current) => [...current, ...additions]);
    additions.forEach((item) => void validateItem(item));
  };

  const validateItem = async (item: QueueItem) => {
    try {
      const prepared = await prepareMediaFile(item.sourceFile, classifyMediaFile(item.sourceFile));
      const previewUrl = URL.createObjectURL(prepared.file);
      if (!queueRef.current.some((candidate) => candidate.id === item.id)) {
        URL.revokeObjectURL(previewUrl);
        return;
      }
      patchQueue(item.id, { prepared, previewUrl, status: "ready", error: undefined });
    } catch (error) {
      patchQueue(item.id, { status: "failed", error: readableError(error) });
    }
  };

  const uploadItem = async (item: QueueItem) => {
    const workspace = workspaceQuery.data;
    if (!workspace || !item.prepared || !projectId || !groupId) return;
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    patchQueue(item.id, { status: "uploading", progress: 0, error: undefined });
    try {
      const asset = await mediaRepository.upload(
        {
          accountId: workspace.accountId,
          projectId,
          groupId,
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
      await queryClient.invalidateQueries({ queryKey: ["media", "assets"] });
      setNotice({ title: "Файл загружен", message: item.prepared.file.name, tone: "success" });
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
    if (next !== item) patchQueue(item.id, { requestId: next.requestId });
    void uploadItem(next);
  };

  const removeItem = (item: QueueItem) => {
    controllers.current.get(item.id)?.abort();
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setQueue((current) => current.filter((candidate) => candidate.id !== item.id));
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

  return (
    <AppShell
      eyebrow={workspace.accountName}
      title="Медиа"
      description="Проверяем файлы в браузере, загружаем частями и сохраняем только после серверной верификации."
      actions={
        readyCount ? (
          <Button disabled={uploadDisabled} icon={<UploadCloud size={17} />} onClick={() => void uploadReady()}>
            Загрузить готовые · {readyCount}
          </Button>
        ) : undefined
      }
    >
      {auth.mode === "demo" ? (
        <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          Демо-режим: очередь работает локально. В online-режиме те же действия используют приватный Supabase Storage.
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
        <Panel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              disabled={projectsQuery.isPending || !projectsQuery.data?.length}
              label="Проект"
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
                setSelectedGroupId("");
              }}
              options={(projectsQuery.data ?? []).map((project) => ({ label: project.name, value: project.id }))}
              value={projectId}
            />
            <Select
              disabled={groupsQuery.isPending || !groupsQuery.data?.length}
              label="Группа"
              onChange={(event) => setSelectedGroupId(event.target.value)}
              options={(groupsQuery.data ?? []).map((group) => ({ label: group.name, value: group.id }))}
              value={groupId}
            />
          </div>

          {!projectsQuery.isPending && !projectsQuery.data?.length ? (
            <p className="mt-4 rounded-xl border border-line bg-white/[0.025] p-4 text-sm text-muted">
              Сначала создайте активный проект и группу в разделе «Проекты».
            </p>
          ) : null}
          {projectId && !groupsQuery.isPending && !groupsQuery.data?.length ? (
            <p className="mt-4 rounded-xl border border-line bg-white/[0.025] p-4 text-sm text-muted">
              В выбранном проекте пока нет активной группы.
            </p>
          ) : null}

          <div className="mt-5">
            <FileDropzone
              accept={mediaAccept}
              disabled={uploadDisabled}
              hint="Маркер: JPEG, PNG или WebP до 25 МБ. Видео: MP4/H.264 до 500 МБ. Можно выбрать несколько файлов."
              onPick={addFiles}
            />
          </div>

          {queue.length ? (
            <div className="mt-5 grid gap-3" aria-label="Очередь загрузки">
              {queue.map((item) => (
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
          ) : (
            <div className="mt-6 text-center text-sm text-muted">
              Очередь пуста. Файлы не покидают браузер до успешной проверки.
            </div>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Загруженные файлы</h2>
              <p className="mt-1 text-xs text-muted">Текущий проект и группа</p>
            </div>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
              {assetsQuery.data?.length ?? 0}
            </span>
          </div>
          {assetsQuery.isPending ? (
            <div className="mt-5 grid gap-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : assetsQuery.error ? (
            <p className="mt-5 text-sm text-rose-300">{readableError(assetsQuery.error)}</p>
          ) : assetsQuery.data?.length ? (
            <div className="mt-5 grid gap-2">
              {assetsQuery.data.map((asset) => (
                <AssetRow key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-line p-5 text-center text-sm text-muted">
              Проверенные файлы появятся здесь после финализации.
            </div>
          )}
        </Panel>
      </section>

      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6">
          <Toast {...notice} onDismiss={() => setNotice(undefined)} />
        </div>
      ) : null}
    </AppShell>
  );

  function patchQueue(id: string, patch: Partial<QueueItem>) {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
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
  const isVideo = item.prepared?.kind === "video" || item.sourceFile.type === "video/mp4";
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
                {formatBytes(item.prepared?.file.size ?? item.sourceFile.size)} · {queueStatusLabel[item.status]}
              </p>
            </div>
            <StatusIcon status={item.status} />
          </div>
          {item.prepared ? <MetadataLine prepared={item.prepared} /> : null}
          {item.status === "uploading" ? (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
              </div>
              <p className="mt-1 text-right text-[11px] text-muted">{item.progress}%</p>
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
  const details =
    prepared.kind === "video"
      ? `${dimensions} · ${prepared.metadata.durationSeconds.toFixed(1)} сек · H.264/${prepared.metadata.audioCodec === "aac" ? "AAC" : "без аудио"}`
      : `${dimensions} · метаданные удалены`;
  return <p className="mt-2 text-[11px] leading-5 text-muted">{details}</p>;
}

function AssetRow({ asset }: { asset: MediaAsset }) {
  const isVideo = asset.kind === "video";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.025] p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {isVideo ? <Film size={18} /> : <FileImage size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{asset.original_file_name ?? (isVideo ? "Видео" : "Маркер")}</p>
        <p className="mt-1 text-[11px] text-muted">
          v{asset.version} · {formatBytes(asset.size_bytes)} · {new Date(asset.created_at).toLocaleDateString("ru-RU")}
        </p>
      </div>
      <Check className="text-emerald-300" size={16} />
    </div>
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
  validating: "проверяем",
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
