/* global process, Buffer, console */
import { writeFile } from "node:fs/promises";
import { loadImage } from "canvas";
import { OfflineCompiler } from "mind-ar/src/image-target/offline-compiler.js";
if (!process.argv[2]) throw new Error("Pass a PNG conversion of public/postcards/milka-gift-v1.webp without resizing.");
const image = await loadImage(process.argv[2]);
const compiler = new OfflineCompiler();
await compiler.compileImageTargets([image], () => {});
await writeFile("tools/ar-lab/milka.mind", Buffer.from(compiler.exportData()));
console.log("Compiled Milka laboratory target");
