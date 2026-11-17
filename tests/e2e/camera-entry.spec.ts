import { expect, test } from "@playwright/test";

for (const width of [319, 390, 1440]) {
  test(`starts the camera immediately and allows retry at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      Object.assign(window, { cameraRequests: 0 });
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => {
            (window as unknown as { cameraRequests: number }).cameraRequests++;
            throw new DOMException("denied", "NotAllowedError");
          },
        },
      });
    });
    await page.goto("./camera");
    await expect(page.getByRole("heading", { name: "Камера не запустилась" })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { cameraRequests: number }).cameraRequests)).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Повторить" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { cameraRequests: number }).cameraRequests))
      .toBe(2);
    await expect(page.getByRole("heading", { name: "Камера не запустилась" })).toBeVisible();
    await page.screenshot({ path: `artifacts/camera-entry-${width}.png`, animations: "disabled" });
  });
}

test("shows a live camera without a start button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 480;
          const context = canvas.getContext("2d")!;
          context.fillStyle = "#675e52";
          context.fillRect(0, 0, 640, 480);
          return canvas.captureStream(15);
        },
      },
    });
  });
  await page.goto("./camera");
  await expect(page.getByRole("heading", { name: "Наведите на QR-код" })).toBeVisible();
  await expect(page.getByRole("button")).toHaveCount(0);
  await page.screenshot({ path: "artifacts/camera-entry-live.png" });
});

test("explicit video links do not request a camera", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { cameraRequests: 0 });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          (window as unknown as { cameraRequests: number }).cameraRequests++;
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./ar/demo?view=video");
  await expect(page.getByTestId("public-ar-fallback-video")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { cameraRequests: number }).cameraRequests)).toBe(0);
});
