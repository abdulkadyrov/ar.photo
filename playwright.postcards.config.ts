import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/postcard-buyer",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4182/ar.photo/", browserName: "chromium", trace: "on-first-retry" },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4182 --strictPort",
    url: "http://127.0.0.1:4182/ar.photo/",
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_ENABLE_DEMO_MODE: "false",
      VITE_SUPABASE_URL: "https://postcard-api.test",
      VITE_SUPABASE_PUBLISHABLE_KEY: "postcard-test-public-publishable-key",
    },
  },
});
