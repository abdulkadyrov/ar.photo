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

for (const viewport of [
  { width: 490, height: 620 },
  { width: 844, height: 390 },
]) {
  test(`scrubs frames and trims with handles while keeping the preview visible at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("./");
    await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await page.getByRole("link", { name: "Создать AR-фото" }).first().click();
    await page.getByLabel("Выбрать фотографию-маркер").setInputFiles("public/test-assets/test.jpg");
    await page.getByLabel("Выбрать видео", { exact: true }).setInputFiles("test-assets/fixtures/h264-aac.mp4");
    const comparison = page.getByRole("slider", { name: "Линия сравнения фото и видео" });
    await comparison.fill("75");
    await expect(page.locator(".media-comparison-divider")).toHaveAttribute("style", "left: 75%;");
    await page.getByRole("button", { name: "Кадр и монтаж видео", exact: true }).click();
    const dialog = page.getByRole("dialog");
    const player = dialog.locator("video");
    await expect(dialog.locator(".media-filmstrip-images img").first()).toBeVisible();
    const previewBounds = await player.locator("..").boundingBox();
    expect(previewBounds!.height).toBeGreaterThan(60);
    const strip = dialog.getByLabel("Лента кадров видео");
    // Drag/scroll the filmstrip itself, without using the auxiliary seek input.
    await strip.evaluate((el) => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.5;
    });
    await expect.poll(() => player.evaluate((el) => (el as HTMLVideoElement).currentTime)).toBeCloseTo(0.5, 1);
    const stripBounds = await strip.boundingBox();
    const initialTrackWidth = await dialog
      .locator(".media-filmstrip-track")
      .evaluate((el) => el.getBoundingClientRect().width);
    await page.mouse.move(stripBounds!.x + stripBounds!.width / 2, stripBounds!.y + stripBounds!.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      stripBounds!.x + stripBounds!.width / 2 - initialTrackWidth * 0.1,
      stripBounds!.y + stripBounds!.height / 2,
      { steps: 5 },
    );
    await page.mouse.up();
    await expect.poll(() => player.evaluate((el) => (el as HTMLVideoElement).currentTime)).toBeCloseTo(0.6, 1);
    await dialog.getByRole("slider", { name: "Позиция разреза", exact: true }).fill("0.5");
    const end = dialog.getByRole("slider", { name: "Конец выбранного фрагмента", exact: true });
    const bounds = await end.boundingBox();
    const trackWidth = await dialog
      .locator(".media-filmstrip-track")
      .evaluate((el) => el.getBoundingClientRect().width);
    await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds!.x + bounds!.width / 2 - trackWidth * 0.2, bounds!.y + bounds!.height / 2, {
      steps: 10,
    });
    await page.mouse.up();
    await expect.poll(async () => Number(await end.getAttribute("aria-valuenow"))).toBeCloseTo(0.8, 1);
    await expect.poll(() => player.evaluate((el) => (el as HTMLVideoElement).currentTime)).toBeCloseTo(0.8, 1);
    await dialog.getByRole("button", { name: "Отменить", exact: true }).click();
    await expect(end).toHaveAttribute("aria-valuenow", "1");
    // One gesture is one undo step; keyboard offers the same operation without dragging.
    await expect(dialog.getByRole("button", { name: "Отменить", exact: true })).toBeDisabled();
    await end.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(end).toHaveAttribute("aria-valuenow", "0.9");
    await dialog.locator(".media-editor-tools").evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const afterScroll = await player.locator("..").boundingBox();
    expect(afterScroll!.y).toBeCloseTo(previewBounds!.y, 0);
    expect(afterScroll!.y + afterScroll!.height).toBeLessThan(viewport.height);
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await dialog.getByRole("button", { name: "Применить изменения" }).click();
    await expect(page.getByRole("button", { name: "Сравнить с видео", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
