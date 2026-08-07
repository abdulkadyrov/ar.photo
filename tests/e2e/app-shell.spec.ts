import { expect, test, type Page } from "@playwright/test";

async function signInToDemo(page: Page) {
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти" }).click();
}

test("opens the explicit authentication screen", async ({ page }) => {
  await page.goto("./");

  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await expect(page.getByRole("heading", { name: "Добро пожаловать" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Зарегистрироваться" })).toBeVisible();
});

test("navigates through the protected router and opens quick creation", async ({ page }) => {
  await page.goto("./");
  await signInToDemo(page);
  await expect(page).toHaveURL(/\/ar\.photo\/dashboard$/);
  await page.getByRole("link", { name: "Создать AR-фото" }).first().click();
  await expect(page).toHaveURL(/\/ar\.photo\/create$/);
  await expect(page.getByRole("heading", { name: "Оживите фотографию" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Этапы создания AR-фото" }).getByText("Шаг 1", { exact: true }),
  ).toBeVisible();
});

test("times and automatically publishes quick creation", async ({ page }) => {
  await page.goto("./");
  await signInToDemo(page);
  await page.getByRole("link", { name: "Создать AR-фото" }).first().click();

  await page.getByLabel("Название").fill("Быстрая публикация");
  await page.getByLabel("Выбрать фотографию-маркер").setInputFiles("public/test-assets/test.jpg");
  await page.getByLabel("Выбрать видео").setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await page.getByRole("button", { name: "Оживить фото" }).click();

  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Всё готово" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Подготовлено и опубликовано за")).toBeVisible();
  await expect(page.getByRole("button", { name: "Открыть AR" })).toBeEnabled();
});

test("renders the responsive SaaS navigation", async ({ page }) => {
  await page.goto("./dashboard");
  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await signInToDemo(page);

  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("navigation", { name: "Мобильная навигация" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Мобильная навигация" }).getByText("AR-камера")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("opens the production QR camera from the protected workspace", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__entryCameraRequests", { value: 0, writable: true });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          (window as typeof window & { __entryCameraRequests: number }).__entryCameraRequests += 1;
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("./camera");
  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await signInToDemo(page);
  await page.goto("./camera");

  await expect(page.getByRole("heading", { name: "Сканируйте QR-код" })).toBeVisible();
  expect(
    await page.evaluate(() => (window as typeof window & { __entryCameraRequests: number }).__entryCameraRequests),
  ).toBe(0);
  await page.getByRole("button", { name: "Включить камеру" }).click();
  await expect(page.getByRole("heading", { name: "Камера не запустилась" })).toBeVisible();
  expect(
    await page.evaluate(() => (window as typeof window & { __entryCameraRequests: number }).__entryCameraRequests),
  ).toBe(1);
});

test("keeps the dashboard and project catalog compact on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 364, height: 628 });
  await page.goto("./dashboard");
  await signInToDemo(page);

  const mobileNav = page.getByRole("navigation", { name: "Мобильная навигация" });
  const [heroBox, recentHeadingBox, navBox] = await Promise.all([
    page.locator(".dashboard-hero").boundingBox(),
    page.getByRole("heading", { name: "Недавние проекты" }).boundingBox(),
    mobileNav.boundingBox(),
  ]);
  expect(heroBox).not.toBeNull();
  expect(heroBox!.height).toBeLessThanOrEqual(160);
  expect(recentHeadingBox).not.toBeNull();
  expect(navBox).not.toBeNull();
  expect(recentHeadingBox!.y + recentHeadingBox!.height).toBeLessThanOrEqual(navBox!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.goto("./projects");
  const search = page.getByRole("textbox", { name: "Поиск проектов" });
  await expect(search).toBeVisible();
  expect(
    await search.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingLeft)),
  ).toBeGreaterThanOrEqual(48);
  const toolbarBox = await page.locator(".projects-toolbar").boundingBox();
  expect(toolbarBox).not.toBeNull();
  expect(toolbarBox!.height).toBeLessThanOrEqual(130);
  await expect(page.getByRole("button", { name: "Черновики", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Создать", exact: true }).click();
  const projectDialog = page.getByRole("dialog", { name: "Новый проект" });
  await projectDialog.getByPlaceholder("Например, Выпускной 2027").fill("Компактный черновик");
  await projectDialog.getByRole("button", { name: "Создать проект" }).click();
  await expect(page.getByRole("link", { name: "Компактный черновик" })).toBeVisible();
  const projectCardBox = await page.locator(".project-card").first().boundingBox();
  expect(projectCardBox).not.toBeNull();
  expect(projectCardBox!.height).toBeLessThanOrEqual(160);

  await page.getByRole("button", { name: "Черновики", exact: true }).click();
  await expect(page).toHaveURL(/status=draft/);
  await expect(page.getByRole("link", { name: "Компактный черновик" })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
});

test("redirects the legacy test viewer to the production QR camera", async ({ page }) => {
  await page.goto("./viewer/test");
  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await signInToDemo(page);
  await page.goto("./viewer/test");

  await expect(page).toHaveURL(/\/ar\.photo\/camera$/);
  await expect(page.getByRole("heading", { name: "Сканируйте QR-код" })).toBeVisible();
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

  await expect(page.getByRole("heading", { name: "Отсканируйте QR-код" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Включить камеру" })).toBeVisible();
  expect(
    await page.evaluate(() => (window as typeof window & { __arPhotoCameraRequests: number }).__arPhotoCameraRequests),
  ).toBe(0);

  await page.getByRole("button", { name: "Включить камеру" }).click();
  await expect(page.getByRole("heading", { name: "Не удалось открыть AR" })).toBeVisible();

  await page.getByRole("button", { name: "Смотреть обычное видео" }).click();
  await expect(page.getByTestId("public-ar-fallback-video")).toBeVisible();
  expect(
    await page.evaluate(() => (window as typeof window & { __arPhotoCameraRequests: number }).__arPhotoCameraRequests),
  ).toBe(1);
});

test("creates a production project and group without duplicate submissions", async ({ page }) => {
  await page.goto("./projects");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Мои проекты", exact: true })).toBeVisible();
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
  await expect(page).toHaveURL(/\/items\?projectId=/);
  const createdProjectId = new URL(page.url()).searchParams.get("projectId");
  expect(createdProjectId).toBeTruthy();
  await page.goto(`./projects/${createdProjectId}`);
  await expect(page.getByRole("heading", { name: "Выпускной 2027 — Школа №25" })).toBeVisible();

  const projectUrl = page.url();
  await page.getByRole("link", { name: "Открыть ar-работы проекта: 0" }).click();
  await expect(page).toHaveURL(/\/items\?projectId=/);
  await expect(page.getByRole("heading", { name: "AR-работы", exact: true })).toBeVisible();
  await page.goto(projectUrl);

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
  await page.goto(projectUrl);

  const teachersCard = page.locator('section[aria-label="Группы проекта"] > div').filter({ hasText: "Учителя" });
  await teachersCard.getByRole("button", { name: "Перенести" }).click();
  const moveDialog = page.getByRole("dialog", { name: "Перенести группу" });
  await moveDialog.getByLabel("Проект назначения").selectOption({ label: "Архив школы №25" });
  await moveDialog.getByRole("button", { name: "Перенести", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Учителя" })).toHaveCount(0);

  await page.goto("./groups");
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
  const mediaProjectId = new URL(page.url()).searchParams.get("projectId");
  expect(mediaProjectId).toBeTruthy();
  await page.goto(`./projects/${mediaProjectId}`);
  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("Media upload group");
  await groupDialog.getByRole("button", { name: "Создать группу" }).click();
  await page.goto("./media");

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
  await expect(page).toHaveURL(/\/items\?projectId=/);
  const projectId = new URL(page.url()).searchParams.get("projectId");
  expect(projectId).toBeTruthy();
  await page.goto(`./projects/${projectId}`);
  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("AR workflow group");
  await groupDialog.getByRole("button", { name: "Создать группу" }).click();

  await page.goto("./items");
  await page.getByRole("link", { name: "Новая AR-работа" }).click();
  await page.getByRole("combobox", { name: "Проект", exact: true }).selectOption({ label: "AR workflow project" });
  await page.getByRole("combobox", { name: "Группа", exact: true }).selectOption({ label: "AR workflow group" });
  await page.getByRole("button", { name: "Продолжить" }).click();

  await page.getByPlaceholder("Например, Портрет Алексея").fill("Портрет Алексея");
  await page.getByPlaceholder("Что происходит в видео и для кого эта работа").fill("Проверка полного workflow");
  await page.getByRole("button", { name: "Продолжить" }).click();

  const markerBase64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
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
  const workflowFileInputs = page.locator('input[type="file"]');
  await workflowFileInputs.nth(0).setInputFiles({
    name: "workflow-marker.png",
    mimeType: "image/png",
    buffer: Buffer.from(markerBase64, "base64"),
  });
  await expect(page.getByText("Маркер загружен", { exact: true })).toBeVisible();
  await workflowFileInputs.nth(1).setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await expect(page.getByText("Видео загружено", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Обработать и продолжить" }).click();

  await expect(page.getByRole("heading", { name: "Все артефакты готовы" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AR-работа готова к публикации" })).toBeVisible();
  await page.getByRole("button", { name: "Опубликовать и создать QR" }).click();
  await expect(page.getByRole("heading", { name: "Портрет Алексея" })).toBeVisible();
  await expect(page.getByTestId("qr-preview")).toBeVisible();

  const initialPublicUrl = await page.getByTestId("public-qr-url").textContent();
  expect(initialPublicUrl).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):\d+\/ar\.photo\/ar\/[a-f0-9]{36}$/);
  expect(initialPublicUrl).not.toContain("88000000-0000-4000-8000-000000000001");
  await expect(page.getByText("Публичный base URL", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Открыть AR" })).toBeVisible();

  const qrPageUrl = page.url();
  await page.getByRole("link", { name: "AR-работы" }).click();
  const compactWork = page.getByRole("link", { name: "Открыть AR-работу «Портрет Алексея»" });
  await expect(compactWork).toBeVisible();
  await expect(compactWork.getByText("Портрет Алексея", { exact: true })).toBeVisible();
  await expect(compactWork.getByText("Ревизия", { exact: false })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  const cards = page.locator(".ar-item-card");
  const [firstCardBox, secondCardBox] = await Promise.all([cards.nth(0).boundingBox(), cards.nth(1).boundingBox()]);
  expect(firstCardBox).not.toBeNull();
  expect(secondCardBox).not.toBeNull();
  expect(Math.abs(firstCardBox!.width - firstCardBox!.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(firstCardBox!.y - secondCardBox!.y)).toBeLessThanOrEqual(2);
  await compactWork.click();
  await expect(page.getByRole("heading", { name: "Фото", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Видео", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "QR-код", exact: true })).toBeVisible();
  await expect(page.getByLabel("Видео AR-работы")).toBeVisible();
  await expect(page.getByLabel("Открыть публичную ссылку")).toBeVisible();
  await page.goto(qrPageUrl);

  await page.setViewportSize({ width: 319, height: 628 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const [openArBox, mobileNavBox] = await Promise.all([
    page.getByRole("button", { name: "Открыть AR" }).boundingBox(),
    page.getByRole("navigation", { name: "Мобильная навигация" }).boundingBox(),
  ]);
  expect(openArBox).not.toBeNull();
  expect(mobileNavBox).not.toBeNull();
  expect(openArBox!.y + openArBox!.height).toBeLessThanOrEqual(mobileNavBox!.y);

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByText("Дополнительно", { exact: true }).click();

  await page.getByRole("button", { name: "AR Photo", exact: true }).click();
  await expect(page.getByText("Стиль QR сохранён", { exact: true })).toBeVisible();
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
    page.getByRole("navigation", { name: "Мобильная навигация" }).getByRole("link", { name: "Поддержка" }),
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
    page.getByRole("navigation", { name: "Мобильная навигация" }).getByRole("link", { name: "Проекты" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("runs MFA-gated admin support and dangerous operations with reason capture", async ({ page }) => {
  await page.goto("./admin");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Супер-админ", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Сводка супер-админа" })).toBeVisible();
  await expect(page.getByText("MFA подтверждена", { exact: false }).first()).toBeVisible();
  const adminNavigation = page.getByRole("navigation", { name: "Разделы admin-панели" });
  await expect(adminNavigation.getByRole("button")).toHaveCount(10);

  await adminNavigation.getByRole("button", { name: "Аккаунты" }).click();
  const alphaAccount = page.getByRole("article").filter({ hasText: "Alpha Studio" });
  await alphaAccount.getByRole("button", { name: "Открыть с причиной" }).click();
  const supportDialog = page.getByRole("dialog", { name: "Support access: Alpha Studio" });
  await expect(supportDialog.getByRole("button", { name: "Открыть аккаунт" })).toBeDisabled();
  await supportDialog.getByLabel("Причина обращения").fill("Диагностика обращения клиента SUPPORT-1042");
  await supportDialog.getByRole("button", { name: "Открыть аккаунт" }).click();
  await expect(page.getByRole("heading", { name: "Пользователи · Alpha Studio" })).toBeVisible();
  await expect(page.getByText("Иван Иванов", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("encrypted_password");

  await page.getByRole("button", { name: "Сбросить пароль" }).first().click();
  const resetDialog = page.getByRole("dialog", { name: /Отправить сброс/ });
  await resetDialog.getByLabel("Причина").fill("Подтверждённый запрос клиента SUPPORT-1042");
  await resetDialog.getByLabel("Введите СБРОС").fill("СБРОС");
  await resetDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.getByText("Операция выполнена", { exact: true })).toBeVisible();

  const editor = page.getByRole("article").filter({ hasText: "Алина Магомедова" });
  await editor.getByRole("button", { name: "Заблокировать" }).click();
  const blockDialog = page.getByRole("dialog", { name: "Заблокировать Алина Магомедова?" });
  await blockDialog.getByLabel("Причина").fill("Временная блокировка по обращению SECURITY-205");
  await blockDialog.getByLabel("Введите ЗАБЛОКИРОВАТЬ").fill("ЗАБЛОКИРОВАТЬ");
  await blockDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(editor.getByText("Заблокирован", { exact: true })).toBeVisible();

  await editor.getByRole("button", { name: "Разблокировать" }).click();
  const unblockDialog = page.getByRole("dialog", { name: "Разблокировать Алина Магомедова?" });
  await unblockDialog.getByLabel("Причина").fill("Проверка завершена по обращению SECURITY-205");
  await unblockDialog.getByLabel("Введите РАЗБЛОКИРОВАТЬ").fill("РАЗБЛОКИРОВАТЬ");
  await unblockDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(editor.getByText("Активен", { exact: true })).toBeVisible();

  await editor.getByRole("button", { name: "Удалить" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "Безвозвратно удалить Алина Магомедова?" });
  await deleteDialog.getByLabel("Причина").fill("Удаление по подтверждённому запросу владельца OWNER-812");
  await deleteDialog.getByLabel("Введите УДАЛИТЬ").fill("УДАЛИТЬ");
  await deleteDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.getByText("Алина Магомедова", { exact: true })).toHaveCount(0);

  await adminNavigation.getByRole("button", { name: "Проекты и AR" }).click();
  await page.getByLabel("Поиск проектов и AR-работ").fill("Выпускной");
  await page.getByRole("button", { name: "Найти" }).click();
  const publishedItem = page.getByRole("article").filter({ hasText: "Алексей Иванов" });
  await publishedItem.getByRole("button", { name: "Приостановить" }).click();
  const itemDialog = page.getByRole("dialog", { name: "Приостановить Алексей Иванов?" });
  await itemDialog.getByLabel("Причина").fill("Обращение правообладателя CONTENT-44");
  await itemDialog.getByLabel("Введите ПРИОСТАНОВИТЬ").fill("ПРИОСТАНОВИТЬ");
  await itemDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(publishedItem.getByText("suspended", { exact: true })).toBeVisible();

  await adminNavigation.getByRole("button", { name: "Ошибки" }).click();
  await page.getByRole("button", { name: "Повторить задачу" }).first().click();
  const retryDialog = page.getByRole("dialog", { name: /Повторить processing/ });
  await retryDialog.getByLabel("Причина").fill("Повтор после диагностики безопасной ошибки");
  await retryDialog.getByLabel("Введите ПОВТОРИТЬ").fill("ПОВТОРИТЬ");
  await retryDialog.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.getByRole("button", { name: "Повторить задачу" })).toHaveCount(1);

  await adminNavigation.getByRole("button", { name: "История действий" }).click();
  await expect(page.getByText("admin.processing.retry", { exact: true })).toBeVisible();
  await expect(page.getByText("admin.password_reset.request", { exact: true })).toBeVisible();
  await expect(page.getByText("admin.user.suspend", { exact: true })).toBeVisible();
  await expect(page.getByText("admin.user.activate", { exact: true })).toBeVisible();
  await expect(page.getByText("admin.user.delete.authorized", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("keeps PWA caching static-only and restores the last visited shell offline", async ({ page, context }) => {
  await page.goto("./dashboard");
  await signInToDemo(page);
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();

  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
  await context.setOffline(false);
});
