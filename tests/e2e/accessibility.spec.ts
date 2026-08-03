import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function signInToDemo(page: Page) {
  await page.getByPlaceholder("Не менее 8 символов").fill("demo-password");
  await page.getByRole("button", { name: "Войти" }).click();
}

async function expectNoSeriousAccessibilityViolations(page: Page, label: string) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const violations = result.violations.filter((item) => item.impact === "critical" || item.impact === "serious");
  expect(
    violations.map((item) => ({
      id: item.id,
      impact: item.impact,
      help: item.help,
      targets: item.nodes.map((node) => node.target),
    })),
    `${label} has serious accessibility violations`,
  ).toEqual([]);
}

test("keeps critical public and protected surfaces free of serious WCAG violations", async ({ page }) => {
  await page.goto("./");
  await expectNoSeriousAccessibilityViolations(page, "landing");

  await page.goto("./login");
  await expectNoSeriousAccessibilityViolations(page, "login");
  await signInToDemo(page);
  await expectNoSeriousAccessibilityViolations(page, "dashboard");

  await page.goto("./admin");
  await expect(page.getByRole("heading", { name: "Admin", exact: true })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page, "admin");

  await page.goto("./ar/demo");
  await expect(page.getByRole("button", { name: "Начать AR" })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page, "public AR intro");
});
