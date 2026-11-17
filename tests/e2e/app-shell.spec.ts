import { expect, test, type Page } from "@playwright/test";

async function signInToDemo(page: Page) {
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти" }).click();
}

for (const width of [319, 390, 1280]) {
  test(`opens native photo and video pickers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("./");
    await signInToDemo(page);
    await page.goto("./create");
    for (const [label, path, picker] of [
      ["Добавить фотографию", "public/test-assets/test.jpg", "marker-media-picker"],
      ["Добавить видео", "test-assets/fixtures/h264-aac.mp4", "video-media-picker"],
    ]) {
      const button = page.getByRole("button", { name: label, exact: true });
      await expect(button).toBeVisible();
      const bounds = await button.boundingBox();
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
      const chooser = page.waitForEvent("filechooser");
      await button.click();
      await (await chooser).setFiles(path);
      await expect(page.getByTestId(picker).getByText(path.split("/").pop()!, { exact: true })).toBeVisible();
      await expect(page.getByTestId(picker).getByRole("button", { name: /^Просмотреть/ })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("opens the explicit authentication screen", async ({ page }) => {
  await page.goto("./");

  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await expect(page.getByRole("heading", { name: "Вход в кабинет" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Создать аккаунт" })).toBeVisible();
});

test("navigates through the protected router and opens quick creation", async ({ page }) => {
  await page.goto("./");
  await signInToDemo(page);
  await expect(page).toHaveURL(/\/ar\.photo\/dashboard$/);
  await page.getByRole("link", { name: "Создать AR-фото" }).first().click();
  await expect(page).toHaveURL(/\/ar\.photo\/create$/);
  await expect(page.getByRole("heading", { name: "Новое AR-фото" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Создание AR-фото", exact: true })).toBeVisible();
  await expect(page.getByLabel("Название", { exact: true })).toBeVisible();
});

test("times and automatically publishes quick creation", async ({ page }) => {
  await page.goto("./");
  await signInToDemo(page);
  await page.getByRole("link", { name: "Создать AR-фото" }).first().click();

  await page.getByLabel("Название").fill("Быстрая публикация");
  await page.getByLabel("Выбрать фотографию-маркер").setInputFiles("public/test-assets/test.jpg");
  await page.getByLabel("Выбрать видео").setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await page.getByRole("button", { name: "Подготовить и опубликовать" }).click();

  await expect(page.getByRole("timer")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Всё готово" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Подготовлено и опубликовано за")).toBeVisible();
  await expect(page.getByRole("button", { name: "Открыть AR" })).toBeEnabled();
  await page.goto("./qr-codes");
  const selection = page.getByRole("checkbox", { name: "Выбрать QR Быстрая публикация", exact: true });
  await selection.click();
  await expect(selection).toBeChecked();
  await expect(page.getByRole("button", { name: "Печать выбранных", exact: true })).toBeEnabled();
  await expect(page.locator(".qr-print-batch figure")).toHaveCount(1);
  await expect(page.locator(".qr-print-batch figure")).toContainText("Быстрая публикация");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".qr-print-batch")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Основная навигация", exact: true })).not.toBeVisible();
  await page.emulateMedia({ media: "screen" });
});

test("publishes two photo-video pairs behind one quick-start QR", async ({ page }) => {
  await page.goto("./");
  await signInToDemo(page);
  await page.getByRole("link", { name: "Создать AR-фото" }).first().click();

  await page.getByLabel("Название").fill("Групповое оживление");
  await page.getByRole("button", { name: /Добавить ещё AR-фото/ }).click();

  const markerInputs = page.getByLabel("Выбрать фотографию-маркер");
  const videoInputs = page.getByLabel("Выбрать видео");
  await markerInputs.nth(0).setInputFiles("public/test-assets/test.jpg");
  await videoInputs.nth(0).setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await markerInputs.nth(1).setInputFiles("test-assets/test2.jpg");
  await videoInputs.nth(1).setInputFiles("test-assets/fixtures/h264-aac.mp4");
  await page.getByRole("button", { name: "Подготовить и опубликовать" }).click();

  await expect(page.getByRole("heading", { name: "Всё готово" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("2 AR-фото привязаны к одному QR-коду.")).toBeVisible();
  await expect(page.getByRole("img", { name: "QR: Групповое оживление" })).toHaveCount(1);
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
  await expect(page.getByRole("navigation", { name: "Мобильная навигация" }).getByText("Профиль")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).touchAction)).toBe("pan-y");
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
  await expect(page).toHaveURL(/\/ar\.photo\/camera$/);

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
  await expect(mobileNav).toBeVisible();
  const [heroBox, recentHeadingBox, navBox] = await Promise.all([
    page.locator(".dashboard-summary").boundingBox(),
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

  await page.getByRole("button", { name: "Создать проект", exact: true }).first().click();
  const projectDialog = page.getByRole("dialog", { name: "Новый проект" });
  await projectDialog.getByPlaceholder("Например, Выпускной 2027").fill("Компактный черновик");
  await projectDialog.getByRole("button", { name: "Создать проект" }).click();
  await expect(page.getByRole("link", { name: "Компактный черновик" })).toBeVisible();
  const [firstProjectCardBox, projectGridColumns] = await Promise.all([
    page.locator(".project-card").first().boundingBox(),
    page.locator(".projects-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ")),
  ]);
  expect(firstProjectCardBox).not.toBeNull();
  expect(firstProjectCardBox!.height).toBeLessThan(firstProjectCardBox!.width);
  expect(projectGridColumns).toHaveLength(1);

  const projectCard = page.locator(".project-card").filter({ hasText: "Компактный черновик" });
  await projectCard.locator('summary[aria-label="Действия проекта «Компактный черновик»"]').click();
  await expect(projectCard.getByRole("menuitem", { name: "Редактировать проект «Компактный черновик»" })).toBeVisible();
  await expect(projectCard.getByRole("menuitem", { name: "Архивировать проект «Компактный черновик»" })).toBeVisible();
  await expect(projectCard.getByRole("menuitem", { name: "Удалить проект «Компактный черновик»" })).toBeVisible();

  await page.getByRole("button", { name: "Черновики", exact: true }).click();
  await expect(page).toHaveURL(/status=draft/);
  await expect(page.getByRole("link", { name: "Компактный черновик" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("protects the workspace and clears the demo session on logout", async ({ page }) => {
  await page.goto("./dashboard");
  await signInToDemo(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.getByRole("navigation", { name: "Мобильная навигация" }).getByRole("link", { name: "Профиль" }).click();
  await expect(page.getByRole("heading", { name: "Мой профиль", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Выйти из аккаунта" }).click();

  await expect(page).toHaveURL(/\/ar\.photo\/login$/);
  await expect(page.getByRole("heading", { name: "Вход в кабинет" })).toBeVisible();
});

test("registers with email and password through the explicit signup route", async ({ page }) => {
  await page.goto("./register");
  await page.getByLabel("Ваше имя", { exact: true }).fill("Новая студия");
  await page.getByPlaceholder("name@example.com").fill("new-owner@example.com");
  await page.getByPlaceholder("8+ символов, A–Z, a–z и цифра").fill("Strong-password1");
  await page.getByPlaceholder("Повторите пароль").fill("Strong-password1");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Создать кабинет" }).click();

  await expect(page).toHaveURL(/\/ar\.photo\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
});

test("redirects the legacy test viewer to the production QR camera", async ({ page }) => {
  await page.goto("./viewer/test");

  await expect(page).toHaveURL(/\/ar\.photo\/camera$/);
  await expect(page.locator(".ar-camera-live")).toBeVisible();
});

test("automatically opens AR and keeps a video fallback after denied permission", async ({ page }) => {
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

  await expect(page.getByText("Доступ к камере запрещён.", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Смотреть видео" }).click();
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
  await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/);
  const createdProjectId = new URL(page.url()).pathname.split("/").pop();
  expect(createdProjectId).toBeTruthy();
  await page.goto(`./projects/${createdProjectId}`);
  await expect(page.getByRole("heading", { name: "Выпускной 2027 — Школа №25" })).toBeVisible();

  const projectUrl = page.url();
  await page.getByRole("tab", { name: "Работы", exact: true }).click();
  await expect(page.getByText("В проекте пока нет AR-фото.", { exact: true })).toBeVisible();
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
  await page.getByLabel("Действия группы «Учителя»").click();
  await page.getByRole("menuitem", { name: "Выше", exact: true }).click();
  await expect(page.locator('section[aria-label="Группы проекта"] h3')).toHaveText(["Учителя", "11А класс"]);

  await page.getByRole("button", { name: "Проекты", exact: true }).click();
  await page.getByRole("button", { name: "Создать проект" }).first().click();
  const destinationDialog = page.getByRole("dialog", { name: "Новый проект" });
  await destinationDialog.getByPlaceholder("Например, Выпускной 2027").fill("Архив школы №25");
  await destinationDialog.getByRole("button", { name: "Создать проект" }).click();
  await page.goto(projectUrl);

  const teachersCard = page.locator('section[aria-label="Группы проекта"] article').filter({ hasText: "Учителя" });
  await teachersCard.getByLabel("Действия группы «Учителя»").click();
  await teachersCard.getByRole("menuitem", { name: "Перенести" }).click();
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
  const mediaProjectId = new URL(page.url()).pathname.split("/").pop();
  expect(mediaProjectId).toBeTruthy();
  await page.goto(`./projects/${mediaProjectId}`);
  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("Media upload group");
  await groupDialog.getByRole("button", { name: "Создать группу" }).click();
  await page.goto("./media");

  await expect(page.getByRole("heading", { name: "Медиа и загрузки", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Загрузить файлы", exact: true }).click();
  await expect(page.getByText("Демо: файлы сохраняются только в этом браузере.", { exact: false })).toBeVisible();
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
  await page.getByRole("button", { name: "Загрузить файлы", exact: true }).click();
  await expect(page.getByRole("button", { name: "Загрузить готовые · 3" })).toBeVisible();
  await page.getByRole("button", { name: "Загрузить готовые · 3" }).click();
  await expect(page.getByText("загружено", { exact: false })).toHaveCount(3);
  await expect(page.getByText("Файл загружен", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Просмотр marker-stage-4/ })).toHaveCount(3);

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
  await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+$/);
  const projectId = new URL(page.url()).pathname.split("/").pop();
  expect(projectId).toBeTruthy();
  await page.goto(`./projects/${projectId}`);
  await page.getByRole("button", { name: "Добавить группу" }).first().click();
  const groupDialog = page.getByRole("dialog", { name: "Новая группа" });
  await groupDialog.getByPlaceholder("Например, 11А класс").fill("AR workflow group");
  await groupDialog.getByRole("button", { name: "Создать группу" }).click();

  await page.goto("./items");
  await page.getByRole("link", { name: "Добавить фото", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Новое AR-фото", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Проект", exact: true }).selectOption({ label: "AR workflow project" });
  await page.getByRole("combobox", { name: "Группа", exact: true }).selectOption({ label: "AR workflow group" });
  await page.getByRole("button", { name: "Продолжить" }).click();

  await page.getByPlaceholder("Например, Портрет Алексея").fill("Портрет Алексея");
  await page.getByPlaceholder("Что происходит в видео и для кого эта работа").fill("Проверка полного workflow");
  await page.getByRole("button", { name: "Продолжить" }).click();

  await expect(page.getByRole("heading", { name: "Редактирование AR-фото", exact: true })).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: "AR workflow group" })).toBeVisible();
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
  await page.getByRole("button", { name: "Сохранить изменения", exact: true }).click();

  // Processing completion now publishes and opens the QR without another click.
  await expect(page.getByRole("heading", { name: "QR и публикация", level: 1 })).toBeVisible();
  await expect(page.getByTestId("qr-preview")).toBeVisible();

  const initialPublicUrl = await page.getByTestId("public-qr-url").textContent();
  expect(initialPublicUrl).toMatch(/^http:\/\/(localhost|127\.0\.0\.1):\d+\/ar\.photo\/ar\/[a-f0-9]{36}$/);
  expect(initialPublicUrl).not.toContain("88000000-0000-4000-8000-000000000001");
  await expect(page.getByText("Публичный base URL", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Открыть AR" })).toBeVisible();

  const qrPageUrl = page.url();
  await page.getByRole("button", { name: "Назад", exact: true }).click();
  await expect(page.getByRole("heading", { name: "AR-работы", exact: true })).toBeVisible();
  await expect(page.getByText("AR workflow group", { exact: true })).toBeVisible();
  await page.getByPlaceholder("Найти AR-работу").fill("Портрет");
  await expect(page).toHaveURL(/q=/);
  const compactWork = page.getByRole("link", { name: "Открыть AR-работу «Портрет Алексея»" });
  await expect(compactWork).toBeVisible();
  await expect(compactWork.getByText("Портрет Алексея", { exact: true })).toBeVisible();
  await expect(compactWork.getByText("Ревизия", { exact: false })).toHaveCount(0);
  await page.setViewportSize({ width: 319, height: 628 });
  await expect(compactWork.locator("..").getByText("AR workflow group", { exact: true })).toBeVisible();
  const cards = page.locator(".ar-item-card");
  const [firstCardBox, workGridColumns] = await Promise.all([
    cards.first().boundingBox(),
    page.locator(".ar-items-grid").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ")),
  ]);
  expect(firstCardBox).not.toBeNull();
  expect(firstCardBox!.height).toBeLessThan(firstCardBox!.width);
  expect(workGridColumns).toHaveLength(1);
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = ".ar-items-grid { padding-top: 720px; }";
    document.head.append(style);
    window.scrollTo(0, 500);
  });
  const savedListScrollY = await page.evaluate(() => window.scrollY);
  expect(savedListScrollY).toBeGreaterThan(0);
  await compactWork.click();
  await expect(page.getByRole("heading", { name: "Фото (основа AR)", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Видео (AR-контент)", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "QR-код", exact: true })).toBeVisible();
  await expect(page.locator(".ar-item-qr-code svg")).toBeVisible();
  await expect(page.getByRole("timer")).toContainText("Готово за");
  await expect(page.getByLabel("Видео AR-работы")).toBeVisible();
  await expect(page.getByLabel("Открыть публичную ссылку")).toBeVisible();
  const mediaSections = page.locator(".ar-item-media-section");
  const [photoSectionBox, videoSectionBox, photoPreviewBox, videoPreviewBox, qrSummaryBox] = await Promise.all([
    mediaSections.nth(0).boundingBox(),
    mediaSections.nth(1).boundingBox(),
    mediaSections.nth(0).locator(".ar-item-media-preview").boundingBox(),
    mediaSections.nth(1).locator(".ar-item-media-preview").boundingBox(),
    page.locator(".ar-item-publication").boundingBox(),
  ]);
  expect(photoSectionBox).not.toBeNull();
  expect(videoSectionBox).not.toBeNull();
  expect(photoPreviewBox).not.toBeNull();
  expect(videoPreviewBox).not.toBeNull();
  expect(qrSummaryBox).not.toBeNull();
  expect(videoSectionBox!.y).toBeGreaterThanOrEqual(photoSectionBox!.y + photoSectionBox!.height);
  expect(photoPreviewBox!.width).toBeLessThanOrEqual(photoSectionBox!.width);
  expect(videoPreviewBox!.width).toBeLessThanOrEqual(videoSectionBox!.width);
  expect(qrSummaryBox!.y).toBeGreaterThan(photoSectionBox!.y + photoSectionBox!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const detailScroll = await page.evaluate(() => window.scrollY);
  const openPhoto = page.getByRole("button", { name: "Открыть фото", exact: true });
  await openPhoto.click();
  const photoViewer = page.getByRole("dialog", { name: "Просмотр фото" });
  await expect(photoViewer.getByRole("img", { name: "Фотография-маркер" })).toBeVisible();
  await expect(photoViewer.getByRole("button", { name: "Закрыть просмотр" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(photoViewer).toHaveCount(0);
  await expect(openPhoto).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(detailScroll);
  await page.getByRole("button", { name: "Открыть видео", exact: true }).click();
  const videoViewer = page.getByRole("dialog", { name: "Просмотр видео" });
  await expect(videoViewer.getByLabel("Видео AR-работы")).toBeVisible();
  expect(
    await mediaSections
      .nth(1)
      .locator("video.ar-item-media-preview")
      .evaluate((video: HTMLVideoElement) => video.paused),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await videoViewer.getByRole("button", { name: "Закрыть просмотр" }).click();
  await expect(videoViewer).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Открыть видео", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Вернуться к AR-работам" }).click();
  await expect(page.getByPlaceholder("Найти AR-работу")).toHaveValue("Портрет");
  await expect(page.getByRole("heading", { name: "AR-работы", exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(savedListScrollY - 1);
  await page.goto(qrPageUrl);

  await page.setViewportSize({ width: 319, height: 628 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const qrMobileNav = page.getByRole("navigation", { name: "Мобильная навигация" });
  await expect(qrMobileNav).toBeVisible();
  const [openArBox, mobileNavBox] = await Promise.all([
    page.getByRole("button", { name: "Открыть AR" }).boundingBox(),
    qrMobileNav.boundingBox(),
  ]);
  expect(openArBox).not.toBeNull();
  expect(mobileNavBox).not.toBeNull();
  // The mobile reference stacks the QR and link panels. Keep the action reachable
  // above the fixed navigation after scrolling on a short phone.
  await page
    .getByRole("button", { name: "Открыть AR", exact: true })
    .evaluate((element) => element.scrollIntoView({ block: "center" }));
  await page.getByRole("button", { name: "Открыть AR", exact: true }).click({ trial: true });
  const visibleOpenAr = await page.getByRole("button", { name: "Открыть AR", exact: true }).boundingBox();
  expect(visibleOpenAr!.y + visibleOpenAr!.height).toBeLessThanOrEqual(mobileNavBox!.y);

  await page.setViewportSize({ width: 1280, height: 720 });
  const printing = page.locator("details.qr-extra-card");
  await expect(printing).toHaveAttribute("open", "");

  await page.getByRole("button", { name: "AR Photo", exact: true }).click();
  await expect(page.getByText("Стиль QR сохранён", { exact: true })).toBeVisible();
  const svgDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG" }).click();
  await expect((await svgDownloadPromise).suggestedFilename()).toMatch(/Портрет-Алексея-qr-v2\.svg$/);

  await page.getByText("Управление публикацией", { exact: true }).click();
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

  await expect(page.getByRole("heading", { name: "Мой пакет", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Студия" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: /Хранилище/ })).toBeVisible();
  await expect(page.getByText("потраченные добавления не возвращаются", { exact: false })).toBeVisible();

  await page.getByRole("link", { name: "Команда", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Моя команда", exact: true })).toBeVisible();
  await expect(page.getByText("Алина Магомедова", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Пригласить участника" }).click();
  const inviteDialog = page.getByRole("dialog", { name: "Пригласить участника" });
  await inviteDialog.getByPlaceholder("employee@example.com").fill("designer@example.com");
  await inviteDialog.getByLabel("Роль").selectOption("viewer");
  await inviteDialog.locator("summary").filter({ hasText: "Дополнительные разрешения" }).click();
  await inviteDialog.getByText("Статистика", { exact: true }).click();
  await inviteDialog.getByRole("button", { name: "Отправить приглашение" }).click();
  await expect(page.getByText("Приглашение создано", { exact: true })).toBeVisible();
  await expect(page.getByText("designer@example.com", { exact: true })).toBeVisible();

  const memberCard = page.locator(".team-member").filter({ hasText: "Алина Магомедова" });
  await memberCard.locator("summary").click();
  await memberCard.getByRole("button", { name: "Изменить роль" }).click();
  const rightsDialog = page.getByRole("dialog", { name: "Права: Алина Магомедова" });
  await rightsDialog.getByLabel("Роль").selectOption("viewer");
  await rightsDialog.getByRole("button", { name: "Сохранить права" }).click();
  await expect(page.getByText("Права сотрудника сохранены", { exact: true })).toBeVisible();

  await page.locator(".team-member").filter({ hasText: "Алина Магомедова" }).locator("summary").click();
  await page
    .locator(".team-member")
    .filter({ hasText: "Алина Магомедова" })
    .getByRole("button", { name: "Отключить доступ", exact: true })
    .click();
  await page.getByRole("dialog", { name: "Отключить сотрудника?" }).getByRole("button", { name: "Отключить" }).click();
  await expect(page.getByText("Доступ сотрудника отключён", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("navigation", { name: "Мобильная навигация" }).getByRole("link", { name: "Профиль" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("shows account, subscription and support inside the mobile profile", async ({ page }) => {
  await page.setViewportSize({ width: 319, height: 628 });
  await page.goto("./profile");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Мой профиль", exact: true })).toBeVisible();
  await expect(page.getByLabel("Название аккаунта", { exact: true })).toHaveValue("Vakha Studio");
  await expect(page.getByRole("link", { name: "Мой пакет", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Поддержка", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Выйти из аккаунта", exact: true })).toBeVisible();
  await page.getByLabel("Имя и фамилия", { exact: true }).fill("Алина Магомедова");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Профиль сохранён" })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Имя и фамилия", { exact: true })).toHaveValue("Алина Магомедова");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("filters privacy-safe analytics across every scope and date mode", async ({ page }) => {
  await page.goto("./analytics");
  await signInToDemo(page);

  await expect(page.getByRole("heading", { name: "Статистика моих работ", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Ключевые показатели" })).toBeVisible();
  await expect(page.getByTestId("analytics-chart")).toBeVisible();
  await page.locator("summary").filter({ hasText: "Подробнее о просмотрах и устройствах" }).click();
  await expect(page.getByText("Приватность по умолчанию", { exact: true })).toBeVisible();
  await expect(page.getByText(/не сохраняет IP-адреса/)).toBeVisible();

  const scope = page.getByLabel("Раздел аналитики");
  for (const label of ["Проект · Выпускной 2027", "Группа · 11А класс", "AR-работа · Алексей Иванов"]) {
    await scope.selectOption({ label });
    await expect(scope.locator("option:checked")).toHaveText(label);
    await expect(page.getByTestId("analytics-chart")).toBeVisible();
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

test("runs MFA-gated account editing and audited admin operations", async ({ page }) => {
  await page.goto("./admin");
  await signInToDemo(page);
  await expect(page.getByRole("heading", { name: "Обзор платформы", exact: true })).toBeVisible();
  await expect(page.getByText("MFA подтверждена", { exact: false }).first()).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Разделы администрации", exact: true });
  await expect(nav.getByRole("link")).toHaveCount(12);
  await nav.getByRole("link", { name: "Аккаунты", exact: true }).click();
  const alpha = page.getByRole("row").filter({ hasText: "Alpha Studio" });
  await alpha.getByRole("button", { name: "Открыть аккаунт" }).click();
  await expect(page.getByRole("heading", { name: "Alpha Studio", exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Изменить", exact: true }).click();
  await page.getByLabel("Название аккаунта", { exact: false }).fill("Alpha Studio QA");
  await page.getByRole("button", { name: "Сохранить изменения", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Alpha Studio QA", exact: false })).toBeVisible();
  await nav.getByRole("link", { name: "Пользователи", exact: true }).click();
  await expect(page.getByText("Иван Иванов", { exact: true }).first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText("encrypted_password");

  async function openUser(name: string) {
    await page.getByRole("row").filter({ hasText: name }).getByRole("button", { name: "Открыть", exact: true }).click();
    return page.getByRole("dialog", { name: "Карточка пользователя" });
  }
  const owner = await openUser("Иван Иванов");
  await owner.getByRole("button", { name: "Сбросить пароль" }).click();
  const reset = page.getByRole("dialog", { name: /Отправить сброс/ });
  await expect(reset.getByLabel("Введите СБРОС")).toHaveCount(0);
  await reset.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(page.getByText("Операция выполнена", { exact: true })).toBeVisible();

  for (const action of ["Заблокировать", "Разблокировать"]) {
    const editor = await openUser("Алина Магомедова");
    await editor.getByRole("button", { name: action, exact: true }).click();
    const dialog = page.getByRole("dialog", { name: `${action} Алина Магомедова?` });
    await expect(dialog.getByLabel(`Введите ${action.toUpperCase()}`)).toHaveCount(0);
    await dialog.getByRole("button", { name: "Подтвердить", exact: true }).click();
    await expect(page.getByRole("row").filter({ hasText: "Алина Магомедова" })).toContainText(
      action === "Заблокировать" ? "Приостановлен" : "Активен",
    );
  }
  const editor = await openUser("Алина Магомедова");
  await editor.getByRole("button", { name: "Удалить", exact: true }).click();
  const deletion = page.getByRole("dialog", { name: "Безвозвратно удалить Алина Магомедова?" });
  await deletion.getByLabel("Введите УДАЛИТЬ").fill("УДАЛИТЬ");
  await deletion.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: "Алина Магомедова" })).toHaveCount(0);

  await nav.getByRole("link", { name: "Контент", exact: true }).click();
  await page.getByLabel("Поиск проектов и AR-работ").fill("Выпускной");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  const work = page.getByRole("row").filter({ hasText: "Алексей Иванов" });
  await work.getByRole("button", { name: "Открыть", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Алексей Иванов" })
    .getByRole("button", { name: "Приостановить", exact: true })
    .click();
  const suspension = page.getByRole("dialog", { name: "Приостановить Алексей Иванов?" });
  await suspension.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(work).toContainText("Приостановлен");

  await nav.getByRole("link", { name: "Обработка", exact: true }).click();
  const job = page.locator(".admin-job").first();
  await job.locator("summary").click();
  await job.getByRole("button", { name: "Повторить задачу" }).click();
  await page
    .getByRole("dialog", { name: /Повторить обработку/ })
    .getByRole("button", { name: "Подтвердить", exact: true })
    .click();
  await expect(page.locator(".admin-job")).toHaveCount(1);
  await nav.getByRole("link", { name: "Журнал", exact: true }).click();
  for (const event of [
    "admin.processing.retry",
    "admin.password_reset.request",
    "admin.user.suspend",
    "admin.user.activate",
    "admin.user.delete.authorized",
  ]) {
    await expect(page.getByText(event, { exact: true }).first()).toBeVisible();
  }
  await page.setViewportSize({ width: 319, height: 628 });
  await page.getByRole("button", { name: "Разделы", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Разделы администрации" });
  await menu.getByRole("link", { name: "Аккаунты", exact: true }).click();
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole("navigation", { name: "Мобильная навигация администрации" })).toBeVisible();
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

  expect(cacheState.keys).toEqual(["ar-photo-static-v4"]);
  expect(cacheState.privateCandidateCached).toBe(false);
  expect(cacheState.staticAssetCached).toBe(true);

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Главная", exact: true })).toBeVisible();
  await context.setOffline(false);
});

test("edits photo credit packages and grants an addon from the admin panel", async ({ page }) => {
  await page.goto("./admin");
  await signInToDemo(page);
  const nav = page.getByRole("navigation", { name: "Разделы администрации", exact: true });
  await nav.getByRole("link", { name: "Тарифы", exact: true }).click();
  await page.getByRole("button", { name: "Новый тариф", exact: true }).click();
  const editor = page.getByRole("dialog", { name: "Новый тариф или пакет" });
  await editor.getByRole("radio", { name: "Дополнение", exact: true }).check();
  await expect(editor.getByLabel("Код тарифа", { exact: true })).not.toBeVisible();
  await editor.getByLabel("Название", { exact: true }).fill("Ещё 50 фото");
  await editor.getByLabel("Стоимость, ₽", { exact: true }).fill("490");
  await editor.getByLabel("Срок, дней", { exact: true }).fill("0");
  await editor.getByLabel("Добавления AR-фото", { exact: true }).fill("50");
  await editor.getByRole("button", { name: "Сохранить тариф" }).click();
  await expect(editor).toHaveCount(0);
  await page.getByRole("button", { name: "Дополнения", exact: true }).click();
  const card = page
    .locator(".admin-plan-card")
    .filter({ has: page.getByRole("heading", { name: "Ещё 50 фото", exact: true }) });
  await expect(card).toContainText("50");
  await expect(card).toContainText("490");
  await card.getByRole("button", { name: "Редактировать" }).click();
  const edit = page.getByRole("dialog", { name: "Редактировать тариф" });
  await expect(edit.getByLabel("Добавления AR-фото", { exact: true })).toHaveValue("50");
  await edit.getByLabel("Добавления AR-фото", { exact: true }).fill("75");
  await edit.getByRole("button", { name: "Сохранить тариф" }).click();
  await expect(card).toContainText("75");
  await nav.getByRole("link", { name: "Аккаунты", exact: true }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Alpha Studio" })
    .getByRole("button", { name: "Открыть аккаунт" })
    .click();
  await expect(page.getByRole("heading", { name: "Alpha Studio", exact: false })).toBeVisible();
  await nav.getByRole("link", { name: "Подписки", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Тариф или пакет", exact: true })
    .selectOption({ label: "Ещё 50 фото · 75 добавлений фото · 0 дней · 490 ₽" });
  await page.getByRole("button", { name: "Проверить начисление" }).click();
  await page
    .getByRole("dialog", { name: "Подтвердите назначение пакета" })
    .getByRole("button", { name: "Подтвердить и начислить пакет" })
    .click();
  await expect(page.getByRole("status").filter({ hasText: "Пакет начислен" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("deletes an account with one confirmation and no typed service fields", async ({ page }) => {
  await page.goto("./admin");
  await signInToDemo(page);
  const nav = page.getByRole("navigation", { name: "Разделы администрации", exact: true });
  await nav.getByRole("link", { name: "Аккаунты", exact: true }).click();
  const account = page.getByRole("row").filter({ hasText: "Beta Studio" });
  await account.getByLabel("Другие действия: Beta Studio").click();
  await account.getByRole("button", { name: "Удалить аккаунт", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Удалить аккаунт Beta Studio?" });
  await expect(dialog.getByRole("textbox")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Удалить аккаунт", exact: true }).click();
  await expect(account).toHaveCount(0);
});
