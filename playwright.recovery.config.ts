import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/recovery",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4181/ar.photo/", trace: "on-first-retry" },
  projects: [{ name: "recovery-chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "VITE_SUPABASE_URL=https://auth.example.test VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_recovery_fixture_only VITE_ENABLE_DEMO_MODE=false VITE_AUTH_EMAIL_ENABLED=false npm run build && npm run preview -- --host 127.0.0.1 --port 4181 --strictPort",
    reuseExistingServer: false,
    url: "http://127.0.0.1:4181/ar.photo/",
    timeout: 120000,
  },
});
