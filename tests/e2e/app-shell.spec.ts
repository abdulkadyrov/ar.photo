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
  await projectDialog.locator('input[type="file"]').setInputFiles({
    name: "school-cover.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlFzh8AAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await projectDialog.getByRole("button", { name: "Создать проект" }).dblclick();

  await expect(page.getByRole("link", { name: "Выпускной 2027 — Школа №25" })).toHaveCount(1);
  await expect(page.locator("article").filter({ hasText: "Выпускной 2027 — Школа №25" }).locator("img")).toHaveCount(1);
  await page.getByRole("link", { name: "Выпускной 2027 — Школа №25" }).click();
  await expect(page.getByRole("heading", { name: "Выпускной 2027 — Школа №25" })).toBeVisible();

  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("11А класс");
  await groupDialog.getByRole("button", { name: "Создать группу" }).click();

  await expect(page.getByRole("heading", { name: "11А класс" })).toHaveCount(1);
  await expect(groupDialog).toBeHidden();

  const addGroupButton = page.getByRole("button", { name: "Добавить группу" }).first();
  await expect(addGroupButton).toBeEnabled();
  await addGroupButton.click();
  const secondGroupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await secondGroupDialog.getByPlaceholder("Например, 11А класс").fill("Учителя");
  await secondGroupDialog.getByRole("button", { name: "Создать группу" }).click();
  await page.getByRole("button", { name: "Поднять группу «Учителя»" }).click();
  await expect(page.locator('section[aria-label="Группы проекта"] h3')).toHaveText(["Учителя", "11А класс"]);

  await page.getByRole("button", { name: "Проекты", exact: true }).click();
  await page.getByRole("button", { name: "Создать проект" }).first().click();
  const destinationDialog = page.getByRole("dialog", { name: "Новый проект" });
  await destinationDialog.getByPlaceholder("Например, Выпускной 2027").fill("Архив школы №25");
  await destinationDialog.getByRole("button", { name: "Создать проект" }).click();
  await page.getByRole("link", { name: "Выпускной 2027 — Школа №25" }).click();

  const teachersCard = page.locator('section[aria-label="Группы проекта"] > div').filter({ hasText: "Учителя" });
  await teachersCard.getByRole("button", { name: "Перенести" }).click();
  const moveDialog = page.getByRole("dialog", { name: "Перенести группу" });
  await moveDialog.getByLabel("Проект назначения").selectOption({ label: "Архив школы №25" });
  await moveDialog.getByRole("button", { name: "Перенести", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Учителя" })).toHaveCount(0);

  await page.getByRole("link", { name: "Группы", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Группы", exact: true })).toBeVisible();
  await expect(page.getByText("Учителя", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
