import { readFile } from "node:fs/promises";

const headers = await readFile("public/_headers", "utf8");
const worker = await readFile("public/sw.js", "utf8");
const runtimeConfig = await readFile("src/shared/config/env.ts", "utf8");
const packageManifest = await readFile("package.json", "utf8");
const pagesWorkflow = await readFile(".github/workflows/deploy.yml", "utf8");
const supabaseConfig = await readFile("supabase/config.toml", "utf8");

function getTomlSection(source, name) {
  const marker = `[${name}]`;
  const start = source.indexOf(marker);
  if (start < 0) return "";
  const bodyStart = start + marker.length;
  const nextSection = source.slice(bodyStart).search(/^\[/m);
  return nextSection < 0 ? source.slice(bodyStart) : source.slice(bodyStart, bodyStart + nextSection);
}

const authConfig = getTomlSection(supabaseConfig, "auth");
const emailAuthConfig = getTomlSection(supabaseConfig, "auth.email");
const totpAuthConfig = getTomlSection(supabaseConfig, "auth.mfa.totp");
const storageConfig = getTomlSection(supabaseConfig, "storage");
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
  'cache: "reload"',
  'cache: "no-store"',
];
const requiredDemoBoundaryRules = [
  [runtimeConfig, "VITE_ENABLE_DEMO_MODE", "runtime demo opt-in"],
  [runtimeConfig, '"unconfigured"', "fail-closed runtime mode"],
  [packageManifest, '"build:demo"', "explicit demo build"],
  [pagesWorkflow, "VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}", "Pages Supabase URL secret"],
  [
    pagesWorkflow,
    "VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}",
    "Pages publishable key secret",
  ],
  [pagesWorkflow, "VITE_PUBLIC_APP_URL: https://abdulkadyrov.github.io/ar.photo/", "canonical Pages origin"],
  [pagesWorkflow, "run: npm run build", "production Pages build"],
  [pagesWorkflow, "cp dist/index.html dist/404.html", "Pages SPA fallback"],
  [
    pagesWorkflow,
    'git -C pages archive "$revision" assets | tar --extract --directory=dist',
    "restored immutable assets from recent Pages releases",
  ],
  [pagesWorkflow, "rsync -a --ignore-existing pages/assets/ dist/assets/", "retained immutable Pages assets"],
  [pagesWorkflow, "fetch-depth: 24", "Pages release history checkout"],
];
const requiredAuthConfigRules = [
  [authConfig, /enable_signup\s*=\s*true/, "self-service Auth signup"],
  [emailAuthConfig, /enable_signup\s*=\s*true/, "email signup provider"],
  [emailAuthConfig, /enable_confirmations\s*=\s*false/, "email autoconfirm"],
  [totpAuthConfig, /enroll_enabled\s*=\s*true/, "TOTP enrollment"],
  [totpAuthConfig, /verify_enabled\s*=\s*true/, "TOTP verification"],
  [storageConfig, /file_size_limit\s*=\s*"50MiB"/, "free-tier Storage upload ceiling"],
];
const failures = [
  ...requiredHeaders.filter((value) => !headers.includes(value)).map((value) => `missing header contract: ${value}`),
  ...requiredWorkerRules.filter((value) => !worker.includes(value)).map((value) => `missing SW guard: ${value}`),
  ...requiredDemoBoundaryRules
    .filter(([source, value]) => !source.includes(value))
    .map(([, , label]) => `missing demo boundary contract: ${label}`),
  ...requiredAuthConfigRules
    .filter(([source, pattern]) => !pattern.test(source))
    .map(([, , label]) => `missing Supabase Auth contract: ${label}`),
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
