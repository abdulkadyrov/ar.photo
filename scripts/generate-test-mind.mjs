import { writeFile } from "node:fs/promises";
import { loadImage } from "canvas";
import { OfflineCompiler } from "mind-ar/src/image-target/offline-compiler.js";

const imagePath = "public/test-assets/test.jpg";
const outputPath = "public/test-assets/test.mind";

const image = await loadImage(imagePath);
const compiler = new OfflineCompiler();

await compiler.compileImageTargets([image], (progress) => {
  const value = Math.round(progress);
  if (value % 10 === 0) console.log(`MindAR compile progress: ${value}%`);
});

const buffer = compiler.exportData();
await writeFile(outputPath, Buffer.from(buffer));
console.log(`Created ${outputPath}`);
