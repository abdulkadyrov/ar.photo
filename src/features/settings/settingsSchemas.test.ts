import { describe, expect, it } from "vitest";
import {
  accountEntitlementsSchema,
  defaultPermissions,
  normalizePermissions,
  pendingTeamInvitationsSchema,
} from "./settingsSchemas";

describe("settings schemas", () => {
  it("parses the strict entitlement contract", () => {
    const entitlements = accountEntitlementsSchema.parse({
      accountId: "88000000-0000-4000-8000-000000000001",
      accountName: "Vakha Studio",
      accountStatus: "active",
      memberRole: "owner",
      permissions: defaultPermissions("owner"),
      canWrite: true,
      plan: {
        id: "88000000-0000-4000-8000-000000000002",
        code: "studio",
        name: "Студия",
        description: null,
      },
      subscription: {
        status: "active",
        startsAt: "2026-08-03T00:00:00.000000+00:00",
        expiresAt: "2027-08-03T03:00:00.000000+03:00",
        gracePeriodEndsAt: "2027-08-10T00:00:00.000000+00:00",
      },
      limits: {
        storageBytes: 10_000,
        projects: 50,
        groups: 500,
        arItems: 5_000,
        videoDurationSeconds: 120,
        maxVideoBytes: 500_000,
        teamMembers: 10,
      },
      usage: { storageBytes: 100, projects: 2, groups: 4, arItems: 8, teamMembers: 2, pendingInvitations: 1 },
    });

    expect(entitlements.permissions.manage_team).toBe(true);
    expect(entitlements.limits.projects).toBe(50);
  });

  it("enforces permission ceilings when a role changes", () => {
    expect(normalizePermissions("viewer", defaultPermissions("manager"))).toEqual({
      upload: false,
      edit: false,
      publish: false,
      delete: false,
      analytics: true,
      manage_groups: false,
      manage_team: false,
    });
    expect(normalizePermissions("editor", defaultPermissions("manager")).manage_team).toBe(false);
  });

  it("rejects malformed pending invitations", () => {
    expect(() => pendingTeamInvitationsSchema.parse([{ id: "not-a-uuid" }])).toThrow();
  });
});
