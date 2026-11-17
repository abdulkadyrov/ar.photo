import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "access.capture.pw.ts",
  workers: 1,
  retries: 0,
  timeout: 120_000,
  reporter: "list",
  outputDir: "/tmp/khanzama-fidelity/access/playwright",
  use: { baseURL: "http://127.0.0.1:4179/ar.photo/", browserName: "chromium", deviceScaleFactor: 1 },
});
