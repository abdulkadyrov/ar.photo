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

test("registers with email and password through the explicit signup route", async ({ page }) => {
  await page.goto("./register");

  await page.getByPlaceholder("name@example.com").fill("new-owner@example.com");
  await page.getByPlaceholder("10+ символов, A–Z, a–z и цифра").fill("Strong-password1");
  await page.getByPlaceholder("Повторите пароль").fill("Strong-password1");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Зарегистрироваться" }).click();

  await expect(page).toHaveURL(/\/ar\.photo\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Добро пожаловать в AR Photo" })).toBeVisible();
});

test("keeps the public MindAR regression route available without a camera grant", async ({ page }) => {
  await page.goto("./viewer/test");

  await expect(page.getByText("Test Viewer", { exact: true })).toBeVisible();
  await expect(page.getByAltText("test target")).toBeVisible();
});

test("keeps the public AR viewer camera-explicit with a no-camera fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__arPhotoCameraRequests", { value: 0, writable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          (window as typeof window & { __arPhotoCameraRequests: number }).__arPhotoCameraRequests += 1;
          await new Promise((resolve) => window.setTimeout(resolve, 150));
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./ar/demo");

  await expect(page.getByRole("heading", { name: "Демо AR Photo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Начать AR" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Подробнее о камере и приватности" })).toHaveAttribute(
    "href",
    "/ar.photo/privacy",
  );
  expect(
    await page.evaluate(() => (window as typeof window & { __arPhotoCameraRequests: number }).__arPhotoCameraRequests),
  ).toBe(0);

  await page.getByRole("button", { name: "Начать AR" }).click();
  const guide = page.getByTestId("marker-scan-guide");
  await expect(guide).toHaveCSS("aspect-ratio", "2742 / 1542");
  await expect(page.getByText("AR не удалось запустить", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Смотреть обычное видео" }).click();
  await expect(page.getByTestId("public-ar-fallback-video")).toBeVisible();
  expect(
    await page.evaluate(() => (window as typeof window & { __arPhotoCameraRequests: number }).__arPhotoCameraRequests),
  ).toBe(1);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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

test("validates and uploads a marker through the resumable media queue", async ({ page }) => {
  await page.goto("./projects");
  await signInToDemo(page);

  await page.getByRole("button", { name: "Создать проект" }).first().click();
  const projectDialog = page.getByRole("dialog", { name: "Новый проект" });
  await projectDialog.getByPlaceholder("Например, Выпускной 2027").fill("Media upload project");
  await projectDialog.getByRole("button", { name: "Создать проект" }).click();
  await page.getByRole("link", { name: "Media upload project" }).click();
  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("Media upload group");
  await groupDialog.getByRole("button", { name: "Создать группу" }).click();
  await page.getByRole("link", { name: "Медиа", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Медиа", exact: true })).toBeVisible();
  await expect(page.getByText("Демо-режим", { exact: false })).toBeVisible();
  const markerFixtures = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#5f48ff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.font = "bold 48px sans-serif";
    context.fillText("AR Photo", 190, 250);
    return ["image/png", "image/jpeg", "image/webp"].map((mimeType) => ({
      mimeType,
      base64: canvas.toDataURL(mimeType, 0.9).split(",")[1],
    }));
  });
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(
    markerFixtures.map((fixture) => ({
      name: `marker-stage-4.${fixture.mimeType.split("/")[1]}`,
      mimeType: fixture.mimeType,
      buffer: Buffer.from(fixture.base64, "base64"),
    })),
  );

  for (const extension of ["png", "jpeg", "webp"]) {
    const queue = page.getByRole("article").filter({ hasText: `marker-stage-4.${extension}` });
    await expect(queue.getByText("готов к загрузке", { exact: false })).toBeVisible();
    await expect(queue.getByText("Сохранено локально", { exact: false })).toBeVisible();
  }

  await page.reload();
  await expect(page.getByText("Локальная очередь восстановлена", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Загрузить готовые · 3" })).toBeVisible();
  await page.getByRole("button", { name: "Загрузить готовые · 3" }).click();
  await expect(page.getByText("загружено", { exact: false })).toHaveCount(3);
  await expect(page.getByText("Файл загружен", { exact: true })).toBeVisible();
  await expect(page.getByText("v1", { exact: false }).first()).toBeVisible();

  await fileInput.setInputFiles("test-assets/fixtures/h264-aac.mp4");
  const h264Queue = page.getByRole("article").filter({ hasText: "h264-aac.mp4" });
  await expect(h264Queue.getByText("H.264/AAC", { exact: false })).toBeVisible();
  await h264Queue.getByRole("button", { name: "Загрузить" }).click();
  await expect(h264Queue.getByText("загружено", { exact: false })).toBeVisible();

  await fileInput.setInputFiles("test-assets/fixtures/vp8-opus.webm");
  const convertedQueue = page.getByRole("article").filter({ hasText: "vp8-opus.webm" });
  await expect(convertedQueue.getByText("H.264/AAC", { exact: false })).toBeVisible();
  await expect(convertedQueue.getByText("преобразовано", { exact: false })).toBeVisible();
  await convertedQueue.getByRole("button", { name: "Загрузить" }).click();
  await expect(convertedQueue.getByText("загружено", { exact: false })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("publishes the completed AR workflow and rotates a printable QR", async ({ page }) => {
  await page.goto("./projects");
  await signInToDemo(page);

  await page.getByRole("button", { name: "Создать проект" }).first().click();
  const projectDialog = page.getByRole("dialog", { name: "Новый проект" });
  await projectDialog.getByPlaceholder("Например, Выпускной 2027").fill("AR workflow project");
  await projectDialog.getByRole("button", { name: "Создать проект" }).click();
  await page.getByRole("link", { name: "AR workflow project" }).click();
  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("AR workflow group");
  await groupDialog.getByRole("button", { name: "Создать группу" }).click();

  await page.getByRole("link", { name: "AR-работы", exact: true }).click();
  await page.getByRole("link", { name: "Новая AR-работа" }).click();
  await page.getByRole("combobox", { name: "Проект", exact: true }).selectOption({ label: "AR workflow project" });
  await page.getByRole("combobox", { name: "Группа", exact: true }).selectOption({ label: "AR workflow group" });
  await page.getByRole("button", { name: "Продолжить" }).click();

  await page.getByPlaceholder("Например, Портрет Алексея").fill("Портрет Алексея");
  await page.getByPlaceholder("Что происходит в видео и для кого эта работа").fill("Проверка полного workflow");
  await page.getByRole("button", { name: "Продолжить" }).click();

  const markerBase64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext("2d")!;
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const value = ((x / 4) ^ (y / 4)) % 2 === 0 ? 24 : 232;
        context.fillStyle = `rgb(${value}, ${255 - value}, ${(x * 7 + y * 11) % 255})`;
        context.fillRect(x, y, 4, 4);
      }
    }
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.locator('input[type="file"]').setInputFiles({
    name: "workflow-marker.png",
    mimeType: "image/png",
    buffer: Buffer.from(markerBase64, "base64"),
  });
  await expect(page.getByText("Маркер загружен", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Продолжить" }).click();

  await page.getByRole("button", { name: "Анализировать маркер" }).click();
  await expect(page.getByText(/\/100$/).first()).toBeVisible();
  const riskConfirmation = page.getByText("Я понимаю риск потери распознавания", { exact: false });
  if (await riskConfirmation.isVisible()) await riskConfirmation.click();
  await page.getByRole("button", { name: "Продолжить" }).click();

  await page.locator('input[type="file"]').setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await expect(page.getByText("Видео загружено", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.getByRole("button", { name: "Запустить обработку" }).click();

  await expect(page.getByRole("heading", { name: "Все артефакты готовы" })).toBeVisible();
  await page.getByRole("button", { name: "Продолжить" }).click();
  for (const label of [
    "Выбрана правильная печатная фотография",
    "Видео и звук соответствуют фотографии",
    "Поведение при потере маркера подтверждено",
  ]) {
    await page.getByText(label, { exact: true }).click();
  }
  await page.getByRole("button", { name: "Проверка завершена" }).click();

  await expect(page.getByRole("heading", { name: "AR-работа готова к публикации" })).toBeVisible();
  await page.getByRole("link", { name: "Опубликовать и создать QR" }).click();
  await expect(page.getByRole("heading", { name: "Портрет Алексея" })).toBeVisible();
  await page.getByRole("button", { name: "Опубликовать и создать QR" }).click();
  await expect(page.getByText("AR-работа опубликована", { exact: true })).toBeVisible();
  await expect(page.getByTestId("qr-preview")).toBeVisible();

  const initialPublicUrl = await page.getByTestId("public-qr-url").textContent();
  expect(initialPublicUrl).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):\d+\/ar\.photo\/ar\/[a-f0-9]{36}$/);
  expect(initialPublicUrl).not.toContain("88000000-0000-4000-8000-000000000001");
  await expect(page.getByText("QR прошёл software gate", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /^AR Photo/ }).click();
  await expect(page.getByText("Стиль QR сохранён", { exact: true })).toBeVisible();
  await expect(page.getByText(/Quiet zone 4 · ECC H · contrast/)).toBeVisible();
  const svgDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG" }).click();
  await expect((await svgDownloadPromise).suggestedFilename()).toMatch(/Портрет-Алексея-qr-v2\.svg$/);

  await page.getByRole("button", { name: "Обновить публичную ссылку" }).click();
  const rotateDialog = page.getByRole("dialog", { name: "Отозвать старую ссылку?" });
  await expect(rotateDialog.getByRole("button", { name: "Обновить ссылку" })).toBeDisabled();
  await rotateDialog.getByLabel("Введите ОБНОВИТЬ").fill("ОБНОВИТЬ");
  await rotateDialog.getByRole("button", { name: "Обновить ссылку" }).click();
  await expect(page.getByText("Публичная ссылка обновлена", { exact: true })).toBeVisible();
  await expect(page.getByTestId("public-qr-url")).not.toHaveText(initialPublicUrl!);

  const rotatedPublicUrl = await page.getByTestId("public-qr-url").textContent();
  await page.getByRole("button", { name: "Отключить публикацию" }).click();
  await page.getByRole("dialog", { name: "Отключить публикацию?" }).getByRole("button", { name: "Отключить" }).click();
  await expect(page.getByText("Публикация отключена", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Опубликовать и создать QR" }).click();
  await expect(page.getByTestId("public-qr-url")).toHaveText(rotatedPublicUrl!);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("shows subscription usage and manages team permissions within the tariff", async ({ page }) => {
  await page.goto("./settings/subscription");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Тариф и лимиты" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Студия" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: /Хранилище/ })).toBeVisible();
  await expect(page.getByText("Продление без фиктивной оплаты", { exact: true })).toBeVisible();

  const settingsNavigation = page.getByRole("navigation", { name: "Разделы настроек" });
  await settingsNavigation.getByRole("link", { name: "Команда" }).click();
  await expect(page.getByRole("heading", { name: "Команда", exact: true })).toBeVisible();
  await expect(page.getByText("Алина Магомедова", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Пригласить сотрудника" }).click();
  const inviteDialog = page.getByRole("dialog", { name: "Пригласить сотрудника" });
  await inviteDialog.getByPlaceholder("employee@example.com").fill("designer@example.com");
  await inviteDialog.getByLabel("Роль").selectOption("viewer");
  await inviteDialog.getByText("Статистика", { exact: true }).click();
  await inviteDialog.getByRole("button", { name: "Отправить приглашение" }).click();
  await expect(page.getByText("Приглашение создано", { exact: true })).toBeVisible();
  await expect(page.getByText("designer@example.com", { exact: true })).toBeVisible();

  const memberCard = page.getByText("Алина Магомедова", { exact: true }).locator("../..");
  await memberCard.getByRole("button", { name: "Права" }).click();
  const rightsDialog = page.getByRole("dialog", { name: "Права: Алина Магомедова" });
  await rightsDialog.getByLabel("Роль").selectOption("viewer");
  await rightsDialog.getByRole("button", { name: "Сохранить права" }).click();
  await expect(page.getByText("Права сотрудника сохранены", { exact: true })).toBeVisible();

  await page
    .getByText("Алина Магомедова", { exact: true })
    .locator("../..")
    .getByRole("button", { name: "Отключить" })
    .click();
  await page.getByRole("dialog", { name: "Отключить сотрудника?" }).getByRole("button", { name: "Отключить" }).click();
  await expect(page.getByText("Доступ сотрудника отключён", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("navigation", { name: "Мобильная навигация" }).getByRole("link", { name: "Настройки" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("filters privacy-safe analytics across every scope and date mode", async ({ page }) => {
  await page.goto("./analytics");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Аналитика", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Ключевые показатели" })).toBeVisible();
  await expect(page.getByTestId("analytics-chart")).toBeVisible();
  await expect(page.getByText("Приватность по умолчанию", { exact: true })).toBeVisible();
  await expect(page.getByText(/не сохраняет IP-адреса/)).toBeVisible();

  const scope = page.getByLabel("Раздел аналитики");
  for (const label of ["Проект · Выпускной 2027", "Группа · 11А класс", "AR-работа · Алексей Иванов"]) {
    await scope.selectOption({ label });
    await expect(page.getByText(label.split(" · ")[1], { exact: true }).first()).toBeVisible();
  }

  await page.getByLabel("Период аналитики").selectOption("custom");
  await page.getByLabel("С даты").fill("2026-07-01");
  await page.getByLabel("По дату").fill("2026-07-07");
  await expect(page.getByRole("img", { name: "График активности за 7 дней" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("navigation", { name: "Мобильная навигация" }).getByRole("link", { name: "Аналитика" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("runs MFA-gated admin support and dangerous operations with reason capture", async ({ page }) => {
  await page.goto("./admin");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Admin", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Admin overview" })).toBeVisible();
  await expect(page.getByText("MFA verified", { exact: false }).first()).toBeVisible();
  const adminNavigation = page.getByRole("navigation", { name: "Разделы admin-панели" });
  await expect(adminNavigation.getByRole("button")).toHaveCount(10);

  await adminNavigation.getByRole("button", { name: "Accounts" }).click();
  const alphaAccount = page.getByRole("article").filter({ hasText: "Alpha Studio" });
  await alphaAccount.getByRole("button", { name: "Открыть с причиной" }).click();
  const supportDialog = page.getByRole("dialog", { name: "Support access: Alpha Studio" });
  await expect(supportDialog.getByRole("button", { name: "Открыть аккаунт" })).toBeDisabled();
  await supportDialog.getByLabel("Причина обращения").fill("Диагностика обращения клиента SUPPORT-1042");
  await supportDialog.getByRole("button", { name: "Открыть аккаунт" }).click();
  await expect(page.getByRole("heading", { name: "Users · Alpha Studio" })).toBeVisible();
  await expect(page.getByText("Иван Иванов", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("encrypted_password");

  await page.getByRole("button", { name: "Отправить сброс" }).first().click();
  const resetDialog = page.getByRole("dialog", { name: /Отправить сброс/ });
  await resetDialog.getByLabel("Причина").fill("Подтверждённый запрос клиента SUPPORT-1042");
  await resetDialog.getByLabel("Введите СБРОС").fill("СБРОС");
  await resetDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.getByText("Операция выполнена", { exact: true })).toBeVisible();

  await adminNavigation.getByRole("button", { name: "AR Items" }).click();
  await page.getByLabel("Поиск проектов и AR-работ").fill("Выпускной");
  await page.getByRole("button", { name: "Найти" }).click();
  const publishedItem = page.getByRole("article").filter({ hasText: "Алексей Иванов" });
  await publishedItem.getByRole("button", { name: "Приостановить" }).click();
  const itemDialog = page.getByRole("dialog", { name: "Приостановить Алексей Иванов?" });
  await itemDialog.getByLabel("Причина").fill("Обращение правообладателя CONTENT-44");
  await itemDialog.getByLabel("Введите ПРИОСТАНОВИТЬ").fill("ПРИОСТАНОВИТЬ");
  await itemDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(publishedItem.getByText("suspended", { exact: true })).toBeVisible();

  await adminNavigation.getByRole("button", { name: "Errors" }).click();
  await page.getByRole("button", { name: "Повторить задачу" }).first().click();
  const retryDialog = page.getByRole("dialog", { name: /Повторить processing/ });
  await retryDialog.getByLabel("Причина").fill("Повтор после диагностики безопасной ошибки");
  await retryDialog.getByLabel("Введите ПОВТОРИТЬ").fill("ПОВТОРИТЬ");
  await retryDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.getByRole("button", { name: "Повторить задачу" })).toHaveCount(1);

  await adminNavigation.getByRole("button", { name: "Audit" }).click();
  await expect(page.getByText("admin.processing.retry", { exact: true })).toBeVisible();
  await expect(page.getByText("admin.password_reset.request", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("keeps PWA caching static-only and restores the last visited shell offline", async ({ page, context }) => {
  await page.goto("./dashboard");
  await signInToDemo(page);
  await expect(page.getByRole("heading", { name: "Добро пожаловать в AR Photo" })).toBeVisible();

  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Добро пожаловать в AR Photo" })).toBeVisible();
  await page.reload();

  const cacheState = await page.evaluate(async () => {
    const privateCandidate = new URL("test-assets/test.jpg", document.baseURI).href;
    await fetch(privateCandidate);
    const staticAsset = [...document.scripts].map((script) => script.src).find((source) => source.includes("/assets/"));
    if (!staticAsset) throw new Error("Built application script was not found");
    await fetch(staticAsset);
    const keys = await caches.keys();
    const entries = (
      await Promise.all(keys.map(async (key) => (await (await caches.open(key)).keys()).map((request) => request.url)))
    ).flat();
    return {
      keys,
      privateCandidateCached: entries.includes(privateCandidate),
      staticAssetCached: entries.includes(staticAsset),
    };
  });

  expect(cacheState.keys).toEqual(["ar-photo-static-v3"]);
  expect(cacheState.privateCandidateCached).toBe(false);
  expect(cacheState.staticAssetCached).toBe(true);

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Добро пожаловать в AR Photo" })).toBeVisible();
  await context.setOffline(false);
});
