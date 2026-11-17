import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const phase = process.env.FIDELITY_PHASE === "after" ? "after" : "before";
const integrationFix = process.env.FIDELITY_SCOPE === "integration-fix";
const qrPrintFix = process.env.FIDELITY_SCOPE === "qr-print-fix";
const output = `/tmp/khanzama-fidelity/media/${qrPrintFix ? "qr-print-fix" : integrationFix ? "integration-fix" : phase}`;
const sheets = [
  { id: "account-items", route: "/items", pc: [1292, 808], mobile: [422, 808] },
  { id: "account-item-detail", route: "/items/:id", pc: [1104, 929], mobile: [394, 929] },
  { id: "account-create", route: "/create", pc: [1093, 941], mobile: [405, 941] },
  { id: "account-edit", route: "/items/:id/edit", pc: [1110, 932], mobile: [366, 932] },
  { id: "account-media", route: "/media", pc: [1084, 901], mobile: [411, 901] },
  { id: "account-qr-list", route: "/qr-codes", pc: [1102, 885], mobile: [425, 885] },
  { id: "account-qr-detail", route: "/items/:id/qr", pc: [1084, 883], mobile: [407, 883] },
  { id: "viewer-camera", route: "/camera", pc: [1204, 752], mobile: [462, 752] },
  { id: "viewer-public", route: "/ar/demo", pc: [1233, 805], mobile: [399, 805] },
  { id: "viewer-unsupported", route: "/unsupported", pc: [996, 881], mobile: [412, 881] },
] as const;

async function navigate(page: Page, route: string) {
  // Keep this browser document: the demo repository deliberately keeps private
  // object URLs in memory. This is route-state setup, not Back-navigation proof.
  await page.evaluate((route) => {
    const state = { usr: null, key: crypto.randomUUID(), idx: (window.history.state?.idx ?? 0) + 1 };
    window.history.pushState(state, "", `/ar.photo${route}`);
    window.dispatchEvent(new PopStateEvent("popstate", { state }));
    window.scrollTo(0, 0);
  }, route);
  await expect(page.locator("h1").first()).toBeVisible();
}

async function selectPair(page: Page, title: string) {
  await page.getByLabel("Название", { exact: true }).fill(title);
  await page.getByLabel("Выбрать фотографию-маркер").setInputFiles("public/test-assets/test.jpg");
  await page.getByLabel("Выбрать видео", { exact: true }).setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await expect
    .poll(() =>
      page
        .getByTestId("video-media-picker")
        .locator("video")
        .evaluate((video) => (video as HTMLVideoElement).readyState),
    )
    .toBeGreaterThanOrEqual(2);
}

test("media / AR / QR reference viewport audit", async ({ page }) => {
  test.setTimeout(240_000);
  await mkdir(output, { recursive: true });
  await page.addLocatorHandler(page.getByRole("button", { name: "Отложить обновление" }), async (button) =>
    button.click(),
  );
  await page.setViewportSize({ width: 1292, height: 808 });
  await page.goto("./login");
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
  for (const title of ["Море — проверка интерфейса", "Весна — проверка интерфейса", "Наш сад — проверка интерфейса"]) {
    await navigate(page, "/create");
    await selectPair(page, title);
    if (phase === "after" && !integrationFix && !qrPrintFix && title.startsWith("Море")) {
      await page.getByRole("button", { name: "Кадрировать фото", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.getByRole("button", { name: "Кадр и монтаж видео", exact: true }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await page.locator(".quick-playback-settings>summary").click();
      await expect(page.getByRole("slider", { name: "Линия сравнения фото и видео" })).toBeVisible();
      await page.locator(".quick-playback-settings>summary").click();
    }
    await page.getByRole("button", { name: "Подготовить и опубликовать", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Всё готово", exact: true })).toBeVisible({ timeout: 45_000 });
    await page.getByRole("button", { name: "Создать ещё", exact: true }).click();
  }
  const fixture = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("ar-photo-demo-ar-items-v1")!);
    const catalog = JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!);
    return {
      itemId: state.items[0].id as string,
      projectId: state.items[0].project_id as string,
      groupName: catalog.groups.find((group: { id: string }) => group.id === state.items[0].group_id)?.name as string,
    };
  });
  const rows: object[] = [];
  for (const sheet of sheets) {
    if (integrationFix && sheet.id !== "account-media" && sheet.id !== "account-edit") continue;
    if (qrPrintFix && sheet.id !== "account-qr-detail") continue;
    for (const mode of ["pc", "mobile"] as const) {
      const [width, height] = sheet[mode];
      await page.setViewportSize({ width, height });
      const route = sheet.route.replace(":id", fixture.itemId);
      await navigate(page, route);
      const headings: Record<string, string> = {
        "account-items": "AR-работы",
        "account-item-detail": "Наш сад — проверка интерфейса",
        "account-create": "Новое AR-фото",
        "account-edit": "Редактирование AR-фото",
        "account-media": "Медиа и загрузки",
        "account-qr-list": "QR-коды",
        "account-qr-detail": "QR и публикация",
        "viewer-camera": "Оживите печатную фотографию",
        "viewer-public": "Демо AR Photo",
        "viewer-unsupported": "Откройте в другом браузере",
      };
      await expect(page.getByRole("heading", { name: headings[sheet.id], exact: true }).first()).toBeVisible();
      if (sheet.id === "account-create") await selectPair(page, "Новое живое фото");
      if (sheet.id === "account-media") {
        const project = page.getByRole("combobox", { name: "Проект", exact: true });
        await expect(project.locator("option")).not.toHaveCount(0);
        await project.selectOption({ label: "Быстрые AR-фото" });
        await expect(page.getByRole("combobox", { name: "Порядок файлов", exact: true })).toBeVisible();
        expect((await new AxeBuilder({ page }).withRules(["select-name"]).analyze()).violations).toEqual([]);
      }
      if (sheet.id === "account-edit") {
        expect(fixture.groupName).toBeTruthy();
        await expect(page.getByRole("definition").filter({ hasText: fixture.groupName })).toBeVisible();
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        (document.activeElement as HTMLElement)?.blur();
      });
      await expect(page.locator(".skeleton")).toHaveCount(0);
      if (phase === "after" && sheet.id === "account-item-detail" && mode === "mobile") {
        const qr = await page.locator(".ar-item-publication").boundingBox();
        const nav = await page.getByRole("navigation", { name: "Мобильная навигация", exact: true }).boundingBox();
        expect(qr!.y + qr!.height).toBeLessThanOrEqual(nav!.y);
      }
      await page.screenshot({ path: path.join(output, `${sheet.id}-${mode}.png`), animations: "disabled" });
      const geometry = await page.evaluate(() => ({
        bodyWidth: document.body.scrollWidth,
        viewportWidth: innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        viewportHeight: innerHeight,
        controls: Array.from(document.querySelectorAll("main button, main a.btn, main input, main select"))
          .filter((el) => (el as HTMLElement).offsetWidth > 0)
          .slice(0, 30)
          .map((el) => ({
            name: el.getAttribute("aria-label") || el.textContent?.trim(),
            box: el.getBoundingClientRect().toJSON(),
          })),
      }));
      if (geometry.pageHeight > height + 30)
        await page.screenshot({
          path: path.join(output, `${sheet.id}-${mode}-full.png`),
          fullPage: true,
          animations: "disabled",
        });
      rows.push({ id: sheet.id, mode, route, viewport: { width, height }, ...geometry });
    }
  }
  const extras: object[] = [];
  if (phase === "after" && !qrPrintFix) {
    for (const [name, route, title] of [
      ["detail", "/items/" + fixture.itemId, "Наш сад — проверка интерфейса"],
      ["create", "/create", "Новое AR-фото"],
      ["edit", "/items/" + fixture.itemId + "/edit", "Редактирование AR-фото"],
      ["qr", "/items/" + fixture.itemId + "/qr", "QR и публикация"],
      ["public", "/ar/demo", "Демо AR Photo"],
    ]) {
      if (integrationFix && name !== "edit") continue;
      await page.setViewportSize({ width: 319, height: 720 });
      await navigate(page, route);
      await expect(page.getByRole("heading", { name: title, exact: true }).first()).toBeVisible();
      if (name === "edit")
        await expect(page.getByRole("definition").filter({ hasText: fixture.groupName })).toBeVisible();
      if (name === "create") await selectPair(page, "Новое живое фото");
      await page.evaluate(() => {
        (document.activeElement as HTMLElement)?.blur();
      });
      await page.screenshot({ path: path.join(output, `narrow-${name}-319.png`), animations: "disabled" });
      extras.push({
        id: name,
        viewport: { width: 319, height: 720 },
        geometry: await page.evaluate(() => ({
          bodyWidth: document.body.scrollWidth,
          viewportWidth: innerWidth,
          height: document.documentElement.scrollHeight,
        })),
      });
      expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(319);
    }
    for (const [mode, width, height] of [
      ["pc", 996, 881],
      ["mobile", 412, 881],
    ] as const) {
      if (integrationFix) continue;
      await page.setViewportSize({ width, height });
      await navigate(page, "/unsupported?publicSlug=demo");
      await expect(page.getByRole("link", { name: "Смотреть видео", exact: true })).toBeVisible();
      await page.screenshot({
        path: path.join(output, `viewer-unsupported-context-${mode}.png`),
        animations: "disabled",
      });
    }
    await writeFile(path.join(output, "extra-checks.json"), JSON.stringify(extras, null, 2));
  }
  if (qrPrintFix) {
    await page.setViewportSize({ width: 319, height: 720 });
    await navigate(page, `/items/${fixture.itemId}/qr`);
    const details = page.locator(".qr-extra-card");
    const summary = details.locator(":scope > summary");
    const style = page.getByRole("button", { name: "AR Photo", exact: true });
    const settleToggle = async () => {
      // Native details toggle is queued, so prove stability after browser frames,
      // rather than only checking React's immediate controlled-open render.
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
      );
    };
    await expect(details).not.toHaveAttribute("open");
    await expect(page).not.toHaveURL(/[?&]print=/);
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(details).toHaveAttribute("open");
    await settleToggle();
    await expect(page).not.toHaveURL(/[?&]print=/);
    await summary.click();
    await expect(page).toHaveURL(/[?&]print=collapsed/);
    await summary.click();
    await settleToggle();
    await expect(page).toHaveURL(/[?&]print=expanded/);
    await expect(style).toBeVisible();
    await page.setViewportSize({ width: 319, height: 720 });
    await settleToggle();
    await expect(page).toHaveURL(/[?&]print=expanded/);
    await expect(style).toBeVisible();
    await summary.focus();
    await page.keyboard.press("Space");
    await settleToggle();
    await expect(page).toHaveURL(/[?&]print=collapsed/);
    await expect(details).not.toHaveAttribute("open");
    await page.setViewportSize({ width: 1280, height: 900 });
    await settleToggle();
    await expect(details).not.toHaveAttribute("open");
    await expect(page).toHaveURL(/[?&]print=collapsed/);
    await summary.focus();
    await page.keyboard.press("Enter");
    await settleToggle();
    await expect(page).toHaveURL(/[?&]print=expanded/);
    await expect(style).toBeVisible();
  }
  await writeFile(path.join(output, "matrix.json"), JSON.stringify({ phase, fixture, rows }, null, 2));
});
