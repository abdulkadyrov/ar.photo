import { z } from "zod";

const uuid = z.string().uuid();
const count = z.number().int().nonnegative();
const bytes = z.number().int().nonnegative();
const timestamp = z.string().datetime({ offset: true });
const optionalTimestamp = timestamp.nullable();
const accountStatus = z.enum(["active", "suspended", "closed"]);
const subscriptionStatus = z.enum(["trial", "active", "grace_period", "expired", "suspended", "cancelled"]);
const arItemStatus = z.enum(["draft", "processing", "ready", "published", "failed", "suspended", "archived"]);

export const adminAccessSchema = z.object({ isSuperadmin: z.boolean(), mfaVerified: z.boolean() }).strict();

export const adminOverviewSchema = z
  .object({
    accounts: z.object({ total: count, active: count, suspended: count }).strict(),
    users: z.object({ total: count, active: count }).strict(),
    subscriptions: z.object({ active: count, attention: count }).strict(),
    storageBytes: bytes,
    arItems: count,
    publishedItems: count,
    failedJobs: count,
  })
  .strict();

export const adminAccountListSchema = z
  .object({
    total: count,
    items: z.array(
      z
        .object({
          id: uuid,
          name: z.string().min(1).max(120),
          slug: z.string().min(3).max(63),
          status: accountStatus,
          ownerName: z.string().min(1).max(120).nullable(),
          planCode: z.string().min(2).max(32).nullable(),
          planName: z.string().min(1).max(80).nullable(),
          subscriptionStatus: subscriptionStatus.nullable(),
          subscriptionExpiresAt: optionalTimestamp,
          storageUsedBytes: bytes,
          arItemCount: count,
          failedJobCount: count,
          createdAt: timestamp,
        })
        .strict(),
    ),
  })
  .strict();

export const adminAccountDetailSchema = z
  .object({
    account: z
      .object({
        id: uuid,
        name: z.string().min(1).max(120),
        slug: z.string().min(3).max(63),
        status: accountStatus,
        timezone: z.string().min(1).max(64),
        storageUsedBytes: bytes,
        createdAt: timestamp,
      })
      .strict(),
    subscription: z
      .object({
        id: uuid,
        planId: uuid,
        planCode: z.string().min(2).max(32),
        planName: z.string().min(1).max(80),
        status: subscriptionStatus,
        startsAt: timestamp,
        expiresAt: optionalTimestamp,
        gracePeriodEndsAt: optionalTimestamp,
        customLimits: z.record(z.string(), z.number().int().nonnegative()),
      })
      .strict(),
    users: z.array(
      z
        .object({
          id: uuid,
          fullName: z.string().min(1).max(120).nullable(),
          emailDisplay: z.string().email().nullable(),
          role: z.enum(["owner", "manager", "editor", "viewer"]),
          isActive: z.boolean(),
          acceptedAt: optionalTimestamp,
          lastLoginAt: optionalTimestamp,
        })
        .strict(),
    ),
    usage: z
      .object({
        projects: count,
        groups: count,
        arItems: count,
        publishedItems: count,
        storageBytes: bytes,
        failedJobs: count,
      })
      .strict(),
  })
  .strict();

export const adminPlanSchema = z
  .object({
    id: uuid,
    code: z.string().min(2).max(32),
    name: z.string().min(1).max(80),
    description: z.string().max(2000).nullable(),
    storageLimitBytes: bytes.nullable(),
    projectLimit: count.nullable(),
    groupLimit: count.nullable(),
    arItemLimit: count.nullable(),
    videoDurationLimitSeconds: z.number().int().positive().nullable(),
    maxVideoSizeBytes: z.number().int().positive().nullable(),
    teamLimit: z.number().int().positive().nullable(),
    isActive: z.boolean(),
    updatedAt: timestamp,
  })
  .strict();

export const adminProcessingErrorListSchema = z
  .object({
    total: count,
    items: z.array(
      z
        .object({
          id: z.number().int().positive(),
          accountId: uuid,
          accountName: z.string().min(1).max(120),
          arItemId: uuid,
          arItemTitle: z.string().min(1).max(160),
          type: z.string().min(1).max(64),
          errorCode: z.string().min(1).max(80),
          errorMessage: z.string().min(1).max(500),
          attemptCount: count,
          maxAttempts: z.number().int().positive(),
          updatedAt: timestamp,
        })
        .strict(),
    ),
  })
  .strict();

export const adminContentResultSchema = z
  .object({
    accountId: uuid,
    accountName: z.string().min(1).max(120),
    projectId: uuid,
    projectName: z.string().min(1).max(160),
    groupId: uuid,
    groupName: z.string().min(1).max(160),
    arItemId: uuid,
    arItemTitle: z.string().min(1).max(160),
    arItemStatus,
  })
  .strict();

export const adminAuditListSchema = z
  .object({
    total: count,
    items: z.array(
      z
        .object({
          id: z.number().int().positive(),
          accountId: uuid.nullable(),
          actorUserId: uuid,
          actorName: z.string().min(1).max(120).nullable(),
          action: z.string().min(3).max(100),
          entityType: z.string().min(1).max(80),
          entityId: z.string().max(160).nullable(),
          reason: z.string().min(10).max(500),
          metadataSafe: z.record(z.string(), z.unknown()),
          createdAt: timestamp,
        })
        .strict(),
    ),
  })
  .strict();

export const adminSettingSchema = z
  .object({
    key: z.enum([
      "maintenance_mode",
      "registration_enabled",
      "public_ar_enabled",
      "analytics_retention_days",
      "support_banner",
    ]),
    value: z.union([z.boolean(), z.number().int(), z.string()]),
    description: z.string().min(3).max(200),
    updatedAt: timestamp,
  })
  .strict();

export const adminReasonSchema = z.string().trim().min(10).max(500);
export const createAdminAccountSchema = z
  .object({
    email: z.string().trim().email(),
    fullName: z.string().trim().min(1).max(120),
    accountName: z.string().trim().min(1).max(120),
    accountSlug: z.string().regex(/^[a-z0-9][a-z0-9-]{2,62}$/),
    planId: uuid,
    reason: adminReasonSchema,
  })
  .strict();

export type AdminAccess = z.infer<typeof adminAccessSchema>;
export type AdminOverview = z.infer<typeof adminOverviewSchema>;
export type AdminAccountList = z.infer<typeof adminAccountListSchema>;
export type AdminAccount = AdminAccountList["items"][number];
export type AdminAccountDetail = z.infer<typeof adminAccountDetailSchema>;
export type AdminPlan = z.infer<typeof adminPlanSchema>;
export type AdminProcessingErrorList = z.infer<typeof adminProcessingErrorListSchema>;
export type AdminContentResult = z.infer<typeof adminContentResultSchema>;
export type AdminAuditList = z.infer<typeof adminAuditListSchema>;
export type AdminSetting = z.infer<typeof adminSettingSchema>;
export type CreateAdminAccountInput = z.infer<typeof createAdminAccountSchema>;
export type SubscriptionAdminInput = {
  planId: string;
  status: z.infer<typeof subscriptionStatus>;
  startsAt: string;
  expiresAt: string | null;
  gracePeriodEndsAt: string | null;
  customLimits: Record<string, number>;
  reason: string;
};
export type AdminPlanInput = Omit<AdminPlan, "id" | "updatedAt"> & { id?: string; reason: string };

export type AdminErrorCode = "forbidden" | "mfa_required" | "invalid" | "not_found" | "unexpected";
export class AdminError extends Error {
  constructor(
    readonly code: AdminErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AdminError";
  }
}
