import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import type { Json } from "../../shared/api/database.types";
import { assertDemoRuntimeEnabled } from "../../shared/config/env";
import {
  accountEntitlementsSchema,
  inviteDeliverySchema,
  inviteTeamMemberSchema,
  normalizePermissions,
  pendingTeamInvitationsSchema,
  teamRosterSchema,
  type AccountEntitlements,
  type AssignableMemberRole,
  type InviteDelivery,
  type InviteTeamMemberInput,
  type PendingTeamInvitation,
  type Permissions,
  type TeamRoster,
} from "./settingsSchemas";
import { createDemoSettingsRepository } from "./demoSettingsRepository";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export type SettingsErrorCode =
  | "forbidden"
  | "team_limit_reached"
  | "already_member"
  | "invalid_permissions"
  | "invite_delivery_failed"
  | "not_configured"
  | "not_found"
  | "unexpected";

export class SettingsError extends Error {
  constructor(
    readonly code: SettingsErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SettingsError";
  }
}

export interface SettingsRepository {
  getEntitlements(accountId: string): Promise<AccountEntitlements>;
  getTeamRoster(accountId: string): Promise<TeamRoster>;
  getPendingInvitations(): Promise<PendingTeamInvitation[]>;
  inviteMember(accountId: string, input: InviteTeamMemberInput): Promise<InviteDelivery>;
  revokeInvitation(accountId: string, invitationId: string): Promise<void>;
  acceptInvitation(invitationId: string): Promise<void>;
  updateMember(
    accountId: string,
    memberId: string,
    role: AssignableMemberRole,
    permissions: Permissions,
  ): Promise<void>;
  setMemberActive(accountId: string, memberId: string, isActive: boolean): Promise<void>;
}

export class SupabaseSettingsRepository implements SettingsRepository {
  constructor(private readonly client: SupabaseBrowserClient) {}

  async getEntitlements(accountId: string) {
    const { data, error } = await this.client.rpc("get_account_entitlements", { p_target_account_id: accountId });
    if (error) throw mapSettingsError(error);
    return parseContract(accountEntitlementsSchema, data, "Некорректный ответ сервера о подписке");
  }

  async getTeamRoster(accountId: string) {
    const { data, error } = await this.client.rpc("get_team_roster", { p_target_account_id: accountId });
    if (error) throw mapSettingsError(error);
    return parseContract(teamRosterSchema, data, "Некорректный ответ сервера о команде");
  }

  async getPendingInvitations() {
    const { data, error } = await this.client.rpc("get_my_pending_team_invitations");
    if (error) throw mapSettingsError(error);
    return parseContract(pendingTeamInvitationsSchema, data, "Некорректный ответ сервера о приглашениях");
  }

  async inviteMember(accountId: string, rawInput: InviteTeamMemberInput) {
    const input = inviteTeamMemberSchema.parse(rawInput);
    const { data, error } = await this.client.functions.invoke("team-invite", {
      body: { accountId, ...input },
    });
    if (error) throw await mapEdgeFunctionError(error);
    return parseContract(inviteDeliverySchema, data, "Некорректный ответ сервиса приглашений");
  }

  async revokeInvitation(accountId: string, invitationId: string) {
    const { error } = await this.client.rpc("revoke_team_invitation", {
      p_target_account_id: accountId,
      p_invitation_id: invitationId,
    });
    if (error) throw mapSettingsError(error);
  }

  async acceptInvitation(invitationId: string) {
    const { error } = await this.client.rpc("accept_team_invitation", { p_invitation_id: invitationId });
    if (error) throw mapSettingsError(error);
  }

  async updateMember(accountId: string, memberId: string, role: AssignableMemberRole, permissions: Permissions) {
    const { error } = await this.client.rpc("update_team_member", {
      p_target_account_id: accountId,
      p_member_id: memberId,
      p_role: role,
      p_permissions: normalizePermissions(role, permissions) as Json,
    });
    if (error) throw mapSettingsError(error);
  }

  async setMemberActive(accountId: string, memberId: string, isActive: boolean) {
    const { error } = await this.client.rpc("set_team_member_active", {
      p_target_account_id: accountId,
      p_member_id: memberId,
      p_is_active: isActive,
    });
    if (error) throw mapSettingsError(error);
  }
}

function parseContract<T>(schema: { parse(value: unknown): T }, value: unknown, message: string): T {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new SettingsError("unexpected", message, error);
  }
}

function mapSettingsError(error: { code?: string; message?: string; context?: unknown }) {
  const code = error.code;
  if (code === "42501" || code === "forbidden") {
    return new SettingsError("forbidden", "Недостаточно прав для управления настройками", error);
  }
  if (code === "23514" || code === "team_limit_reached") {
    return new SettingsError("team_limit_reached", "Лимит сотрудников по тарифу исчерпан", error);
  }
  if (code === "23505" || code === "already_member") {
    return new SettingsError("already_member", "Пользователь уже состоит в команде", error);
  }
  if (code === "22023" || code === "invalid_permissions") {
    return new SettingsError("invalid_permissions", "Выбранные права недоступны для этой роли", error);
  }
  if (code === "invite_delivery_failed") {
    return new SettingsError("invite_delivery_failed", "Не удалось доставить приглашение", error);
  }
  if (code === "team_invite_not_configured") {
    return new SettingsError("not_configured", "Сервис приглашений ещё не настроен администратором", error);
  }
  if (code === "23503") return new SettingsError("not_found", "Запись не найдена", error);
  return new SettingsError("unexpected", error.message ?? "Не удалось выполнить операцию", error);
}

async function mapEdgeFunctionError(error: { code?: string; message?: string; context?: unknown }) {
  if (error.context instanceof Response) {
    try {
      const payload = (await error.context.clone().json()) as { code?: string };
      if (payload.code) return mapSettingsError({ ...error, code: payload.code, context: undefined });
    } catch {
      // The generic mapper below keeps the original safe message.
    }
  }
  return mapSettingsError(error);
}

let repository: SettingsRepository | undefined;

export function getSettingsRepository(): SettingsRepository {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  if (client) repository = new SupabaseSettingsRepository(client);
  else {
    assertDemoRuntimeEnabled();
    repository = createDemoSettingsRepository();
  }
  return repository;
}

export function setSettingsRepositoryForTests(nextRepository?: SettingsRepository) {
  repository = nextRepository;
}
