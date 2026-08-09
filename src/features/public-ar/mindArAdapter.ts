import type * as ThreeModule from "three";
import { publicArTargets, type PublicArManifest, type PublicArTarget } from "./publicManifest";
import { videoMilestones, type PublicArAnalyticsEvent } from "./telemetry";
import { createArRecordingEngine, type ArRecording, type ArRecordingEngine } from "./arRecording";

export type PublicArTrackingState = "searching" | "tracking";

export const publicArTrackingConfig = Object.freeze({
  filterMinCF: 0.001,
  filterBeta: 20,
  warmupTolerance: 7,
  missTolerance: 10,
});

export const publicArCameraConstraints = Object.freeze({
  width: { ideal: 1280, max: 1280 },
  height: { ideal: 720, max: 720 },
  frameRate: { ideal: 30, max: 30 },
});

export const PUBLIC_AR_START_TIMEOUT_MS = 45_000;

export type MarkerDimensions = { width: number; height: number };

type ColorManagedRenderer = { outputColorSpace: string };
type ColorManagedTexture = { colorSpace: string };
type LegacyThreeColorModule = {
  WebGLRenderer: { prototype: object };
  sRGBEncoding: number;
  LinearEncoding: number;
  SRGBColorSpace: string;
  LinearSRGBColorSpace: string;
};

const mindArColorBridge = Symbol.for("ar-photo.mind-ar-color-bridge");

export function installMindArColorCompatibility(Three: LegacyThreeColorModule) {
  const prototype = Three.WebGLRenderer.prototype as object & { [mindArColorBridge]?: boolean };
  if (prototype[mindArColorBridge]) return false;
  const legacyDescriptor = Object.getOwnPropertyDescriptor(prototype, "outputEncoding");
  if (!legacyDescriptor?.configurable) return false;

  Object.defineProperty(prototype, "outputEncoding", {
    configurable: true,
    enumerable: legacyDescriptor.enumerable,
    get(this: ColorManagedRenderer) {
      return this.outputColorSpace === Three.SRGBColorSpace ? Three.sRGBEncoding : Three.LinearEncoding;
    },
    set(this: ColorManagedRenderer, encoding: number) {
      this.outputColorSpace = encoding === Three.sRGBEncoding ? Three.SRGBColorSpace : Three.LinearSRGBColorSpace;
    },
  });
  Object.defineProperty(prototype, mindArColorBridge, { configurable: true, value: true });
  return true;
}

export function configureSrgbVideoOutput(
  renderer: ColorManagedRenderer,
  texture: ColorManagedTexture,
  srgbColorSpace: string,
) {
  renderer.outputColorSpace = srgbColorSpace;
  texture.colorSpace = srgbColorSpace;
}

export function resolveMarkerDimensions(
  manifestMarker: MarkerDimensions,
  trackingDimensions?: readonly (readonly [number, number])[],
) {
  const [trackingWidth, trackingHeight] = trackingDimensions?.[0] ?? [];
  if (
    typeof trackingWidth === "number" &&
    typeof trackingHeight === "number" &&
    Number.isFinite(trackingWidth) &&
    Number.isFinite(trackingHeight) &&
    trackingWidth > 0 &&
    trackingHeight > 0
  ) {
    return { width: trackingWidth, height: trackingHeight };
  }
  return manifestMarker;
}

export function markerPlaneGeometry(marker: MarkerDimensions) {
  if (!Number.isFinite(marker.width) || !Number.isFinite(marker.height) || marker.width <= 0 || marker.height <= 0) {
    throw new Error("Invalid marker geometry");
  }
  return {
    width: 1,
    height: marker.height / marker.width,
    z: 0,
  } as const;
}

export function coverTextureTransform(videoAspectRatio: number, markerAspectRatio: number) {
  if (
    !Number.isFinite(videoAspectRatio) ||
    !Number.isFinite(markerAspectRatio) ||
    videoAspectRatio <= 0 ||
    markerAspectRatio <= 0
  ) {
    throw new Error("Invalid texture aspect ratio");
  }
  if (videoAspectRatio > markerAspectRatio) {
    const repeatX = markerAspectRatio / videoAspectRatio;
    return { repeatX, repeatY: 1, offsetX: (1 - repeatX) / 2, offsetY: 0 };
  }
  if (videoAspectRatio < markerAspectRatio) {
    const repeatY = videoAspectRatio / markerAspectRatio;
    return { repeatX: 1, repeatY, offsetX: 0, offsetY: (1 - repeatY) / 2 };
  }
  return { repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 };
}

export type PublicArSession = {
  readonly recordingSupported: boolean;
  setMuted(muted: boolean): void;
  togglePlayback(): Promise<boolean>;
  startRecording(): void;
  stopRecording(): Promise<ArRecording>;
  stop(): void;
};

export function isIosWebKit(userAgent = navigator.userAgent, maxTouchPoints = navigator.maxTouchPoints) {
  return /iphone|ipad|ipod/i.test(userAgent) || (/macintosh/i.test(userAgent) && maxTouchPoints > 1);
}

export function boundedCameraConstraints(constraints: MediaStreamConstraints = {}): MediaStreamConstraints {
  if (constraints.video === false) return constraints;
  const requested = typeof constraints.video === "object" ? constraints.video : {};
  return {
    ...constraints,
    video: { ...requested, ...publicArCameraConstraints },
  };
}

export async function startPublicMindAr(options: {
  container: HTMLDivElement;
  manifest: PublicArManifest;
  muted: boolean;
  playbackVideo?: HTMLVideoElement;
  playbackVideos?: HTMLVideoElement[];
  onTrackingState(state: PublicArTrackingState): void;
  onPlaybackEvent(event: PublicArAnalyticsEvent, valueSeconds?: number | null, errorCode?: string | null): void;
}): Promise<PublicArSession> {
  const { container, manifest, onTrackingState, onPlaybackEvent } = options;
  const targets = publicArTargets(manifest);
  const videos =
    options.playbackVideos ??
    (options.playbackVideo ? [options.playbackVideo] : createPublicArPlaybackVideos(manifest, options.muted));
  if (videos.length !== targets.length) throw new Error("AR playback target count mismatch");
  targets.forEach((target, index) => configurePlaybackVideo(videos[index], target, options.muted));

  const [{ MindARThree }, THREE, trackingAssets] = await Promise.all([
    import("mind-ar/dist/mindar-image-three.prod.js"),
    import("three"),
    Promise.all(targets.map((target) => fetchTrackingAsset(target.assets.trackingAssetUrl))),
  ]);
  const Three = THREE as typeof ThreeModule;

  // MindAR 1.2.5 still writes the removed Three.js `outputEncoding` property.
  // Bridge that write to the current color-space API before MindAR creates its
  // renderer, then explicitly keep both renderer output and video input in sRGB.
  installMindArColorCompatibility(Three);

  const mergedTrackingAsset = await mergeTrackingAssets(trackingAssets);
  const trackingAssetUrl = URL.createObjectURL(mergedTrackingAsset);

  const mindar = new MindARThree({
    container,
    imageTargetSrc: trackingAssetUrl,
    uiLoading: "no",
    uiScanning: "no",
    uiError: "no",
    maxTrack: 1,
    ...publicArTrackingConfig,
  });
  const { renderer, scene, camera } = mindar;
  renderer.setPixelRatio?.(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  let stopped = false;
  let activeTargetIndex = 0;
  let targetVisible = false;
  const runtimes = targets.map((target, index) => {
    const video = videos[index];
    const texture = new Three.VideoTexture(video);
    configureSrgbVideoOutput(renderer, texture, Three.SRGBColorSpace);
    let activeMarker: MarkerDimensions = target.marker;
    const markerGeometry = markerPlaneGeometry(activeMarker);
    const geometry = new Three.PlaneGeometry(markerGeometry.width, markerGeometry.width);
    const material = new Three.MeshBasicMaterial({
      map: texture,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    const plane = new Three.Mesh(geometry, material);
    plane.position.set(0, 0, markerGeometry.z);
    plane.scale.set(1, markerGeometry.height, 1);
    plane.frustumCulled = false;
    plane.renderOrder = 1;
    const anchor = mindar.addAnchor(index);
    anchor.group.add(plane);
    const fitVideoToMarker = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      const transform = coverTextureTransform(
        video.videoWidth / video.videoHeight,
        activeMarker.width / activeMarker.height,
      );
      texture.repeat.set(transform.repeatX, transform.repeatY);
      texture.offset.set(transform.offsetX, transform.offsetY);
      texture.needsUpdate = true;
    };
    const playbackStarted = () => onPlaybackEvent("playback_started", video.currentTime);
    const playbackProgress = () => {
      for (const event of videoMilestones(video.currentTime, video.duration)) {
        onPlaybackEvent(event, video.currentTime);
      }
    };
    const playbackEnded = () => onPlaybackEvent("completed", video.duration || video.currentTime);
    const playbackError = () => onPlaybackEvent("error", null, "playback_failed");
    video.addEventListener("loadedmetadata", fitVideoToMarker);
    video.addEventListener("play", playbackStarted);
    video.addEventListener("timeupdate", playbackProgress);
    video.addEventListener("ended", playbackEnded);
    video.addEventListener("error", playbackError);
    fitVideoToMarker();
    anchor.onTargetFound = () => {
      activeTargetIndex = index;
      targetVisible = true;
      videos.forEach((candidate, candidateIndex) => {
        if (candidateIndex !== index) candidate.pause();
      });
      anchor.group.visible = true;
      onTrackingState("tracking");
      if (target.behavior.autoplay) video.play().catch(() => undefined);
    };
    anchor.onTargetLost = () => {
      anchor.group.visible = false;
      if (activeTargetIndex === index) {
        targetVisible = false;
        onTrackingState("searching");
      }
      if (target.behavior.markerLost === "pause_hide") video.pause();
      if (target.behavior.markerLost === "stop_reset") {
        video.pause();
        video.currentTime = 0;
      }
    };
    return {
      target,
      video,
      texture,
      geometry,
      material,
      plane,
      setMarker(marker: MarkerDimensions) {
        activeMarker = marker;
      },
      fitVideoToMarker,
      dispose() {
        video.pause();
        video.removeEventListener("loadedmetadata", fitVideoToMarker);
        video.removeEventListener("play", playbackStarted);
        video.removeEventListener("timeupdate", playbackProgress);
        video.removeEventListener("ended", playbackEnded);
        video.removeEventListener("error", playbackError);
        video.removeAttribute("src");
        video.load();
        texture.dispose();
        geometry.dispose();
        material.dispose();
      },
    };
  });
  const visibility = () => {
    if (document.hidden) {
      videos.forEach((video) => video.pause());
    } else if (targetVisible) {
      const runtime = runtimes[activeTargetIndex];
      if (runtime.target.behavior.autoplay) runtime.video.play().catch(() => undefined);
    }
  };
  document.addEventListener("visibilitychange", visibility);

  let recordingEngine: ArRecordingEngine | null = null;
  try {
    await startMindArWithVisibleCamera(mindar);
    runtimes.forEach((runtime, index) => {
      const marker = resolveMarkerDimensions(
        runtime.target.marker,
        mindar.controller?.markerDimensions?.slice(index, index + 1),
      );
      const markerGeometry = markerPlaneGeometry(marker);
      runtime.setMarker(marker);
      runtime.plane.scale.set(1, markerGeometry.height, 1);
      runtime.fitVideoToMarker();
    });
    keepCameraVisible(mindar);
    if (mindar.video && renderer.domElement) {
      recordingEngine = createArRecordingEngine({
        cameraVideo: mindar.video,
        rendererCanvas: renderer.domElement,
        playbackVideo: () => runtimes[activeTargetIndex].video,
      });
    }
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
      recordingEngine?.drawFrame();
    });
    onTrackingState("searching");
  } catch (error) {
    document.removeEventListener("visibilitychange", visibility);
    renderer.setAnimationLoop(null);
    stopMindAr(mindar);
    runtimes.forEach((runtime) => runtime.dispose());
    URL.revokeObjectURL(trackingAssetUrl);
    container.replaceChildren();
    throw error;
  }

  return {
    get recordingSupported() {
      return recordingEngine?.supported ?? false;
    },
    setMuted(muted) {
      videos.forEach((video) => {
        video.muted = muted;
        video.defaultMuted = muted;
        video.toggleAttribute("muted", muted);
      });
      if (!muted && targetVisible) runtimes[activeTargetIndex].video.play().catch(() => undefined);
    },
    async togglePlayback() {
      const video = runtimes[activeTargetIndex].video;
      if (video.paused) {
        await video.play();
        return true;
      }
      video.pause();
      return false;
    },
    startRecording() {
      recordingEngine?.start();
    },
    stopRecording() {
      if (!recordingEngine) {
        return Promise.reject(new DOMException("Screen recording unavailable", "NotSupportedError"));
      }
      return recordingEngine.stop();
    },
    stop() {
      if (stopped) return;
      stopped = true;
      document.removeEventListener("visibilitychange", visibility);
      renderer.setAnimationLoop(null);
      recordingEngine?.dispose();
      stopMindAr(mindar);
      runtimes.forEach((runtime) => runtime.dispose());
      URL.revokeObjectURL(trackingAssetUrl);
      container.replaceChildren();
    },
  };
}

export function createPublicArPlaybackVideo(manifest: PublicArManifest, muted: boolean) {
  return createPublicArPlaybackVideos(manifest, muted)[0];
}

export function createPublicArPlaybackVideos(manifest: PublicArManifest, muted: boolean) {
  return publicArTargets(manifest).map((target) => createPlaybackVideo(target, muted));
}

function createPlaybackVideo(target: PublicArTarget, muted: boolean) {
  const video = document.createElement("video");
  configurePlaybackVideo(video, target, muted);
  // This function is called directly from the camera permission gesture. A
  // play/pause on the final media element preserves Safari's audio grant while
  // QR pairing and asset caching continue asynchronously.
  if (!muted) {
    void video
      .play()
      .then(() => {
        video.pause();
        video.currentTime = 0;
      })
      .catch(() => undefined);
  }
  return video;
}

function configurePlaybackVideo(video: HTMLVideoElement, target: PublicArTarget, muted: boolean) {
  video.loop = target.behavior.loop;
  video.muted = muted;
  video.defaultMuted = muted;
  video.toggleAttribute("muted", muted);
  video.autoplay = false;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.disablePictureInPicture = true;
  video.setAttribute("webkit-playsinline", "");
  if (video.src !== target.assets.videoUrl) {
    video.src = target.assets.videoUrl;
    video.load();
  }
}

function stopMindAr(mindar: {
  stop(): void;
  controller?: { dispose?: () => void };
  renderer: { dispose?: () => void; forceContextLoss?: () => void };
}) {
  try {
    mindar.stop();
  } catch {
    // MindAR can fail before its camera controller is fully initialized.
  }
  try {
    mindar.controller?.dispose?.();
  } catch {
    // A partially initialized worker must not block the remaining teardown.
  }
  mindar.renderer.dispose?.();
  mindar.renderer.forceContextLoss?.();
}

export function keepCameraVisible(mindar: {
  video?: HTMLVideoElement;
  renderer: { domElement?: HTMLCanvasElement; setClearColor?: (color: number, alpha?: number) => void };
  cssRenderer?: { domElement?: HTMLElement };
}) {
  mindar.video?.style.setProperty("z-index", "0");
  mindar.video?.style.setProperty("opacity", "1");
  mindar.renderer.setClearColor?.(0x000000, 0);
  mindar.renderer.domElement?.style.setProperty("z-index", "1");
  mindar.renderer.domElement?.style.setProperty("background", "transparent");
  mindar.cssRenderer?.domElement?.style.setProperty("z-index", "2");
  mindar.cssRenderer?.domElement?.style.setProperty("pointer-events", "none");
}

export async function startMindArWithVisibleCamera(
  mindar: Parameters<typeof keepCameraVisible>[0] & {
    start(): Promise<void>;
    controller?: object;
  },
  timeoutMs = PUBLIC_AR_START_TIMEOUT_MS,
) {
  const restoreCameraRequest = installBoundedCameraRequest();
  const stopWarmupGuard = isIosWebKit() ? bypassIosWarmup(mindar) : () => undefined;
  let startPromise: Promise<void>;
  try {
    startPromise = mindar.start();
  } finally {
    restoreCameraRequest();
  }
  // MindAR creates the camera video synchronously, then waits for target data
  // and its worker while the video still has the library's z-index of -2.
  keepCameraVisible(mindar);
  try {
    await withTimeout(startPromise, timeoutMs);
  } finally {
    stopWarmupGuard();
  }
  keepCameraVisible(mindar);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new DOMException("AR startup timed out", "TimeoutError")), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function fetchTrackingAsset(url: string) {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", credentials: "omit" });
  } catch {
    throw new DOMException("Tracking asset unavailable", "NetworkError");
  }
  if (!response.ok) throw new DOMException("Tracking asset unavailable", "NetworkError");
  const blob = await response.blob();
  if (blob.size < 1024 || blob.size > 10 * 1024 * 1024) {
    throw new DOMException("Tracking asset is invalid", "DataError");
  }
  return blob;
}

export async function mergeTrackingAssets(assets: Blob[]) {
  if (!assets.length) throw new DOMException("Tracking asset is missing", "DataError");
  if (assets.length === 1) return assets[0];
  const { decode, encode } = await import("@msgpack/msgpack");
  const dataList: unknown[] = [];
  for (const asset of assets) {
    const content = decode(new Uint8Array(await asset.arrayBuffer())) as { v?: unknown; dataList?: unknown };
    if (content.v !== 2 || !Array.isArray(content.dataList) || !content.dataList.length) {
      throw new DOMException("Tracking asset is invalid", "DataError");
    }
    dataList.push(...content.dataList);
  }
  const bytes = encode({ v: 2, dataList });
  return new Blob([new Uint8Array(bytes).buffer], { type: "application/octet-stream" });
}

function installBoundedCameraRequest() {
  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices || typeof mediaDevices.getUserMedia !== "function") return () => undefined;
  const original = mediaDevices.getUserMedia;
  try {
    mediaDevices.getUserMedia = (constraints) => original.call(mediaDevices, boundedCameraConstraints(constraints));
  } catch {
    return () => undefined;
  }
  return () => {
    try {
      mediaDevices.getUserMedia = original;
    } catch {
      // The browser may expose mediaDevices as a read-only host object.
    }
  };
}

function bypassIosWarmup(mindar: { controller?: object }) {
  const timer = window.setInterval(() => {
    const controller = mindar.controller as { dummyRun?: (input: HTMLVideoElement) => Promise<void> } | undefined;
    if (!controller) return;
    controller.dummyRun = async () => undefined;
    window.clearInterval(timer);
  }, 16);
  return () => window.clearInterval(timer);
}
