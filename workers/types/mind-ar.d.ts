declare module "mind-ar/src/image-target/offline-compiler.js" {
  import type { Image } from "canvas";

  export class OfflineCompiler {
    compileImageTargets(images: Image[], progressCallback: (progress: number) => void): Promise<unknown>;
    exportData(): Uint8Array;
  }
}
