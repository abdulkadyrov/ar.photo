import { expect, test } from "@playwright/test";

test("protects a dirty creation form and restores it after browser Back", async ({ page }) => {
  await page.goto("./login");
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await page.goto("./postcards");
  await page.getByRole("button", { name: "Добавить магазин", exact: true }).click();
  await page.getByLabel("Название магазина *", { exact: true }).fill("Несохранённый магазин");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Создать тираж", exact: true }).click();
  await expect(page.getByLabel("Название магазина *", { exact: true })).toHaveValue("Несохранённый магазин");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("link", { name: "Проекты", exact: true }).first().click();
  await expect(page).toHaveURL(/\/postcards$/);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("link", { name: "Проекты", exact: true }).first().click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.goBack();
  await expect(page.getByLabel("Название магазина *", { exact: true })).toHaveValue("Несохранённый магазин");
  await page.screenshot({ path: "artifacts/postcards-20261125/form-draft-restored.png", fullPage: true });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.getByLabel("Название магазина *", { exact: true })).toHaveCount(0);
});

for (const width of [319, 390, 1440]) {
  test(`tracks postcard stock, a shop code, sale and return at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./login");
    await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await page.goto("./postcards");
    await expect(page.getByRole("heading", { name: "AR-открытки", exact: true })).toBeVisible();
    await expect(page.getByText("Тиражей пока нет.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Добавить магазин", exact: true }).click();
    await page.getByLabel("Название магазина *", { exact: true }).fill("Подарки · центр");
    await page.getByLabel("Адрес", { exact: true }).fill("Грозный, центральный магазин");
    await page.getByRole("button", { name: "Сохранить магазин" }).click();
    await page.getByRole("button", { name: "Показать код магазина" }).click();
    const code = page.getByLabel("Код активации магазина");
    await expect(code).toHaveText(/^[0-9]{4}$/);
    const originalCode = await code.textContent();
    await page.getByRole("button", { name: "Скрыть код магазина" }).click();
    await expect(code).toHaveCount(0);
    await page.getByRole("button", { name: "Создать тираж", exact: true }).click();
    await page.getByLabel("Название тиража *", { exact: true }).fill("Новый год · пробная партия");
    await page.getByLabel("Количество *", { exact: true }).fill("3");
    await page.getByRole("radio", { name: "Новый год", exact: true }).check();
    await page.getByRole("button", { name: "Создать экземпляры" }).click();
    await expect(page.getByRole("list", { name: "Экземпляры тиража" }).getByRole("listitem")).toHaveCount(3);
    const inventoryCode = await page.locator(".postcards-card-list small").first().textContent();
    await page.getByLabel("Номер открытки / сканер штрихкода").fill(inventoryCode!);
    await page.getByRole("button", { name: "Добавить", exact: true }).click();
    await expect(page.getByText("Выбрано: 1", { exact: true })).toBeVisible();
    await page.getByLabel("Номер открытки / сканер штрихкода").fill(inventoryCode!);
    await page.getByRole("button", { name: "Добавить", exact: true }).click();
    await expect(page.getByText("Эта открытка уже выбрана.")).toBeVisible();
    await page.getByRole("button", { name: "Выбрать доступные" }).click();
    await page.getByRole("button", { name: "Передать магазину", exact: true }).click();
    await expect(page.getByLabel("Учёт магазина")).toContainText("Остаток3");
    await page.getByRole("combobox", { name: "Действие", exact: true }).selectOption("sell");
    await page.getByRole("checkbox", { name: "Выбрать открытку 1", exact: true }).check();
    await page.getByRole("button", { name: "Отметить продажу", exact: true }).click();
    await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
    await expect(page.getByLabel("Учёт магазина")).toContainText("Продано1");
    await page.getByRole("combobox", { name: "Действие", exact: true }).selectOption("return");
    await expect(page.getByRole("checkbox", { name: "Выбрать открытку 1", exact: true })).toBeDisabled();
    await page.getByRole("checkbox", { name: "Выбрать открытку 2", exact: true }).check();
    await page.getByRole("button", { name: "Вернуть на склад", exact: true }).click();
    await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
    await expect(page.getByLabel("Учёт магазина")).toContainText("Остаток1");
    await expect(page.getByLabel("Учёт магазина")).toContainText("Возвращено1");
    await page.reload();
    await expect(page.getByLabel("Учёт магазина")).toContainText("Продано1");
    await page.getByRole("button", { name: "Показать код магазина" }).click();
    await expect(page.getByLabel("Код активации магазина")).toHaveText(originalCode!);
    await page.getByRole("button", { name: "Скрыть код магазина" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByRole("heading", { name: "AR-открытки", exact: true })).toBeInViewport();
    await page.screenshot({ path: `artifacts/postcards-20261125/viewport-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Создать тираж", exact: true }).focus();
    await expect(page.getByRole("button", { name: "Создать тираж", exact: true })).toBeFocused();
  });
}

for (const width of [319, 390, 1440]) {
  test(`chooses visual templates with search and an accessible preview at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("./login");
    await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await page.goto("./postcards");
    await page.getByRole("button", { name: "Создать тираж", exact: true }).click();
    await page.getByLabel("Название тиража *", { exact: true }).fill("Любовь — тест галереи");
    await page.getByLabel("Количество *", { exact: true }).fill("1");
    await expect(page.getByRole("button", { name: "Создать экземпляры" })).toBeDisabled();
    await expect(page.getByRole("radio")).toHaveCount(9);
    await expect
      .poll(() =>
        page
          .locator(".postcard-template-art img")
          .evaluateAll((images) =>
            images.every(
              (image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    await page.locator(".postcard-template-picker").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/postcard-catalog-20261125/gallery-${width}.png`, fullPage: true });
    await page.getByRole("button", { name: "Любовь", exact: true }).click();
    await expect(page.getByRole("radio")).toHaveCount(2);
    const enlarge = page.getByRole("button", { name: "Рассмотреть: Любовь — под луной", exact: true });
    await enlarge.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "Любовь — под луной", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Закрыть просмотр" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(enlarge).toBeFocused();
    await enlarge.click();
    await expect
      .poll(() =>
        dialog
          .getByRole("img", { name: "Любовь — под луной", exact: true })
          .evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);
    const choose = page.getByRole("button", { name: "Выбрать эту открытку" });
    await page.mouse.move(0, 0);
    await expect(choose).toHaveCSS("background-image", /linear-gradient/);
    await page.screenshot({ path: `artifacts/postcard-catalog-20261125/preview-${width}.png`, animations: "disabled" });
    if (width === 319) {
      await choose.hover();
      await expect(choose).toHaveCSS("background-color", "rgb(97, 66, 244)");
      await page.screenshot({
        path: "artifacts/postcard-catalog-20261125/preview-hover-319.png",
        animations: "disabled",
      });
      await page.mouse.move(0, 0);
      await choose.focus();
      await expect(choose).toBeFocused();
      await page.screenshot({
        path: "artifacts/postcard-catalog-20261125/preview-focus-319.png",
        animations: "disabled",
      });
    }
    await choose.click();
    await expect(page.getByRole("radio", { name: "Любовь — под луной", exact: true })).toBeChecked();
    await page.getByLabel("Найти открытку", { exact: true }).fill("несуществующий");
    await expect(page.getByText("По вашему запросу открыток нет.")).toBeVisible();
    await expect(page.getByText("Выбрано: Любовь — под луной", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Сбросить фильтры" }).click();
    await expect(page.getByRole("radio")).toHaveCount(9);
    await page.getByLabel("Найти открытку", { exact: true }).fill("ёлка");
    await expect(page.getByRole("radio", { name: "Новый год", exact: true })).toHaveCount(1);
    await expect(page.getByLabel("Название тиража *", { exact: true })).toHaveValue("Любовь — тест галереи");
    await page.getByRole("button", { name: "Создать экземпляры" }).click();
    await expect(page.locator(".postcard-batch-template")).toContainText("Любовь — под луной");
    await expect(page.getByRole("list", { name: "Экземпляры тиража" }).getByRole("listitem")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const width of [319, 390, 1440]) {
  test(`adds a Milka-style card to a gift-basket batch at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 319 ? 619 : 1000 });
    await page.goto("./login");
    await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await page.goto("./postcards");
    await page.getByRole("button", { name: "Создать тираж", exact: true }).click();
    await page.getByLabel("Название тиража *", { exact: true }).fill("Подарочные корзинки — тест");
    await page.getByLabel("Количество *", { exact: true }).fill("1");
    await page.getByLabel("Найти открытку", { exact: true }).fill("милка");
    await expect(page.getByRole("radio")).toHaveCount(1);
    await page.getByLabel("Найти открытку", { exact: true }).fill("");
    await page.getByRole("button", { name: "Подарки", exact: true }).click();
    await expect(page.getByRole("radio")).toHaveCount(1);
    const name = "Подарочная корзинка · Milka";
    await expect
      .poll(() =>
        page
          .getByRole("img", { name, exact: true })
          .evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `artifacts/postcard-milka-20261126/gallery-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.getByRole("button", { name: `Рассмотреть: ${name}`, exact: true }).click();
    const dialog = page.getByRole("dialog", { name, exact: true });
    await expect
      .poll(() =>
        dialog
          .getByRole("img", { name, exact: true })
          .evaluate((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
      )
      .toBe(true);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `artifacts/postcard-milka-20261126/preview-${width}.png`, animations: "disabled" });
    await dialog.getByRole("button", { name: "Выбрать эту открытку", exact: true }).click();
    await expect(page.getByRole("radio", { name, exact: true })).toBeChecked();
    await page.getByRole("button", { name: "Создать экземпляры", exact: true }).click();
    await expect(page.locator(".postcard-batch-template")).toContainText(name);
    await expect(page.getByRole("list", { name: "Экземпляры тиража" }).getByRole("listitem")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
