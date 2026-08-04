declare module "mind-ar/src/image-target/offline-compiler.js" {
  import type { Canvas, Image } from "canvas";

  type CompiledTarget = {
    targetImage: { width: number; height: number };
    matchingData: Array<{ maximaPoints?: unknown[]; minimaPoints?: unknown[] }>;
    trackingData: Array<{ points?: unknown[] }>;
  };

  export class OfflineCompiler {
    compileImageTargets(images: Array<Image | Canvas>, progressCallback: (progress: number) => void): Promise<unknown>;
    exportData(): Uint8Array;
    importData(buffer: ArrayBuffer): CompiledTarget[];
  }
}
