import type * as ThreeModule from "three";
import type { PublicArManifest } from "./publicManifest";

export type PublicArTrackingState = "searching" | "tracking";

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
}): Promise<PublicArSession> {
  const [{ MindARThree }, THREE] = await Promise.all([
    import("mind-ar/dist/mindar-image-three.prod.js"),
    import("three"),
  ]);
  const Three = THREE as typeof ThreeModule;
  const { container, manifest, onTrackingState } = options;
  const video = document.createElement("video");
  video.src = manifest.assets.videoUrl;
  video.loop = manifest.behavior.loop;
  video.muted = options.muted;
  video.playsInline = true;
  video.preload = "auto";
  video.crossOrigin = "anonymous";
  video.load();

  const mindar = new MindARThree({
    container,
    imageTargetSrc: manifest.assets.trackingAssetUrl,
    uiLoading: "no",
    uiScanning: "no",
    uiError: "no",
    maxTrack: 1,
    warmupTolerance: 5,
    missTolerance: 8,
  });
  const { renderer, scene, camera } = mindar;
  renderer.setClearColor(0x000000, 0);
  const texture = new Three.VideoTexture(video);
  const geometry = new Three.PlaneGeometry(1, 1 / manifest.marker.aspectRatio);
  const material = new Three.MeshBasicMaterial({ map: texture, transparent: true });
  const plane = new Three.Mesh(geometry, material);
  plane.position.set(0, 0, 0.01);
  const anchor = mindar.addAnchor(0);
  anchor.group.add(plane);

  let stopped = false;
  let targetVisible = false;
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

  const resize = () => mindar.resize?.();
  const visibility = () => {
    if (document.hidden) {
      video.pause();
    } else if (targetVisible && manifest.behavior.autoplay) {
      video.play().catch(() => undefined);
    }
  };
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  document.addEventListener("visibilitychange", visibility);

  try {
    await mindar.start();
    keepCameraVisible(mindar);
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
    onTrackingState("searching");
  } catch (error) {
    window.removeEventListener("resize", resize);
    window.removeEventListener("orientationchange", resize);
    document.removeEventListener("visibilitychange", visibility);
    renderer.setAnimationLoop(null);
    try {
      mindar.stop();
    } catch {
      // MindAR can fail before its camera controller is fully initialized.
    }
    video.pause();
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
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      document.removeEventListener("visibilitychange", visibility);
      renderer.setAnimationLoop(null);
      try {
        mindar.stop();
      } catch {
        // Resource disposal below must continue even after a partial MindAR shutdown.
      }
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      geometry.dispose();
      material.dispose();
      container.replaceChildren();
    },
  };
}

function keepCameraVisible(mindar: {
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
