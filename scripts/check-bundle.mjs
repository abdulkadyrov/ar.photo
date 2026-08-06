import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const manifestPath = "dist/.vite/manifest.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const entries = Object.entries(manifest);
const appEntry = entries.find(([, chunk]) => chunk.isEntry)?.[0];
const prototypeEntry = entries.find(([key]) => key.endsWith("src/features/prototype/PrototypeApp.tsx"))?.[0];

if (!appEntry || !prototypeEntry) throw new Error("Expected app and prototype entries are missing from build manifest");

function collectStaticGraph(key, visited = new Set()) {
  if (visited.has(key)) return visited;
  visited.add(key);
  for (const importedKey of manifest[key]?.imports ?? []) collectStaticGraph(importedKey, visited);
  return visited;
}

function graphSize(keys) {
  return [...keys].reduce((total, key) => total + statSync(join("dist", manifest[key].file)).size, 0);
}

function assertWithin(label, actual, maximum) {
  if (actual > maximum) throw new Error(`${label} is ${actual} bytes; budget is ${maximum} bytes`);
}

const initialGraph = collectStaticGraph(appEntry);
const dashboardGraph = collectStaticGraph(prototypeEntry, new Set(initialGraph));
const initialBytes = graphSize(initialGraph);
const dashboardBytes = graphSize(dashboardGraph);
const dashboardFiles = [...dashboardGraph].map((key) => manifest[key].file.toLowerCase());

assertWithin("Initial JS graph", initialBytes, 600 * 1024);
assertWithin("Dashboard JS graph", dashboardBytes, 800 * 1024);

if (dashboardFiles.some((file) => file.includes("mindar") || file.includes("three.module"))) {
  throw new Error("MindAR/Three must remain outside the dashboard static import graph");
}

const cssFiles = manifest[appEntry].css ?? [];
const cssBytes = cssFiles.reduce((total, file) => total + statSync(join("dist", file)).size, 0);
// The authenticated workspace now includes the shared responsive shell, auth,
// dashboard, support and super-admin design system in one deterministic stylesheet.
assertWithin("Initial CSS", cssBytes, 56 * 1024);

for (const [key, chunk] of entries) {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("mindar-image-three"))
    assertWithin("MindAR lazy chunk", statSync(join("dist", chunk.file)).size, 1500 * 1024);
  if (lowerKey.includes("three.module"))
    assertWithin("Three.js lazy chunk", statSync(join("dist", chunk.file)).size, 700 * 1024);
}

console.log(
  `Bundle budget passed: initial ${Math.round(initialBytes / 1024)} KiB, dashboard ${Math.round(dashboardBytes / 1024)} KiB, CSS ${Math.round(cssBytes / 1024)} KiB.`,
);
