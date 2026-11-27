import * as THREE from "three";
import { sampleMotion } from "./motion";
import "mind-ar/dist/mindar-image-three.prod.js";
import { C as Controller } from "mind-ar/dist/controller-mGt1s8dJ.js";

import { createPlanarAnchor, installPlanarObservations } from "../../src/features/public-ar/planarTrackingBridge";
import { postcardTemplateCatalog } from "../../src/features/postcards/postcardTemplates";
import type { Quad } from "../../src/features/public-ar/planarTracking";

const W = 640,
  H = 480;
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const viewport = $<HTMLDivElement>("viewport");
const status = $("status");
const base = import.meta.env.BASE_URL;
const params = {
  pitch: 0,
  yaw: 0,
  roll: 0,
  distance: 3,
  offset: 0,
  occlusion: 0,
  noise: 0,
  duplicate: 0,
  defocus: 0,
  motionStrength: 1,
  motionSpeed: 1,
};
let effectiveParams = { ...params };
let tremorTime = 0;
let motionTime = 0,
  motionClock = performance.now();
let scenario = "manual",
  scenarioStart = performance.now(),
  frame = 0,
  started = false;
let duplicateModel: THREE.Mesh;
let inputInFlight = false;
let model: THREE.Mesh,
  markerAspect = 2 / 3,
  controller: any,
  tracking: any;
let renderHandle = 0,
  cameraAt = -Infinity,
  noiseFrame = 0;
const noiseUniforms = { labNoise: { value: 0 }, labFrame: { value: 0 }, labDefocus: { value: 0 } };
let lastFrame = -Infinity,
  lastUi = 0;
const anchor = { visible: false, onTargetUpdate: undefined as undefined | (() => void) };
const runtime: { video?: HTMLVideoElement; controller?: any } = {};
const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
camera.position.z = 3;
const scene = new THREE.Scene();
scene.background = new THREE.Color("#8a8275");
const sourceRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
sourceRenderer.setSize(W, H);
sourceRenderer.setPixelRatio(1);
sourceRenderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.append(sourceRenderer.domElement);
// A monotonically stamped canvas frame exercises the production capture-time gate.
Object.defineProperty(sourceRenderer.domElement, "currentTime", { get: () => frame / 30 });
runtime.video = sourceRenderer.domElement as unknown as HTMLVideoElement;
const overlayRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
overlayRenderer.setSize(W, H);
overlayRenderer.setPixelRatio(1);
overlayRenderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.append(overlayRenderer.domElement);
const overlayScene = new THREE.Scene();
const overlayCamera = new THREE.Camera();
overlayCamera.projectionMatrix.copy(camera.projectionMatrix);
overlayCamera.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
const guides = document.createElement("canvas");
guides.width = W;
guides.height = H;
viewport.append(guides);
const ctx = guides.getContext("2d")!;
const read = installPlanarObservations(
  runtime,
  new AbortController().signal,
  true,
  (e) => {
    status.textContent = String(e);
  },
  true,
);
const localCorners = () => [
  new THREE.Vector3(-0.5, 0.5 / markerAspect, 0),
  new THREE.Vector3(0.5, 0.5 / markerAspect, 0),
  new THREE.Vector3(0.5, -0.5 / markerAspect, 0),
  new THREE.Vector3(-0.5, -0.5 / markerAspect, 0),
];
function truth(): Quad {
  return localCorners().map((p) => {
    p.applyMatrix4(model.matrixWorld).project(camera);
    return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
  }) as Quad;
}
function measured(): Quad | null {
  if (!tracking?.group.visible) return null;
  return localCorners().map((p) => {
    p.applyMatrix4(tracking.group.matrix).applyMatrix4(overlayCamera.projectionMatrix);
    return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
  }) as Quad;
}
function rms(a: Quad, b: Quad) {
  return Math.sqrt(a.reduce((s, p, i) => s + ((p.x - b[i].x) * W) ** 2 + ((p.y - b[i].y) * H) ** 2, 0) / 4);
}
type Sample = {
  time: number;
  scenario: string;
  frameTime: number;
  rawErrorPx: number;
  filteredErrorPx: number | null;
  visible: boolean;
  partial: boolean;
  truth: Quad;
  raw: Quad;
  filtered: Quad | null;
  worldCoords?: { x: number; y: number }[];
  screenCoords?: { x: number; y: number }[];
};
let samples: Sample[] = [];
let trackAttempts = 0,
  estimateRejects = 0,
  foundEvents = 0,
  lostEvents = 0;
let loopFrames = 0,
  visibleFrames = 0;
const captured = new WeakMap<object, Quad>(),
  truthByTime = new Map<number, Quad>();
const featuresByTime = new Map<number, { worldCoords: any[]; screenCoords: any[] }>();
const video = document.createElement("video");
video.src = base + "test-assets/fixtures/h264-aac.mp4";
video.muted = true;
video.loop = true;
video.playsInline = true;
// Fixture lives outside public; Vite serves it locally, never in production build.
video.src = base + "test-assets/fixtures/h264-aac.mp4";
const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
let videoPlane: THREE.Mesh;
let occluder: THREE.Mesh;
function drawQuad(q: Quad, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  q.forEach((p, i) => (i ? ctx.lineTo(p.x * W, p.y * H) : ctx.moveTo(p.x * W, p.y * H)));
  ctx.closePath();
  ctx.stroke();
}
function summary() {
  const valid = samples.filter((s) => s.filteredErrorPx !== null);
  return {
    version: 1,
    marker: {
      width: controller?.markerDimensions?.[0]?.[0] ?? null,
      height: controller?.markerDimensions?.[0]?.[1] ?? null,
      aspect: markerAspect,
    },
    parameters: { ...params },
    effectiveParameters: { ...effectiveParams },
    noiseSeed: 1,
    cameraFps: 30,
    motionTime,
    tremorTime,
    trackAttempts,
    estimateRejects,
    foundEvents,
    lostEvents,
    scenario,
    source: "real MindAR features + production planar bridge",
    input: { width: W, height: H },
    samples: samples.length,
    visibleFraction: loopFrames ? visibleFrames / loopFrames : 0,
    rawRmsPx: samples.length ? Math.sqrt(samples.reduce((s, p) => s + p.rawErrorPx ** 2, 0) / samples.length) : null,
    filteredRmsPx: valid.length
      ? Math.sqrt(valid.reduce((s, p) => s + p.filteredErrorPx! ** 2, 0) / valid.length)
      : null,
    filteredP95Px: valid.length
      ? [...valid.map((s) => s.filteredErrorPx!)].sort((a, b) => a - b)[Math.floor((valid.length - 1) * 0.95)]
      : null,
  };
}
function reset() {
  samples = [];
  trackAttempts = 0;
  estimateRejects = 0;
  foundEvents = 0;
  lostEvents = 0;
  loopFrames = 0;
  visibleFrames = 0;
  lastFrame = -Infinity;
}
function setScenario(value: string) {
  if (value === "manual" && scenario !== "manual") Object.assign(params, effectiveParams);
  scenario = value;
  scenarioStart = performance.now();
  motionClock = scenarioStart;
  motionTime = 0;
  tremorTime = 0;
  noiseFrame = 0;
  $<HTMLSelectElement>("scenario").value = value;
  reset();
}
function animate(now: number) {
  renderHandle = requestAnimationFrame(animate);
  if (!model) return;
  if (now - cameraAt >= 1000 / 30) {
    cameraAt = now;
    const motionDt = Math.max(0, (now - motionClock) / 1000);
    motionTime += motionDt * params.motionSpeed;
    tremorTime += motionDt * Math.min(params.motionSpeed, 12 / 11.1);
    motionClock = now;
    let p = { ...params };
    if (scenario === "front") p = { ...p, pitch: 0, yaw: 0, offset: 0, distance: 3 };
    if (scenario === "tilt30") p = { ...p, pitch: 30, yaw: 0, offset: 0, distance: 3 };
    if (scenario === "tilt50") p = { ...p, pitch: 50, yaw: 0, offset: 0, distance: 3 };
    if (scenario === "duplicate") p = { ...p, pitch: 30, yaw: 0, offset: 0, distance: 3, duplicate: 1 };
    const movement = sampleMotion(scenario, motionTime, params.motionStrength, tremorTime);
    if (movement) p = { ...p, ...movement };
    effectiveParams = { ...p };
    model.rotation.set(
      THREE.MathUtils.degToRad(p.pitch),
      THREE.MathUtils.degToRad(p.yaw),
      THREE.MathUtils.degToRad(p.roll),
    );
    model.position.x = p.offset;
    camera.position.z = p.distance;
    camera.updateMatrixWorld();
    model.updateMatrixWorld();
    if (duplicateModel) {
      duplicateModel.visible = p.duplicate > 0;
      duplicateModel.rotation.copy(model.rotation);
      duplicateModel.position.copy(model.localToWorld(new THREE.Vector3(1.03, 0, 0)));
      duplicateModel.updateMatrixWorld();
    }
    if (occluder) {
      occluder.visible = p.occlusion > 0;
      occluder.scale.x = p.occlusion / 100;
      occluder.position.x = -0.5 + p.occlusion / 200;
    }
    noiseUniforms.labNoise.value = params.noise / 255;
    noiseUniforms.labDefocus.value = params.defocus;
    noiseUniforms.labFrame.value = ++noiseFrame;
    sourceRenderer.render(scene, camera);
    frame++;
  }
  tracking?.update();
  overlayRenderer.render(overlayScene, overlayCamera);
  ctx.clearRect(0, 0, W, H);
  drawQuad(truth(), "#6affb3");
  const result = measured();
  if (result) drawQuad(result, "#ad77ff");
  if (started) {
    loopFrames++;
    if (result) visibleFrames++;
    const obs = read(0);
    if (obs && obs.frameTime !== lastFrame) {
      lastFrame = obs.frameTime!;
      const expected = truthByTime.get(lastFrame);
      if (expected) {
        samples.push({
          time: now,
          scenario,
          frameTime: lastFrame,
          rawErrorPx: rms(obs.corners, expected),
          filteredErrorPx: result ? rms(result, expected) : null,
          visible: !!result,
          partial: !!obs.partial,
          truth: expected,
          raw: obs.corners,
          filtered: result,
          ...featuresByTime.get(lastFrame),
        });
        featuresByTime.delete(lastFrame);
        if (samples.length > 20000) samples.shift();
      }
      truthByTime.delete(lastFrame);
    }
  }
  if (now - lastUi > 300) {
    lastUi = now;
    const s = summary();
    for (const key of Object.keys(params) as (keyof typeof params)[]) {
      const control = $<HTMLInputElement>(key);
      if (document.activeElement !== control) control.value = String(effectiveParams[key]);
      const output = document.getElementById(key + "Value");
      if (output) output.textContent = String(Math.round(effectiveParams[key] * 100) / 100);
    }
    $("metrics").textContent =
      `Состояние: ${result ? "цель найдена" : "поиск"} · кадров измерения: ${s.samples}\nОшибка сырых углов: ${s.rawRmsPx?.toFixed(2) ?? "—"} px\nОшибка после фильтра: ${s.filteredRmsPx?.toFixed(2) ?? "—"} px · p95: ${s.filteredP95Px?.toFixed(2) ?? "—"} px\nВидимость: ${(s.visibleFraction * 100).toFixed(1)}% · камера ${W} × ${H}`;
  }
}
// Diagnostic rendering mirrors the production 7%/10% rounded postcard mask.
// Tracking still imports the actual production bridge and filter above.
function roundedWindow() {
  const shape = new THREE.Shape();
  const x = 0.5,
    y = 0.5,
    rx = 0.07,
    ry = 0.1;
  shape.moveTo(-x + rx, -y);
  shape.lineTo(x - rx, -y);
  shape.quadraticCurveTo(x, -y, x, -y + ry);
  shape.lineTo(x, y - ry);
  shape.quadraticCurveTo(x, y, x - rx, y);
  shape.lineTo(-x + rx, y);
  shape.quadraticCurveTo(-x, y, -x, y - ry);
  shape.lineTo(-x, -y + ry);
  shape.quadraticCurveTo(-x, -y, -x + rx, -y);
  const result = new THREE.ShapeGeometry(shape, 6),
    uv = result.getAttribute("uv"),
    position = result.getAttribute("position");
  for (let i = 0; i < uv.count; i++) uv.setXY(i, position.getX(i) + x, position.getY(i) + y);
  return result;
}
async function timeout<T>(work: Promise<T>, milliseconds: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function start() {
  try {
    await startInternal();
  } catch (error) {
    status.textContent = String(error);
    $("start").removeAttribute("disabled");
    throw error;
  }
}
async function startInternal() {
  if (started) return;
  const button = $<HTMLButtonElement>("start");
  button.disabled = true;
  if (controller) {
    await timeout(
      new Promise<void>((resolve) => {
        const check = () => {
          if (!inputInFlight) resolve();
          else setTimeout(check, 20);
        };
        check();
      }),
      10000,
      "Предыдущий кадр не завершился. Перезагрузите стенд.",
    );
    started = true;
    motionClock = performance.now();
    reset();
    renderHandle = requestAnimationFrame(animate);
    controller.processVideo(sourceRenderer.domElement);
    void video.play();
    $("stop").removeAttribute("disabled");
    status.textContent = "MindAR запущен · локальная камера";
    return;
  }
  status.textContent = "Загрузка эталона…";

  const image = new Image();
  image.src = base + "postcards/milka-gift-v1.webp";
  await timeout(image.decode(), 15000, "Не удалось загрузить изображение эталона.");
  markerAspect = image.naturalWidth / image.naturalHeight;
  const texture = new THREE.Texture(image);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  const sourceMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
  sourceMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, noiseUniforms);
    shader.fragmentShader =
      "uniform float labNoise; uniform float labFrame; uniform float labDefocus;\n" +
      shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(labFrame * 0.37, labFrame * 0.71), vec2(12.9898,78.233))) * 43758.5453);
      gl_FragColor.rgb = clamp(gl_FragColor.rgb + (n * 2.0 - 1.0) * labNoise, 0.0, 1.0);
    `,
      );
  };
  sourceMaterial.onBeforeCompile = ((original) => (shader, renderer) => {
    original(shader, renderer);
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `#ifdef USE_MAP
      vec2 dx=dFdx(vMapUv)*labDefocus,dy=dFdy(vMapUv)*labDefocus;
      vec4 color=texture2D(map,vMapUv)*4.0;
      color+=texture2D(map,vMapUv+dx)*2.0+texture2D(map,vMapUv-dx)*2.0;
      color+=texture2D(map,vMapUv+dy)*2.0+texture2D(map,vMapUv-dy)*2.0;
      color+=texture2D(map,vMapUv+dx+dy)+texture2D(map,vMapUv+dx-dy)+texture2D(map,vMapUv-dx+dy)+texture2D(map,vMapUv-dx-dy);
      diffuseColor*=color/16.0;
    #endif`,
    );
  })(sourceMaterial.onBeforeCompile);
  model = new THREE.Mesh(new THREE.PlaneGeometry(1, 1 / markerAspect), sourceMaterial);
  duplicateModel = new THREE.Mesh(model.geometry, sourceMaterial);
  duplicateModel.visible = false;
  scene.add(duplicateModel);
  scene.add(model);
  occluder = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1 / markerAspect),
    new THREE.MeshBasicMaterial({ color: "#c5b8a7", side: THREE.DoubleSide }),
  );
  occluder.position.z = 0.005;
  model.add(occluder);
  occluder.visible = false;
  const url = new URL("./milka.mind", import.meta.url).href;
  controller = new Controller({
    inputWidth: W,
    inputHeight: H,
    filterMinCF: 1,
    filterBeta: 0,
    warmupTolerance: 7,
    missTolerance: 10,
    onUpdate: (event: any) => {
      if (event.type === "processDone") inputInFlight = false;
      if (event.type === "updateMatrix") {
        anchor.visible = !!event.worldMatrix;
        anchor.onTargetUpdate?.();
      }
    },
  });
  runtime.controller = controller;
  await timeout(controller.addImageTargets(url), 30000, "Данные распознавания не загрузились. Проверьте milka.mind.");
  URL.revokeObjectURL(url);
  const load = controller.inputLoader.loadInput.bind(controller.inputLoader);
  controller.inputLoader.loadInput = (input: any) => {
    inputInFlight = true;
    const q = truth();
    const tensor = load(input);
    captured.set(tensor, q);
    return tensor;
  };
  const track = controller.tracker.track.bind(controller.tracker);
  controller.tracker.track = (input: any, pose: any, index: number) => {
    const result = track(input, pose, index);
    trackAttempts++;
    const obs = read(index);
    if (!obs) estimateRejects++;
    const q = captured.get(input);
    if (obs && q) {
      truthByTime.set(obs.frameTime!, q);
      featuresByTime.set(obs.frameTime!, { worldCoords: result.worldCoords, screenCoords: result.screenCoords });
      if (truthByTime.size > 200) truthByTime.delete(truthByTime.keys().next().value!);
    }
    return result;
  };
  tracking = createPlanarAnchor({
    three: THREE,
    anchor,
    scene: overlayScene,
    camera: overlayCamera,
    container: viewport,
    readObservation: () => read(0),
    isTracking: () => !!controller.trackingStates[0]?.isTracking,
    onFound() {
      foundEvents++;
    },
    onLost() {
      lostEvents++;
    },
  });
  const template = postcardTemplateCatalog.find((item) => item.code === "milka-gift")!;
  const rect = template.previewFrame ?? template.frame;
  const geometry = {
    width: rect.width,
    height: rect.height / markerAspect,
    x: rect.x + rect.width / 2 - 0.5,
    y: (0.5 - rect.y - rect.height / 2) / markerAspect,
    z: 0,
    aspectRatio: (markerAspect * rect.width) / rect.height,
  };
  videoPlane = new THREE.Mesh(
    roundedWindow(),
    new THREE.MeshBasicMaterial({ map: videoTexture, depthTest: false, depthWrite: false, toneMapped: false }),
  );
  videoPlane.position.set(geometry.x, geometry.y, geometry.z);
  videoPlane.scale.set(geometry.width, geometry.height, 1);
  videoPlane.frustumCulled = false;
  const fitVideo = () => {
    if (!video.videoWidth) return;
    const ratio = video.videoWidth / video.videoHeight / geometry.aspectRatio;
    const fit = {
      repeatX: Math.min(1, 1 / ratio),
      repeatY: Math.min(1, ratio),
      offsetX: (1 - Math.min(1, 1 / ratio)) / 2,
      offsetY: (1 - Math.min(1, ratio)) / 2,
    };
    videoTexture.repeat.set(fit.repeatX, fit.repeatY);
    videoTexture.offset.set(fit.offsetX, fit.offsetY);
  };
  video.addEventListener("loadedmetadata", fitVideo);
  fitVideo();
  tracking.group.add(videoPlane);
  await video.play().catch(() => undefined);
  started = true;
  scenarioStart = performance.now();
  motionClock = scenarioStart;
  motionTime = 0;
  tremorTime = 0;
  noiseFrame = 0;
  reset();
  controller.processVideo(sourceRenderer.domElement);
  status.textContent = "MindAR запущен · локальная камера";
  button.textContent = "Распознавание запущено";
  $("stop").removeAttribute("disabled");
}
function stop() {
  controller?.stopProcessVideo();
  started = false;
  cancelAnimationFrame(renderHandle);
  video.pause();
  $("stop").setAttribute("disabled", "");
  $("start").removeAttribute("disabled");
  $("start").textContent = "Продолжить";
  status.textContent = "Остановлено · GPU-цикл приостановлен";
}
$("stop").addEventListener("click", stop);
window.addEventListener("pagehide", () => {
  stop();
  controller?.dispose();
});
for (const key of Object.keys(params) as (keyof typeof params)[]) {
  const input = $<HTMLInputElement>(key);
  input.addEventListener("input", () => {
    const value = Number(input.value);
    if (key !== "motionSpeed" && key !== "motionStrength") setScenario("manual");
    params[key] = value;
    const output = document.getElementById(key + "Value");
    if (output) output.textContent = input.value;
  });
}
$("scenario").addEventListener("change", () => setScenario($<HTMLSelectElement>("scenario").value));
$("start").addEventListener("click", () =>
  start().catch((e) => {
    status.textContent = String(e);
    console.error(e);
  }),
);
$("showVideo").addEventListener("change", () => {
  if (videoPlane) videoPlane.visible = $<HTMLInputElement>("showVideo").checked;
});
let localVideoUrl: string | null = null;
$("videoFile").addEventListener("change", () => {
  const file = $<HTMLInputElement>("videoFile").files?.[0];
  if (!file) return;
  if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
  localVideoUrl = URL.createObjectURL(file);
  video.src = localVideoUrl;
  void video.play();
});
$("export").addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify({ summary: summary(), samples }, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "ar-lab-" + scenario + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
Object.assign(window, {
  __arLab: {
    start,
    stop,
    setScenario,
    setParameters: (p: Partial<typeof params>) => {
      setScenario("manual");
      Object.assign(params, p);
    },
    reset,
    summary,
    samples: () => samples,
    cameraFrame: () => sourceRenderer.domElement.toDataURL("image/png"),
    ready: () => started,
  },
});
renderHandle = requestAnimationFrame(animate);
status.textContent = "Готов к запуску";
