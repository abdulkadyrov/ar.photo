import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createCanvas } from "canvas";
import JSZip from "jszip";

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
