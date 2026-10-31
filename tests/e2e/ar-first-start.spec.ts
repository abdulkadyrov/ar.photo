import { expect, test } from "@playwright/test";
import QRCode from "qrcode";

test("hands the first QR camera stream to real AR tracking without a page reload", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Canvas camera fixture requires Chromium captureStream");
  test.setTimeout(90_000);
  const qr = await QRCode.toDataURL("http://localhost/ar.photo/ar/demo", { width: 150, margin: 4 });
  await page.addInitScript((qrImage) => {
    const state = { requests: 0, tracks: [] as MediaStreamTrack[] };
    Object.assign(window, { __arFirstStart: state });
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
          const [photo, qr] = await Promise.all([load("/ar.photo/test-assets/test.jpg"), load(qrImage)]);
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext("2d")!;
          const draw = () => {
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, 640, 480);
            ctx.drawImage(qr, 245, 5, 150, 150);
            ctx.drawImage(photo, 70, 180, 500, 281);
          };
          draw();
          const stream = canvas.captureStream(15);
          state.tracks.push(...stream.getTracks());
          const timer = setInterval(() => {
            if (stream.getTracks().every((track) => track.readyState === "ended")) clearInterval(timer);
            else draw();
          }, 66);
          return stream;
        },
      },
    });
  }, qr);
  await page.goto("./ar/demo");
  await page.getByRole("button", { name: "Включить камеру", exact: true }).click();
  await expect(page.getByText("Фото найдено", { exact: true })).toBeVisible({ timeout: 60_000 });
  const camera = await page.locator(".ar-viewer-stage > video").evaluate((video) => {
    const rect = video.getBoundingClientRect();
    return { width: rect.width, height: rect.height, viewportWidth: innerWidth, viewportHeight: innerHeight };
  });
  expect(camera.width).toBeGreaterThanOrEqual(camera.viewportWidth);
  expect(camera.height).toBeGreaterThanOrEqual(camera.viewportHeight);
  expect(
    await page.evaluate(() => (window as unknown as { __arFirstStart: { requests: number } }).__arFirstStart.requests),
  ).toBe(1);
  // Client-side departure must release the stream owned by the AR session.
  await page.evaluate(() => {
    history.pushState({}, "", "/ar.photo/login");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { __arFirstStart: { tracks: MediaStreamTrack[] } }).__arFirstStart.tracks.every(
          (track) => track.readyState === "ended",
        ),
      ),
    )
    .toBe(true);
});
