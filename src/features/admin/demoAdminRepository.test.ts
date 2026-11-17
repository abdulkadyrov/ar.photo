import { describe, expect, it } from "vitest";
import { AdminError } from "./adminSchemas";
import { createDemoAdminRepository } from "./demoAdminRepository";

const alphaId = "20000000-0000-4000-8000-000000000001";
const betaId = "20000000-0000-4000-8000-000000000002";
const alphaOwnerId = "10000000-0000-4000-8000-000000000010";
const alphaEditorId = "10000000-0000-4000-8000-000000000011";

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

  it("edits account and user profiles without changing access or package state", async () => {
    const repository = createDemoAdminRepository();
    const before = await repository.getAccountDetail(alphaId, "Проверка исходной карточки аккаунта");
    await repository.updateAccount(
      alphaId,
      { name: "  Обновлённая студия  ", timezone: "Asia/Yekaterinburg" },
      "Редактирование профиля аккаунта администратором",
    );
    await repository.updateUser(
      alphaId,
      alphaOwnerId,
      { fullName: "Новый контакт владельца" },
      "Редактирование имени владельца администратором",
    );
    const after = await repository.getAccountDetail(alphaId, "Проверка сохранённой карточки аккаунта");
    expect(after.account).toMatchObject({
      name: "Обновлённая студия",
      timezone: "Asia/Yekaterinburg",
      slug: before.account.slug,
      status: before.account.status,
    });
    expect(after.subscription).toEqual(before.subscription);
    expect(after.users.find((user) => user.id === alphaOwnerId)).toMatchObject({
      fullName: "Новый контакт владельца",
      role: "owner",
      isActive: true,
    });
    const snapshot = await repository.getSnapshot();
    expect(snapshot.accounts.items.find((account) => account.id === alphaId)).toMatchObject({
      name: "Обновлённая студия",
      ownerName: "Новый контакт владельца",
    });
    expect(
      snapshot.audit.items.find((log) => log.action === "admin.account.profile.update")?.metadataSafe,
    ).toMatchObject({ before: { name: before.account.name }, after: { name: "Обновлённая студия" } });
  });

  it("rejects foreign user edits and invalid profile values before mutation", async () => {
    const repository = createDemoAdminRepository();
    await expect(
      repository.updateUser(
        betaId,
        alphaEditorId,
        { fullName: "Чужой пользователь" },
        "Попытка изменить чужой профиль",
      ),
    ).rejects.toBeInstanceOf(AdminError);
    await expect(
      repository.updateAccount(alphaId, { name: " ", timezone: "Europe/Moscow" }, "Некорректное название аккаунта"),
    ).rejects.toThrow();
    await expect(
      repository.updateAccount(
        alphaId,
        { name: "Valid", timezone: "Wrong/Zone" },
        "Некорректный часовой пояс аккаунта",
      ),
    ).rejects.toThrow();
    await expect(
      repository.updateUser(alphaId, alphaEditorId, { fullName: "\u0001invalid" }, "Некорректное имя пользователя"),
    ).rejects.toThrow();
    expect((await repository.getSnapshot()).audit.items.some((log) => log.action.endsWith("profile.update"))).toBe(
      false,
    );
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

  it("closes an account, removes it from the console and keeps audit evidence", async () => {
    const repository = createDemoAdminRepository();
    await repository.deleteAccount(betaId, "УДАЛИТЬ АККАУНТ", "Закрытие аккаунта по подтверждённому запросу OWNER-901");
    const snapshot = await repository.getSnapshot();
    expect(snapshot.accounts.items.some((item) => item.id === betaId)).toBe(false);
    expect(snapshot.audit.items[0]).toMatchObject({
      action: "admin.account.close",
      accountId: betaId,
      entityId: betaId,
    });
    await expect(repository.getAccountDetail(betaId, "Проверка закрытого аккаунта OWNER-901")).rejects.toBeInstanceOf(
      AdminError,
    );
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

  it("blocks, restores and deletes eligible account users with audit evidence", async () => {
    const repository = createDemoAdminRepository();
    await repository.setUserActive(alphaId, alphaEditorId, false, "Блокировка пользователя по обращению RISK-204");
    let detail = await repository.getAccountDetail(alphaId, "Проверка блокировки пользователя RISK-204");
    expect(detail.users.find((user) => user.id === alphaEditorId)?.isActive).toBe(false);
    await repository.setUserActive(alphaId, alphaEditorId, true, "Восстановление пользователя после RISK-204");
    await repository.deleteUser(alphaId, alphaEditorId, "УДАЛИТЬ", "Удаление сотрудника по запросу владельца SUP-812");
    detail = await repository.getAccountDetail(alphaId, "Проверка удаления пользователя SUP-812");
    expect(detail.users.some((user) => user.id === alphaEditorId)).toBe(false);
    const audit = (await repository.getSnapshot()).audit.items;
    expect(audit.some((item) => item.action === "admin.user.suspend" && item.entityId === alphaEditorId)).toBe(true);
    expect(
      audit.some((item) => item.action === "admin.user.delete.authorized" && item.entityId === alphaEditorId),
    ).toBe(true);
  });

  it("never deletes an account owner", async () => {
    const repository = createDemoAdminRepository();
    await expect(
      repository.deleteUser(alphaId, alphaOwnerId, "УДАЛИТЬ", "Попытка удаления владельца аккаунта SUP-900"),
    ).rejects.toBeInstanceOf(AdminError);
  });
});
