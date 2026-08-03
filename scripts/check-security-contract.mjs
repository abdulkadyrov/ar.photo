import { readFile } from "node:fs/promises";

const headers = await readFile("public/_headers", "utf8");
const worker = await readFile("public/sw.js", "utf8");
const runtimeConfig = await readFile("src/shared/config/env.ts", "utf8");
const packageManifest = await readFile("package.json", "utf8");
const previewWorkflow = await readFile(".github/workflows/deploy.yml", "utf8");
const requiredHeaders = [
  "Content-Security-Policy:",
  "frame-ancestors 'none'",
  "Permissions-Policy: camera=(self)",
  "Strict-Transport-Security:",
  "X-Content-Type-Options: nosniff",
  "X-Frame-Options: DENY",
  "/ar.photo/sw.js",
  "Cache-Control: no-cache, no-store, must-revalidate",
];
const requiredWorkerRules = [
  "url.origin !== self.location.origin",
  "url.pathname.startsWith(`${BASE_URL}assets/`)",
  "!isSafeStaticRequest(event.request)",
  "/private|no-store/i.test(cacheControl)",
];
const requiredDemoBoundaryRules = [
  [runtimeConfig, "VITE_ENABLE_DEMO_MODE", "runtime demo opt-in"],
  [runtimeConfig, '"unconfigured"', "fail-closed runtime mode"],
  [packageManifest, '"build:demo"', "explicit demo build"],
  [previewWorkflow, "npm run build:demo", "preview-only demo build"],
];
const failures = [
  ...requiredHeaders.filter((value) => !headers.includes(value)).map((value) => `missing header contract: ${value}`),
  ...requiredWorkerRules.filter((value) => !worker.includes(value)).map((value) => `missing SW guard: ${value}`),
  ...requiredDemoBoundaryRules
    .filter(([source, value]) => !source.includes(value))
    .map(([, , label]) => `missing demo boundary contract: ${label}`),
];
const connectSources = headers.match(/connect-src ([^;]+)/)?.[1].split(/\s+/) ?? [];
if (connectSources.includes("*")) failures.push("CSP connect-src must not use a global wildcard origin");
if (/respondWith\(\s*caches\.match\(event\.request\)/.test(worker))
  failures.push("SW must not cache arbitrary requests");

if (failures.length) {
  console.error(`Security contract check failed:\n${failures.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}
console.log("Security header and service-worker allowlist contract passed.");
