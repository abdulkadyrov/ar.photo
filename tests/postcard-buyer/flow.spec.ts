import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
const publicToken = "1234567890abcdef1234567890abcdef";
const slug = "abcdef".repeat(6);
const uploadId = "70000000-0000-4000-8000-000000000001";
const origin = "http://127.0.0.1:4182";

async function mockBuyer(page: Page, initiallyPublished = false) {
  await page.route(`${origin}/processed-postcard.mp4`, (route) =>
    route.fulfill({ status: 200, contentType: "video/mp4", body: readFileSync("test-assets/fixtures/h264-aac.mp4") }),
  );
  let state = initiallyPublished ? "published" : "available";
  let ownerToken: string | null = null;
  let mode = "frame";
  let uploads = 0;
  const snapshot = () => ({
    card: {
      publicToken,
      templateCode: "eid",
      title: "Ид мубарак!",
      state,
      mode,
      frame: { x: 0.1, y: 0.285, width: 0.8, height: 0.46 },
      publicSlug: state === "published" ? slug : null,
    },
    limits: { maxVideoBytes: 104857600, maxVideoSeconds: 120 },
    owned: Boolean(ownerToken),
    jobs:
      state === "processing" || state === "ready"
        ? ["marker_analysis", "video_transcode", "video_inspection", "marker_compilation", "thumbnail_generation"].map(
            (stage) => ({
              stage,
              status: state === "ready" ? "succeeded" : "queued",
              progress: state === "ready" ? 100 : 0,
            }),
          )
        : [],
    previewImageUrl: `${origin}/ar.photo/postcards/eid-v1.webp`,
    videoPreviewUrl: state === "ready" || state === "published" ? `${origin}/processed-postcard.mp4` : null,
  });
  await page.route("https://postcard-api.test/functions/v1/postcard-buyer**", async (route) => {
    const headers = {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, PUT, OPTIONS",
      "access-control-allow-headers": "apikey,content-type,x-postcard-edit-token",
    };
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers });
      return;
    }
    if (route.request().method() === "PUT") {
      expect(route.request().headers()["x-postcard-edit-token"]).toBe(ownerToken);
      expect(route.request().postDataBuffer()?.byteLength).toBeGreaterThan(1000);
      uploads++;
      await route.fulfill({ status: 200, headers, json: { uploaded: true } });
      return;
    }
    const body = route.request().postDataJSON();
    expect(body.publicToken).toBe(publicToken);
    if (body.action === "claim") {
      expect(body.shopCode).toBe("ABCDEF123456");
      expect(body.editToken).toMatch(/^[a-f0-9]{64}$/);
      ownerToken = body.editToken;
      state = "claimed";
    }
    if (body.action === "upload") {
      expect(body.video.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(body.marker).toBeUndefined();
      mode = body.mode;
      await route.fulfill({
        status: 200,
        headers,
        json: {
          uploadId,
          video: {
            signedUrl: `https://postcard-api.test/functions/v1/postcard-buyer/upload/${publicToken}/${uploadId}`,
            headers: { "x-postcard-edit-token": ownerToken },
          },
        },
      });
      return;
    }
    if (body.action === "completeUpload") {
      expect(uploads).toBe(1);
      state = "processing";
    }
    if (body.action === "state" && state === "processing") state = "ready";
    if (body.action === "publish") {
      expect(state).toBe("ready");
      state = "published";
    }
    await route.fulfill({ status: 200, headers, json: snapshot() });
  });
}

for (const width of [319, 390, 1440]) {
  test(`activates, previews, uploads and explicitly publishes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockBuyer(page);
    await page.goto(`./card/${publicToken}`);
    await expect(page.getByRole("heading", { name: "Активируйте открытку" })).toBeVisible();
    await page.screenshot({ path: `artifacts/postcards-full-20261125/buyer-${width}-activation.png`, fullPage: true });
    await page.getByLabel("Код с вкладыша").fill("ABCD · EF12 · 3456");
    await page.getByRole("button", { name: "Активировать открытку", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Добавьте своё видео" })).toBeVisible();
    await page.getByRole("radio", { name: /На всю открытку/ }).check();
    await page.getByRole("radio", { name: /Внутри рамки/ }).check();
    await page.getByLabel("Выбрать видео для открытки").setInputFiles("test-assets/fixtures/h264-aac.mp4");
    await expect(page.getByRole("button", { name: "Загрузить видео", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Загрузить видео", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Проверьте и опубликуйте" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Опубликовать подарок" })).toBeEnabled();
    await expect
      .poll(() =>
        page.locator(".postcard-buyer-preview video").evaluate((node) => {
          const video = node as HTMLVideoElement;
          return video.currentSrc.endsWith("/processed-postcard.mp4") && video.readyState >= 2 && video.videoWidth > 0;
        }),
      )
      .toBe(true);
    await page.locator(".postcard-buyer-preview video").evaluate(async (node) => {
      const video = node as HTMLVideoElement;
      video.muted = true;
      await video.play();
      await new Promise<void>((resolve) => video.addEventListener("timeupdate", () => resolve(), { once: true }));
      video.pause();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/postcards-full-20261125/buyer-${width}-ready.png`, fullPage: true });
    await page.getByRole("button", { name: "Опубликовать подарок" }).click();
    await expect(page.getByRole("heading", { name: "Ваш подарок готов" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Посмотреть подарок" })).toHaveAttribute(
      "href",
      `/ar.photo/ar/${slug}`,
    );
    const backup = page.waitForEvent("download");
    await page.getByRole("button", { name: /Скачать.*доступ|Скачать.*ссылк|Скачать файл/ }).click();
    expect((await backup).suggestedFilename()).toContain("доступ");
  });
}

test("an unowned published QR opens the existing viewer without registration", async ({ page }) => {
  await mockBuyer(page, true);
  await page.goto(`./card/${publicToken}`);
  await expect(page).toHaveURL(new RegExp(`/ar/${slug}$`));
});

test("cancelled browser Back preserves the exact buyer entry, File and placement for upload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockBuyer(page);
  await page.addInitScript(
    ({ token }) => {
      if (location.pathname.endsWith(`/card/${token}`)) {
        history.replaceState({ idx: 0, key: "buyer-origin", usr: { from: "postcard" } }, "", "/ar.photo/privacy");
        history.pushState(
          { idx: 1, key: "buyer-draft", usr: { draft: true } },
          "",
          `/ar.photo/card/${token}?gift=1#preview`,
        );
      }
    },
    { token: publicToken },
  );
  await page.goto(`./card/${publicToken}`);
  await page.getByLabel("Код с вкладыша").fill("ABCDEF123456");
  await page.getByRole("button", { name: "Активировать открытку", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Добавьте своё видео" })).toBeVisible();
  const picker = page.getByLabel("Выбрать видео для открытки");
  await picker.setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await expect(page.getByRole("button", { name: "Загрузить видео", exact: true })).toBeEnabled();
  await page.getByRole("radio", { name: /На всю открытку/ }).check();
  const dialogShown = new Promise<void>((resolve) =>
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain("Выбранное видео");
      await dialog.dismiss();
      resolve();
    }),
  );
  await page.evaluate(() => history.back());
  await Promise.race([
    dialogShown,
    new Promise((_, reject) => setTimeout(() => reject(new Error("No confirmation after browser Back")), 5000)),
  ]);
  await expect(page).toHaveURL(`${origin}/ar.photo/card/${publicToken}?gift=1#preview`);
  await expect(page.getByText(/h264-aac\.mp4/)).toBeVisible();
  await expect(page.getByRole("radio", { name: /На всю открытку/ })).toBeChecked();
  expect(await page.evaluate(() => history.state)).toEqual({ idx: 1, key: "buyer-draft", usr: { draft: true } });
  await page.getByRole("button", { name: "Загрузить видео", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Проверьте и опубликуйте" })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "Опубликовать подарок" })).toBeEnabled();
});
