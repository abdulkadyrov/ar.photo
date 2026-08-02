import { expect, test, type Page } from "@playwright/test";

async function signInToDemo(page: Page) {
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти" }).click();
}

test("opens the AR Photo prototype shell", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Оживающие выпускные фотографии" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Открыть проекты" })).toBeVisible();
});

test("navigates through the new router and keeps local project creation working", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Открыть проекты" }).click();

  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await signInToDemo(page);
  await expect(page).toHaveURL(/\/ar\.photo\/dashboard$/);
  await page.getByPlaceholder("Например, Выпускной 2026").fill("Router smoke test");
  await page.getByRole("button", { name: "Новый проект" }).click();

  await expect(page.getByRole("heading", { name: "Router smoke test" })).toBeVisible();
});

test("renders the responsive SaaS navigation", async ({ page }) => {
  await page.goto("./dashboard");
  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await signInToDemo(page);

  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Добро пожаловать в AR Photo" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("navigation", { name: "Мобильная навигация" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("protects the workspace and clears the demo session on logout", async ({ page }) => {
  await page.goto("./dashboard");
  await signInToDemo(page);

  await page.getByRole("button", { name: "Выйти" }).click();

  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
});

test("keeps the public MindAR regression route available without a camera grant", async ({ page }) => {
  await page.goto("./viewer/test");

  await expect(page.getByText("Test Viewer", { exact: true })).toBeVisible();
  await expect(page.getByAltText("test target")).toBeVisible();
});

test("creates a production project and group without duplicate submissions", async ({ page }) => {
  await page.goto("./projects");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Проекты", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Создать проект" }).first().click();
  const projectDialog = page.getByRole("dialog", { name: "Новый проект" });
  await projectDialog.getByPlaceholder("Например, Выпускной 2027").fill("Выпускной 2027 — Школа №25");
  await projectDialog.getByPlaceholder("Краткое описание проекта").fill("Тест production catalog flow");
  await projectDialog.getByRole("button", { name: "Создать проект" }).dblclick();

  await expect(page.getByRole("link", { name: "Выпускной 2027 — Школа №25" })).toHaveCount(1);
  await page.getByRole("link", { name: "Выпускной 2027 — Школа №25" }).click();
  await expect(page.getByRole("heading", { name: "Выпускной 2027 — Школа №25" })).toBeVisible();

  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("11А класс");
  await groupDialog.getByRole("button", { name: "Создать группу" }).dblclick();

  await expect(page.getByRole("heading", { name: "11А класс" })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
