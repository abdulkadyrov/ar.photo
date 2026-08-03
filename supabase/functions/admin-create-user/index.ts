import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { z } from "zod";

type RpcError = { code?: string };
type UserRpcClient = {
  rpc<T>(name: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: RpcError | null }>;
};
type AdminAccess = { isSuperadmin: boolean; mfaVerified: boolean };

const createAccountSchema = z
  .object({
    email: z.string().email(),
    fullName: z.string().trim().min(1).max(120),
    accountName: z.string().trim().min(1).max(120),
    accountSlug: z.string().regex(/^[a-z0-9][a-z0-9-]{2,62}$/),
    planId: z.string().uuid(),
    subscriptionStatus: z
      .enum(["trial", "active", "grace_period", "expired", "suspended", "cancelled"])
      .default("trial"),
    startsAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    gracePeriodEndsAt: z.string().datetime().nullable().optional(),
    customLimits: z.record(z.string(), z.number().int().nonnegative()).default({}),
    reason: z.string().trim().min(10).max(500),
  })
  .strict();

export default {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    if (request.method !== "POST") {
      return Response.json({ code: "method_not_allowed" }, { status: 405 });
    }

    const payload = createAccountSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return Response.json(
        {
          code: "invalid_request",
          issues: payload.error.issues.map((issue) => ({ path: issue.path, code: issue.code })),
        },
        { status: 400 },
      );
    }

    const callerId = context.userClaims?.id;
    if (!callerId) return Response.json({ code: "unauthorized" }, { status: 401 });
    const userRpc = context.supabase as unknown as UserRpcClient;
    const access = await userRpc.rpc<AdminAccess>("get_admin_access");
    if (access.error || !access.data?.isSuperadmin) return Response.json({ code: "forbidden" }, { status: 403 });
    if (!access.data.mfaVerified) return Response.json({ code: "mfa_required" }, { status: 403 });

    const input = payload.data;
    const authResult = await context.supabaseAdmin.auth.admin.inviteUserByEmail(input.email, {
      data: { full_name: input.fullName },
    });

    if (authResult.error || !authResult.data.user) {
      return Response.json({ code: "auth_user_creation_failed" }, { status: 422 });
    }

    const createdUserId = authResult.data.user.id;
    const startsAt = input.startsAt ?? new Date().toISOString();
    const { data: account, error: accountError } = await userRpc.rpc<Record<string, unknown>>(
      "admin_create_account_with_reason",
      {
        p_owner_user_id: createdUserId,
        p_account_name: input.accountName,
        p_account_slug: input.accountSlug,
        p_subscription_plan_id: input.planId,
        p_subscription_status: input.subscriptionStatus,
        p_subscription_starts_at: startsAt,
        p_subscription_expires_at: input.expiresAt ?? null,
        p_subscription_grace_ends_at: input.gracePeriodEndsAt ?? null,
        p_custom_limits: input.customLimits,
        p_reason: input.reason,
      },
    );

    if (accountError || !account) {
      const cleanup = await context.supabaseAdmin.auth.admin.deleteUser(createdUserId);
      if (cleanup.error) console.error("Failed to compensate Auth user creation", { userId: createdUserId });
      return Response.json({ code: "account_creation_failed" }, { status: 422 });
    }

    return Response.json(
      {
        account,
        user: { id: createdUserId, email: authResult.data.user.email },
        delivery: "invite",
      },
      { status: 201 },
    );
  }),
};
