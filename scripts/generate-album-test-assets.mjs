import { createCanvas } from "canvas";
import { OfflineCompiler } from "mind-ar/src/image-target/offline-compiler.js";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("test-assets/album", { recursive: true });
for (const id of [1, 2]) {
  const canvas = createCanvas(512, 384),
    ctx = canvas.getContext("2d");
  let seed = id * 745213;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, 512, 384);
  for (let i = 0; i < 650; i++) {
    ctx.fillStyle = `rgb(${Math.floor(random() * 256)},${Math.floor(random() * 256)},${Math.floor(random() * 256)})`;
    ctx.beginPath();
    ctx.arc(random() * 512, random() * 384, 3 + random() * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "white";
  ctx.fillRect(145, 145, 220, 90);
  ctx.fillStyle = "black";
  ctx.font = "bold 38px sans-serif";
  ctx.fillText("ALBUM " + id, 165, 202);
  await writeFile(`test-assets/album/${id}.png`, canvas.toBuffer("image/png"));
  const compiler = new OfflineCompiler();
  await compiler.compileImageTargets([canvas], () => {});
  await writeFile(`test-assets/album/${id}.mind`, Buffer.from(compiler.exportData()));
  console.log("Compiled synthetic marker", id);
}
