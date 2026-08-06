import type * as ThreeModule from "three";
import type { PublicArManifest } from "./publicManifest";
import { videoMilestones, type PublicArAnalyticsEvent } from "./telemetry";

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
  setMuted(muted: boolean): void;
  togglePlayback(): Promise<boolean>;
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
  onTrackingState(state: PublicArTrackingState): void;
  onPlaybackEvent(event: PublicArAnalyticsEvent, valueSeconds?: number | null, errorCode?: string | null): void;
}): Promise<PublicArSession> {
  const { container, manifest, onTrackingState, onPlaybackEvent } = options;
  const video = document.createElement("video");
  video.loop = manifest.behavior.loop;
  video.muted = options.muted;
  video.defaultMuted = options.muted;
  if (options.muted) video.setAttribute("muted", "");
  video.autoplay = false;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.disablePictureInPicture = true;
  video.setAttribute("webkit-playsinline", "");
  // Entered directly from the «Начать AR» click. Starting the same element
  // before the first await preserves Safari's audio permission; pause it as
  // soon as playback becomes available so the video still begins on marker.
  video.src = manifest.assets.videoUrl;
  video.load();
  if (!options.muted) {
    void video
      .play()
      .then(() => {
        video.pause();
        video.currentTime = 0;
      })
      .catch(() => undefined);
  }

  const [{ MindARThree }, THREE, trackingAsset] = await Promise.all([
    import("mind-ar/dist/mindar-image-three.prod.js"),
    import("three"),
    fetchTrackingAsset(options.manifest.assets.trackingAssetUrl),
  ]);
  const Three = THREE as typeof ThreeModule;

  const trackingAssetUrl = URL.createObjectURL(trackingAsset);

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
  const texture = new Three.VideoTexture(video);
  texture.colorSpace = Three.SRGBColorSpace;
  let activeMarker: MarkerDimensions = manifest.marker;
  let markerGeometry = markerPlaneGeometry(activeMarker);
  // The unit plane is scaled after the .mind dataset loads. This lets the
  // compiled target remain authoritative if manifest metadata ever drifts.
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
  const anchor = mindar.addAnchor(0);
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
  video.addEventListener("loadedmetadata", fitVideoToMarker);
  fitVideoToMarker();

  let stopped = false;
  let targetVisible = false;
  const playbackStarted = () => onPlaybackEvent("playback_started", video.currentTime);
  const playbackProgress = () => {
    for (const event of videoMilestones(video.currentTime, video.duration)) {
      onPlaybackEvent(event, video.currentTime);
    }
  };
  const playbackEnded = () => onPlaybackEvent("completed", video.duration || video.currentTime);
  const playbackError = () => onPlaybackEvent("error", null, "playback_failed");
  video.addEventListener("play", playbackStarted);
  video.addEventListener("timeupdate", playbackProgress);
  video.addEventListener("ended", playbackEnded);
  video.addEventListener("error", playbackError);
  anchor.onTargetFound = () => {
    targetVisible = true;
    anchor.group.visible = true;
    onTrackingState("tracking");
    if (manifest.behavior.autoplay) video.play().catch(() => undefined);
  };
  anchor.onTargetLost = () => {
    targetVisible = false;
    anchor.group.visible = false;
    onTrackingState("searching");
    if (manifest.behavior.markerLost === "pause_hide") video.pause();
    if (manifest.behavior.markerLost === "stop_reset") {
      video.pause();
      video.currentTime = 0;
    }
  };

  const visibility = () => {
    if (document.hidden) {
      video.pause();
    } else if (targetVisible && manifest.behavior.autoplay) {
      video.play().catch(() => undefined);
    }
  };
  document.addEventListener("visibilitychange", visibility);

  try {
    await startMindArWithVisibleCamera(mindar);
    activeMarker = resolveMarkerDimensions(manifest.marker, mindar.controller?.markerDimensions);
    markerGeometry = markerPlaneGeometry(activeMarker);
    plane.scale.set(1, markerGeometry.height, 1);
    fitVideoToMarker();
    keepCameraVisible(mindar);
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
    onTrackingState("searching");
  } catch (error) {
    document.removeEventListener("visibilitychange", visibility);
    renderer.setAnimationLoop(null);
    stopMindAr(mindar);
    video.pause();
    removePlaybackListeners();
    video.removeEventListener("loadedmetadata", fitVideoToMarker);
    video.removeAttribute("src");
    video.load();
    texture.dispose();
    geometry.dispose();
    material.dispose();
    URL.revokeObjectURL(trackingAssetUrl);
    container.replaceChildren();
    throw error;
  }

  return {
    setMuted(muted) {
      video.muted = muted;
      video.defaultMuted = muted;
      video.toggleAttribute("muted", muted);
      if (!muted && targetVisible) video.play().catch(() => undefined);
    },
    async togglePlayback() {
      if (video.paused) {
        await video.play();
        return true;
      }
      video.pause();
      return false;
    },
    stop() {
      if (stopped) return;
      stopped = true;
      document.removeEventListener("visibilitychange", visibility);
      renderer.setAnimationLoop(null);
      stopMindAr(mindar);
      video.pause();
      removePlaybackListeners();
      video.removeEventListener("loadedmetadata", fitVideoToMarker);
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      geometry.dispose();
      material.dispose();
      URL.revokeObjectURL(trackingAssetUrl);
      container.replaceChildren();
    },
  };

  function removePlaybackListeners() {
    video.removeEventListener("play", playbackStarted);
    video.removeEventListener("timeupdate", playbackProgress);
    video.removeEventListener("ended", playbackEnded);
    video.removeEventListener("error", playbackError);
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
    const timer = window.setTimeout(
      () => reject(new DOMException("AR startup timed out", "TimeoutError")),
      timeoutMs,
    );
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
    const controller = mindar.controller as
      | { dummyRun?: (input: HTMLVideoElement) => Promise<void> }
      | undefined;
    if (!controller) return;
    controller.dummyRun = async () => undefined;
    window.clearInterval(timer);
  }, 16);
  return () => window.clearInterval(timer);
}
