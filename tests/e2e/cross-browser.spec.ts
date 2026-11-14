import { expect, test, type Page } from "@playwright/test";

async function signInToDemo(page: Page) {
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти" }).click();
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("opens the protected workspace with responsive navigation", async ({ page }) => {
  await page.goto("./dashboard");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
  const mobile = (page.viewportSize()?.width ?? 1_280) < 768;
  await expect(
    page.getByRole("navigation", { name: mobile ? "Мобильная навигация" : "Основная навигация" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("keeps public AR camera-explicit with a normal-video fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__crossBrowserCameraRequests", { value: 0, writable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          (window as typeof window & { __crossBrowserCameraRequests: number }).__crossBrowserCameraRequests += 1;
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./ar/demo");

  await expect(page.getByRole("button", { name: "Открыть AR-камеру" })).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as typeof window & { __crossBrowserCameraRequests: number }).__crossBrowserCameraRequests,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Открыть AR-камеру" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "Повторить", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Смотреть видео" }).click();
  await expect(page.getByTestId("public-ar-fallback-video")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("renders the MFA-gated admin console without leaking layout width", async ({ page }) => {
  await page.goto("./login");
  await signInToDemo(page);
  await page.goto("./admin");

  await expect(page.getByRole("heading", { name: "Обзор платформы", exact: true })).toBeVisible();
  await expect(page.getByText("MFA подтверждена", { exact: false })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await page.getByRole("button", { name: "Разделы", exact: true }).click();
    await page
      .getByRole("dialog", { name: "Разделы администрации" })
      .getByRole("link", { name: "Журнал", exact: true })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Разделы администрации", exact: true })
      .getByRole("link", { name: "Журнал", exact: true })
      .click();
  }
  await expect(page.getByRole("heading", { name: "История действий", level: 1 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
