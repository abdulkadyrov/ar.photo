import type * as ThreeModule from "three";
import type { PublicArManifest } from "./publicManifest";
import { videoMilestones, type PublicArAnalyticsEvent } from "./telemetry";

export type PublicArTrackingState = "searching" | "tracking";

export const publicArTrackingConfig = Object.freeze({
  filterMinCF: 0.001,
  filterBeta: 100,
  warmupTolerance: 5,
  missTolerance: 5,
});

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

export async function startPublicMindAr(options: {
  container: HTMLDivElement;
  manifest: PublicArManifest;
  muted: boolean;
  onTrackingState(state: PublicArTrackingState): void;
  onPlaybackEvent(event: PublicArAnalyticsEvent, valueSeconds?: number | null, errorCode?: string | null): void;
}): Promise<PublicArSession> {
  const [{ MindARThree }, THREE] = await Promise.all([
    import("mind-ar/dist/mindar-image-three.prod.js"),
    import("three"),
  ]);
  const Three = THREE as typeof ThreeModule;
  const { container, manifest, onTrackingState, onPlaybackEvent } = options;
  const video = document.createElement("video");
  video.src = manifest.assets.videoUrl;
  video.loop = manifest.behavior.loop;
  video.muted = options.muted;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.disablePictureInPicture = true;
  video.setAttribute("webkit-playsinline", "");
  video.load();

  const mindar = new MindARThree({
    container,
    imageTargetSrc: manifest.assets.trackingAssetUrl,
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
    container.replaceChildren();
    throw error;
  }

  return {
    setMuted(muted) {
      video.muted = muted;
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
  mindar: Parameters<typeof keepCameraVisible>[0] & { start(): Promise<void> },
) {
  const startPromise = mindar.start();
  // MindAR creates the camera video synchronously, then waits for target data
  // and its worker while the video still has the library's z-index of -2.
  keepCameraVisible(mindar);
  await startPromise;
  keepCameraVisible(mindar);
}
