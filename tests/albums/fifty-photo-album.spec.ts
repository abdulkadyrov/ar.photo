import { expect, test } from "@playwright/test";
import QRCode from "qrcode";
import { readFile } from "node:fs/promises";
const slug = "a".repeat(36);

test("recognizes either end of a 50-photo album, loads only viewed clips and reuses disk cache after reload", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const [one, two, mindOne, mindTwo, decoy, video] = await Promise.all([
    readFile("test-assets/album/1.png"),
    readFile("test-assets/album/2.png"),
    readFile("test-assets/album/1.mind"),
    readFile("test-assets/album/2.mind"),
    readFile("public/test-assets/test.mind"),
    readFile("test-assets/fixtures/h264-aac.mp4"),
  ]);
  const qr = await QRCode.toDataURL(`http://localhost/ar.photo/ar/${slug}`, { width: 150, margin: 4 });
  const behavior = { autoplay: true, loop: true, markerLost: "pause_hide", audioDefault: "muted" };
  const origin = "http://127.0.0.1:4186/ar.photo/album-test/";
  const targets = Array.from({ length: 50 }, (_, index) => ({
    targetId: `target-${index}`,
    title: `Photo ${index}`,
    marker: { width: 512, height: 384, aspectRatio: 4 / 3 },
    behavior,
    fallbackEnabled: true,
    assets: {
      trackingAssetUrl: `${origin}${index}.mind`,
      videoUrl: `${origin}${index}.mp4`,
      posterUrl: `${origin}${index}.webp`,
    },
  }));
  const manifest = {
    version: 2,
    title: "Synthetic album",
    marker: targets[0].marker,
    behavior,
    fallbackEnabled: true,
    assets: targets[0].assets,
    targets,
    signedUrlsExpireAt: new Date(Date.now() + 300000).toISOString(),
  };
  const downloads: number[] = [];
  let markerRequests = 0;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/functions/v1/**", async (route) => {
    if (route.request().url().includes("public-ar-manifest"))
      await route.fulfill({ json: manifest, headers: { "access-control-allow-origin": "*" } });
    else await route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } });
  });
  await page.route("**/album-test/*", async (route) => {
    const url = new URL(route.request().url());
    const index = Number(url.pathname.split("/").pop()!.split(".")[0]);
    if (url.pathname.endsWith(".mind")) {
      markerRequests++;
      await route.fulfill({
        body: index === 0 ? mindOne : index === 49 ? mindTwo : decoy,
        contentType: "application/octet-stream",
      });
    } else if (url.pathname.endsWith(".mp4")) {
      downloads.push(index);
      if (index === 49 && downloads.filter((value) => value === 49).length === 1) {
        await route.fulfill({ status: 503, body: "unavailable" });
        return;
      }
      if (index === 0 && downloads.length === 1) await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({ body: video, contentType: "video/mp4" });
    } else if (url.pathname.endsWith(".png"))
      await route.fulfill({ body: index === 0 ? one : two, contentType: "image/png" });
    else await route.fulfill({ body: "", contentType: "image/webp" });
  });
  await page.addInitScript(
    ({ qr, origin }) => {
      const state = { selected: 0, requests: 0, sources: 0, mediaElements: 0, streams: [] as MediaStream[] };
      const elements = new WeakSet<HTMLMediaElement>();
      const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "src")!;
      Object.defineProperty(HTMLMediaElement.prototype, "src", {
        ...descriptor,
        set(value: string) {
          if (value.startsWith("blob:")) {
            state.sources++;
            if (!elements.has(this)) {
              elements.add(this);
              state.mediaElements++;
            }
          }
          descriptor.set!.call(this, value);
        },
      });
      Object.assign(window, { __albumCamera: state });
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => {
            state.requests++;
            const load = (src: string) =>
              new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = src;
              });
            const [a, b, q] = await Promise.all([load(origin + "0.png"), load(origin + "49.png"), load(qr)]);
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext("2d")!;
            const draw = () => {
              ctx.fillStyle = "#111";
              ctx.fillRect(0, 0, 640, 480);
              ctx.drawImage(q, 245, 0, 150, 150);
              ctx.drawImage(state.selected === 0 ? a : b, 120, 165, 400, 300);
            };
            draw();
            const stream = canvas.captureStream(15);
            state.streams.push(stream);
            const timer = setInterval(() => {
              if (stream.getTracks().every((t) => t.readyState === "ended")) clearInterval(timer);
              else draw();
            }, 66);
            return stream;
          },
        },
      });
    },
    { qr, origin },
  );
  await page.goto(`./ar/${slug}`);
  await expect(page.getByText("Загружаем видео…", { exact: true })).toBeVisible({ timeout: 90000 });
  await expect(page.getByText("Фото найдено", { exact: true })).toBeVisible({ timeout: 90_000 });
  expect(downloads).toEqual([0]);
  expect(markerRequests).toBe(50);
  await page.evaluate(() => {
    (window as unknown as { __albumCamera: { selected: number } }).__albumCamera.selected = 49;
  });
  await expect(page.getByText("Видео не загрузилось", { exact: true })).toBeVisible({ timeout: 30000 });
  await page.setViewportSize({ width: 319, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/album-50-checks/retry-319.png" });
  await page.getByRole("button", { name: "Повторить загрузку" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Фото найдено", { exact: true })).toBeVisible();
  expect(downloads).toEqual([0, 49, 49]);
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __albumCamera: { sources: number } }).__albumCamera.sources),
    )
    .toBe(2);
  await page.evaluate(() => {
    (window as unknown as { __albumCamera: { selected: number } }).__albumCamera.selected = 0;
  });
  await expect(page.getByText("Фото найдено", { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __albumCamera: { sources: number } }).__albumCamera.sources),
    )
    .toBe(3);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByText("Фото найдено", { exact: true })).toBeVisible({ timeout: 90000 });
  await page.evaluate(() => {
    (window as unknown as { __albumCamera: { selected: number } }).__albumCamera.selected = 49;
  });
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __albumCamera: { sources: number } }).__albumCamera.sources),
    )
    .toBe(2);
  await expect(page.getByText("Фото найдено", { exact: true })).toBeVisible();
  expect(downloads).toEqual([0, 49, 49]);
  expect(markerRequests).toBe(50);
  expect(
    await page.evaluate(
      () => (window as unknown as { __albumCamera: { mediaElements: number } }).__albumCamera.mediaElements,
    ),
  ).toBe(1);
  expect(
    await page.evaluate(() => (window as unknown as { __albumCamera: { requests: number } }).__albumCamera.requests),
  ).toBe(1);
  expect(errors).toEqual([]);
  await page.screenshot({ path: "artifacts/album-50-checks/fifty-album.png" });
});
