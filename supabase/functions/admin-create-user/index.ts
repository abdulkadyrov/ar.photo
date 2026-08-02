import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { z } from "zod";

const createAccountSchema = z
  .object({
    email: z.string().email(),
    fullName: z.string().trim().min(1).max(120),
    temporaryPassword: z.string().min(10).max(128).optional(),
    sendInvite: z.boolean().default(true),
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
  })
  .superRefine((value, context) => {
    if (!value.sendInvite && !value.temporaryPassword) {
      context.addIssue({
        code: "custom",
        path: ["temporaryPassword"],
        message: "A temporary password is required when sendInvite is false",
      });
    }
  });

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

    const callerId = context.userClaims?.sub;
    if (!callerId) return Response.json({ code: "unauthorized" }, { status: 401 });

    const { data: caller } = await context.supabase
      .from("profiles")
      .select("role,is_active")
      .eq("id", callerId)
      .maybeSingle();
    if (!caller?.is_active || caller.role !== "superadmin") {
      return Response.json({ code: "forbidden" }, { status: 403 });
    }

    const input = payload.data;
    const authResult = input.sendInvite
      ? await context.supabaseAdmin.auth.admin.inviteUserByEmail(input.email, {
          data: { full_name: input.fullName },
        })
      : await context.supabaseAdmin.auth.admin.createUser({
          email: input.email,
          password: input.temporaryPassword!,
          email_confirm: true,
          user_metadata: { full_name: input.fullName, must_change_password: true },
        });

    if (authResult.error || !authResult.data.user) {
      return Response.json({ code: "auth_user_creation_failed" }, { status: 422 });
    }

    const createdUserId = authResult.data.user.id;
    const startsAt = input.startsAt ?? new Date().toISOString();
    const { data: account, error: accountError } = await context.supabase.rpc("admin_create_account", {
      p_owner_user_id: createdUserId,
      p_account_name: input.accountName,
      p_account_slug: input.accountSlug,
      p_subscription_plan_id: input.planId,
      p_subscription_status: input.subscriptionStatus,
      p_subscription_starts_at: startsAt,
      p_subscription_expires_at: input.expiresAt ?? null,
      p_subscription_grace_ends_at: input.gracePeriodEndsAt ?? null,
      p_custom_limits: input.customLimits,
    });

    if (accountError || !account) {
      const cleanup = await context.supabaseAdmin.auth.admin.deleteUser(createdUserId);
      if (cleanup.error) console.error("Failed to compensate Auth user creation", { userId: createdUserId });
      return Response.json({ code: "account_creation_failed" }, { status: 422 });
    }

    return Response.json(
      {
        account,
        user: { id: createdUserId, email: authResult.data.user.email },
        delivery: input.sendInvite ? "invite" : "temporary_password",
      },
      { status: 201 },
    );
  }),
};
