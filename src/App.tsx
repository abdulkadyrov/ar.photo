import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft,
  AlertTriangle,
  Camera,
  Download,
  Expand,
  FileArchive,
  FolderPlus,
  ImageUp,
  Import,
  Maximize2,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Trash2,
  Upload,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ARClass, ARProject, ARStudent, LivePhoto, Media, StoreSnapshot } from "./types";
import { clearAll, deleteProjectCascade, getMediaBlob, importSnapshot, loadData, saveClass, saveLivePhoto, saveMedia, saveProject, saveStudent } from "./lib/db";
import { createId, nowIso } from "./lib/id";
import { exportClassZip, exportProjectZip, getClassStats, parseImportZip } from "./lib/zip";
import { go, parseRoute, viewerUrl } from "./lib/routes";

const emptySnapshot: StoreSnapshot = {
  projects: [],
  classes: [],
  students: [],
  livePhotos: [],
  media: [],
  mediaBlobs: [],
};

export function App() {
  const [route, setRoute] = useState(() => parseRoute(location.pathname));
  const [snapshot, setSnapshot] = useState<StoreSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setSnapshot(await loadData());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const onRoute = () => setRoute(parseRoute(location.pathname));
    window.addEventListener("popstate", onRoute);
    return () => window.removeEventListener("popstate", onRoute);
  }, []);

  if (loading) return <Shell><StatusPanel title="Подготовка AR..." text="Загружаем локальное хранилище." /></Shell>;
  if (route.name === "project") return <ProjectPage snapshot={snapshot} projectId={route.id} refresh={refresh} />;
  if (route.name === "viewer" && route.id === "test") return <TestViewerPage />;
  if (route.name === "viewer") return <ViewerPage snapshot={snapshot} livePhotoId={route.id} />;
  if (route.name === "dashboard") return <Dashboard snapshot={snapshot} refresh={refresh} />;
  return <Home snapshot={snapshot} refresh={refresh} />;
}

function Shell({ children, flush = false }: { children: React.ReactNode; flush?: boolean }) {
  return <main className={flush ? "min-h-screen bg-ink text-white" : "min-h-screen bg-background text-ink"}>{children}</main>;
}

function Home({ snapshot, refresh }: { snapshot: StoreSnapshot; refresh: () => Promise<void> }) {
  return (
    <Shell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6">
        <Topbar snapshot={snapshot} refresh={refresh} />
        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">School AR Photo</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">Оживающие выпускные фотографии</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">Создавайте школьные AR-альбомы без backend: фото, видео, QR, ZIP-экспорт и локальная работа прямо в браузере.</p>
          <div className="flex flex-wrap gap-3">
              <Button onClick={() => go("/dashboard")} icon={<FolderPlus size={19} />}>Открыть проекты</Button>
              <Button variant="ghost" onClick={() => go("/viewer/test")} icon={<Camera size={18} />}>Test Viewer</Button>
              <Button variant="ghost" onClick={() => seedDemo(refresh)} icon={<Play size={18} />}>Создать демо</Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[32px] bg-card p-5 shadow-soft">
            <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,#dbeafe,#fff,#f8fafc)] p-5">
              <div className="grid h-full grid-rows-[1fr_auto] gap-4">
                <div className="relative overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-soft">
                  <div className="absolute inset-8 rounded-[20px] border border-dashed border-blue-300 bg-blue-50/80" />
                  <div className="absolute inset-x-12 bottom-16 h-28 rounded-[24px] bg-primary/90 shadow-soft" />
                  <div className="absolute left-1/2 top-20 h-28 w-28 -translate-x-1/2 rounded-full bg-slate-300" />
                  <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/90 p-4">
                    <div className="h-3 w-36 rounded-full bg-slate-900" />
                    <div className="mt-3 h-2 w-52 rounded-full bg-slate-300" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm font-medium">
                  <MiniStep label="Фото" />
                  <MiniStep label="Видео" />
                  <MiniStep label="QR" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Dashboard({ snapshot, refresh }: { snapshot: StoreSnapshot; refresh: () => Promise<void> }) {
  const [projectName, setProjectName] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectName.trim()) return;
    await saveProject({ id: createId("project"), name: projectName.trim(), createdAt: nowIso() });
    setProjectName("");
    await refresh();
  };

  const importZip = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const imported = await parseImportZip(file);
    await importSnapshot(imported.data, imported.blobs);
    await refresh();
    event.currentTarget.value = "";
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-5 py-6">
        <Topbar snapshot={snapshot} refresh={refresh} />
        <section className="mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <Panel>
            <h2 className="text-2xl font-semibold">AR Photo</h2>
            <form className="mt-5 space-y-3" onSubmit={createProject}>
              <Input value={projectName} onChange={setProjectName} placeholder="Гимназия 12" />
              <Button icon={<Plus size={18} />} full>Новый проект</Button>
            </form>
            <div className="mt-4 flex gap-2">
              <input ref={importRef} type="file" accept=".zip" className="hidden" onChange={importZip} />
              <Button type="button" variant="ghost" onClick={() => importRef.current?.click()} icon={<Import size={18} />}>ZIP Import</Button>
              <Button type="button" variant="ghost" onClick={async () => { await clearAll(); await refresh(); }} icon={<Trash2 size={18} />}>Очистить</Button>
            </div>
          </Panel>
          <div className="grid gap-4">
            {snapshot.projects.map((project) => <ProjectCard key={project.id} project={project} snapshot={snapshot} refresh={refresh} />)}
            {!snapshot.projects.length && <StatusPanel title="Нет проектов" text="Создайте первый школьный AR-альбом." />}
          </div>
        </section>
      </div>
    </Shell>
  );
}

function ProjectPage({ snapshot, projectId, refresh }: { snapshot: StoreSnapshot; projectId: string; refresh: () => Promise<void> }) {
  const project = snapshot.projects.find((item) => item.id === projectId);
  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  const classes = snapshot.classes.filter((item) => item.projectId === projectId);
  const activeClass = classes.find((item) => item.id === selectedClassId) ?? classes[0];
  const students = activeClass ? snapshot.students.filter((item) => item.classId === activeClass.id) : [];

  useEffect(() => {
    if (!selectedClassId && classes[0]) setSelectedClassId(classes[0].id);
  }, [classes, selectedClassId]);

  if (!project) return <Shell><NotFound /></Shell>;

  const createClass = async (event: FormEvent) => {
    event.preventDefault();
    if (!className.trim()) return;
    const arClass = { id: createId("class"), projectId, name: className.trim() };
    await saveClass(arClass);
    setSelectedClassId(arClass.id);
    setClassName("");
    await refresh();
  };

  const createStudent = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeClass || !studentName.trim()) return;
    const [lastName = "", ...rest] = studentName.trim().split(/\s+/);
    await saveStudent({ id: createId("student"), classId: activeClass.id, firstName: rest.join(" ") || "Ученик", lastName });
    setStudentName("");
    await refresh();
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-5 py-6">
        <Topbar snapshot={snapshot} refresh={refresh} />
        <button className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted" onClick={() => go("/dashboard")}><ArrowLeft size={16} /> Проекты</button>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold">{project.name}</h1>
            <p className="mt-2 text-muted">{classes.length} класса, {snapshot.livePhotos.length} live photo</p>
          </div>
          <Button variant="ghost" onClick={() => exportProjectZip(snapshot, project.id)} icon={<FileArchive size={18} />}>Экспорт проекта</Button>
        </div>
        <section className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
          <Panel>
            <form className="space-y-3" onSubmit={createClass}>
              <Input value={className} onChange={setClassName} placeholder="4А" />
              <Button icon={<Plus size={18} />} full>Создать класс</Button>
            </form>
            <div className="mt-5 grid gap-2">
              {classes.map((item) => {
                const stats = getClassStats(snapshot, item);
                return (
                  <button key={item.id} className={`rounded-2xl border p-4 text-left transition ${activeClass?.id === item.id ? "border-primary bg-blue-50" : "border-line bg-white"}`} onClick={() => setSelectedClassId(item.id)}>
                    <div className="font-semibold">{item.name}</div>
                    <div className="mt-1 text-sm text-muted">{stats.students} учеников, {stats.livePhotos} live photo</div>
                  </button>
                );
              })}
            </div>
          </Panel>
          <div className="space-y-5">
            {activeClass && (
              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold">{activeClass.name}</h2>
                  <Button variant="ghost" onClick={() => exportClassZip(snapshot, activeClass)} icon={<Download size={18} />}>4A_live_photos.zip</Button>
                </div>
                <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={createStudent}>
                  <Input value={studentName} onChange={setStudentName} placeholder="Иванов Максим" />
                  <Button icon={<UserPlus size={18} />}>Добавить ученика</Button>
                </form>
              </Panel>
            )}
            <div className="grid gap-4 xl:grid-cols-2">
              {students.map((student) => <StudentCard key={student.id} student={student} snapshot={snapshot} refresh={refresh} />)}
              {activeClass && !students.length && <StatusPanel title="Класс пустой" text="Добавьте ученика и загрузите фото с видео." />}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function StudentCard({ student, snapshot, refresh }: { student: ARStudent; snapshot: StoreSnapshot; refresh: () => Promise<void> }) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const livePhoto = snapshot.livePhotos.find((item) => item.studentId === student.id);
  const image = livePhoto ? snapshot.media.find((item) => item.id === livePhoto.imageId) : undefined;
  const video = livePhoto ? snapshot.media.find((item) => item.id === livePhoto.videoId) : undefined;
  const [draftImage, setDraftImage] = useState<{ media: Media; blob: Blob } | null>(null);
  const [draftVideo, setDraftVideo] = useState<{ media: Media; blob: Blob } | null>(null);

  const upload = async (type: "image" | "video", file?: File) => {
    if (!file) return;
    const media = { id: createId(type), type, fileName: file.name, blobId: createId("blob") };
    if (type === "image") setDraftImage({ media, blob: file });
    if (type === "video") setDraftVideo({ media, blob: file });
  };

  const generate = async () => {
    if (!draftImage && !image) return;
    if (!draftVideo && !video) return;
    if (draftImage) await saveMedia(draftImage.media, draftImage.blob);
    if (draftVideo) await saveMedia(draftVideo.media, draftVideo.blob);
    const id = livePhoto?.id ?? createId("livephoto");
    await saveLivePhoto({
      id,
      studentId: student.id,
      imageId: draftImage?.media.id ?? image!.id,
      videoId: draftVideo?.media.id ?? video!.id,
      qrCode: viewerUrl(id),
      createdAt: livePhoto?.createdAt ?? nowIso(),
    });
    setDraftImage(null);
    setDraftVideo(null);
    await refresh();
  };

  const downloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas || !livePhoto) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${student.lastName}_${student.firstName}_qr.png`;
    link.click();
  };

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{student.lastName} {student.firstName}</h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-medium">
            <Badge ok={Boolean(image || draftImage)} label="Фото" />
            <Badge ok={Boolean(video || draftVideo)} label="Видео" />
            <Badge ok={Boolean(livePhoto)} label="QR" />
          </div>
        </div>
        {livePhoto && <QRCodeCanvas ref={qrRef} value={livePhoto.qrCode} size={84} bgColor="transparent" />}
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <FileButton accept="image/*" icon={<ImageUp size={18} />} onPick={(file) => upload("image", file)}>Загрузить фото</FileButton>
        <FileButton accept="video/*" icon={<Upload size={18} />} onPick={(file) => upload("video", file)}>Загрузить видео</FileButton>
        <Button type="button" variant="ghost" onClick={generate} icon={<QrCode size={18} />}>Сгенерировать QR</Button>
        <Button type="button" variant="ghost" disabled={!livePhoto} onClick={() => livePhoto && go(`/viewer/${livePhoto.id}`)} icon={<Camera size={18} />}>Открыть Viewer</Button>
      </div>
      {livePhoto && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="quiet" onClick={downloadQr} icon={<Download size={17} />}>PNG QR</Button>
          <span className="min-w-0 flex-1 truncate rounded-xl bg-slate-100 px-3 py-2 text-xs text-muted">{livePhoto.qrCode}</span>
        </div>
      )}
    </Panel>
  );
}

function ViewerPage({ snapshot, livePhotoId }: { snapshot: StoreSnapshot; livePhotoId: string }) {
  const livePhoto = snapshot.livePhotos.find((item) => item.id === livePhotoId);
  const videoMeta = livePhoto ? snapshot.media.find((item) => item.id === livePhoto.videoId) : undefined;
  const [videoUrl, setVideoUrl] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let objectUrl = "";
    async function boot() {
      if (videoMeta) {
        const blob = await getMediaBlob(videoMeta.blobId);
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setVideoUrl(objectUrl);
        }
      }
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        await cameraRef.current.play();
        setCameraReady(true);
      }
    }
    boot().catch(() => setCameraReady(false));
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [videoMeta]);

  if (!livePhoto) return <Shell flush><NotFound /></Shell>;

  return (
    <Shell flush>
      <div className="relative min-h-screen overflow-hidden bg-black">
        <video ref={cameraRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute left-1/2 top-1/2 aspect-[3/4] w-[76vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] border border-white/50 bg-black/20 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          {videoUrl ? <video ref={videoRef} className="h-full w-full object-cover" src={videoUrl} muted={muted} autoPlay loop playsInline /> : <div className="grid h-full place-items-center text-white">Подготовка AR...</div>}
        </div>
        <div className="absolute inset-x-4 top-5 rounded-[20px] bg-black/45 p-4 text-white backdrop-blur">
          <div className="text-sm font-semibold">{cameraReady ? "Наведите камеру на фотографию" : "Подготовка AR..."}</div>
          <div className="mt-1 text-xs text-white/70">{videoUrl ? "Видео воспроизводится" : "Загружаем видео"}</div>
        </div>
        <div className="absolute inset-x-4 bottom-5 grid grid-cols-3 gap-2">
          <ControlButton onClick={() => setMuted((value) => !value)} icon={muted ? <VolumeX /> : <Volume2 />} label="Звук" />
          <ControlButton onClick={() => document.documentElement.requestFullscreen?.()} icon={<Maximize2 />} label="Fullscreen" />
          <ControlButton onClick={() => { videoRef.current?.play(); videoRef.current!.currentTime = 0; }} icon={<RotateCcw />} label="Повтор" />
        </div>
      </div>
    </Shell>
  );
}

function TestViewerPage() {
  const base = import.meta.env.BASE_URL;
  const imageSrc = `${base}test-assets/test.jpg`;
  const videoSrc = `${base}test-assets/test.mp4`;
  const targetSrc = `${base}test-assets/test.mind`;
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackCameraRef = useRef<HTMLVideoElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Проверяем test assets...");
  const [mode, setMode] = useState<"loading" | "mindar" | "fallback" | "missing">("loading");
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function boot() {
      const [hasImage, hasVideo, hasTarget] = await Promise.all([assetExists(imageSrc), assetExists(videoSrc), assetExists(targetSrc)]);
      if (!hasImage || !hasVideo) {
        setMode("missing");
        setStatus("Нужны public/test-assets/test.jpg и public/test-assets/test.mp4");
        return;
      }
      if (!hasTarget) {
        setMode("fallback");
        setStatus("test.mind не найден: показываем camera preview и test.mp4 без image tracking");
        cleanup = await startFallbackCamera(fallbackCameraRef.current);
        return;
      }

      setMode("mindar");
      setStatus("Подготовка MindAR...");
      try {
        cleanup = await startMindAr({
          container: containerRef.current,
          baseUrl: base,
          targetSrc,
          videoSrc,
          muted,
          onStatus: setStatus,
        });
      } catch (error) {
        setMode("fallback");
        setStatus(error instanceof Error ? error.message : "MindAR не запустился, включен fallback viewer");
        cleanup = await startFallbackCamera(fallbackCameraRef.current);
      }
    }

    boot();
    return () => cleanup?.();
  }, [imageSrc, muted, targetSrc, videoSrc]);

  const replay = () => {
    const video = fallbackVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
  };

  return (
    <Shell flush>
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <div ref={containerRef} className={mode === "mindar" ? "absolute inset-0" : "hidden"} />
        {mode !== "mindar" && (
          <>
            <video ref={fallbackCameraRef} className="absolute inset-0 h-full w-full object-cover opacity-70" playsInline muted />
            <div className="absolute left-1/2 top-1/2 aspect-[3/4] w-[76vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] border border-white/50 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
              <video ref={fallbackVideoRef} className="h-full w-full object-cover" src={videoSrc} muted={muted} autoPlay loop playsInline />
            </div>
          </>
        )}
        <div className="absolute inset-x-4 top-5 rounded-[20px] bg-black/55 p-4 text-white backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold">
            {mode === "fallback" || mode === "missing" ? <AlertTriangle size={17} /> : <Camera size={17} />}
            <span>{mode === "mindar" ? "Наведите камеру на test.jpg" : "Test Viewer"}</span>
          </div>
          <div className="mt-1 text-xs leading-5 text-white/75">{status}</div>
          <div className="mt-3 flex items-center gap-3 text-xs text-white/75">
            <img src={imageSrc} className="h-14 w-11 rounded-lg object-cover" alt="test target" />
            <span>Файлы: test.jpg, test.mp4{mode !== "mindar" ? ", нужен test.mind для tracking" : ""}</span>
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-5 grid grid-cols-3 gap-2">
          <ControlButton onClick={() => setMuted((value) => !value)} icon={muted ? <VolumeX /> : <Volume2 />} label="Звук" />
          <ControlButton onClick={() => document.documentElement.requestFullscreen?.()} icon={<Maximize2 />} label="Fullscreen" />
          <ControlButton onClick={replay} icon={<RotateCcw />} label="Повтор" />
        </div>
      </div>
    </Shell>
  );
}

function Topbar({ snapshot, refresh }: { snapshot: StoreSnapshot; refresh: () => Promise<void> }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <button className="flex items-center gap-3" onClick={() => go("/")}>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white"><Expand size={20} /></span>
        <span className="text-lg font-semibold">AR Photo</span>
      </button>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted sm:inline">{snapshot.projects.length} проектов</span>
        <Button type="button" variant="quiet" onClick={() => seedDemo(refresh)} icon={<Plus size={17} />}>Демо</Button>
      </div>
    </header>
  );
}

function ProjectCard({ project, snapshot, refresh }: { project: ARProject; snapshot: StoreSnapshot; refresh: () => Promise<void> }) {
  const classes = snapshot.classes.filter((item) => item.projectId === project.id);
  const classIds = classes.map((item) => item.id);
  const students = snapshot.students.filter((item) => classIds.includes(item.classId));
  const livePhotos = snapshot.livePhotos.filter((item) => students.some((student) => student.id === item.studentId));
  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button className="text-left" onClick={() => go(`/project/${project.id}`)}>
          <h3 className="text-2xl font-semibold">{project.name}</h3>
          <p className="mt-2 text-muted">{classes.length} класса, {livePhotos.length} live photo</p>
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => go(`/project/${project.id}`)} icon={<ArrowLeft className="rotate-180" size={18} />}>Открыть</Button>
          <Button variant="quiet" onClick={async () => { await deleteProjectCascade(project.id); await refresh(); }} icon={<Trash2 size={17} />}>Удалить</Button>
        </div>
      </div>
    </Panel>
  );
}

function Button({ children, icon, variant = "primary", full = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode; variant?: "primary" | "ghost" | "quiet"; full?: boolean }) {
  return <button {...props} className={`btn btn-${variant} ${full ? "w-full" : ""} ${props.className ?? ""}`}>{icon}{children}</button>;
}

function FileButton({ children, accept, icon, onPick }: { children: React.ReactNode; accept: string; icon: React.ReactNode; onPick: (file?: File) => void }) {
  return (
    <label className="btn btn-ghost cursor-pointer">
      {icon}{children}
      <input type="file" accept={accept} className="hidden" onChange={(event) => onPick(event.currentTarget.files?.[0])} />
    </label>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-card border border-line bg-card p-4 shadow-soft">{children}</div>;
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <input className="h-12 w-full rounded-2xl border border-line bg-white px-4 text-base outline-none transition focus:border-primary" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />;
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`rounded-full px-3 py-1 ${ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{label}: {ok ? "✓" : "○"}</span>;
}

function MiniStep({ label }: { label: string }) {
  return <div className="rounded-2xl bg-white p-3 text-center shadow-sm">{label}</div>;
}

function StatusPanel({ title, text }: { title: string; text: string }) {
  return <Panel><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-muted">{text}</p></Panel>;
}

function ControlButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-white/90 text-sm font-semibold text-slate-950 backdrop-blur" onClick={onClick}>{icon}<span>{label}</span></button>;
}

function NotFound() {
  return <div className="grid min-h-screen place-items-center px-5"><StatusPanel title="Не найдено" text="Проверьте ссылку или вернитесь в dashboard." /></div>;
}

async function assetExists(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function startFallbackCamera(camera: HTMLVideoElement | null) {
  if (!camera) return undefined;
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
  camera.srcObject = stream;
  await camera.play();
  return () => stream.getTracks().forEach((track) => track.stop());
}

async function startMindAr({
  container,
  baseUrl,
  targetSrc,
  videoSrc,
  muted,
  onStatus,
}: {
  container: HTMLDivElement | null;
  baseUrl: string;
  targetSrc: string;
  videoSrc: string;
  muted: boolean;
  onStatus: (status: string) => void;
}) {
  if (!container) throw new Error("MindAR container не готов");
  await loadScript(`${baseUrl}vendor/three.min.js`);
  await loadScript(`${baseUrl}vendor/mindar-image-three.prod.js`);

  const runtime = window as unknown as {
    THREE?: {
      VideoTexture: new (video: HTMLVideoElement) => unknown;
      PlaneGeometry: new (width: number, height: number) => unknown;
      MeshBasicMaterial: new (options: { map: unknown; transparent: boolean }) => unknown;
      Mesh: new (geometry: unknown, material: unknown) => { scale: { set: (x: number, y: number, z: number) => void } };
    };
    MINDAR?: {
      IMAGE?: {
        MindARThree: new (options: { container: HTMLDivElement; imageTargetSrc: string }) => {
          renderer: { setAnimationLoop: (callback: (() => void) | null) => void; render: (scene: unknown, camera: unknown) => void };
          scene: unknown;
          camera: unknown;
          addAnchor: (index: number) => { group: { add: (mesh: unknown) => void }; onTargetFound?: () => void; onTargetLost?: () => void };
          start: () => Promise<void>;
          stop: () => void;
        };
      };
    };
  };

  const THREE = runtime.THREE;
  const MindARThree = runtime.MINDAR?.IMAGE?.MindARThree;
  if (!THREE || !MindARThree) throw new Error("MindAR runtime не загрузился");

  const video = document.createElement("video");
  video.src = videoSrc;
  video.loop = true;
  video.muted = muted;
  video.playsInline = true;
  video.crossOrigin = "anonymous";
  await video.play().catch(() => undefined);

  const mindarThree = new MindARThree({ container, imageTargetSrc: targetSrc });
  const { renderer, scene, camera } = mindarThree;
  const texture = new THREE.VideoTexture(video);
  const geometry = new THREE.PlaneGeometry(1, 1.35);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const plane = new THREE.Mesh(geometry, material);
  plane.scale.set(1, 1, 1);

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(plane);
  anchor.onTargetFound = () => {
    onStatus("Фото найдено: test.mp4 воспроизводится поверх test.jpg");
    video.play();
  };
  anchor.onTargetLost = () => {
    onStatus("Фото потеряно: наведите камеру на test.jpg");
    video.pause();
  };

  await mindarThree.start();
  onStatus("Наведите камеру на распечатанное или открытое test.jpg");
  renderer.setAnimationLoop(() => renderer.render(scene, camera));

  return () => {
    renderer.setAnimationLoop(null);
    mindarThree.stop();
    video.pause();
  };
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Не удалось загрузить ${src}`));
    document.head.append(script);
  });
}

async function seedDemo(refresh: () => Promise<void>) {
  const project: ARProject = { id: createId("project"), name: "Гимназия 12", createdAt: nowIso() };
  const arClass: ARClass = { id: createId("class"), projectId: project.id, name: "4А" };
  const student: ARStudent = { id: createId("student"), classId: arClass.id, firstName: "Максим", lastName: "Иванов" };
  await saveProject(project);
  await saveClass(arClass);
  await saveStudent(student);
  await refresh();
  go(`/project/${project.id}`);
}
