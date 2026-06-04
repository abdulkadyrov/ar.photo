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
      warmupTolerance?: number;
      missTolerance?: number;
    });
    video?: HTMLVideoElement;
    renderer: {
      domElement?: HTMLCanvasElement;
      setAnimationLoop: (callback: (() => void) | null) => void;
      render: (scene: unknown, camera: unknown) => void;
      setClearColor: (color: number, alpha?: number) => void;
    };
    cssRenderer?: { domElement?: HTMLElement };
    scene: unknown;
    camera: unknown;
    addAnchor(index: number): {
      group: { add: (mesh: unknown) => void };
      onTargetFound?: () => void;
      onTargetLost?: () => void;
    };
    start(): Promise<void>;
    stop(): void;
  }
}

declare module "three" {
  export class VideoTexture {
    constructor(video: HTMLVideoElement);
  }

  export class PlaneGeometry {
    constructor(width: number, height: number);
  }

  export class MeshBasicMaterial {
    constructor(options: { map: unknown; transparent: boolean });
  }

  export class Mesh {
    constructor(geometry: unknown, material: unknown);
    scale: { set: (x: number, y: number, z: number) => void };
  }
}
