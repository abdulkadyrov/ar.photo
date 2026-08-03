import { beforeEach, describe, expect, it } from "vitest";
import { DemoSettingsRepository, type DemoSettingsState, type DemoSettingsStore } from "./demoSettingsRepository";
import { defaultPermissions } from "./settingsSchemas";

describe("demo settings repository", () => {
  let state: DemoSettingsState | null;
  let repository: DemoSettingsRepository;

  beforeEach(() => {
    state = null;
    const store: DemoSettingsStore = {
      read: () => state,
      write: (next) => {
        state = structuredClone(next);
      },
    };
    repository = new DemoSettingsRepository(store, () => new Date("2026-08-03T10:00:00.000Z"));
  });

  it("creates and revokes an invitation while synchronizing usage", async () => {
    const entitlements = await repository.getEntitlements("20000000-0000-4000-8000-000000000001");
    const result = await repository.inviteMember(entitlements.accountId, {
      email: "new@example.com",
      role: "editor",
      permissions: defaultPermissions("editor"),
    });

    expect(result.delivery).toBe("email");
    expect((await repository.getTeamRoster(entitlements.accountId)).invitations).toHaveLength(2);
    expect((await repository.getEntitlements(entitlements.accountId)).usage.pendingInvitations).toBe(2);

    await repository.revokeInvitation(entitlements.accountId, result.invitation.id);
    expect((await repository.getTeamRoster(entitlements.accountId)).invitations).toHaveLength(1);
  });

  it("applies role permission ceilings and toggles employee access", async () => {
    const accountId = "20000000-0000-4000-8000-000000000001";
    const roster = await repository.getTeamRoster(accountId);
    const editor = roster.members.find((member) => member.role === "editor")!;

    await repository.updateMember(accountId, editor.id, "viewer", defaultPermissions("manager"));
    expect((await repository.getTeamRoster(accountId)).members[1].permissions).toMatchObject({
      upload: false,
      analytics: true,
      manage_team: false,
    });

    await repository.setMemberActive(accountId, editor.id, false);
    expect((await repository.getEntitlements(accountId)).usage.teamMembers).toBe(1);
  });
});
