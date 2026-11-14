import { expect, test } from "@playwright/test";

const accountPages = [
  ["dashboard", "Главная"],
  ["projects", "Проекты"],
  ["groups", "Группы"],
  ["items", "AR"],
  ["create", "Новое AR-фото"],
  ["media", "Медиа"],
  ["qr-codes", "QR"],
  ["analytics", "Аналитика"],
  ["profile", "Профиль"],
  ["settings", "Настройки"],
  ["settings/subscription", "Подписка"],
  ["settings/team", "Команда"],
  ["settings/security", "Безопасность"],
  ["support", "Поддержка"],
];

test("keeps the customer workspace separate from platform administration at every size", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("./login");
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  for (const width of [1440, 768, 319]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route] of accountPages) {
      await page.goto(`./${route}`);
      await expect(page.locator(".account-shell main")).toBeVisible();
      await expect(page.locator("h1")).not.toBeEmpty();
      await expect(page.getByRole("navigation", { name: "Разделы администрации", exact: true })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Супер-админ", exact: true })).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route} overflows at ${width}px`,
      ).toBe(true);
    }
  }
});

test("shows all administration sections through the mobile menu and keeps keyboard focus inside it", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 319, height: 628 });
  await page.goto("./admin");
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Обзор платформы", exact: true })).toBeVisible();
  for (const label of [
    "Аккаунты",
    "Пользователи",
    "Подписки",
    "Тарифы",
    "Аналитика",
    "Активность",
    "Контент",
    "Обработка",
    "Хранилище",
    "Настройки",
    "Журнал",
    "Обзор",
  ]) {
    await page.getByRole("button", { name: "Разделы", exact: true }).click();
    const menu = page.getByRole("dialog", { name: "Разделы администрации" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link")).toHaveCount(13);
    await menu.getByRole("link", { name: label, exact: true }).click();
    await expect(menu).not.toBeVisible();
    await expect(page.locator(".admin-workspace")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} overflows`).toBe(
      true,
    );
  }
  await page.getByRole("button", { name: "Разделы", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Разделы администрации" });
  await page.keyboard.press("Tab");
  expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Разделы", exact: true })).toBeFocused();
});
