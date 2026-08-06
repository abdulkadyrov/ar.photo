import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { z } from "zod";

type RpcError = { code?: string };
type UserRpcClient = {
  rpc<T>(name: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: RpcError | null }>;
};
type AdminAccess = { isSuperadmin: boolean; mfaVerified: boolean };

const deleteUserSchema = z
  .object({
    accountId: z.string().uuid(),
    userId: z.string().uuid(),
    confirmation: z.literal("УДАЛИТЬ"),
    reason: z.string().trim().min(10).max(500),
  })
  .strict();

export default {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    if (request.method !== "POST") return Response.json({ code: "method_not_allowed" }, { status: 405 });
    const callerId = context.userClaims?.id;
    if (!callerId) return Response.json({ code: "unauthorized" }, { status: 401 });

    const payload = deleteUserSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return Response.json(
        {
          code: "invalid_request",
          issues: payload.error.issues.map((issue) => ({ path: issue.path, code: issue.code })),
        },
        { status: 400 },
      );
    }
    if (payload.data.userId === callerId) return Response.json({ code: "self_delete_forbidden" }, { status: 422 });

    const userRpc = context.supabase as unknown as UserRpcClient;
    const access = await userRpc.rpc<AdminAccess>("get_admin_access");
    if (access.error || !access.data?.isSuperadmin) return Response.json({ code: "forbidden" }, { status: 403 });
    if (!access.data.mfaVerified) return Response.json({ code: "mfa_required" }, { status: 403 });

    const authorization = await userRpc.rpc<{ authorized: boolean; userId: string }>("admin_authorize_user_deletion", {
      p_target_account_id: payload.data.accountId,
      p_target_user_id: payload.data.userId,
      p_confirmation: payload.data.confirmation,
      p_reason: payload.data.reason,
    });
    if (authorization.error || !authorization.data?.authorized) {
      const forbidden = authorization.error?.code === "42501";
      return Response.json(
        { code: forbidden ? "forbidden" : "user_delete_not_allowed" },
        { status: forbidden ? 403 : 422 },
      );
    }

    const deletion = await context.supabaseAdmin.auth.admin.deleteUser(payload.data.userId, false);
    if (deletion.error) return Response.json({ code: "user_delete_failed" }, { status: 422 });
    return Response.json({ deleted: true, userId: payload.data.userId }, { status: 200 });
  }),
};
