import { expect, test } from "@playwright/test";
const user = {
  id: "10000000-0000-4000-8000-000000000099",
  email: "recovery@example.test",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
  is_anonymous: false,
};
const jwt =
  [
    { alg: "HS256", typ: "JWT" },
    { sub: user.id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 },
  ]
    .map((v) => Buffer.from(JSON.stringify(v)).toString("base64url"))
    .join(".") + ".fixture";

test("opening or reloading a recovery link does not consume it; password save verifies once", async ({ page }) => {
  let verifies = 0,
    updates = 0;
  await page.route("https://auth.example.test/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
      "Content-Type": "application/json",
    };
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
    if (url.pathname === "/auth/v1/verify") {
      verifies++;
      expect(request.postDataJSON()).toMatchObject({ type: "recovery", token_hash: "fixture_hash" });
      return route.fulfill({
        headers,
        json: { access_token: jwt, refresh_token: "fixture_refresh", expires_in: 3600, token_type: "bearer", user },
      });
    }
    if (url.pathname === "/auth/v1/user") {
      if (request.method() === "PUT") {
        updates++;
        expect(request.postDataJSON()).toMatchObject({ password: "TestPass8" });
      }
      return route.fulfill({ headers, json: user });
    }
    return route.fulfill({ headers, json: [] });
  });
  await page.goto("./recover-access#token_hash=fixture_hash");
  await expect(page.getByRole("heading", { name: "Новый пароль", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Сохранить пароль" })).toBeVisible();
  expect(verifies).toBe(0);
  await page.getByLabel("Новый пароль", { exact: true }).fill("TestPass8");
  await page.getByLabel("Повторите пароль", { exact: true }).fill("TestPass8");
  await page.getByRole("button", { name: "Сохранить пароль" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(verifies).toBe(1);
  expect(updates).toBe(1);
});

test("recovery without a token cannot set a password", async ({ page }) => {
  await page.goto("./recover-access");
  await expect(page.getByRole("button", { name: "Сохранить пароль" })).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText("персональную ссылку");
});

test("disabled email delivery is disclosed instead of promising a sent email", async ({ page }) => {
  await page.goto("./reset-password");
  await expect(page.getByRole("alert")).toContainText("Письма восстановления ещё не настроены");
  await expect(page.getByRole("button", { name: "Получить ссылку" })).toHaveCount(0);
});
