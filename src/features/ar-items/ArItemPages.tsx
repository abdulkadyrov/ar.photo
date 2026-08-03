import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileVideo2,
  ImageIcon,
  LoaderCircle,
  Play,
  Plus,
  RefreshCw,
  ScanLine,
  Sparkles,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import type { ArItem, ArItemSettings, MediaAsset, ProcessingJob } from "../../entities/ar-item/model";
import { Button, ErrorState, Input, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getMediaRepository } from "../media/mediaRepository";
import { markerAccept, prepareMediaFile } from "../media/mediaValidation";
import { getArItemRepository } from "./arItemRepository";
import { analyzeMarkerFile, type MarkerQualityResult } from "./markerQuality";

const catalogRepository = getCatalogRepository();
const mediaRepository = getMediaRepository();
const arItemRepository = getArItemRepository();

const wizardSteps = [
  "Проект",
  "Описание",
  "Маркер",
  "Качество",
  "Видео",
  "Поведение",
  "Обработка",
  "Тест",
  "Публикация",
] as const;

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
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const itemsQuery = useQuery({
    queryKey: ["ar-items", workspaceQuery.data?.accountId],
    queryFn: () => arItemRepository.listItems(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });

  if (workspaceQuery.isPending || itemsQuery.isPending) return <ItemsLoading />;
  if (workspaceQuery.error || itemsQuery.error) {
    return (
      <AppShell title="AR-работы" description="Связанные фотографии и видео">
        <div className="mt-6">
          <ErrorState text={readableError(workspaceQuery.error ?? itemsQuery.error)} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow={workspaceQuery.data.accountName}
      title="AR-работы"
      description="Создавайте связь маркера и видео, следите за обработкой и проверяйте результат до публикации."
      actions={
        <Link className="btn btn-primary" to="/items/new">
          <Plus size={17} /> Новая AR-работа
        </Link>
      }
    >
      {itemsQuery.data.length ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Список AR-работ">
          {itemsQuery.data.map((item) => (
            <article key={item.id} className="surface-card rounded-card border border-line p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <span className="metric-icon">
                  <Sparkles size={20} />
                </span>
                <ItemStatus status={item.status} />
              </div>
              <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
                {item.description ?? "Описание не добавлено"}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                <span>Ревизия {item.version}</span>
                <span>{new Date(item.updated_at).toLocaleDateString("ru-RU")}</span>
              </div>
              <Link className="btn btn-ghost mt-4 w-full" to={`/items/${item.id}/edit`}>
                Открыть мастер <ArrowRight size={16} />
              </Link>
              {item.status === "ready" || item.status === "published" ? (
                <Link className="btn btn-primary mt-2 w-full" to={`/items/${item.id}/qr`}>
                  {item.status === "published" ? "QR и публикация" : "Опубликовать"} <ScanLine size={16} />
                </Link>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <Panel className="mt-6 py-12 text-center">
          <span className="metric-icon mx-auto">
            <Sparkles size={24} />
          </span>
          <h2 className="mt-4 text-2xl font-semibold">Создайте первую AR-работу</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Нужны проект, группа, фотография-маркер и H.264-видео. Мастер проверит каждый шаг.
          </p>
          <Link className="btn btn-primary mt-5" to="/items/new">
            <Plus size={17} /> Начать
          </Link>
        </Panel>
      )}
    </AppShell>
  );
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
    return typeof resumeStep === "number" && resumeStep >= 1 && resumeStep <= 9 ? resumeStep : 1;
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
  const [qualityAccepted, setQualityAccepted] = useState(false);
  const [uploadState, setUploadState] = useState<{ kind: "marker" | "video"; progress: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ title: string; message?: string; tone: "error" | "success" } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [testChecks, setTestChecks] = useState([false, false, false]);
  const [previewUrls, setPreviewUrls] = useState<{ marker?: string; video?: string }>({});
  const requestId = useRef(crypto.randomUUID());
  const uploadedFiles = useRef(new Map<string, File>());
  const initializedItemId = useRef("");

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
    refetchInterval: step >= 7 && step <= 8 ? 3_000 : false,
  });
  const assetsQuery = useQuery({
    queryKey: ["media", "assets", accountId, projectId, groupId],
    queryFn: () => mediaRepository.listAssets(accountId!, projectId, groupId),
    enabled: Boolean(accountId && projectId && groupId),
  });
  const jobsQuery = useQuery({
    queryKey: ["ar-item", "jobs", accountId, currentItemId],
    queryFn: () => arItemRepository.listJobs(accountId!, currentItemId),
    enabled: Boolean(accountId && currentItemId && step >= 7),
    refetchInterval: step === 7 ? 3_000 : false,
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
      audioDefault: item.audio_default as "muted" | "sound_on",
      fallbackEnabled: item.fallback_enabled,
    });
    if (item.status === "ready" || item.status === "published") setStep(8);
    else if (item.status === "processing" || item.status === "failed") setStep(7);
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
    if (step !== 8 || !selectedMarker || !selectedVideo) return;
    let active = true;
    void Promise.all([mediaRepository.getAssetUrl(selectedMarker), mediaRepository.getAssetUrl(selectedVideo)]).then(
      ([marker, video]) => {
        if (active) setPreviewUrls({ marker, video });
      },
    );
    return () => {
      active = false;
    };
  }, [selectedMarker, selectedVideo, step]);

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
      setNotice({ title: kind === "marker" ? "Маркер загружен" : "Видео загружено", tone: "success" });
    } catch (error) {
      showError(error);
    } finally {
      setUploadState(null);
    }
  };

  const analyzeSelectedMarker = async () => {
    if (!selectedMarker) return;
    setBusy(true);
    try {
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
      setQuality(await analyzeMarkerFile(file));
      setQualityAccepted(false);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const startProcessing = async () => {
    if (!accountId || !currentItemId || !markerAssetId || !videoAssetId) return;
    setBusy(true);
    try {
      await arItemRepository.prepare(accountId, currentItemId, { ...settings, markerAssetId, videoAssetId });
      setStep(7);
      await Promise.all([itemQuery.refetch(), jobsQuery.refetch()]);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

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
      if (!markerAssetId) setNotice({ title: "Добавьте фотографию-маркер", tone: "error" });
      else setStep(4);
    } else if (step === 4) {
      if (!quality) setNotice({ title: "Сначала выполните анализ качества", tone: "error" });
      else if (!quality.suitable && !qualityAccepted)
        setNotice({ title: "Подтвердите риск слабого маркера", tone: "error" });
      else setStep(5);
    } else if (step === 5) {
      if (!videoAssetId) setNotice({ title: "Добавьте H.264-видео", tone: "error" });
      else setStep(6);
    } else if (step === 6) await startProcessing();
    else if (step === 7 && currentItem?.status === "ready") setStep(8);
    else if (step === 8 && testChecks.every(Boolean)) setStep(9);
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

  const canGoBack = step > 1 && step !== 7;
  const nextLabel = step === 6 ? "Запустить обработку" : step === 8 ? "Проверка завершена" : "Продолжить";

  return (
    <AppShell
      eyebrow="AR Item Workflow"
      title={currentItem?.title || "Новая AR-работа"}
      description="Девять проверяемых шагов от выбора группы до готовности к публикации."
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Шаг {step} из 9</p>
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
          ) : null}

          {step === 4 ? (
            <MarkerQualityStep
              busy={busy}
              quality={quality}
              accepted={qualityAccepted}
              onAccepted={setQualityAccepted}
              onAnalyze={() => void analyzeSelectedMarker()}
            />
          ) : null}

          {step === 5 ? (
            <MediaStep
              kind="video"
              assets={videos}
              selectedId={videoAssetId}
              uploadState={uploadState}
              onSelect={setVideoAssetId}
              onUpload={(file) => void uploadFile(file, "video")}
            />
          ) : null}

          {step === 6 ? <SettingsStep settings={settings} onChange={setSettings} /> : null}

          {step === 7 ? (
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
          ) : null}

          {step === 8 ? (
            <TestingStep
              markerUrl={previewUrls.marker}
              videoUrl={previewUrls.video}
              checks={testChecks}
              onToggle={(index) =>
                setTestChecks((current) =>
                  current.map((value, currentIndex) => (currentIndex === index ? !value : value)),
                )
              }
            />
          ) : null}

          {step === 9 ? <PublicationStep itemId={currentItemId} /> : null}

          {step < 9 ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button variant="quiet" disabled={!canGoBack || busy} onClick={() => setStep((current) => current - 1)}>
                <ArrowLeft size={16} /> Назад
              </Button>
              <Button
                disabled={
                  busy || (step === 7 && currentItem?.status !== "ready") || (step === 8 && !testChecks.every(Boolean))
                }
                onClick={() => void next()}
              >
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
    <ol className="mt-6 grid grid-cols-3 gap-2 md:grid-cols-5 xl:grid-cols-9" aria-label="Шаги создания AR-работы">
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
        <h3 className="mt-3 font-semibold">{marker ? "JPEG, PNG или WebP до 25 МБ" : "MP4 с H.264 до 500 МБ"}</h3>
        <p className="mt-1 text-xs text-muted">Файл проходит сигнатурную проверку и приватную resumable-загрузку.</p>
        <label className="btn btn-ghost mt-4 cursor-pointer">
          <Upload size={16} /> {uploadState?.kind === kind ? `Загрузка ${uploadState.progress}%` : "Выбрать файл"}
          <input
            className="hidden"
            type="file"
            accept={marker ? markerAccept : "video/mp4"}
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

function MarkerQualityStep({
  busy,
  quality,
  accepted,
  onAccepted,
  onAnalyze,
}: {
  busy: boolean;
  quality: MarkerQualityResult | null;
  accepted: boolean;
  onAccepted: (value: boolean) => void;
  onAnalyze: () => void;
}) {
  return (
    <div>
      <p className="text-sm leading-6 text-muted">
        Локальная проверка оценивает яркость, контраст, резкость, плотность признаков и энтропию. Worker повторит анализ
        авторитетно.
      </p>
      <Button
        className="mt-5"
        disabled={busy}
        onClick={onAnalyze}
        icon={busy ? <LoaderCircle className="animate-spin" size={16} /> : <ScanLine size={16} />}
      >
        Анализировать маркер
      </Button>
      {quality ? (
        <div
          className={`mt-5 rounded-2xl border p-5 ${quality.suitable ? "border-emerald-400/30 bg-emerald-400/10" : "border-amber-300/30 bg-amber-300/10"}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Оценка качества</p>
              <strong className="mt-1 block text-4xl">{quality.score}/100</strong>
            </div>
            {quality.suitable ? (
              <CheckCircle2 className="text-emerald-300" size={34} />
            ) : (
              <AlertTriangle className="text-amber-200" size={34} />
            )}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Object.entries(quality.metrics).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-black/15 p-3 text-center">
                <strong>{value}</strong>
                <span className="mt-1 block text-[10px] uppercase text-muted">{metricLabel(key)}</span>
              </div>
            ))}
          </div>
          {!quality.suitable ? (
            <label className="mt-5 flex items-start gap-3 text-sm leading-5">
              <input
                className="mt-1"
                type="checkbox"
                checked={accepted}
                onChange={(event) => onAccepted(event.target.checked)}
              />
              <span>
                Я понимаю риск потери распознавания. После серверной проверки потребуется указать причину ручного
                подтверждения.
              </span>
            </label>
          ) : null}
        </div>
      ) : null}
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
        onChange={(event) => onChange({ ...settings, audioDefault: event.target.value as "muted" | "sound_on" })}
        options={[
          { value: "muted", label: "Выключен — совместимо с autoplay" },
          { value: "sound_on", label: "Включён после действия пользователя" },
        ]}
      />
      <div className="rounded-xl border border-line bg-white/[0.025] p-4 text-sm leading-6 text-muted">
        Перед запуском будут созданы четыре задания: анализ маркера, проверка кодеков, компиляция `.mind` и WebP-превью.
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
          Обработка выполняется автоматически и обычно занимает несколько минут. Эту страницу можно оставить
          открытой — статусы обновятся сами.
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
          <p className="mt-2 text-sm text-muted">Можно перейти к ручной проверке пары «маркер + видео».</p>
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

function TestingStep({
  markerUrl,
  videoUrl,
  checks,
  onToggle,
}: {
  markerUrl?: string;
  videoUrl?: string;
  checks: boolean[];
  onToggle: (index: number) => void;
}) {
  const labels = [
    "Выбрана правильная печатная фотография",
    "Видео и звук соответствуют фотографии",
    "Поведение при потере маркера подтверждено",
  ];
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-line bg-black/20">
          {markerUrl ? (
            <img alt="Предпросмотр маркера" className="aspect-[4/3] h-full w-full object-cover" src={markerUrl} />
          ) : (
            <PreviewPlaceholder icon={<ImageIcon />} label="Маркер" />
          )}
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-black/20">
          {videoUrl ? (
            <video className="aspect-[4/3] h-full w-full object-cover" controls preload="metadata" src={videoUrl} />
          ) : (
            <PreviewPlaceholder icon={<FileVideo2 />} label="Видео" />
          )}
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {labels.map((label, index) => (
          <label
            key={label}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-sm"
          >
            <input className="mt-1" type="checkbox" checked={checks[index]} onChange={() => onToggle(index)} />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <Link className="btn btn-ghost mt-5" to="/viewer/test" target="_blank" rel="noreferrer">
        <ScanLine size={16} /> Открыть техническую AR-проверку
      </Link>
    </div>
  );
}

function PublicationStep({ itemId }: { itemId: string }) {
  return (
    <div className="py-4 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
        <CheckCircle2 size={34} />
      </span>
      <h3 className="mt-5 text-2xl font-semibold">AR-работа готова к публикации</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
        Workflow и generated assets проверены. Следующий экран атомарно активирует public manifest и создаст QR без
        внутренних UUID, Storage path или signed URL.
      </p>
      <Link className="btn btn-primary mt-5" to={`/items/${itemId}/qr`}>
        Опубликовать и создать QR
      </Link>
      <div className="mt-4">
        <Link className="text-sm font-semibold text-primary" to={`/items/${itemId}/edit`}>
          Сохранено как готовая ревизия
        </Link>
      </div>
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

function PreviewPlaceholder({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="grid aspect-[4/3] place-items-center text-muted">
      <div className="text-center">
        <span className="metric-icon mx-auto">{icon}</span>
        <p className="mt-2 text-xs">{label} загружается</p>
      </div>
    </div>
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

function metricLabel(key: string) {
  return (
    {
      brightness: "яркость",
      contrast: "контраст",
      sharpness: "резкость",
      featureDensity: "признаки",
      entropy: "энтропия",
    }[key] ?? key
  );
}

function lostBehaviorLabel(value: ArItemSettings["markerLostBehavior"]) {
  return { pause_hide: "Пауза и скрытие", continue_audio_hide: "Продолжить звук", stop_reset: "Стоп и сброс" }[value];
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Неизвестная ошибка";
}
