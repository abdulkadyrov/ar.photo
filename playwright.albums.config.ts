import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/albums",
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4186/ar.photo/", browserName: "chromium", trace: "on-first-retry" },
  webServer: {
    command:
      process.env.ALBUM_PREVIEW === "1"
        ? "npm run preview -- --host 127.0.0.1 --port 4186 --strictPort"
        : "npm run dev -- --host 127.0.0.1 --port 4186 --strictPort",
    url: "http://127.0.0.1:4186/ar.photo/",
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_ENABLE_DEMO_MODE: "false",
      VITE_SUPABASE_URL: "https://album-api.test",
      VITE_SUPABASE_PUBLISHABLE_KEY: "album-test-public-publishable-key",
    },
  },
});
