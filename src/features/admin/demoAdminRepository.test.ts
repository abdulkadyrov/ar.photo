import { describe, expect, it } from "vitest";
import { AdminError } from "./adminSchemas";
import { createDemoAdminRepository } from "./demoAdminRepository";

const alphaId = "20000000-0000-4000-8000-000000000001";
const alphaOwnerId = "10000000-0000-4000-8000-000000000010";

describe("DemoAdminRepository", () => {
  it("returns an MFA-verified admin snapshot without password material", async () => {
    const repository = createDemoAdminRepository();
    expect(await repository.getAccess()).toEqual({ isSuperadmin: true, mfaVerified: true });
    const snapshot = await repository.getSnapshot();
    expect(snapshot.accounts.total).toBe(2);
    expect(snapshot.overview.failedJobs).toBe(2);
    expect(JSON.stringify(snapshot)).not.toMatch(/password|encrypted_password/i);
  });

  it("captures a reason before returning account-scoped users", async () => {
    const repository = createDemoAdminRepository();
    await expect(repository.getAccountDetail(alphaId, "short")).rejects.toBeInstanceOf(Error);
    const detail = await repository.getAccountDetail(alphaId, "Диагностика обращения клиента SUP-1042");
    expect(detail.users).toHaveLength(2);
    const snapshot = await repository.getSnapshot();
    expect(snapshot.audit.items[0]).toMatchObject({ action: "admin.support_access", accountId: alphaId });
  });

  it("suspends and restores an account with audit evidence", async () => {
    const repository = createDemoAdminRepository();
    await repository.setAccountStatus(alphaId, "suspended", "Проверка инцидента RISK-18 клиента");
    expect((await repository.getSnapshot()).accounts.items.find((item) => item.id === alphaId)?.status).toBe(
      "suspended",
    );
    await repository.setAccountStatus(alphaId, "active", "Инцидент RISK-18 успешно закрыт");
    const snapshot = await repository.getSnapshot();
    expect(snapshot.accounts.items.find((item) => item.id === alphaId)?.status).toBe("active");
    expect(
      snapshot.audit.items.filter((item) => item.action === "admin.account.status" && item.accountId === alphaId),
    ).toHaveLength(2);
  });

  it("finds and suspends a public AR item", async () => {
    const repository = createDemoAdminRepository();
    const [item] = await repository.searchContent("Выпускной");
    expect(item.arItemStatus).toBe("published");
    await repository.setItemSuspended(alphaId, item.arItemId, true, "Обращение правообладателя CONTENT-44");
    expect((await repository.searchContent("Выпускной"))[0].arItemStatus).toBe("suspended");
  });

  it("retries only an existing failed processing job", async () => {
    const repository = createDemoAdminRepository();
    await repository.retryProcessingJob(alphaId, 47, "Повтор после диагностики безопасной ошибки");
    expect((await repository.getSnapshot()).errors.items.map((item) => item.id)).not.toContain(47);
    await expect(
      repository.retryProcessingJob(alphaId, 47, "Повтор уже закрытой ошибки processing"),
    ).rejects.toBeInstanceOf(AdminError);
  });

  it("updates subscriptions and strict system settings", async () => {
    const repository = createDemoAdminRepository();
    await repository.updateSubscription(alphaId, {
      planId: "00000000-0000-4000-8000-000000000001",
      status: "suspended",
      startsAt: "2026-08-03T05:00:00.000Z",
      expiresAt: "2026-11-01T05:00:00.000Z",
      gracePeriodEndsAt: null,
      customLimits: { project_limit: 12 },
      reason: "Изменение подписки по договору CONTRACT-77",
    });
    const detail = await repository.getAccountDetail(alphaId, "Проверка результата по CONTRACT-77");
    expect(detail.subscription).toMatchObject({ planCode: "trial", status: "suspended" });
    await expect(
      repository.updateSetting("analytics_retention_days", 7, "Небезопасный срок хранения analytics"),
    ).rejects.toBeInstanceOf(AdminError);
    await repository.updateSetting("analytics_retention_days", 180, "Срок согласован после legal review");
    expect(
      (await repository.getSnapshot()).settings.find((item) => item.key === "analytics_retention_days")?.value,
    ).toBe(180);
  });

  it("creates owner accounts by invitation and never accepts a password", async () => {
    const repository = createDemoAdminRepository();
    await repository.createAccount({
      email: "owner@agency.example",
      fullName: "Owner Agency",
      accountName: "Agency Studio",
      accountSlug: "agency-studio",
      planId: "00000000-0000-4000-8000-000000000002",
      reason: "Создание аккаунта по договору CONTRACT-88",
    });
    const snapshot = await repository.getSnapshot("agency-studio");
    expect(snapshot.accounts.total).toBe(1);
    expect(JSON.stringify(snapshot)).not.toMatch(/password/i);
  });

  it("authorizes only account-scoped password reset delivery", async () => {
    const repository = createDemoAdminRepository();
    await repository.requestPasswordReset(alphaId, alphaOwnerId, "Подтверждённый запрос клиента SUPPORT-55");
    expect((await repository.getSnapshot()).audit.items[0].action).toBe("admin.password_reset.request");
    await expect(
      repository.requestPasswordReset(alphaId, crypto.randomUUID(), "Попытка сброса чужого пользователя"),
    ).rejects.toBeInstanceOf(AdminError);
  });
});
