import { expect, test } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`prepares matching crops and removes a middle video fragment at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./");
    await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await page.getByRole("link", { name: "Создать AR-фото" }).first().click();
    await page.getByLabel("Название", { exact: true }).fill("Проверка монтажа");
    await page.getByLabel("Выбрать фотографию-маркер").setInputFiles("public/test-assets/test.jpg");
    await page.getByLabel("Выбрать видео", { exact: true }).setInputFiles("test-assets/fixtures/h264-aac.mp4");
    await page.getByRole("button", { name: "Кадрировать фото", exact: true }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "9:16", exact: true }).click();
    await expect(dialog.getByRole("button", { name: "9:16", exact: true })).toHaveAttribute("aria-pressed", "true");
    await dialog.getByRole("button", { name: "Применить изменения" }).click();
    await expect(page.getByText("Пропорции фото и видео отличаются", { exact: true })).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Скачать фото для печати" }).click();
    expect((await downloadPromise).suggestedFilename()).toMatch(/crop.png$/);
    await page.getByRole("button", { name: "Кадр и монтаж видео", exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Соотношение фото", exact: true }).click();
    const cursor = dialog.getByRole("slider", { name: "Позиция разреза", exact: true });
    await cursor.fill("0.3");
    await dialog.getByRole("button", { name: "Разрезать здесь" }).click();
    await cursor.fill("0.7");
    await dialog.getByRole("button", { name: "Разрезать здесь" }).click();
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(
      await dialog
        .locator(".media-timeline-section")
        .evaluate(
          (el) => el.getBoundingClientRect().right <= document.querySelector("dialog")!.getBoundingClientRect().right,
        ),
    ).toBe(true);
    await dialog.getByRole("button", { name: /^Фрагмент 2/ }).click();
    await dialog.getByRole("button", { name: "Удалить фрагмент 2" }).click();
    await expect(dialog.getByText("Итого 0:00.6")).toBeVisible();
    await dialog.getByRole("button", { name: "Отменить", exact: true }).click();
    await expect(dialog.getByText("Итого 0:01.0")).toBeVisible();
    await dialog.getByRole("button", { name: /^Фрагмент 2/ }).click();
    await dialog.getByRole("button", { name: "Удалить фрагмент 2" }).click();
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await dialog.getByRole("button", { name: "Применить изменения" }).click();
    await expect(page.getByText("Фото и видео совпадают по пропорциям", { exact: true })).toBeVisible();
    // Replacement must clear stale edit instructions for the replaced source.
    await page.getByLabel("Выбрать видео", { exact: true }).setInputFiles("test-assets/fixtures/h264-aac.mp4");
    await expect(page.getByText("Пропорции фото и видео отличаются", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Кадр и монтаж видео", exact: true }).click();
    await expect(page.getByRole("dialog").getByText("Итого 0:01.0")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}
