import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const baseURL = process.env.FIDELITY_BASE_URL ?? "http://127.0.0.1:4179/ar.photo/";
const phase = process.env.FIDELITY_PHASE ?? "before";
const output = `/tmp/khanzama-fidelity/access/${phase}`;
const sheets = [
  { id: "access-login", route: "login", desktop: [1060, 896], mobile: [429, 888] },
  { id: "access-register", route: "register", desktop: [1049, 888], mobile: [400, 888] },
  { id: "access-reset", route: "reset-password", desktop: [1186, 711], mobile: [435, 711] },
  { id: "access-password", route: "update-password", desktop: [1041, 817], mobile: [424, 817], auth: true },
  {
    id: "access-mfa",
    route: phase === "before" ? "settings/security" : "mfa",
    desktop: [1204, 760],
    mobile: [448, 760],
    auth: true,
  },
  { id: "viewer-privacy", route: "privacy", desktop: [1005, 897], mobile: [440, 897] },
  { id: "viewer-not-found", route: "missing-fidelity-page", desktop: [1210, 751], mobile: [425, 751] },
] as const;
test("capture every access sheet at desktop and phone sizes", async ({ browser }) => {
  await mkdir(output, { recursive: true });
  const metrics = [];
  for (const sheet of sheets) {
    const context = await browser.newContext();
    const page = await context.newPage();
    if ("auth" in sheet) {
      await page.goto(`${baseURL}login`);
      await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
      await page.getByRole("button", { name: "Войти", exact: true }).click();
      await expect(page).toHaveURL(/dashboard$/);
    }
    for (const device of ["desktop", "mobile"] as const) {
      const [width, height] = sheet[device];
      await page.setViewportSize({ width, height });
      await page.goto(`${baseURL}${sheet.route}`);
      await expect(page.locator("h1")).toBeVisible();
      if (phase !== "before" && sheet.id === "access-password") {
        // This isolated demo fixture represents the server's insufficient_aal
        // response from the concept. No credentials are sent to a service.
        await page.evaluate(async () => {
          const loadedUrl = performance
            .getEntriesByType("resource")
            .map((entry) => entry.name)
            .find((name) => new URL(name).pathname.endsWith("/authAdapter.ts"));
          if (!loadedUrl) throw new Error("The real page auth module was not loaded");
          const { getAuthAdapter } = await import(loadedUrl);
          getAuthAdapter().updatePassword = async () => {
            throw { code: "insufficient_aal" };
          };
        });
        await page.getByLabel("Новый пароль", { exact: true }).fill("VisualOnly123");
        await page.getByLabel("Повторите пароль", { exact: true }).fill("VisualOnly123");
        await page.getByRole("button", { name: "Сохранить пароль", exact: true }).click();
        await expect(page.getByRole("button", { name: "Подтвердить MFA", exact: true })).toBeVisible();
      }
      await page.evaluate(() => document.fonts.ready);
      if (sheet.id === "viewer-privacy" && device === "mobile" && phase !== "before") {
        const footer = await page.locator(".public-privacy-footer").boundingBox();
        expect(footer).not.toBeNull();
        expect(footer!.y + footer!.height).toBeLessThanOrEqual(height);
      }
      await page.screenshot({ path: `${output}/${sheet.id}-${device}.png`, fullPage: false, animations: "disabled" });
      metrics.push({
        id: sheet.id,
        device,
        width,
        height,
        ...(await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          title: document.querySelector("h1")?.textContent,
        }))),
      });
    }
    if (phase !== "before")
      for (const width of [319, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await expect
          .poll(
            () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            `${sheet.id} at ${width}px`,
          )
          .toBe(true);
        await page.screenshot({ path: `${output}/${sheet.id}-narrow-${width}.png`, animations: "disabled" });
      }
    await context.close();
  }
  await writeFile(`${output}/metrics.json`, JSON.stringify(metrics, null, 2));
});
