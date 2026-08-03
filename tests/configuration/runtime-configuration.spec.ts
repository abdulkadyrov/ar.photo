import { expect, test } from "@playwright/test";

test("fails closed instead of exposing demo data without backend configuration", async ({ page }) => {
  await page.goto("./login");

  await expect(page.getByRole("heading", { name: "Конфигурация сервиса недоступна" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Войти" })).toHaveCount(0);
  await expect(page.getByText("demo-режим", { exact: false })).toHaveCount(0);

  await page.goto("./register");
  await expect(page.getByRole("heading", { name: "Конфигурация сервиса недоступна" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Зарегистрироваться" })).toHaveCount(0);

  await page.goto("./dashboard");
  await expect(page.getByRole("heading", { name: "Конфигурация сервиса недоступна" })).toBeVisible();

  await page.goto("./privacy");
  await expect(page.getByRole("heading", { name: "Камера и приватность" })).toBeVisible();
});
