/// <reference types="vite/client" />

declare module "qrcode" {
  export function toDataURL(
    value: string,
    options?: {
      margin?: number;
      width?: number;
      color?: { dark?: string; light?: string };
    },
  ): Promise<string>;
}

declare module "mind-ar/dist/mindar-image-three.prod.js" {
  export class MindARThree {
    constructor(options: {
      container: HTMLElement;
      imageTargetSrc: string;
      uiLoading?: "yes" | "no";
      uiScanning?: "yes" | "no";
      uiError?: "yes" | "no";
      maxTrack?: number;
      filterMinCF?: number;
      filterBeta?: number;
      warmupTolerance?: number;
      missTolerance?: number;
    });
    video?: HTMLVideoElement;
    renderer: {
      domElement: HTMLCanvasElement;
      outputColorSpace: string;
      setAnimationLoop: (callback: (() => void) | null) => void;
      render: (scene: unknown, camera: unknown) => void;
      setClearColor: (color: number, alpha?: number) => void;
      setPixelRatio?: (ratio: number) => void;
      dispose?: () => void;
      forceContextLoss?: () => void;
    };
    controller?: { dispose?: () => void; markerDimensions?: Array<[number, number]> };
    cssRenderer?: { domElement?: HTMLElement };
    scene: {
      add(object: unknown): void;
      remove(object: unknown): void;
    };
    camera: unknown;
    addAnchor(index: number): {
      group: { add(object: unknown): void; matrix: import("three").Matrix4; visible: boolean };
      visible: boolean;
      onTargetFound?: () => void;
      onTargetLost?: () => void;
      onTargetUpdate?: () => void;
    };
    start(): Promise<void>;
    stop(): void;
    resize?(): void;
  }
}

declare module "mind-ar/src/image-target/compiler.js" {
  export class Compiler {
    compileImageTargets(
      images: Array<CanvasImageSource & { width: number; height: number }>,
      progressCallback: (progress: number) => void,
    ): Promise<unknown>;
    exportData(): Uint8Array;
  }
}

declare module "three" {
  export class WebGLRenderer {
    outputColorSpace: string;
  }

  export const sRGBEncoding: number;
  export const LinearEncoding: number;
  export class VideoTexture {
    constructor(video: HTMLVideoElement);
    colorSpace: string;
    repeat: { set: (x: number, y: number) => void };
    offset: { set: (x: number, y: number) => void };
    needsUpdate: boolean;
    dispose(): void;
  }

  export const SRGBColorSpace: string;
  export const LinearSRGBColorSpace: string;

  export class PlaneGeometry {
    constructor(width: number, height: number);
    dispose(): void;
  }

  export class MeshBasicMaterial {
    constructor(options: {
      map: unknown;
      transparent: boolean;
      depthTest?: boolean;
      depthWrite?: boolean;
      toneMapped?: boolean;
    });
    dispose(): void;
  }

  export class Mesh {
    constructor(geometry: unknown, material: unknown);
    position: { set: (x: number, y: number, z: number) => void };
    scale: { set: (x: number, y: number, z: number) => void };
    frustumCulled: boolean;
    renderOrder: number;
  }

  export class Matrix4 {
    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    copy(value: Vector3): this;
    distanceTo(value: Vector3): number;
    lerp(value: Vector3, alpha: number): this;
  }

  export class Quaternion {
    copy(value: Quaternion): this;
    angleTo(value: Quaternion): number;
    slerp(value: Quaternion, alpha: number): this;
  }

  export class Group {
    matrix: Matrix4;
    matrixAutoUpdate: boolean;
    visible: boolean;
    add(object: unknown): void;
  }
}
