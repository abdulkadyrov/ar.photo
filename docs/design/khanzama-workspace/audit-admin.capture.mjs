// Observational demo-only browser capture. Uses the existing shared Vite server; never builds or launches a server.
import { createRequire } from "node:module";
import { URL } from "node:url";
import process from "node:process";
import fs from "node:fs/promises";
const require = createRequire(new URL("../../../package.json", import.meta.url));
const { chromium } = require("@playwright/test");
const phase = process.argv[2] ?? "after";
if (!["before", "after", "narrow"].includes(phase)) throw new Error("Expected before, after or narrow capture phase");
const out = `/tmp/khanzama-fidelity/admin/${phase}`;
await fs.mkdir(out, { recursive: true });
const A = "20000000-0000-4000-8000-000000000001",
  U = "10000000-0000-4000-8000-000000000010";
const cases = [
  ["admin-overview", "section=overview", [1106, 892], [387, 892]],
  ["admin-accounts", "section=accounts", [1107, 876], [380, 877]],
  [
    "admin-account-detail",
    `section=accounts&account=${A}&accountView=detail&accountTab=overview`,
    [1077, 911],
    [424, 911],
  ],
  [
    "admin-account-edit",
    `section=accounts&account=${A}&accountView=detail&accountTab=overview&accountEdit=1`,
    [1098, 895],
    [372, 891],
  ],
  ["admin-users", `section=users&account=${A}`, [1170, 898], [347, 896]],
  ["admin-user-detail", `section=users&account=${A}&user=${U}`, [1118, 899], [371, 898]],
  ["admin-subscriptions", `section=subscriptions&account=${A}`, [1133, 871], [390, 871]],
  ["admin-plans", "section=plans", [1127, 922], [347, 922]],
  ["admin-plan-edit", "section=plans", [1168, 898], [353, 897]],
  ["admin-analytics", "section=analytics", [1114, 881], [380, 882]],
  ["admin-activity", `section=activity&account=${A}`, [1106, 870], [406, 870]],
  ["admin-content", "section=items", [1332, 779], [360, 779]],
  ["admin-jobs", "section=errors", [1082, 911], [394, 909]],
  ["admin-storage", "section=storage", [1103, 923], [387, 923]],
  ["admin-settings", "section=settings", [1106, 935], [367, 935]],
  ["admin-audit", "section=audit", [1162, 971], [360, 974]],
];
const browser = await chromium.launch();
const context = await browser.newContext();
const login = await context.newPage();
await login.goto("http://127.0.0.1:4179/ar.photo/login");
await login.getByLabel("Пароль", { exact: true }).fill("ArPhotoDemo1!");
await login.getByRole("button", { name: "Войти", exact: true }).click();
await login.waitForURL("**/dashboard");
await login.close();
const manifest = [];
for (const [name, query, d, m] of cases)
  for (const [device, bounds] of phase === "narrow"
    ? [["mobile", [319, 700]]]
    : [
        ["desktop", d],
        ["mobile", m],
      ]) {
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    await page.setViewportSize({ width: bounds[0], height: bounds[1] });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    try {
      await page.goto(`http://127.0.0.1:4179/ar.photo/admin?${query}`);
      await page.locator(".admin-workspace").waitFor();
      if (query.includes("account="))
        await page
          .getByRole("status")
          .filter({ hasText: "Открываем аккаунт" })
          .waitFor({ state: "hidden" })
          .catch(() => {});
      if (name === "admin-plan-edit") {
        await page.getByRole("button", { name: "Редактировать", exact: true }).first().click();
        await page.getByLabel("Название", { exact: true }).waitFor();
      }
      if (name === "admin-subscriptions") await page.getByLabel("Тариф или пакет").selectOption({ index: 2 });
      if (name === "admin-content") {
        await page.getByLabel("Поиск проектов и AR-работ").fill("Выпускной");
        await page.getByRole("button", { name: "Найти", exact: true }).click();
        if (device === "desktop") await page.getByRole("button", { name: "Открыть", exact: true }).first().click();
      }
      if (name === "admin-jobs") await page.locator(".admin-job summary").first().click();
      if (name === "admin-audit") {
        const detail = page.getByRole("button", { name: "Детали", exact: true });
        if (await detail.count()) await detail.first().click();
        else await page.locator(".admin-audit-card").first().click();
      }
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${out}/${name}-${device}.png` });
      const metrics = await page.evaluate(() => ({
        viewport: [globalThis.innerWidth, globalThis.innerHeight],
        scrollWidth: globalThis.document.documentElement.scrollWidth,
        scrollHeight: globalThis.document.documentElement.scrollHeight,
        headings: [...globalThis.document.querySelectorAll("h1,h2")].map((e) => ({
          text: e.textContent,
          size: globalThis.getComputedStyle(e).fontSize,
        })),
      }));
      if (metrics.scrollHeight > bounds[1] + 10)
        await page.screenshot({ path: `${out}/${name}-${device}-full.png`, fullPage: true });
      else await fs.rm(`${out}/${name}-${device}-full.png`, { force: true });
      await fs.rm(`${out}/${name}-${device}-error.png`, { force: true });
      manifest.push({ name, device, capturedAt: new Date().toISOString(), url: page.url(), ...metrics, errors });
      globalThis.console.log(name, device, "ok", metrics.scrollWidth);
    } catch (error) {
      manifest.push({ name, device, error: String(error), errors });
      globalThis.console.log(name, device, "ERROR", String(error).slice(0, 250));
      await page.screenshot({ path: `${out}/${name}-${device}-error.png` }).catch(() => {});
    } finally {
      await page.close();
    }
  }
await fs.writeFile(`${out}/manifest.json`, JSON.stringify(manifest, null, 2));
await browser.close();
