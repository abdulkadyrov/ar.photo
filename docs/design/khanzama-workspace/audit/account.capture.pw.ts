import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
type Pane = { x: number; y: number; w: number; h: number };
const bounds: { sheets: Array<{ id: string; route: string; source: string; desktop: Pane; mobile: Pane }> } =
  JSON.parse(readFileSync(new URL("./account.bounds.json", import.meta.url), "utf8"));

const phase = process.env.FIDELITY_PHASE ?? "before";
const output = `/tmp/khanzama-fidelity/account/${phase}`;
const sheets = bounds.sheets.map((sheet) => ({
  ...sheet,
  desktopSize: [sheet.desktop.w, sheet.desktop.h],
  mobileSize: [sheet.mobile.w, sheet.mobile.h],
}));

async function spa(page: Page, route: string) {
  await page.evaluate((path) => {
    history.pushState({}, "", `/ar.photo/${path}`);
    dispatchEvent(new PopStateEvent("popstate"));
  }, route);
  await expect(page.locator(".account-shell main")).toBeVisible();
  const headings = route.startsWith("projects/")
    ? route.endsWith("/edit")
      ? "Редактор проекта"
      : "Натюрморты с цветами"
    : route.startsWith("groups")
      ? "Группы проекта"
      : (
          {
            dashboard: "Главная",
            projects: "Мои проекты",
            analytics: "Статистика моих работ",
            profile: "Мой профиль",
            settings: "Настройки аккаунта",
            "settings/subscription": "Мой пакет",
            "settings/team": "Моя команда",
            "settings/security": "Безопасность аккаунта",
            support: "Поддержка",
          } as Record<string, string>
        )[route];
  if (route === "dashboard") await expect(page.locator("h1")).toHaveText(/^(Главная|Моя CRM)$/);
  else if (headings) await expect(page.locator("h1")).toContainText(headings);
  await page
    .locator(".skeleton")
    .first()
    .waitFor({ state: "hidden", timeout: 10000 })
    .catch(() => {});
  await page.waitForTimeout(180);
}

async function seed(page: Page) {
  await page.goto("./login");
  const seeded = await page.evaluate(async () => {
    const catalog = (await import("/ar.photo/src/features/catalog/catalogRepository.ts")).getCatalogRepository();
    const ar = (await import("/ar.photo/src/features/ar-items/arItemRepository.ts")).getArItemRepository();
    const settings = (await import("/ar.photo/src/features/settings/settingsRepository.ts")).getSettingsRepository();
    const workspace = await catalog.getWorkspace("fidelity-user");
    await settings.getEntitlements(workspace.accountId);
    const photo = await (await fetch("/ar.photo/test-assets/test.jpg")).blob();
    for (const [index, name] of ["Горные озёра", "Лавандовое поле", "Натюрморты с цветами"].entries()) {
      const project = await catalog.createProject(
        workspace.accountId,
        { name, description: "Коллекция живых фотографий", category: "family" },
        `fidelity-project-${index}`,
      );
      await catalog.uploadProjectCover(
        workspace.accountId,
        project.id,
        new File([photo], "cover.jpg", { type: "image/jpeg" }),
      );
      const group = await catalog.createGroup(
        workspace.accountId,
        project.id,
        { name: ["9А", "9Б", "Общие фотографии"][index], description: "Фотографии группы" },
        `fidelity-group-${index}`,
      );
      await catalog.uploadGroupCover(
        workspace.accountId,
        group.id,
        new File([photo], "cover.jpg", { type: "image/jpeg" }),
      );
      await ar.createDraft(workspace.accountId, {
        projectId: project.id,
        groupId: group.id,
        title: ["Горное озеро", "Весенний сад", "Лавандовый натюрморт"][index],
        description: "Аудит интерфейса, локальные демонстрационные данные",
        requestId: `fidelity-item-${index}`,
      });
    }
    const catalogState = JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!);
    const arState = JSON.parse(localStorage.getItem("ar-photo-demo-ar-items-v1")!);
    for (const [i, project] of catalogState.projects.entries()) {
      const old = project.id;
      project.id = `50000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
      for (const group of catalogState.groups.filter((g: { project_id: string }) => g.project_id === old)) {
        const oldGroup = group.id;
        group.project_id = project.id;
        group.id = `60000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
        for (const item of arState.items.filter((r: { group_id: string }) => r.group_id === oldGroup)) {
          item.group_id = group.id;
          item.project_id = project.id;
          item.id = `70000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
          item.status = ["published", "ready", "draft"][i];
          item.marker_image_path = project.cover_path;
        }
      }
    }
    catalogState.workspace.accountName = "Моя студия";
    catalogState.arItemProjectIds = arState.items.map((item: { project_id: string }) => item.project_id);
    localStorage.setItem("ar-photo-demo-catalog-v2", JSON.stringify(catalogState));
    localStorage.setItem("ar-photo-demo-ar-items-v1", JSON.stringify(arState));
    const settingsState = JSON.parse(localStorage.getItem("ar-photo-demo-settings-v1")!);
    settingsState.entitlements.accountName = "Моя студия";
    settingsState.entitlements.usage.projects = catalogState.projects.length;
    settingsState.entitlements.usage.groups = catalogState.groups.length;
    settingsState.entitlements.usage.arItems = arState.items.length;
    localStorage.setItem("ar-photo-demo-settings-v1", JSON.stringify(settingsState));
    return { projectId: catalogState.projects[0].id, accountId: workspace.accountId };
  });
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/dashboard$/);
  await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem("ar-photo-demo-session-v1")!);
    localStorage.setItem(
      "ar-photo-demo-profile-v1",
      JSON.stringify({
        id: session.user.id,
        full_name: "Мария Кузнецова",
        email_display: session.user.email,
        avatar_path: null,
        role: "account_user",
        is_active: true,
      }),
    );
  });
  return seeded;
}

test("capture all thirteen account sheets at their internal desktop and phone pane sizes", async ({ page }) => {
  await mkdir(output, { recursive: true });
  const ids = await seed(page);
  const metrics: unknown[] = [];
  for (const sheet of sheets) {
    if (sheet.route === "crm")
      await page.evaluate(() => {
        const c = JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!);
        c.workspace.accountName = "Моя CRM";
        c.workspace.subscriptionExpiresAt = null;
        localStorage.setItem("ar-photo-demo-catalog-v2", JSON.stringify(c));
        const s = JSON.parse(localStorage.getItem("ar-photo-demo-settings-v1")!);
        s.entitlements.accountName = "Моя CRM";
        s.entitlements.limits.arItems = null;
        s.entitlements.subscription.expiresAt = null;
        localStorage.setItem("ar-photo-demo-settings-v1", JSON.stringify(s));
      });
    for (const mode of ["desktop", "mobile"] as const) {
      const [width, height] = mode === "desktop" ? sheet.desktopSize : sheet.mobileSize;
      await page.setViewportSize({ width, height });
      const route =
        sheet.route === "project" || sheet.route === "project-edit"
          ? `projects/${ids.projectId}`
          : sheet.route === "groups"
            ? `groups?projectId=${ids.projectId}`
            : sheet.route === "crm"
              ? "dashboard"
              : sheet.route;
      await spa(page, route);
      if (sheet.route === "project-edit") {
        if (phase === "before") {
          await page.getByRole("button", { name: "Изменить", exact: true }).first().click();
          await expect(page.getByRole("dialog")).toBeVisible();
        } else {
          await spa(page, `projects/${ids.projectId}/edit`);
        }
      }
      await page.mouse.move(0, 0);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.screenshot({ path: `${output}/${sheet.id}-${mode}.png`, fullPage: false, animations: "disabled" });
      metrics.push({
        sheet: sheet.id,
        mode,
        route: page.url(),
        viewport: { width, height },
        sourceCrop: sheet[mode],
        source: sheet.source,
        ...(await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          h1: document.querySelector("h1")?.textContent,
        }))),
      });
      if (sheet.route === "project-edit" && phase === "before") await page.keyboard.press("Escape");
    }
  }
  await writeFile(`${output}/capture.json`, JSON.stringify(metrics, null, 2));
});

test("keeps all account pages within 319 and 390 pixel viewports", async ({ page }) => {
  const ids = await seed(page);
  const measurements = [];
  await mkdir(`${output}/narrow`, { recursive: true });
  for (const width of [319, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const sheet of sheets.filter((row) => row.route !== "crm")) {
      const route =
        sheet.route === "project"
          ? `projects/${ids.projectId}`
          : sheet.route === "project-edit"
            ? `projects/${ids.projectId}/edit`
            : sheet.route === "groups"
              ? `groups?projectId=${ids.projectId}`
              : sheet.route;
      await spa(page, route);
      const measure = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(measure.scrollWidth, `${sheet.id} overflows at ${width}`).toBeLessThanOrEqual(width);
      measurements.push({ id: sheet.id, ...measure });
      await page.mouse.move(0, 0);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      });
      await page.screenshot({ path: `${output}/narrow/${sheet.id}-${width}.png`, animations: "disabled" });
    }
  }
  await writeFile(`${output}/narrow/measurements.json`, JSON.stringify(measurements, null, 2));
});

test("keeps editor cancel/save, inline rename, profile and team actions real", async ({ page }) => {
  await page.setViewportSize({ width: 1285, height: 900 });
  const ids = await seed(page);
  const flows: Record<string, unknown> = {};
  await mkdir(`${output}/states`, { recursive: true });
  const filtered = `projects?search=${encodeURIComponent("Натюрморты")}`;
  await spa(page, filtered);
  await page.getByRole("link", { name: "Изменить", exact: true }).first().click();
  await expect(page.locator("h1")).toHaveText("Редактор проекта");
  await page.getByLabel("Название", { exact: true }).fill("Несохранённая правка");
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page).toHaveURL(/projects\?search=/);
  await expect(page.getByRole("link", { name: "Натюрморты с цветами", exact: true })).toBeVisible();
  flows.projectCancel = {
    route: page.url(),
    persistedName: await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!).projects.find(
          (row: { id: string }) => row.id === id,
        ).name,
      ids.projectId,
    ),
  };
  await page.getByRole("link", { name: "Изменить", exact: true }).first().click();
  await page.getByLabel("Описание (необязательно)", { exact: true }).fill("Сохранено при проверке интерфейса");
  await page.locator(".project-editor footer").getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page).toHaveURL(/projects\?search=/);
  expect(
    await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!).projects.find(
          (item: { id: string }) => item.id === id,
        ).description,
      ids.projectId,
    ),
  ).toBe("Сохранено при проверке интерфейса");
  flows.projectSave = {
    route: page.url(),
    description: await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!).projects.find(
          (row: { id: string }) => row.id === id,
        ).description,
      ids.projectId,
    ),
  };
  await page.screenshot({ path: `${output}/states/project-save-return.png`, animations: "disabled" });
  await spa(page, `groups?projectId=${ids.projectId}`);
  await page.locator(".group-directory-list summary").first().click();
  await page.getByRole("menuitem", { name: "Переименовать", exact: true }).click();
  await page.getByLabel("Новое название группы").fill("Общие фотографии — новое название");
  await page.screenshot({ path: `${output}/states/groups-inline-rename-desktop.png`, animations: "disabled" });
  await page.setViewportSize({ width: 393, height: 854 });
  await page.screenshot({ path: `${output}/states/groups-inline-rename-mobile.png`, animations: "disabled" });
  await page.setViewportSize({ width: 1285, height: 900 });
  await page.locator(".group-inline-rename").getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Общие фотографии — новое название", exact: true })).toBeVisible();
  flows.groupRename = {
    route: page.url(),
    groupCount: await page.evaluate(() => JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!).groups.length),
    name: "Общие фотографии — новое название",
  };
  await spa(page, "settings/team");
  await page.getByRole("button", { name: "Пригласить участника", exact: true }).click();
  const invitation = page.getByRole("dialog");
  await invitation.getByLabel("Email", { exact: true }).fill("pending@example.test");
  await page.screenshot({ path: `${output}/states/team-invite-desktop.png`, animations: "disabled" });
  await page.setViewportSize({ width: 444, height: 873 });
  await page.screenshot({ path: `${output}/states/team-invite-mobile.png`, animations: "disabled" });
  await page.setViewportSize({ width: 1285, height: 900 });
  await invitation.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(invitation).not.toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("ar-photo-demo-settings-v1")!).roster.invitations.length),
  ).toBe(1);
  flows.teamInviteCancel = {
    pendingInvitations: await page.evaluate(
      () => JSON.parse(localStorage.getItem("ar-photo-demo-settings-v1")!).roster.invitations.length,
    ),
  };
  await spa(page, "profile");
  await page.getByLabel("Имя и фамилия", { exact: true }).fill("Несохранённое имя");
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.getByLabel("Имя и фамилия", { exact: true })).toHaveValue("Мария Кузнецова");
  expect(await page.locator(".profile-role-field select").count()).toBe(0);
  flows.profileCancel = {
    persistedName: await page.getByLabel("Имя и фамилия", { exact: true }).inputValue(),
    ownRoleEditable: false,
  };
  await spa(page, "settings");
  await page.getByLabel("Название студии", { exact: true }).fill("Моя студия — проверка");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByText("Настройки сохранены", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("ar-photo-demo-settings-v1")!).accountSettings.name),
  ).toBe("Моя студия — проверка");
  flows.settingsSave = {
    name: await page.evaluate(
      () => JSON.parse(localStorage.getItem("ar-photo-demo-settings-v1")!).accountSettings.name,
    ),
  };
  await writeFile(`${output}/states/flow-results.json`, JSON.stringify(flows, null, 2));
});

test("checks the requested analytics, subscription and project-tabs refinements", async ({ page }) => {
  const ids = await seed(page);
  await mkdir(`${output}/states`, { recursive: true });
  await page.setViewportSize({ width: 1105, height: 890 });
  await spa(page, "settings/subscription");
  const projects = page.locator(".package-recent-project");
  await expect(projects).toHaveCount(3);
  expect(await projects.locator("h3").allTextContents()).toEqual([
    "Натюрморты с цветами",
    "Лавандовое поле",
    "Горные озёра",
  ]);
  await expect(projects.first()).toHaveAttribute("href", `/ar.photo/projects/${ids.projectId}`);
  await projects.first().click();
  await expect(page).toHaveURL(new RegExp(`/projects/${ids.projectId}$`));
  await page.getByRole("button", { name: "Проекты", exact: true }).click();
  await expect(page).toHaveURL(/settings\/subscription$/);
  await page.setViewportSize({ width: 319, height: 900 });
  await spa(page, `groups?projectId=${ids.projectId}`);
  const tabs = page.getByRole("navigation", { name: "Разделы выбранного проекта", exact: true });
  await expect(tabs.getByRole("link")).toHaveCount(5);
  await expect(tabs.getByRole("link", { name: "Группы", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(tabs.getByRole("link", { name: "Обзор проекта", exact: true })).toHaveAttribute(
    "href",
    `/ar.photo/projects/${ids.projectId}`,
  );
  await expect(tabs.getByRole("link", { name: "AR-фото", exact: true })).toHaveAttribute(
    "href",
    `/ar.photo/items?projectId=${ids.projectId}`,
  );
  await expect(tabs.getByRole("link", { name: "QR-коды", exact: true })).toHaveAttribute(
    "href",
    `/ar.photo/qr-codes?projectId=${ids.projectId}`,
  );
  await expect(tabs.getByRole("link", { name: "Настройки", exact: true })).toHaveAttribute(
    "href",
    `/ar.photo/projects/${ids.projectId}/edit`,
  );
  const tabBounds = await tabs.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(tabBounds.scrollWidth).toBeGreaterThan(tabBounds.clientWidth);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(319);
  await tabs.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  await expect(tabs.getByRole("link", { name: "Настройки", exact: true })).toBeInViewport();
  await page.setViewportSize({ width: 351, height: 893 });
  await spa(page, "analytics");
  await expect(page.locator(".app-topbar-actions")).not.toBeVisible();
  await expect(page.locator(".analytics-work-row")).toHaveCount(3);
  const chart = await page.locator(".analytics-chart-grid > .surface-card").boundingBox();
  const rowBoxes = await Promise.all(
    [0, 1, 2].map((index) => page.locator(".analytics-work-row").nth(index).boundingBox()),
  );
  const nav = await page.locator(".mobile-nav").boundingBox();
  await writeFile(
    `${output}/states/refinement-results.json`,
    JSON.stringify(
      {
        recentProjectNames: await page.evaluate(() =>
          JSON.parse(localStorage.getItem("ar-photo-demo-catalog-v2")!).projects.map(
            (row: { name: string }) => row.name,
          ),
        ),
        tabBounds,
        chart,
        rowBoxes,
        nav,
      },
      null,
      2,
    ),
  );
  expect(chart!.height).toBeGreaterThanOrEqual(150);
  expect(chart!.height).toBeLessThanOrEqual(170);
  expect(rowBoxes[2]!.y + rowBoxes[2]!.height).toBeLessThanOrEqual(nav!.y);
});

test("keeps dashboard recent-project heading above navigation at 319 by 628", async ({ page }) => {
  await page.setViewportSize({ width: 319, height: 628 });
  await page.goto("./login");
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/dashboard$/);
  await mkdir(`${output}/states`, { recursive: true });
  await page.setViewportSize({ width: 319, height: 628 });
  await spa(page, "dashboard");
  const heading = await page.locator(".dashboard-recent-projects h2").boundingBox();
  const navigation = await page.locator(".mobile-nav").boundingBox();
  expect(heading).not.toBeNull();
  expect(navigation).not.toBeNull();
  expect(heading!.y + heading!.height).toBeLessThanOrEqual(navigation!.y);
  await page.screenshot({ path: `${output}/states/dashboard-319x628.png`, animations: "disabled" });
  await writeFile(`${output}/states/dashboard-319x628.json`, JSON.stringify({ heading, navigation }, null, 2));
  await page.evaluate(() => localStorage.clear());
  await seed(page);
  const sheet = sheets.find((row) => row.id === "account-dashboard")!;
  for (const mode of ["desktop", "mobile"] as const) {
    const [width, height] = mode === "desktop" ? sheet.desktopSize : sheet.mobileSize;
    await page.setViewportSize({ width, height });
    await spa(page, "dashboard");
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `${output}/${sheet.id}-${mode}.png`, animations: "disabled" });
  }
});
