import type { AdminRepository, AdminSnapshot } from "./adminRepository";
import {
  AdminError,
  adminReasonSchema,
  createAdminAccountSchema,
  type AdminAccountDetail,
  type AdminAuditList,
  type AdminContentResult,
  type AdminPlan,
  type AdminPlanInput,
  type AdminProcessingErrorList,
  type AdminSetting,
  type CreateAdminAccountInput,
  type SubscriptionAdminInput,
} from "./adminSchemas";

const now = "2026-08-03T05:00:00.000Z";
const adminUserId = "10000000-0000-4000-8000-000000000001";
const alphaId = "20000000-0000-4000-8000-000000000001";
const betaId = "20000000-0000-4000-8000-000000000002";

type DemoState = {
  snapshot: AdminSnapshot;
  details: Record<string, AdminAccountDetail>;
  content: AdminContentResult[];
};

export function createDemoAdminRepository(): AdminRepository {
  return new DemoAdminRepository(createState());
}

export class DemoAdminRepository implements AdminRepository {
  constructor(private readonly state: DemoState = createState()) {}

  async getAccess() {
    return { isSuperadmin: true, mfaVerified: true };
  }

  async verifyMfa(rawCode: string) {
    if (!/^\d{6,8}$/.test(rawCode.trim())) throw new AdminError("invalid", "Введите одноразовый код MFA");
  }

  async getSnapshot(search = "") {
    const query = search.trim().toLocaleLowerCase("ru");
    const items = this.state.snapshot.accounts.items.filter(
      (account) =>
        !query ||
        account.name.toLocaleLowerCase("ru").includes(query) ||
        account.slug.includes(query) ||
        account.id === query,
    );
    return structuredClone({
      ...this.state.snapshot,
      overview: this.overview(),
      accounts: { total: items.length, items },
      plans: this.state.snapshot.plans,
      errors: this.state.snapshot.errors,
      audit: this.state.snapshot.audit,
      settings: this.state.snapshot.settings,
    });
  }

  async getAccountDetail(accountId: string, rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    const detail = this.state.details[accountId];
    if (!detail) throw new AdminError("not_found", "Аккаунт не найден");
    this.audit(accountId, "admin.support_access", "accounts", accountId, reason);
    return structuredClone(detail);
  }

  async searchContent(rawSearch: string) {
    const search = rawSearch.trim().toLocaleLowerCase("ru");
    if (search.length < 2 || search.length > 80) throw new AdminError("invalid", "Введите от 2 до 80 символов");
    return structuredClone(
      this.state.content.filter((item) =>
        [item.projectName, item.groupName, item.arItemTitle, item.projectId, item.arItemId].some((value) =>
          value.toLocaleLowerCase("ru").includes(search),
        ),
      ),
    );
  }

  async createAccount(rawInput: CreateAdminAccountInput) {
    const input = createAdminAccountSchema.parse(rawInput);
    if (this.state.snapshot.accounts.items.some((item) => item.slug === input.accountSlug)) {
      throw new AdminError("invalid", "Slug уже используется");
    }
    const accountId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const subscriptionId = crypto.randomUUID();
    const plan = this.plan(input.planId);
    this.state.snapshot.accounts.items.unshift({
      id: accountId,
      name: input.accountName,
      slug: input.accountSlug,
      status: "active",
      ownerName: input.fullName,
      planCode: plan.code,
      planName: plan.name,
      subscriptionStatus: "trial",
      subscriptionExpiresAt: addDays(14),
      storageUsedBytes: 0,
      arItemCount: 0,
      failedJobCount: 0,
      createdAt: now,
    });
    this.state.details[accountId] = {
      account: {
        id: accountId,
        name: input.accountName,
        slug: input.accountSlug,
        status: "active",
        timezone: "Europe/Moscow",
        storageUsedBytes: 0,
        createdAt: now,
      },
      subscription: {
        id: subscriptionId,
        planId: plan.id,
        planCode: plan.code,
        planName: plan.name,
        status: "trial",
        startsAt: now,
        expiresAt: addDays(14),
        gracePeriodEndsAt: null,
        customLimits: {},
      },
      users: [
        {
          id: userId,
          fullName: input.fullName,
          emailDisplay: input.email,
          role: "owner",
          isActive: true,
          acceptedAt: null,
          lastLoginAt: null,
        },
      ],
      usage: { projects: 0, groups: 0, arItems: 0, publishedItems: 0, storageBytes: 0, failedJobs: 0 },
    };
    this.audit(accountId, "admin.account.create", "accounts", accountId, input.reason);
  }

  async updateSubscription(accountId: string, input: SubscriptionAdminInput) {
    const reason = adminReasonSchema.parse(input.reason);
    const detail = this.detail(accountId);
    const plan = this.plan(input.planId);
    detail.subscription = {
      ...detail.subscription,
      planId: plan.id,
      planCode: plan.code,
      planName: plan.name,
      status: input.status,
      startsAt: input.startsAt,
      expiresAt: input.expiresAt,
      gracePeriodEndsAt: input.gracePeriodEndsAt,
      customLimits: structuredClone(input.customLimits),
    };
    const account = this.account(accountId);
    account.planCode = plan.code;
    account.planName = plan.name;
    account.subscriptionStatus = input.status;
    account.subscriptionExpiresAt = input.expiresAt;
    this.audit(accountId, "admin.subscription.update", "subscriptions", detail.subscription.id, reason);
  }

  async setAccountStatus(accountId: string, status: "active" | "suspended", rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    this.account(accountId).status = status;
    this.detail(accountId).account.status = status;
    this.audit(accountId, "admin.account.status", "accounts", accountId, reason, { status });
  }

  async setUserActive(accountId: string, userId: string, active: boolean, rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    const user = this.detail(accountId).users.find((candidate) => candidate.id === userId);
    if (!user) throw new AdminError("not_found", "Пользователь аккаунта не найден");
    if (active && !user.acceptedAt)
      throw new AdminError("invalid", "Ожидающее приглашение нельзя активировать вручную");
    user.isActive = active;
    this.audit(accountId, active ? "admin.user.activate" : "admin.user.suspend", "profiles", userId, reason, {
      active,
      memberRole: user.role,
    });
  }

  async deleteUser(accountId: string, userId: string, confirmation: "УДАЛИТЬ", rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    if (confirmation !== "УДАЛИТЬ") throw new AdminError("invalid", "Введите подтверждение УДАЛИТЬ");
    const detail = this.detail(accountId);
    const index = detail.users.findIndex((candidate) => candidate.id === userId);
    if (index < 0) throw new AdminError("not_found", "Пользователь аккаунта не найден");
    if (detail.users[index].role === "owner") throw new AdminError("invalid", "Владельца аккаунта нельзя удалить");
    detail.users.splice(index, 1);
    this.audit(accountId, "admin.user.delete.authorized", "profiles", userId, reason);
  }

  async setItemSuspended(accountId: string, itemId: string, suspended: boolean, rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    const item = this.state.content.find(
      (candidate) => candidate.accountId === accountId && candidate.arItemId === itemId,
    );
    if (!item) throw new AdminError("not_found", "AR-работа не найдена");
    item.arItemStatus = suspended ? "suspended" : "ready";
    this.audit(accountId, suspended ? "admin.ar_item.suspend" : "admin.ar_item.restore", "ar_items", itemId, reason);
  }

  async retryProcessingJob(accountId: string, jobId: number, rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    const index = this.state.snapshot.errors.items.findIndex(
      (candidate) => candidate.accountId === accountId && candidate.id === jobId,
    );
    if (index < 0) throw new AdminError("not_found", "Ошибка обработки уже закрыта");
    this.state.snapshot.errors.items.splice(index, 1);
    this.state.snapshot.errors.total = this.state.snapshot.errors.items.length;
    const account = this.account(accountId);
    account.failedJobCount = Math.max(0, account.failedJobCount - 1);
    this.detail(accountId).usage.failedJobs = Math.max(0, this.detail(accountId).usage.failedJobs - 1);
    this.audit(accountId, "admin.processing.retry", "processing_jobs", String(jobId), reason);
  }

  async upsertPlan(input: AdminPlanInput) {
    const reason = adminReasonSchema.parse(input.reason);
    const id = input.id ?? crypto.randomUUID();
    const plan: AdminPlan = { ...input, id, updatedAt: now };
    delete (plan as Partial<AdminPlanInput>).reason;
    const index = this.state.snapshot.plans.findIndex((candidate) => candidate.id === id);
    if (index < 0) this.state.snapshot.plans.push(plan);
    else this.state.snapshot.plans[index] = plan;
    this.audit(null, "admin.plan.upsert", "subscription_plans", id, reason, { code: plan.code });
  }

  async updateSetting(key: AdminSetting["key"], value: AdminSetting["value"], rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    const setting = this.state.snapshot.settings.find((candidate) => candidate.key === key);
    if (!setting) throw new AdminError("not_found", "Настройка не найдена");
    if (key === "analytics_retention_days" && (typeof value !== "number" || value < 30 || value > 730)) {
      throw new AdminError("invalid", "Retention должен быть от 30 до 730 дней");
    }
    setting.value = value;
    setting.updatedAt = now;
    this.audit(null, "admin.settings.update", "system_settings", key, reason);
  }

  async requestPasswordReset(accountId: string, userId: string, rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    if (!this.detail(accountId).users.some((user) => user.id === userId)) {
      throw new AdminError("not_found", "Пользователь аккаунта не найден");
    }
    this.audit(accountId, "admin.password_reset.request", "profiles", userId, reason);
  }

  private overview() {
    const accounts = this.state.snapshot.accounts.items;
    const details = Object.values(this.state.details);
    return {
      accounts: {
        total: accounts.length,
        active: accounts.filter((item) => item.status === "active").length,
        suspended: accounts.filter((item) => item.status === "suspended").length,
      },
      users: {
        total: details.reduce((sum, detail) => sum + detail.users.length, 0),
        active: details.reduce((sum, detail) => sum + detail.users.filter((user) => user.isActive).length, 0),
      },
      subscriptions: {
        active: accounts.filter((item) => ["trial", "active", "grace_period"].includes(item.subscriptionStatus ?? ""))
          .length,
        attention: accounts.filter((item) =>
          ["expired", "suspended", "cancelled"].includes(item.subscriptionStatus ?? ""),
        ).length,
      },
      storageBytes: accounts.reduce((sum, account) => sum + account.storageUsedBytes, 0),
      arItems: accounts.reduce((sum, account) => sum + account.arItemCount, 0),
      publishedItems: details.reduce((sum, detail) => sum + detail.usage.publishedItems, 0),
      failedJobs: this.state.snapshot.errors.items.length,
    };
  }

  private detail(accountId: string) {
    const detail = this.state.details[accountId];
    if (!detail) throw new AdminError("not_found", "Аккаунт не найден");
    return detail;
  }

  private account(accountId: string) {
    const account = this.state.snapshot.accounts.items.find((candidate) => candidate.id === accountId);
    if (!account) throw new AdminError("not_found", "Аккаунт не найден");
    return account;
  }

  private plan(planId: string) {
    const plan = this.state.snapshot.plans.find((candidate) => candidate.id === planId);
    if (!plan) throw new AdminError("not_found", "Тариф не найден");
    return plan;
  }

  private audit(
    accountId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    reason: string,
    metadataSafe: Record<string, unknown> = {},
  ) {
    const audit = this.state.snapshot.audit;
    audit.items.unshift({
      id: (audit.items[0]?.id ?? 0) + 1,
      accountId,
      actorUserId: adminUserId,
      actorName: "AR Photo Admin",
      action,
      entityType,
      entityId,
      reason,
      metadataSafe,
      createdAt: new Date().toISOString(),
    });
    audit.total = audit.items.length;
  }
}

function createState(): DemoState {
  const plans: AdminPlan[] = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      code: "trial",
      name: "Trial",
      description: "Проверка AR Photo",
      storageLimitBytes: 1_073_741_824,
      projectLimit: 3,
      groupLimit: 12,
      arItemLimit: 100,
      videoDurationLimitSeconds: 120,
      maxVideoSizeBytes: 52_428_800,
      teamLimit: 3,
      isActive: true,
      updatedAt: now,
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      code: "studio",
      name: "Studio",
      description: "Коммерческий тариф студии",
      storageLimitBytes: 107_374_182_400,
      projectLimit: 100,
      groupLimit: 1000,
      arItemLimit: 10_000,
      videoDurationLimitSeconds: 600,
      maxVideoSizeBytes: 524_288_000,
      teamLimit: 20,
      isActive: true,
      updatedAt: now,
    },
  ];
  const details: Record<string, AdminAccountDetail> = {
    [alphaId]: detailFixture(alphaId, "Alpha Studio", "alpha-studio", "active", plans[1], 18_345_221_120),
    [betaId]: detailFixture(betaId, "Beta Studio", "beta-studio", "expired", plans[0], 482_344_960),
  };
  details[alphaId].users = [
    {
      id: "10000000-0000-4000-8000-000000000010",
      fullName: "Иван Иванов",
      emailDisplay: "owner-a@arphoto.example",
      role: "owner",
      isActive: true,
      acceptedAt: "2026-04-01T09:00:00.000Z",
      lastLoginAt: "2026-08-03T04:42:00.000Z",
    },
    {
      id: "10000000-0000-4000-8000-000000000011",
      fullName: "Алина Магомедова",
      emailDisplay: "editor-a@arphoto.example",
      role: "editor",
      isActive: true,
      acceptedAt: "2026-05-12T10:00:00.000Z",
      lastLoginAt: "2026-08-02T14:20:00.000Z",
    },
  ];
  details[betaId].users = [
    {
      id: "10000000-0000-4000-8000-000000000020",
      fullName: "Мария Петрова",
      emailDisplay: "owner-b@arphoto.example",
      role: "owner",
      isActive: true,
      acceptedAt: "2026-02-01T09:00:00.000Z",
      lastLoginAt: "2026-07-20T12:00:00.000Z",
    },
  ];
  const accounts = [
    accountFixture(alphaId, "Alpha Studio", "alpha-studio", "active", plans[1], 18_345_221_120, 256, 2),
    accountFixture(betaId, "Beta Studio", "beta-studio", "suspended", plans[0], 482_344_960, 8, 0),
  ];
  const errors: AdminProcessingErrorList = {
    total: 2,
    items: [
      errorFixture(47, alphaId, "Alpha Studio", "70000000-0000-4000-8000-000000000001", "Алексей Иванов"),
      errorFixture(48, alphaId, "Alpha Studio", "70000000-0000-4000-8000-000000000002", "Мария Петрова"),
    ],
  };
  const audit: AdminAuditList = {
    total: 2,
    items: [
      auditFixture(2, alphaId, "admin.subscription.update", "Продление по договору CONTRACT-71"),
      auditFixture(1, betaId, "admin.account.status", "Приостановка после завершения trial"),
    ],
  };
  const settings: AdminSetting[] = [
    settingFixture("analytics_retention_days", 90, "Срок хранения privacy-minimized analytics в днях."),
    settingFixture("maintenance_mode", false, "Отключает клиентские операции во время аварийных работ."),
    settingFixture("public_ar_enabled", true, "Глобальный operational switch публичного AR."),
    settingFixture("registration_enabled", false, "Создание аккаунтов только через admin flow."),
    settingFixture("support_banner", "", "Короткое operational сообщение для команды поддержки."),
  ];
  return {
    snapshot: {
      overview: {
        accounts: { total: 2, active: 1, suspended: 1 },
        users: { total: 3, active: 3 },
        subscriptions: { active: 1, attention: 1 },
        storageBytes: 18_827_566_080,
        arItems: 264,
        publishedItems: 201,
        failedJobs: 2,
      },
      accounts: { total: accounts.length, items: accounts },
      plans,
      errors,
      audit,
      settings,
    },
    details,
    content: [
      {
        accountId: alphaId,
        accountName: "Alpha Studio",
        projectId: "50000000-0000-4000-8000-000000000001",
        projectName: "Выпускной 2027",
        groupId: "60000000-0000-4000-8000-000000000001",
        groupName: "11А класс",
        arItemId: "70000000-0000-4000-8000-000000000001",
        arItemTitle: "Алексей Иванов",
        arItemStatus: "published",
      },
      {
        accountId: alphaId,
        accountName: "Alpha Studio",
        projectId: "50000000-0000-4000-8000-000000000001",
        projectName: "Выпускной 2027",
        groupId: "60000000-0000-4000-8000-000000000001",
        groupName: "11А класс",
        arItemId: "70000000-0000-4000-8000-000000000002",
        arItemTitle: "Мария Петрова",
        arItemStatus: "failed",
      },
    ],
  };
}

function accountFixture(
  id: string,
  name: string,
  slug: string,
  status: "active" | "suspended",
  plan: AdminPlan,
  storage: number,
  items: number,
  failed: number,
) {
  return {
    id,
    name,
    slug,
    status,
    ownerName: name === "Alpha Studio" ? "Иван Иванов" : "Мария Петрова",
    planCode: plan.code,
    planName: plan.name,
    subscriptionStatus: name === "Alpha Studio" ? ("active" as const) : ("expired" as const),
    subscriptionExpiresAt: name === "Alpha Studio" ? "2026-11-01T05:00:00.000Z" : "2026-07-01T05:00:00.000Z",
    storageUsedBytes: storage,
    arItemCount: items,
    failedJobCount: failed,
    createdAt: "2026-02-01T09:00:00.000Z",
  };
}

function detailFixture(
  id: string,
  name: string,
  slug: string,
  subscriptionStatus: "active" | "expired",
  plan: AdminPlan,
  storage: number,
): AdminAccountDetail {
  return {
    account: {
      id,
      name,
      slug,
      status: subscriptionStatus === "active" ? "active" : "suspended",
      timezone: "Europe/Moscow",
      storageUsedBytes: storage,
      createdAt: now,
    },
    subscription: {
      id: crypto.randomUUID(),
      planId: plan.id,
      planCode: plan.code,
      planName: plan.name,
      status: subscriptionStatus,
      startsAt: "2026-04-01T05:00:00.000Z",
      expiresAt: subscriptionStatus === "active" ? "2026-11-01T05:00:00.000Z" : "2026-07-01T05:00:00.000Z",
      gracePeriodEndsAt: null,
      customLimits: {},
    },
    users: [],
    usage: {
      projects: subscriptionStatus === "active" ? 12 : 2,
      groups: subscriptionStatus === "active" ? 48 : 4,
      arItems: subscriptionStatus === "active" ? 256 : 8,
      publishedItems: subscriptionStatus === "active" ? 201 : 3,
      storageBytes: storage,
      failedJobs: subscriptionStatus === "active" ? 2 : 0,
    },
  };
}

function errorFixture(id: number, accountId: string, accountName: string, arItemId: string, title: string) {
  return {
    id,
    accountId,
    accountName,
    arItemId,
    arItemTitle: title,
    type: "marker_compilation",
    errorCode: "marker_decode_failed",
    errorMessage: "Обработка не завершена. Повторите попытку позже.",
    attemptCount: 3,
    maxAttempts: 3,
    updatedAt: now,
  };
}

function auditFixture(id: number, accountId: string, action: string, reason: string) {
  return {
    id,
    accountId,
    actorUserId: adminUserId,
    actorName: "AR Photo Admin",
    action,
    entityType: "accounts",
    entityId: accountId,
    reason,
    metadataSafe: {},
    createdAt: now,
  };
}

function settingFixture(key: AdminSetting["key"], value: AdminSetting["value"], description: string): AdminSetting {
  return { key, value, description, updatedAt: now };
}

function addDays(days: number) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
