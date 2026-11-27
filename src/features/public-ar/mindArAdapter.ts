import { createArDiagnostics, type ArDiagnosticsEngine, type ArDiagnosticState } from "./arDiagnostics";
import type * as ThreeModule from "three";
import {
  publicArTargets,
  videoViewportSchema,
  type PublicArManifest,
  type PublicArTarget,
  type VideoViewport,
} from "./publicManifest";
import { videoMilestones, type PublicArAnalyticsEvent } from "./telemetry";
import { createArRecordingEngine, type ArRecording, type ArRecordingEngine } from "./arRecording";
import { createPlanarAnchor, installPlanarObservations } from "./planarTrackingBridge";
import { abortable, constructWithManagedResize, prepareArCamera, stopCameraStream } from "./arCameraSession";
import { createAlbumVideoPlayback, type AlbumVideoState } from "./albumVideoPlayback";
import { loadPublicArVideo } from "./publicArCache";

export type PublicArTrackingState = "searching" | "tracking";

export const publicArTrackingConfig = Object.freeze({
  // MindAR uses milliseconds: 1 is a near-pass-through at camera rates.
  // Public overlay stabilization happens once, on measured image corners.
  filterMinCF: 1,
  filterBeta: 0,
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

export function roundedPostcardGeometry(three: typeof ThreeModule) {
  const shape = new three.Shape();
  const x = 0.5;
  const y = 0.5;
  const rx = 0.07;
  const ry = 0.1;
  shape.moveTo(-x + rx, -y);
  shape.lineTo(x - rx, -y);
  shape.quadraticCurveTo(x, -y, x, -y + ry);
  shape.lineTo(x, y - ry);
  shape.quadraticCurveTo(x, y, x - rx, y);
  shape.lineTo(-x + rx, y);
  shape.quadraticCurveTo(-x, y, -x, y - ry);
  shape.lineTo(-x, -y + ry);
  shape.quadraticCurveTo(-x, -y, -x + rx, -y);
  const geometry = new three.ShapeGeometry(shape, 6);
  const uv = geometry.getAttribute("uv");
  const position = geometry.getAttribute("position");
  for (let i = 0; i < uv.count; i++) uv.setXY(i, position.getX(i) + x, position.getY(i) + y);
  return geometry;
}

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

// This affects only the rendered child plane, not the tracked full-image anchor.
// A top-left normalized print window maps into the anchor's centered, Y-up units.
export function videoPlaneGeometry(marker: MarkerDimensions, viewport?: VideoViewport) {
  const markerGeometry = markerPlaneGeometry(marker);
  const rect = videoViewportSchema.parse(viewport ?? { x: 0, y: 0, width: 1, height: 1 });
  return {
    width: rect.width,
    height: markerGeometry.height * rect.height,
    x: rect.x + rect.width / 2 - 0.5,
    y: markerGeometry.height * (0.5 - rect.y - rect.height / 2),
    z: markerGeometry.z,
    aspectRatio: (marker.width * rect.width) / (marker.height * rect.height),
  };
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
  readonly diagnostics?: ArDiagnosticsEngine | null;
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
  diagnostics?: boolean;
  onDiagnosticState?(state: ArDiagnosticState): void;
  manifest: PublicArManifest;
  muted: boolean;
  playbackVideo?: HTMLVideoElement;
  playbackVideos?: HTMLVideoElement[];
  cameraStream?: MediaStream;
  signal?: AbortSignal;
  trackingAssets?: Blob[];
  loadVideo?(index: number, signal: AbortSignal): Promise<Blob>;
  onMediaState?(state: AlbumVideoState): void;
  onAutoplayBlocked?(): void;
  onTrackingState(state: PublicArTrackingState): void;
  onPlaybackEvent(event: PublicArAnalyticsEvent, valueSeconds?: number | null, errorCode?: string | null): void;
}): Promise<PublicArSession> {
  const { container, manifest, onTrackingState, onPlaybackEvent } = options;
  const postcard = manifest.version === 1 && Boolean(manifest.videoViewport);
  options.signal?.throwIfAborted();
  const targets = publicArTargets(manifest);
  const videos =
    options.playbackVideos ??
    (options.playbackVideo ? [options.playbackVideo] : createPublicArPlaybackVideos(manifest, options.muted));
  if (videos.length !== 1) throw new Error("AR uses one shared playback video");
  const video = videos[0];
  configurePlaybackVideo(video, targets[0], options.muted);

  const [{ MindARThree }, THREE, trackingAssets] = await Promise.all([
    import("mind-ar/dist/mindar-image-three.prod.js"),
    import("three"),
    options.trackingAssets
      ? Promise.resolve(options.trackingAssets)
      : Promise.all(targets.map((target) => fetchTrackingAsset(target.assets.trackingAssetUrl, options.signal))),
  ]);
  if (
    trackingAssets.length !== targets.length ||
    trackingAssets.some((asset) => asset.size < 1024 || asset.size > 10 * 1024 * 1024)
  )
    throw new DOMException("Tracking asset is invalid", "DataError");
  const Three = THREE as typeof ThreeModule;

  // MindAR 1.2.5 still writes the removed Three.js `outputEncoding` property.
  // Bridge that write to the current color-space API before MindAR creates its
  // renderer, then explicitly keep both renderer output and video input in sRGB.
  installMindArColorCompatibility(Three);

  const mergedTrackingAsset = await mergeTrackingAssets(trackingAssets, options.signal);
  const trackingAssetUrl = URL.createObjectURL(mergedTrackingAsset);

  options.signal?.throwIfAborted();
  const mindar = constructWithManagedResize(
    () =>
      new MindARThree({
        container,
        imageTargetSrc: trackingAssetUrl,
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
        maxTrack: 1,
        ...publicArTrackingConfig,
      }),
  );
  const lifetime = new AbortController();
  const abort = () => lifetime.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) abort();
  const readObservation = installPlanarObservations(
    mindar,
    lifetime.signal,
    isIosWebKit(),
    (error) => lifetime.abort(error),
    postcard,
  );
  mindar._startVideo = async () => {
    const video = document.createElement("video");
    mindar.video = video;
    container.appendChild(video);
    const cameraOptions = {
      video,
      signal: lifetime.signal,
      stream: options.cameraStream,
      constraints: boundedCameraConstraints({ audio: false, video: { facingMode: { ideal: "environment" } } }),
    };
    try {
      await prepareArCamera(cameraOptions);
    } catch (error) {
      if (
        !postcard ||
        options.cameraStream ||
        lifetime.signal.aborted ||
        !(error instanceof DOMException) ||
        !["NotReadableError", "TrackStartError"].includes(error.name)
      )
        throw error;
      // The system QR camera can still be releasing the device as Safari opens.
      await abortable(new Promise<void>((resolve) => setTimeout(resolve, 500)), lifetime.signal);
      await prepareArCamera(cameraOptions);
    }
  };
  const { renderer, scene, camera } = mindar;
  // Wait for valid camera dimensions and a committed, visible React container.
  const libraryResize = mindar.resize?.bind(mindar);
  mindar.resize = () => {
    if (
      lifetime.signal.aborted ||
      !mindar.controller ||
      !mindar.video?.videoWidth ||
      !container.clientWidth ||
      !container.clientHeight
    )
      return;
    libraryResize?.();
  };
  const resize = () => mindar.resize?.();
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);
  renderer.setPixelRatio?.(Math.min(window.devicePixelRatio || 1, postcard && isIosWebKit() ? 1 : 2));
  renderer.setClearColor(0x000000, 0);
  let stopped = false;
  let activeTargetIndex = 0;
  let targetVisible = false;
  const texture = new Three.VideoTexture(video);
  configureSrgbVideoOutput(renderer, texture, Three.SRGBColorSpace);
  const geometry =
    manifest.version === 1 && manifest.postcardFrameTemplate
      ? roundedPostcardGeometry(Three)
      : new Three.PlaneGeometry(1, 1);
  const material = new Three.MeshBasicMaterial({
    map: texture,
    transparent: false,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const runtimes = targets.map((target, index) => {
    let activeMarker: MarkerDimensions = target.marker;
    const videoGeometry = videoPlaneGeometry(activeMarker, target.videoViewport);
    const plane = new Three.Mesh(geometry, material);
    plane.position.set(videoGeometry.x, videoGeometry.y, videoGeometry.z);
    plane.scale.set(videoGeometry.width, videoGeometry.height, 1);
    plane.visible = false;
    plane.frustumCulled = false;
    plane.renderOrder = 1;
    const anchor = mindar.addAnchor(index);
    const fitVideoToMarker = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      const transform = coverTextureTransform(
        video.videoWidth / video.videoHeight,
        videoPlaneGeometry(activeMarker, target.videoViewport).aspectRatio,
      );
      texture.repeat.set(transform.repeatX, transform.repeatY);
      texture.offset.set(transform.offsetX, transform.offsetY);
      texture.needsUpdate = true;
    };
    const onFound = () => {
      activeTargetIndex = index;
      targetVisible = true;
      runtimes.forEach((runtime) => {
        runtime.plane.visible = false;
      });
      onTrackingState("tracking");
      void player.select(index);
    };
    const onLost = () => {
      plane.visible = false;
      if (activeTargetIndex !== index) return;
      targetVisible = false;
      onTrackingState("searching");
      player.lost(index);
    };
    const stabilizedAnchor = createPlanarAnchor({
      three: Three,
      anchor,
      scene,
      camera: camera as ThreeModule.Camera,
      container,
      readObservation: () => readObservation(index),
      isTracking: () => mindar.controller?.trackingStates?.[index]?.isTracking ?? anchor.visible,
      onFound,
      onLost,
    });
    stabilizedAnchor.group.add(plane);
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
      updatePose: stabilizedAnchor.update,
      diagnosticGroup: stabilizedAnchor.group,
      dispose() {
        stabilizedAnchor.dispose();
      },
    };
  });
  const player = createAlbumVideoPlayback({
    video,
    targets,
    load: options.loadVideo ?? ((index, signal) => loadPublicArVideo(targets[index].assets.videoUrl, signal)),
    visible: (index) => targetVisible && activeTargetIndex === index,
    lossPauseDelayMs: postcard ? 650 : undefined,
    mutedAutoplayFallback: postcard,
    onAutoplayBlocked: options.onAutoplayBlocked,
    onReady(index) {
      if (index !== activeTargetIndex || !targetVisible) return;
      runtimes[index].fitVideoToMarker();
      runtimes[index].plane.visible = true;
    },
    onState(state) {
      if (state !== "ready") runtimes[activeTargetIndex].plane.visible = false;
      options.onMediaState?.(state);
      if (state === "error") onPlaybackEvent("error", null, "playback_failed");
    },
  });
  const fitActiveVideo = () => runtimes[activeTargetIndex]?.fitVideoToMarker();
  const playbackStarted = () => onPlaybackEvent("playback_started", video.currentTime);
  const playbackProgress = () => {
    for (const event of videoMilestones(video.currentTime, video.duration)) onPlaybackEvent(event, video.currentTime);
  };
  const playbackEnded = () => onPlaybackEvent("completed", video.duration || video.currentTime);
  video.addEventListener("loadedmetadata", fitActiveVideo);
  video.addEventListener("play", playbackStarted);
  video.addEventListener("timeupdate", playbackProgress);
  video.addEventListener("ended", playbackEnded);
  const disposePlayback = () => {
    player.dispose();
    video.removeEventListener("loadedmetadata", fitActiveVideo);
    video.removeEventListener("play", playbackStarted);
    video.removeEventListener("timeupdate", playbackProgress);
    video.removeEventListener("ended", playbackEnded);
    texture.dispose();
    geometry.dispose();
    material.dispose();
  };
  const visibility = () => {
    if (document.hidden) {
      videos.forEach((video) => video.pause());
    } else if (targetVisible && player.state === "ready") {
      const runtime = runtimes[activeTargetIndex];
      if (runtime.target.behavior.autoplay) runtime.video.play().catch(() => undefined);
    }
  };
  document.addEventListener("visibilitychange", visibility);

  let recordingEngine: ArRecordingEngine | null = null;
  let diagnostics: ArDiagnosticsEngine | null = null;
  let lastDiagnosticFrame = -Infinity;
  try {
    await startMindArWithVisibleCamera(mindar, PUBLIC_AR_START_TIMEOUT_MS, lifetime.signal);
    lifetime.signal.throwIfAborted();
    URL.revokeObjectURL(trackingAssetUrl);
    runtimes.forEach((runtime, index) => {
      const marker = resolveMarkerDimensions(
        runtime.target.marker,
        mindar.controller?.markerDimensions?.slice(index, index + 1),
      );
      const videoGeometry = videoPlaneGeometry(marker, runtime.target.videoViewport);
      runtime.setMarker(marker);
      runtime.plane.position.set(videoGeometry.x, videoGeometry.y, videoGeometry.z);
      runtime.plane.scale.set(videoGeometry.width, videoGeometry.height, 1);
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
    if (options.diagnostics && mindar.video) {
      diagnostics = createArDiagnostics({
        cameraVideo: mindar.video,
        playbackVideo: video,
        onState: options.onDiagnosticState,
        trackingAssets: options.trackingAssets,
        metadata: {
          targets: targets.map((t) => ({
            width: t.marker.width,
            height: t.marker.height,
            videoViewport: t.videoViewport,
          })),
        },
      });
    }
    renderer.setAnimationLoop(() => {
      runtimes.forEach((runtime) => runtime.updatePose());
      renderer.render(scene, camera);
      recordingEngine?.drawFrame();
      const now = performance.now();
      if (diagnostics?.active && now - lastDiagnosticFrame >= 70) {
        lastDiagnosticFrame = now;
        const observation = readObservation(activeTargetIndex);
        const group = runtimes[activeTargetIndex].diagnosticGroup;
        diagnostics.addSample({
          corners: observation?.corners,
          frameTime: observation?.frameTime,
          processingMs: observation ? observation.time - (observation.frameTime ?? observation.time) : undefined,
          cameraTime: mindar.video?.currentTime,
          input: observation?.input,
          partial: observation?.partial,
          found: group.visible,
          targetIndex: activeTargetIndex,
          renderedMatrix: Array.from(group.matrix.elements),
          projectionMatrix: Array.from((camera as ThreeModule.Camera).projectionMatrix.elements),
          viewport: { width: container.clientWidth, height: container.clientHeight },
        });
      }
    });
    onTrackingState("searching");
  } catch (error) {
    lifetime.abort();
    options.signal?.removeEventListener("abort", abort);
    observer.disconnect();
    window.removeEventListener("resize", resize);
    window.visualViewport?.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibility);
    renderer.setAnimationLoop(null);
    stopMindAr(mindar);
    runtimes.forEach((runtime) => runtime.dispose());
    disposePlayback();
    URL.revokeObjectURL(trackingAssetUrl);
    container.replaceChildren();
    throw error;
  }

  return {
    get diagnostics() {
      return diagnostics;
    },
    get recordingSupported() {
      return recordingEngine?.supported ?? false;
    },
    setMuted(muted) {
      videos.forEach((video) => {
        video.muted = muted;
        video.defaultMuted = muted;
        video.toggleAttribute("muted", muted);
      });
      if (!muted && targetVisible && player.state === "ready")
        runtimes[activeTargetIndex].video.play().catch(() => undefined);
    },
    async togglePlayback() {
      if (player.state === "error") {
        await player.retry();
        return !video.paused;
      }
      if (player.state !== "ready") return false;
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
      lifetime.abort();
      options.signal?.removeEventListener("abort", abort);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
      renderer.setAnimationLoop(null);
      diagnostics?.dispose();
      recordingEngine?.dispose();
      stopMindAr(mindar);
      runtimes.forEach((runtime) => runtime.dispose());
      disposePlayback();
      URL.revokeObjectURL(trackingAssetUrl);
      container.replaceChildren();
    },
  };
}

export function createPublicArPlaybackVideo(manifest: PublicArManifest, muted: boolean) {
  return createPublicArPlaybackVideos(manifest, muted)[0];
}

export function createPublicArPlaybackVideos(manifest: PublicArManifest, muted: boolean) {
  return [createPlaybackVideo(publicArTargets(manifest)[0], muted)];
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
  video.preload = "none";
  video.crossOrigin = "anonymous";
  video.disablePictureInPicture = true;
  video.setAttribute("webkit-playsinline", "");
  // A signed network URL is deliberately never assigned here. The recognized
  // target receives a cached object URL from the single album player.
}

function stopMindAr(mindar: {
  stop(): void;
  video?: HTMLVideoElement;
  controller?: { dispose?: () => void; worker?: { terminate(): void } };
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
  mindar.controller?.worker?.terminate();
  stopCameraStream(mindar.video?.srcObject as MediaStream | null);
  if (mindar.video) {
    mindar.video.srcObject = null;
    mindar.video.remove();
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
  signal?: AbortSignal,
) {
  signal?.throwIfAborted();
  const restoreCameraRequest = installBoundedCameraRequest();
  let startPromise: Promise<void>;
  try {
    startPromise = mindar.start();
  } finally {
    restoreCameraRequest();
  }
  // MindAR creates the camera video synchronously, then waits for target data
  // and its worker while the video still has the library's z-index of -2.
  keepCameraVisible(mindar);
  await withTimeout(signal ? abortable(startPromise, signal) : startPromise, timeoutMs);
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

async function fetchTrackingAsset(url: string, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store", credentials: "omit", signal });
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

export async function mergeTrackingAssets(assets: Blob[], signal?: AbortSignal) {
  signal?.throwIfAborted();
  if (assets.length > 50) throw new DOMException("AR album exceeds 50 targets", "DataError");
  if (assets.length > 4) return mergeTrackingAssetsInWorker(assets, signal);
  if (!assets.length) throw new DOMException("Tracking asset is missing", "DataError");
  if (assets.length === 1) return assets[0];
  const { decode, encode } = await import("@msgpack/msgpack");
  const dataList: unknown[] = [];
  for (const asset of assets) {
    const content = decode(new Uint8Array(await asset.arrayBuffer())) as { v?: unknown; dataList?: unknown };
    if (content.v !== 2 || !Array.isArray(content.dataList) || content.dataList.length !== 1) {
      throw new DOMException("Tracking asset is invalid", "DataError");
    }
    dataList.push(...content.dataList);
  }
  const bytes = encode({ v: 2, dataList });
  return new Blob([new Uint8Array(bytes).buffer], { type: "application/octet-stream" });
}

function mergeTrackingAssetsInWorker(assets: Blob[], signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./trackingMerge.worker.ts", import.meta.url), { type: "module" });
    const clean = () => {
      worker.terminate();
      signal?.removeEventListener("abort", abort);
      clearTimeout(timer);
    };
    const abort = () => {
      clean();
      reject(signal?.reason ?? new DOMException("Tracking preparation cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      clean();
      reject(new DOMException("Tracking preparation timed out", "TimeoutError"));
    }, 45000);
    worker.onmessage = (event: MessageEvent<ArrayBuffer | null>) => {
      clean();
      if (event.data instanceof ArrayBuffer && event.data.byteLength)
        resolve(new Blob([event.data], { type: "application/octet-stream" }));
      else reject(new DOMException("Tracking asset is invalid", "DataError"));
    };
    worker.onerror = () => {
      clean();
      reject(new DOMException("Tracking preparation failed", "DataError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    else worker.postMessage(assets);
  });
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
