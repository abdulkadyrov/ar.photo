import { expect, test } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createCanvas } from "canvas";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

const origin = process.env.POSTCARD_BUYER_TEST_ORIGIN ?? "http://127.0.0.1:4182";
const canonical = createCanvas(1200, 1800).toBuffer("image/png");
for (const width of [319, 390, 1440]) {
  test(`downloads a prepared archive with a fresh click at ${width}px even if automatic saving is blocked`, async ({
    page,
    browserName,
  }) => {
    let assetFetches = 0;
    await page.setViewportSize({ width, height: width === 319 ? 619 : 1000 });
    await page.addInitScript(() => {
      const click = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (!this.download) click.call(this);
      };
    });
    await page.route("https://postcard-api.test/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.includes("/rpc/postcard_prepare_batch"))
        return route.fulfill({ json: { project_id: "project", group_id: "group" } });
      if (path.includes("/rest/v1/media_assets"))
        return route.fulfill({
          json: { id: "asset", storage_bucket: "markers-private", storage_path: "canonical.png" },
        });
      if (path.includes("/storage/v1/object/sign/markers-private"))
        return route.fulfill({ json: { signedURL: "/object/sign/markers-private/canonical.png?token=test" } });
      return route.fulfill({ status: 404, json: { error: "Unexpected request" } });
    });
    await page.route(
      "https://postcard-api.test/storage/v1/object/sign/markers-private/canonical.png?token=test",
      async (route) => {
        assetFetches++;
        await route.fulfill({ contentType: "image/png", body: canonical });
      },
    );
    await page.goto(`${origin}/ar.photo/tests/postcard-buyer/fixtures/print.html`);
    await page.getByRole("button", { name: "Скачать PNG в ZIP", exact: true }).click();
    const link = page.getByRole("link", { name: "Скачать готовый ZIP", exact: true });
    await expect(link).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Архив готов");
    await link.focus();
    const downloaded = page.waitForEvent("download");
    await link.press("Enter");
    const file = await downloaded;
    expect(file.suggestedFilename()).toBe("postcards-batch-1.zip");
    const zip = await JSZip.loadAsync(await readFile((await file.path())!));
    const entries = Object.values(zip.files).filter((entry) => !entry.dir && entry.name.endsWith(".png"));
    expect(entries).toHaveLength(10);
    for (const entry of entries) expect(await entry.async("nodebuffer")).toEqual(canonical);
    const again = page.waitForEvent("download");
    await link.click();
    expect((await again).suggestedFilename()).toBe("postcards-batch-1.zip");
    expect(assetFetches).toBe(10);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({
      path: `artifacts/print-download-20261127/${browserName}-${width}.png`,
      fullPage: true,
    });
    await page.getByLabel("Количество для печати (1–20)").fill("1");
    await expect(link).toHaveCount(0);
  });
}

for (const width of [319, 390, 1440]) {
  test(`reviews postcard selection, saves real PDFs and restores Back at ${width}px`, async ({ page, browserName }) => {
    await page.setViewportSize({ width, height: width === 319 ? 619 : 1000 });
    await page.addInitScript(() => {
      const click = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (!this.download) click.call(this);
      };
    });
    let reviewImage = canonical;
    await page.route("https://postcard-api.test/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.includes("/rpc/postcard_prepare_batch"))
        return route.fulfill({ json: { project_id: "project", group_id: "group" } });
      if (path.includes("/rest/v1/media_assets"))
        return route.fulfill({
          json: { id: "asset", storage_bucket: "markers-private", storage_path: "canonical.png" },
        });
      if (route.request().method() === "POST" && path.includes("/storage/v1/object/sign/"))
        return route.fulfill({ json: { signedURL: "/object/sign/markers-private/canonical.png?token=test" } });
      if (path.includes("/storage/v1/object/sign/markers-private/canonical.png"))
        return route.fulfill({ contentType: "image/png", body: reviewImage });
      return route.fulfill({ status: 404, json: { error: "Unexpected request" } });
    });
    await page.goto(`${origin}/ar.photo/tests/postcard-buyer/fixtures/print.html`);
    reviewImage = Buffer.from(
      await page.evaluate(async () => {
        const image = new Image();
        image.src = "/ar.photo/postcards/milka-gift-v1.webp";
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 1800;
        canvas.getContext("2d")!.drawImage(image, 0, 0, 1200, 1800);
        return canvas.toDataURL("image/png").split(",")[1];
      }),
      "base64",
    );
    await page.getByLabel("Начать с номера", { exact: true }).fill("2");
    await page.getByLabel("Количество для печати (1–20)", { exact: true }).fill("4");
    const trigger = page.getByRole("button", { name: "Печать / PDF", exact: true });
    await trigger.focus();
    const sourceScroll = await page.evaluate(() => scrollY);
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Проверка перед печатью", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("checkbox")).toHaveCount(4);
    await dialog.getByRole("checkbox", { name: "Печатать открытку 5", exact: true }).uncheck();
    await expect(dialog.getByRole("status").first()).toContainText("Выбрано 3 из 4");
    await page.goBack();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByLabel("Начать с номера", { exact: true })).toHaveValue("2");
    await expect(page.getByLabel("Количество для печати (1–20)", { exact: true })).toHaveValue("4");
    await expect(trigger).toBeFocused();
    expect(Math.abs((await page.evaluate(() => scrollY)) - sourceScroll)).toBeLessThan(3);
    await page.goForward();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("checkbox", { name: "Печатать открытку 5", exact: true })).not.toBeChecked();
    await expect(dialog.getByRole("button", { name: "Печатать", exact: true })).toBeEnabled();
    await dialog.getByRole("button", { name: "Скачать PDF", exact: true }).click();
    const readyPdf = dialog.getByRole("link", { name: "Скачать PDF", exact: true });
    await expect(readyPdf).toBeVisible();
    const photoDownload = page.waitForEvent("download");
    await readyPdf.click();
    const photo = await photoDownload;
    const photoBytes = await readFile((await photo.path())!);
    const photoPdf = await PDFDocument.load(photoBytes);
    expect(photoPdf.getPageCount()).toBe(3);
    expect(photoPdf.getPage(0).getWidth()).toBeCloseTo((100 * 72) / 25.4, 5);
    expect(photoPdf.getPage(0).getHeight()).toBeCloseTo((150 * 72) / 25.4, 5);
    await dialog.getByRole("combobox", { name: "Формат печати", exact: true }).selectOption("a4");
    await expect(dialog.getByRole("link", { name: "Скачать PDF", exact: true })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Скачать PDF", exact: true }).click();
    await expect(readyPdf).toBeVisible();
    const a4Download = page.waitForEvent("download");
    await readyPdf.click();
    const a4 = await a4Download;
    const a4Bytes = await readFile((await a4.path())!);
    const a4Pdf = await PDFDocument.load(a4Bytes);
    expect(a4Pdf.getPageCount()).toBe(2);
    expect(a4Pdf.getPage(0).getWidth()).toBeCloseTo((210 * 72) / 25.4, 5);
    expect(a4Pdf.getPage(0).getHeight()).toBeCloseTo((297 * 72) / 25.4, 5);
    await mkdir("artifacts/crm-print-20261127", { recursive: true });
    await writeFile(`artifacts/crm-print-20261127/${browserName}-${width}-photo.pdf`, photoBytes);
    await writeFile(`artifacts/crm-print-20261127/${browserName}-${width}-a4.pdf`, a4Bytes);
    await page.screenshot({ path: `artifacts/crm-print-20261127/${browserName}-${width}-review.png`, fullPage: false });
    await dialog.getByRole("button", { name: "Снять выбор", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "Скачать PDF", exact: true })).toBeDisabled();
    await expect(dialog.getByRole("link", { name: "Скачать PDF", exact: true })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Выбрать все", exact: true }).click();
    await expect(dialog.getByRole("status").first()).toContainText("Выбрано 4 из 4");
    await dialog.getByRole("button", { name: "Закрыть проверку печати", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.reload();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeVisible();
  });
}
