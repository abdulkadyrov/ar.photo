import type { SettingsRepository } from "./settingsRepository";
import {
  accountEntitlementsSchema,
  defaultPermissions,
  inviteTeamMemberSchema,
  normalizePermissions,
  type AccountEntitlements,
  type AssignableMemberRole,
  type InviteTeamMemberInput,
  type PendingTeamInvitation,
  type Permissions,
  type TeamRoster,
} from "./settingsSchemas";
import { SettingsError } from "./settingsRepository";

const demoSettingsKey = "ar-photo-demo-settings-v1";
const demoAccountId = "20000000-0000-4000-8000-000000000001";

export type DemoSettingsState = {
  entitlements: AccountEntitlements;
  roster: TeamRoster;
  pendingInvitations: PendingTeamInvitation[];
};

export interface DemoSettingsStore {
  read(): DemoSettingsState | null;
  write(state: DemoSettingsState): void;
}

export function createDemoSettingsRepository(
  store: DemoSettingsStore = browserStore(),
  now: () => Date = () => new Date(),
): SettingsRepository {
  return new DemoSettingsRepository(store, now);
}

export class DemoSettingsRepository implements SettingsRepository {
  constructor(
    private readonly store: DemoSettingsStore,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async getEntitlements(accountId: string) {
    const state = this.state();
    this.assertAccount(state, accountId);
    return structuredClone(state.entitlements);
  }

  async getTeamRoster(accountId: string) {
    const state = this.state();
    this.assertAccount(state, accountId);
    return structuredClone(state.roster);
  }

  async getPendingInvitations() {
    return structuredClone(this.state().pendingInvitations);
  }

  async inviteMember(accountId: string, rawInput: InviteTeamMemberInput) {
    const state = this.state();
    this.assertAccount(state, accountId);
    const input = inviteTeamMemberSchema.parse(rawInput);
    const occupied = state.roster.members.filter((member) => member.isActive).length + state.roster.invitations.length;
    const limit = state.entitlements.limits.teamMembers;
    if (limit !== null && occupied >= limit) {
      throw new SettingsError("team_limit_reached", "Лимит сотрудников по тарифу исчерпан");
    }
    if (state.roster.members.some((member) => member.email?.toLowerCase() === input.email)) {
      throw new SettingsError("already_member", "Пользователь уже состоит в команде");
    }

    const expiresAt = new Date(this.now().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const invitation = {
      id: crypto.randomUUID(),
      email: input.email,
      role: input.role,
      permissions: normalizePermissions(input.role, input.permissions),
      expiresAt,
      createdAt: this.now().toISOString(),
    };
    const existingIndex = state.roster.invitations.findIndex((item) => item.email === input.email);
    if (existingIndex >= 0) state.roster.invitations[existingIndex] = invitation;
    else state.roster.invitations.unshift(invitation);
    this.syncUsage(state);
    this.store.write(state);
    return { invitation: { id: invitation.id, role: invitation.role, expiresAt }, delivery: "email" as const };
  }

  async revokeInvitation(accountId: string, invitationId: string) {
    const state = this.state();
    this.assertAccount(state, accountId);
    const previousLength = state.roster.invitations.length;
    state.roster.invitations = state.roster.invitations.filter((invitation) => invitation.id !== invitationId);
    if (state.roster.invitations.length === previousLength)
      throw new SettingsError("not_found", "Приглашение не найдено");
    this.syncUsage(state);
    this.store.write(state);
  }

  async acceptInvitation(invitationId: string) {
    const state = this.state();
    const invitation = state.pendingInvitations.find((item) => item.id === invitationId);
    if (!invitation) throw new SettingsError("not_found", "Приглашение не найдено");
    state.pendingInvitations = state.pendingInvitations.filter((item) => item.id !== invitationId);
    this.store.write(state);
  }

  async updateMember(accountId: string, memberId: string, role: AssignableMemberRole, permissions: Permissions) {
    const state = this.state();
    this.assertAccount(state, accountId);
    const member = state.roster.members.find((item) => item.id === memberId);
    if (!member) throw new SettingsError("not_found", "Сотрудник не найден");
    if (member.role === "owner") throw new SettingsError("forbidden", "Владельца нельзя изменить");
    member.role = role;
    member.permissions = normalizePermissions(role, permissions);
    this.store.write(state);
  }

  async setMemberActive(accountId: string, memberId: string, isActive: boolean) {
    const state = this.state();
    this.assertAccount(state, accountId);
    const member = state.roster.members.find((item) => item.id === memberId);
    if (!member) throw new SettingsError("not_found", "Сотрудник не найден");
    if (member.role === "owner") throw new SettingsError("forbidden", "Владельца нельзя отключить");
    if (isActive && !member.isActive) {
      const activeCount = state.roster.members.filter((item) => item.isActive).length;
      const limit = state.entitlements.limits.teamMembers;
      if (limit !== null && activeCount >= limit) {
        throw new SettingsError("team_limit_reached", "Лимит сотрудников по тарифу исчерпан");
      }
    }
    member.isActive = isActive;
    this.syncUsage(state);
    this.store.write(state);
  }

  private state() {
    const existing = this.store.read();
    if (existing) return existing;
    const created = createSeed();
    this.store.write(created);
    return created;
  }

  private assertAccount(state: DemoSettingsState, accountId: string) {
    if (state.entitlements.accountId !== accountId) throw new SettingsError("forbidden", "Аккаунт недоступен");
  }

  private syncUsage(state: DemoSettingsState) {
    state.entitlements.usage.teamMembers = state.roster.members.filter((member) => member.isActive).length;
    state.entitlements.usage.pendingInvitations = state.roster.invitations.length;
  }
}

function browserStore(): DemoSettingsStore {
  return {
    read() {
      const raw = window.localStorage.getItem(demoSettingsKey);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as DemoSettingsState;
        accountEntitlementsSchema.parse(parsed.entitlements);
        return parsed;
      } catch {
        window.localStorage.removeItem(demoSettingsKey);
        return null;
      }
    },
    write(state) {
      window.localStorage.setItem(demoSettingsKey, JSON.stringify(state));
    },
  };
}

function createSeed(): DemoSettingsState {
  const entitlements = accountEntitlementsSchema.parse({
    accountId: demoAccountId,
    accountName: "Vakha Studio",
    accountStatus: "active",
    memberRole: "owner",
    permissions: defaultPermissions("owner"),
    canWrite: true,
    plan: {
      id: "88000000-0000-4000-8000-000000000008",
      code: "studio",
      name: "Студия",
      description: "Для фотостудий и больших выпускных проектов",
    },
    subscription: {
      status: "active",
      startsAt: "2026-08-03T00:00:00.000Z",
      expiresAt: "2027-08-03T00:00:00.000Z",
      gracePeriodEndsAt: "2027-08-10T00:00:00.000Z",
    },
    limits: {
      storageBytes: 50 * 1024 ** 3,
      projects: 120,
      groups: 1_000,
      arItems: 10_000,
      videoDurationSeconds: 180,
      maxVideoBytes: 500 * 1024 ** 2,
      teamMembers: 10,
    },
    usage: {
      storageBytes: Math.round(8.4 * 1024 ** 3),
      projects: 12,
      groups: 48,
      arItems: 256,
      teamMembers: 2,
      pendingInvitations: 1,
    },
  });

  return {
    entitlements,
    roster: {
      members: [
        {
          id: "88000000-0000-4000-8000-000000000101",
          userId: "88000000-0000-4000-8000-000000000201",
          fullName: "Иван Иванов",
          email: "ivan@example.com",
          role: "owner",
          permissions: defaultPermissions("owner"),
          isActive: true,
          acceptedAt: "2026-08-03T00:00:00.000Z",
        },
        {
          id: "88000000-0000-4000-8000-000000000102",
          userId: "88000000-0000-4000-8000-000000000202",
          fullName: "Алина Магомедова",
          email: "alina@example.com",
          role: "editor",
          permissions: defaultPermissions("editor"),
          isActive: true,
          acceptedAt: "2026-08-10T00:00:00.000Z",
        },
      ],
      invitations: [
        {
          id: "88000000-0000-4000-8000-000000000103",
          email: "operator@example.com",
          role: "viewer",
          permissions: defaultPermissions("viewer"),
          expiresAt: "2027-08-10T00:00:00.000Z",
          createdAt: "2026-08-03T00:00:00.000Z",
        },
      ],
    },
    pendingInvitations: [],
  };
}
