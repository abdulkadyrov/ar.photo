import { expect, test } from "@playwright/test";

test("opens the AR Photo prototype shell", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("heading", { name: "Оживающие выпускные фотографии" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Открыть проекты" })).toBeVisible();
});
