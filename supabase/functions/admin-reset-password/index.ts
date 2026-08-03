import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { z } from "zod";

const resetSchema = z
  .object({
    accountId: z.string().uuid(),
    userId: z.string().uuid(),
    reason: z.string().trim().min(10).max(500),
  })
  .strict();

type RpcError = { code?: string };
type UserRpcClient = {
  rpc<T>(name: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: RpcError | null }>;
};
type AdminAccess = { isSuperadmin: boolean; mfaVerified: boolean };

export default {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    if (request.method !== "POST") {
      return Response.json({ code: "method_not_allowed" }, { status: 405 });
    }

    if (!context.userClaims?.id) return Response.json({ code: "unauthorized" }, { status: 401 });
    const userRpc = context.supabase as unknown as UserRpcClient;
    const access = await userRpc.rpc<AdminAccess>("get_admin_access");
    if (access.error || !access.data?.isSuperadmin) return Response.json({ code: "forbidden" }, { status: 403 });
    if (!access.data.mfaVerified) return Response.json({ code: "mfa_required" }, { status: 403 });

    const redirectTo = safeRedirectUrl(Deno.env.get("ADMIN_PASSWORD_RESET_REDIRECT_URL"));
    if (!redirectTo) return Response.json({ code: "password_reset_not_configured" }, { status: 503 });

    const payload = resetSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return Response.json(
        {
          code: "invalid_request",
          issues: payload.error.issues.map((issue) => ({ path: issue.path, code: issue.code })),
        },
        { status: 400 },
      );
    }

    const input = payload.data;
    const authorization = await userRpc.rpc<{ authorized: boolean; userId: string }>("admin_authorize_password_reset", {
      p_target_account_id: input.accountId,
      p_target_user_id: input.userId,
      p_reason: input.reason,
    });
    if (authorization.error || !authorization.data?.authorized) {
      return Response.json(
        { code: authorization.error?.code === "42501" ? "forbidden" : "account_user_not_found" },
        { status: authorization.error?.code === "42501" ? 403 : 404 },
      );
    }

    const authUser = await context.supabaseAdmin.auth.admin.getUserById(input.userId);
    const email = authUser.data.user?.email;
    if (authUser.error || !email) return Response.json({ code: "account_user_not_found" }, { status: 404 });

    const delivery = await context.supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });
    if (delivery.error) return Response.json({ code: "password_reset_delivery_failed" }, { status: 422 });

    return Response.json({ accepted: true, delivery: "email" }, { status: 202 });
  }),
};

function safeRedirectUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    const local = parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
    if (parsed.protocol !== "https:" && !local) return null;
    if (parsed.username || parsed.password || parsed.hash) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
