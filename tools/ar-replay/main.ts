import * as THREE from "three";
import JSZip from "jszip";
import "mind-ar/dist/mindar-image-three.prod.js";
import { C as Controller } from "mind-ar/dist/controller-mGt1s8dJ.js";
import { createPlanarAnchor, installPlanarObservations } from "../../src/features/public-ar/planarTrackingBridge";
import type { Quad } from "../../src/features/public-ar/planarTracking";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const video = $<HTMLVideoElement>("source"),
  canvas = $<HTMLCanvasElement>("guides"),
  viewport = $("viewport");
const ctx = canvas.getContext("2d")!;
type TraceSample = {
  elapsedMs: number;
  found: boolean;
  renderedMatrix: number[];
  projectionMatrix: number[];
  viewport: { width: number; height: number };
  input?: { width: number; height: number };
};
type Diagnostic = {
  durationMs: number;
  targets?: {
    width: number;
    height: number;
    videoViewport?: { x: number; y: number; width: number; height: number };
  }[];
  samples: TraceSample[];
};
type Sample = {
  videoTime: number;
  performanceTime: number;
  observationVideoTime: number | null;
  processingMs: number | null;
  visible: boolean;
  raw: Quad | null;
  filtered: Quad | null;
  recorded: Quad | null;
};
let diagnostic: Diagnostic | null = null,
  targetBlob: Blob | null = null,
  sourceUrl: string | null = null;
let controller: any,
  tracking: ReturnType<typeof createPlanarAnchor> | null = null,
  lifetime: AbortController | null = null;
let read: ReturnType<typeof installPlanarObservations> | null = null;
let running = false,
  busy = false,
  inFlight = false,
  renderHandle = 0,
  markerAspect = 2 / 3,
  startVideoTime = 0,
  startPerformance = 0;
let foundEvents = 0,
  lostEvents = 0,
  attempts = 0,
  rejected = 0,
  lastSample = -Infinity;
let samples: Sample[] = [];
let features: Array<{
  videoTime: number;
  performanceTime: number;
  capturePerformanceTime: number;
  targetIndex: number;
  anchorVisible: boolean;
  vendorTracking: boolean;
  accepted: boolean;
  partial: boolean;
  worldCount: number;
  screenCount: number;
  worldSpan: { x: number; y: number };
  screenSpan: { x: number; y: number };
  worldCoords: { x: number; y: number }[];
  screenCoords: { x: number; y: number }[];
  pose: unknown;
  corners: Quad | null;
  frameTime: number | null;
  observationTime: number | null;
  input: { width: number; height: number } | null;
}> = [];
const span = (points: { x: number; y: number }[], w: number, h: number) =>
  points.length
    ? {
        x: (Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x))) / w,
        y: (Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y))) / h,
      }
    : { x: 0, y: 0 };
const frameMediaTime = new Map<number, number>();
const anchor = { visible: false, onTargetUpdate: undefined as undefined | (() => void) };
const scene = new THREE.Scene(),
  camera = new THREE.Camera();
function status(text: string) {
  $("status").textContent = text;
}
function controls() {
  $<HTMLButtonElement>("start").disabled = !targetBlob || running || busy;
  $<HTMLButtonElement>("pause").disabled = !running || busy;
  $<HTMLButtonElement>("restart").disabled = !targetBlob || busy;
  $<HTMLInputElement>("archive").disabled = busy;
  $<HTMLInputElement>("seek").disabled = !targetBlob || busy;
}
function timeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (x) => {
        clearTimeout(t);
        resolve(x);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}
function localCorners() {
  return [
    [-0.5, 0.5 / markerAspect],
    [0.5, 0.5 / markerAspect],
    [0.5, -0.5 / markerAspect],
    [-0.5, -0.5 / markerAspect],
  ];
}
function projected(matrix: THREE.Matrix4, projection: THREE.Matrix4): Quad {
  return localCorners().map(([x, y]) => {
    const v = new THREE.Vector3(x, y, 0).applyMatrix4(matrix).applyMatrix4(projection);
    return { x: (v.x + 1) / 2, y: (1 - v.y) / 2 };
  }) as Quad;
}
function recordedQuad(time: number): Quad | null {
  const list = diagnostic?.samples;
  if (!list?.length) return null;
  const ms = (time + Number($<HTMLInputElement>("offset").value)) * 1000;
  let nearest = list[0];
  for (const item of list) {
    if (Math.abs(item.elapsedMs - ms) < Math.abs(nearest.elapsedMs - ms)) nearest = item;
  }
  if (Math.abs(nearest.elapsedMs - ms) > 160 || !nearest.found) return null;
  const q = projected(
    new THREE.Matrix4().fromArray(nearest.renderedMatrix),
    new THREE.Matrix4().fromArray(nearest.projectionMatrix),
  );
  // Original viewer used CSS cover; undo its small crop to return to native camera pixels.
  const iw = nearest.input?.width ?? video.videoWidth,
    ih = nearest.input?.height ?? video.videoHeight;
  const vw = nearest.viewport.width,
    vh = nearest.viewport.height,
    k = Math.max(vw / iw, vh / ih);
  return q.map((p) => ({
    x: (p.x * vw + (iw * k - vw) / 2) / (iw * k),
    y: (p.y * vh + (ih * k - vh) / 2) / (ih * k),
  })) as Quad;
}
function drawQuad(q: Quad | null, color: string) {
  if (!q) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, video.videoWidth / 240);
  ctx.beginPath();
  q.forEach((p, i) => {
    const x = p.x * canvas.width,
      y = p.y * canvas.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.stroke();
}
function summary() {
  return {
    source: "recorded camera pixels + real MindAR + production planar bridge",
    running,
    ready: !!targetBlob,
    videoTime: video.currentTime,
    duration: video.duration || 0,
    width: video.videoWidth,
    height: video.videoHeight,
    foundEvents,
    lostEvents,
    attempts,
    rejected,
    samples: samples.length,
    startVideoTime,
    startPerformance,
    alignment: "original trace elapsedMs vs encoded-video time is approximate",
  };
}
function draw() {
  tracking?.update();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const filtered = tracking?.group.visible ? projected(tracking.group.matrix, camera.projectionMatrix) : null;
  const recorded = recordedQuad(video.currentTime);
  drawQuad(filtered, "#31e86b");
  if ($<HTMLInputElement>("recorded").checked) drawQuad(recorded, "#b969ff");
  const now = performance.now();
  if (running && now - lastSample >= 33 && samples.length < 10000) {
    lastSample = now;
    const obs = read?.(0);
    samples.push({
      videoTime: video.currentTime,
      performanceTime: now,
      observationVideoTime: obs?.frameTime === undefined ? null : (frameMediaTime.get(obs.frameTime) ?? null),
      processingMs: obs ? obs.time - (obs.frameTime ?? obs.time) : null,
      visible: !!filtered,
      raw: obs?.corners ?? null,
      filtered,
      recorded,
    });
  }
  $("time").textContent = `${video.currentTime.toFixed(2)} с`;
  if (!$<HTMLInputElement>("seek").matches(":active")) $<HTMLInputElement>("seek").value = String(video.currentTime);
  $("metrics").textContent = JSON.stringify(summary(), null, 2);
  if (running) renderHandle = requestAnimationFrame(draw);
}
async function destroy() {
  running = false;
  cancelAnimationFrame(renderHandle);
  video.pause();
  controller?.stopProcessVideo();
  const deadline = performance.now() + 5000;
  while (inFlight && performance.now() < deadline) await new Promise((r) => setTimeout(r, 10));
  if (inFlight) throw new Error("Старый проход распознавания ещё занят. Перезагрузите стенд.");
  lifetime?.abort();
  tracking?.dispose();
  tracking = null;
  controller?.dispose();
  controller = undefined;
  read = null;
  anchor.visible = false;
  anchor.onTargetUpdate = undefined;
}
async function build() {
  lifetime = new AbortController();
  const runtime: { video?: HTMLVideoElement; controller?: any } = { video };
  read = installPlanarObservations(
    runtime,
    lifetime.signal,
    true,
    (e) => status(`Ошибка распознавания: ${String(e)}`),
    true,
  );
  controller = new Controller({
    inputWidth: video.videoWidth,
    inputHeight: video.videoHeight,
    filterMinCF: 1,
    filterBeta: 0,
    warmupTolerance: 7,
    missTolerance: 10,
    onUpdate: (event: any) => {
      if (event.type === "processDone") inFlight = false;
      if (event.type === "updateMatrix") {
        anchor.visible = !!event.worldMatrix;
        anchor.onTargetUpdate?.();
      }
    },
  });
  runtime.controller = controller;
  const url = URL.createObjectURL(targetBlob!);
  try {
    await timeout(controller.addImageTargets(url), 30000, "Не удалось загрузить target.mind");
  } finally {
    URL.revokeObjectURL(url);
  }
  camera.projectionMatrix.fromArray(controller.getProjectionMatrix());
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  const captureTimes = new WeakMap<object, number>();
  const capturePerformanceTimes = new WeakMap<object, number>();
  const load = controller.inputLoader.loadInput.bind(controller.inputLoader);
  controller.inputLoader.loadInput = (input: HTMLVideoElement) => {
    inFlight = true;
    const capturePerformanceTime = performance.now();
    const captureMediaTime = input.currentTime;
    const tensor = load(input);
    captureTimes.set(tensor, captureMediaTime);
    capturePerformanceTimes.set(tensor, capturePerformanceTime);
    return tensor;
  };
  const track = controller.tracker.track.bind(controller.tracker);
  controller.tracker.track = (input: object, pose: any, index: number) => {
    const result = track(input, pose, index);
    attempts++;
    const obs = read?.(index);
    if (features.length < 4000) {
      const worldCoords = (result.worldCoords ?? []).map((p: { x: number; y: number }) => ({ x: p.x, y: p.y }));
      const screenCoords = (result.screenCoords ?? []).map((p: { x: number; y: number }) => ({ x: p.x, y: p.y }));
      const marker = controller.markerDimensions?.[index] ?? [1200, 1800];
      features.push({
        videoTime: captureTimes.get(input) ?? video.currentTime,
        performanceTime: performance.now(),
        capturePerformanceTime: capturePerformanceTimes.get(input) ?? performance.now(),
        targetIndex: index,
        anchorVisible: anchor.visible,
        vendorTracking: !!controller.trackingStates[index]?.isTracking,
        accepted: !!obs,
        partial: !!obs?.partial,
        worldCount: worldCoords.length,
        screenCount: screenCoords.length,
        worldSpan: span(worldCoords, marker[0], marker[1]),
        screenSpan: span(screenCoords, video.videoWidth, video.videoHeight),
        worldCoords: worldCoords.slice(0, 200),
        screenCoords: screenCoords.slice(0, 200),
        pose: structuredClone(pose),
        corners: obs?.corners ?? null,
        frameTime: obs?.frameTime ?? null,
        observationTime: obs?.time ?? null,
        input: obs?.input ?? null,
      });
    }
    if (!obs) rejected++;
    else if (obs.frameTime !== undefined) {
      frameMediaTime.set(obs.frameTime, captureTimes.get(input) ?? video.currentTime);
      if (frameMediaTime.size > 200) frameMediaTime.delete(frameMediaTime.keys().next().value!);
    }
    return result;
  };
  tracking = createPlanarAnchor({
    three: THREE,
    anchor,
    scene,
    camera,
    container: viewport,
    readObservation: () => read?.(0),
    isTracking: () => !!controller.trackingStates[0]?.isTracking,
    onFound: () => foundEvents++,
    onLost: () => lostEvents++,
  });
}
async function start() {
  if (busy || running || !targetBlob) return;
  busy = true;
  controls();
  try {
    await destroy();
    await build();
    startPerformance = performance.now();
    startVideoTime = video.currentTime;
    running = true;
    await video.play();
    controller.processVideo(video);
    draw();
    status("Повтор идёт: зелёный контур — новый прогон.");
  } catch (e) {
    running = false;
    status(e instanceof Error ? e.message : String(e));
    throw e;
  } finally {
    busy = false;
    controls();
  }
}
async function pause() {
  if (busy) return;
  busy = true;
  controls();
  try {
    await destroy();
    draw();
    status("Пауза. Продолжение начнёт захват цели заново.");
  } finally {
    busy = false;
    controls();
  }
}
async function restart() {
  if (busy || !targetBlob) return;
  await pause();
  video.currentTime = 0;
  samples = [];
  features = [];
  foundEvents = 0;
  lostEvents = 0;
  attempts = 0;
  rejected = 0;
  lastSample = -Infinity;
  frameMediaTime.clear();
  await start();
}
async function loadArchive(file: File) {
  if (busy) throw new Error("Дождитесь остановки");
  busy = true;
  controls();
  try {
    await destroy();
    targetBlob = null;
    diagnostic = null;
    if (file.size > 80 * 1024 * 1024) throw new Error("Архив больше 80 МБ");
    status("Читаем архив…");
    const zip = await JSZip.loadAsync(file);
    const cameraFile = zip.file("camera.mp4") ?? zip.file("camera.webm"),
      target = zip.file("target-0.mind"),
      report = zip.file("diagnostics.json");
    if (!cameraFile || !target || !report)
      throw new Error("В ZIP нужны camera.mp4/webm, target-0.mind и diagnostics.json");
    const parsed = JSON.parse(await report.async("string")) as Diagnostic;
    if (
      !Array.isArray(parsed.samples) ||
      parsed.samples.length > 5000 ||
      parsed.samples.some(
        (s) =>
          !Number.isFinite(s.elapsedMs) ||
          !Array.isArray(s.renderedMatrix) ||
          s.renderedMatrix.length !== 16 ||
          !s.renderedMatrix.every(Number.isFinite) ||
          !Array.isArray(s.projectionMatrix) ||
          s.projectionMatrix.length !== 16 ||
          !s.projectionMatrix.every(Number.isFinite) ||
          !(s.viewport?.width > 0 && s.viewport?.height > 0),
      )
    )
      throw new Error("Некорректный журнал матриц");
    const media = await cameraFile.async("uint8array"),
      mind = await target.async("uint8array");
    if (media.byteLength > 60 * 1024 * 1024 || mind.byteLength > 20 * 1024 * 1024)
      throw new Error("Файлы превышают лимит стенда");
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = URL.createObjectURL(
      new Blob([media as BlobPart], { type: cameraFile.name.endsWith("mp4") ? "video/mp4" : "video/webm" }),
    );
    await timeout(
      new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Видео не читается браузером"));
        video.src = sourceUrl!;
        video.load();
      }),
      15000,
      "Видео не загрузилось",
    );
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    viewport.style.aspectRatio = `${video.videoWidth}/${video.videoHeight}`;
    targetBlob = new Blob([mind as BlobPart]);
    diagnostic = parsed;
    markerAspect = (parsed.targets?.[0]?.width ?? 1200) / (parsed.targets?.[0]?.height ?? 1800);
    if (!Number.isFinite(markerAspect) || markerAspect <= 0) throw new Error("Некорректный размер мишени");
    samples = [];
    features = [];
    foundEvents = 0;
    lostEvents = 0;
    attempts = 0;
    rejected = 0;
    lastSample = -Infinity;
    frameMediaTime.clear();
    $<HTMLInputElement>("seek").max = String(video.duration);
    $("export").removeAttribute("disabled");
    draw();
    status(`Готово: ${video.videoWidth} × ${video.videoHeight}, ${video.duration.toFixed(1)} с`);
  } catch (e) {
    targetBlob = null;
    status(e instanceof Error ? e.message : String(e));
    throw e;
  } finally {
    busy = false;
    controls();
  }
}
$("archive").addEventListener("change", () => {
  const file = $<HTMLInputElement>("archive").files?.[0];
  if (file) void loadArchive(file).catch(() => undefined);
});
$("start").addEventListener("click", () => void start().catch(() => undefined));
$("pause").addEventListener("click", () => void pause().catch(() => undefined));
$("restart").addEventListener("click", () => void restart().catch(() => undefined));
$("seek").addEventListener("change", () => {
  const time = Number($<HTMLInputElement>("seek").value);
  void pause().then(() => {
    video.currentTime = time;
    draw();
  });
});
video.addEventListener("seeked", () => {
  if (!running) draw();
});
video.addEventListener("ended", () => void pause());
$("speed").addEventListener("change", () => {
  video.playbackRate = Number($<HTMLSelectElement>("speed").value);
});
$("offset").addEventListener("input", () => {
  $("offsetValue").textContent = `${Number($<HTMLInputElement>("offset").value).toFixed(2)} с`;
  if (!running) draw();
});
$("recorded").addEventListener("change", () => {
  if (!running) draw();
});
$("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ summary: summary(), samples, features })], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ar-camera-replay.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
window.addEventListener("pagehide", () => {
  running = false;
  video.pause();
  controller?.stopProcessVideo();
  lifetime?.abort();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
});
Object.assign(window, {
  __arReplay: {
    loadArchive,
    start,
    pause,
    restart,
    summary,
    samples: () => samples,
    features: () => features,
    ready: () => !!targetBlob && !busy,
  },
});
