import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import type { Json } from "../../shared/api/database.types";
import {
  AdminError,
  adminAccessSchema,
  adminAccountDetailSchema,
  adminAccountListSchema,
  adminAuditListSchema,
  adminContentResultSchema,
  adminOverviewSchema,
  adminPlanSchema,
  adminProcessingErrorListSchema,
  adminReasonSchema,
  adminSettingSchema,
  createAdminAccountSchema,
  type AdminAccess,
  type AdminAccountDetail,
  type AdminAccountList,
  type AdminAuditList,
  type AdminContentResult,
  type AdminOverview,
  type AdminPlan,
  type AdminPlanInput,
  type AdminProcessingErrorList,
  type AdminSetting,
  type CreateAdminAccountInput,
  type SubscriptionAdminInput,
} from "./adminSchemas";
import { createDemoAdminRepository } from "./demoAdminRepository";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export type AdminSnapshot = {
  overview: AdminOverview;
  accounts: AdminAccountList;
  plans: AdminPlan[];
  errors: AdminProcessingErrorList;
  audit: AdminAuditList;
  settings: AdminSetting[];
};

export interface AdminRepository {
  getAccess(): Promise<AdminAccess>;
  verifyMfa(code: string): Promise<void>;
  getSnapshot(search?: string): Promise<AdminSnapshot>;
  getAccountDetail(accountId: string, reason: string): Promise<AdminAccountDetail>;
  searchContent(search: string): Promise<AdminContentResult[]>;
  createAccount(input: CreateAdminAccountInput): Promise<void>;
  updateSubscription(accountId: string, input: SubscriptionAdminInput): Promise<void>;
  setAccountStatus(accountId: string, status: "active" | "suspended", reason: string): Promise<void>;
  setItemSuspended(accountId: string, itemId: string, suspended: boolean, reason: string): Promise<void>;
  retryProcessingJob(accountId: string, jobId: number, reason: string): Promise<void>;
  upsertPlan(input: AdminPlanInput): Promise<void>;
  updateSetting(key: AdminSetting["key"], value: AdminSetting["value"], reason: string): Promise<void>;
  requestPasswordReset(accountId: string, userId: string, reason: string): Promise<void>;
}

export class SupabaseAdminRepository implements AdminRepository {
  constructor(private readonly client: SupabaseBrowserClient) {}

  async getAccess() {
    const { data, error } = await this.client.rpc("get_admin_access");
    if (error) throw mapAdminError(error);
    return parse(adminAccessSchema, data, "Некорректный ответ проверки admin-доступа");
  }

  async verifyMfa(rawCode: string) {
    const code = rawCode.trim();
    if (!/^\d{6,8}$/.test(code)) throw new AdminError("invalid", "Введите одноразовый код MFA");
    const factors = await this.client.auth.mfa.listFactors();
    if (factors.error) throw mapAdminError(factors.error);
    const factor = factors.data.totp.find((candidate) => candidate.status === "verified");
    if (!factor) throw new AdminError("mfa_required", "Для суперадминистратора не настроен подтверждённый TOTP-фактор");
    const verification = await this.client.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (verification.error) throw new AdminError("mfa_required", "Код MFA не принят", verification.error);
  }

  async getSnapshot(search = "") {
    const [overview, accounts, plans, errors, audit, settings] = await Promise.all([
      this.client.rpc("admin_get_overview"),
      this.client.rpc("admin_list_accounts", { p_search: search, p_limit: 100, p_offset: 0 }),
      this.client.rpc("admin_list_plans"),
      this.client.rpc("admin_get_processing_errors", { p_target_account_id: undefined, p_limit: 100, p_offset: 0 }),
      this.client.rpc("admin_get_audit_logs", { p_target_account_id: undefined, p_limit: 200, p_offset: 0 }),
      this.client.rpc("admin_get_system_settings"),
    ]);
    const error = overview.error ?? accounts.error ?? plans.error ?? errors.error ?? audit.error ?? settings.error;
    if (error) throw mapAdminError(error);
    return {
      overview: parse(adminOverviewSchema, overview.data, "Некорректная admin-сводка"),
      accounts: parse(adminAccountListSchema, accounts.data, "Некорректный список аккаунтов"),
      plans: parse(adminPlanSchema.array(), plans.data, "Некорректный список тарифов"),
      errors: parse(adminProcessingErrorListSchema, errors.data, "Некорректная очередь ошибок"),
      audit: parse(adminAuditListSchema, audit.data, "Некорректный admin audit"),
      settings: parse(adminSettingSchema.array(), settings.data, "Некорректные системные настройки"),
    };
  }

  async getAccountDetail(accountId: string, rawReason: string) {
    const reason = adminReasonSchema.parse(rawReason);
    const { data, error } = await this.client.rpc("admin_get_account_detail", {
      p_target_account_id: accountId,
      p_reason: reason,
    });
    if (error) throw mapAdminError(error);
    return parse(adminAccountDetailSchema, data, "Некорректная карточка аккаунта");
  }

  async searchContent(rawSearch: string) {
    const search = rawSearch.trim();
    if (search.length < 2 || search.length > 80) throw new AdminError("invalid", "Введите от 2 до 80 символов");
    const { data, error } = await this.client.rpc("admin_search_content", { p_search: search, p_limit: 100 });
    if (error) throw mapAdminError(error);
    return parse(adminContentResultSchema.array(), data, "Некорректный результат поиска");
  }

  async createAccount(rawInput: CreateAdminAccountInput) {
    const input = createAdminAccountSchema.parse(rawInput);
    const { error } = await this.client.functions.invoke("admin-create-user", { body: input });
    if (error) throw await mapEdgeAdminError(error);
  }

  async updateSubscription(accountId: string, input: SubscriptionAdminInput) {
    const reason = adminReasonSchema.parse(input.reason);
    const { error } = await this.client.rpc("admin_update_subscription_with_reason", {
      p_target_account_id: accountId,
      p_plan_id: input.planId,
      p_status: input.status,
      p_starts_at: input.startsAt,
      p_expires_at: input.expiresAt as string,
      p_grace_period_ends_at: input.gracePeriodEndsAt as string,
      p_custom_limits: input.customLimits,
      p_reason: reason,
    });
    if (error) throw mapAdminError(error);
  }

  async setAccountStatus(accountId: string, status: "active" | "suspended", rawReason: string) {
    const { error } = await this.client.rpc("admin_set_account_status", {
      p_target_account_id: accountId,
      p_status: status,
      p_reason: adminReasonSchema.parse(rawReason),
    });
    if (error) throw mapAdminError(error);
  }

  async setItemSuspended(accountId: string, itemId: string, suspended: boolean, rawReason: string) {
    const { error } = await this.client.rpc("admin_set_ar_item_suspended", {
      p_target_account_id: accountId,
      p_ar_item_id: itemId,
      p_suspended: suspended,
      p_reason: adminReasonSchema.parse(rawReason),
    });
    if (error) throw mapAdminError(error);
  }

  async retryProcessingJob(accountId: string, jobId: number, rawReason: string) {
    const { error } = await this.client.rpc("admin_retry_processing_job", {
      p_target_account_id: accountId,
      p_job_id: jobId,
      p_reason: adminReasonSchema.parse(rawReason),
    });
    if (error) throw mapAdminError(error);
  }

  async upsertPlan(input: AdminPlanInput) {
    const { error } = await this.client.rpc("admin_upsert_plan", {
      p_plan_id: (input.id ?? null) as string,
      p_code: input.code,
      p_name: input.name,
      p_description: input.description ?? "",
      p_storage_limit_bytes: input.storageLimitBytes as number,
      p_project_limit: input.projectLimit as number,
      p_group_limit: input.groupLimit as number,
      p_ar_item_limit: input.arItemLimit as number,
      p_video_duration_limit_seconds: input.videoDurationLimitSeconds as number,
      p_max_video_size_bytes: input.maxVideoSizeBytes as number,
      p_team_limit: input.teamLimit as number,
      p_is_active: input.isActive,
      p_reason: adminReasonSchema.parse(input.reason),
    });
    if (error) throw mapAdminError(error);
  }

  async updateSetting(key: AdminSetting["key"], value: AdminSetting["value"], rawReason: string) {
    const { error } = await this.client.rpc("admin_update_system_setting", {
      p_key: key,
      p_value: value as Json,
      p_reason: adminReasonSchema.parse(rawReason),
    });
    if (error) throw mapAdminError(error);
  }

  async requestPasswordReset(accountId: string, userId: string, rawReason: string) {
    const { error } = await this.client.functions.invoke("admin-reset-password", {
      body: { accountId, userId, reason: adminReasonSchema.parse(rawReason) },
    });
    if (error) throw await mapEdgeAdminError(error);
  }
}

function parse<T>(schema: { parse(value: unknown): T }, value: unknown, message: string) {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new AdminError("unexpected", message, error);
  }
}

function mapAdminError(error: { code?: string; message?: string }) {
  if (error.code === "42501" && error.message?.includes("MFA")) {
    return new AdminError("mfa_required", "Подтвердите вход вторым фактором", error);
  }
  if (error.code === "42501") return new AdminError("forbidden", "Нет доступа к admin-панели", error);
  if (error.code === "22023" || error.code === "23514" || error.code === "23505") {
    return new AdminError("invalid", "Проверьте введённые данные и причину операции", error);
  }
  if (error.code === "23503") return new AdminError("not_found", "Объект не найден или уже изменён", error);
  return new AdminError("unexpected", error.message ?? "Admin-операция не выполнена", error);
}

async function mapEdgeAdminError(error: { code?: string; message?: string; context?: unknown }) {
  if (error.context instanceof Response) {
    try {
      const payload = (await error.context.clone().json()) as { code?: string };
      if (payload.code === "mfa_required") return new AdminError("mfa_required", "Подтвердите вход вторым фактором");
      if (payload.code === "forbidden") return new AdminError("forbidden", "Нет доступа к admin-панели");
      if (payload.code === "password_reset_not_configured") {
        return new AdminError("unexpected", "Доставка писем сброса ещё не настроена");
      }
      if (payload.code) return new AdminError("invalid", "Сервис отклонил admin-операцию");
    } catch {
      // Fall through to the safe generic error below.
    }
  }
  return mapAdminError(error);
}

let repository: AdminRepository | undefined;
export function getAdminRepository(): AdminRepository {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  repository = client ? new SupabaseAdminRepository(client) : createDemoAdminRepository();
  return repository;
}

export function setAdminRepositoryForTests(nextRepository?: AdminRepository) {
  repository = nextRepository;
}
