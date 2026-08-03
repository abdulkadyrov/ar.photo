import { z } from "zod";

export const permissionKeys = [
  "upload",
  "edit",
  "publish",
  "delete",
  "analytics",
  "manage_groups",
  "manage_team",
] as const;

export const memberRoleSchema = z.enum(["owner", "manager", "editor", "viewer"]);
export const assignableMemberRoleSchema = z.enum(["manager", "editor", "viewer"]);
export const subscriptionStatusSchema = z.enum([
  "trial",
  "active",
  "grace_period",
  "expired",
  "suspended",
  "cancelled",
]);

export const permissionsSchema = z
  .object({
    upload: z.boolean(),
    edit: z.boolean(),
    publish: z.boolean(),
    delete: z.boolean(),
    analytics: z.boolean(),
    manage_groups: z.boolean(),
    manage_team: z.boolean(),
  })
  .strict();

const nullableLimit = z.number().int().nonnegative().nullable();

export const accountEntitlementsSchema = z
  .object({
    accountId: z.string().uuid(),
    accountName: z.string().min(1),
    accountStatus: z.enum(["active", "suspended", "closed"]),
    memberRole: z.union([memberRoleSchema, z.literal("superadmin")]),
    permissions: permissionsSchema,
    canWrite: z.boolean(),
    plan: z
      .object({
        id: z.string().uuid(),
        code: z.string().min(1),
        name: z.string().min(1),
        description: z.string().nullable(),
      })
      .strict(),
    subscription: z
      .object({
        status: subscriptionStatusSchema,
        startsAt: z.string().datetime(),
        expiresAt: z.string().datetime().nullable(),
        gracePeriodEndsAt: z.string().datetime().nullable(),
      })
      .strict(),
    limits: z
      .object({
        storageBytes: nullableLimit,
        projects: nullableLimit,
        groups: nullableLimit,
        arItems: nullableLimit,
        videoDurationSeconds: nullableLimit,
        maxVideoBytes: nullableLimit,
        teamMembers: nullableLimit,
      })
      .strict(),
    usage: z
      .object({
        storageBytes: z.number().int().nonnegative(),
        projects: z.number().int().nonnegative(),
        groups: z.number().int().nonnegative(),
        arItems: z.number().int().nonnegative(),
        teamMembers: z.number().int().nonnegative(),
        pendingInvitations: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();

export const teamMemberSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    fullName: z.string().nullable(),
    email: z.string().email().nullable(),
    role: memberRoleSchema,
    permissions: permissionsSchema,
    isActive: z.boolean(),
    acceptedAt: z.string().datetime().nullable(),
  })
  .strict();

export const teamInvitationSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: assignableMemberRoleSchema,
    permissions: permissionsSchema,
    expiresAt: z.string().datetime(),
    createdAt: z.string().datetime(),
  })
  .strict();

export const teamRosterSchema = z
  .object({
    members: z.array(teamMemberSchema),
    invitations: z.array(teamInvitationSchema),
  })
  .strict();

export const pendingTeamInvitationSchema = z
  .object({
    id: z.string().uuid(),
    accountId: z.string().uuid(),
    accountName: z.string().min(1),
    role: assignableMemberRoleSchema,
    expiresAt: z.string().datetime(),
  })
  .strict();

export const pendingTeamInvitationsSchema = z.array(pendingTeamInvitationSchema);

export const inviteTeamMemberSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Введите корректный email").max(320),
    role: assignableMemberRoleSchema,
    permissions: permissionsSchema,
  })
  .strict();

export const inviteDeliverySchema = z
  .object({
    invitation: z
      .object({ id: z.string().uuid(), role: assignableMemberRoleSchema, expiresAt: z.string().datetime() })
      .strict(),
    delivery: z.enum(["email", "in_app"]),
  })
  .strict();

export type AccountEntitlements = z.infer<typeof accountEntitlementsSchema>;
export type Permissions = z.infer<typeof permissionsSchema>;
export type MemberRole = z.infer<typeof memberRoleSchema>;
export type AssignableMemberRole = z.infer<typeof assignableMemberRoleSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type TeamInvitation = z.infer<typeof teamInvitationSchema>;
export type TeamRoster = z.infer<typeof teamRosterSchema>;
export type PendingTeamInvitation = z.infer<typeof pendingTeamInvitationSchema>;
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;
export type InviteDelivery = z.infer<typeof inviteDeliverySchema>;

export function defaultPermissions(role: MemberRole): Permissions {
  if (role === "owner" || role === "manager") {
    return {
      upload: true,
      edit: true,
      publish: true,
      delete: true,
      analytics: true,
      manage_groups: true,
      manage_team: true,
    };
  }
  if (role === "editor") {
    return {
      upload: true,
      edit: true,
      publish: true,
      delete: false,
      analytics: true,
      manage_groups: true,
      manage_team: false,
    };
  }
  return {
    upload: false,
    edit: false,
    publish: false,
    delete: false,
    analytics: false,
    manage_groups: false,
    manage_team: false,
  };
}

export function permissionCanBeEnabled(role: AssignableMemberRole, permission: (typeof permissionKeys)[number]) {
  if (role === "manager") return true;
  if (role === "editor") return permission !== "manage_team";
  return permission === "analytics";
}

export function normalizePermissions(role: AssignableMemberRole, permissions: Permissions): Permissions {
  return Object.fromEntries(
    permissionKeys.map((permission) => [
      permission,
      permissionCanBeEnabled(role, permission) && permissions[permission],
    ]),
  ) as Permissions;
}
