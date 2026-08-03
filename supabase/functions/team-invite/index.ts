import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { z } from "zod";

const permissionSchema = z
  .object({
    upload: z.boolean().optional(),
    edit: z.boolean().optional(),
    publish: z.boolean().optional(),
    delete: z.boolean().optional(),
    analytics: z.boolean().optional(),
    manage_groups: z.boolean().optional(),
    manage_team: z.boolean().optional(),
  })
  .strict();

const invitationSchema = z
  .object({
    accountId: z.string().uuid(),
    email: z.string().trim().email().max(320),
    role: z.enum(["manager", "editor", "viewer"]),
    permissions: permissionSchema.default({}),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .strict();

type RpcError = { code?: string };
type RpcResult<T> = Promise<{ data: T | null; error: RpcError | null }>;
type UserRpcClient = {
  rpc<T>(name: string, args: Record<string, unknown>): RpcResult<T>;
};
type TeamInvitationRow = {
  id: string;
  role: "manager" | "editor" | "viewer";
  expires_at: string;
};

export default {
  fetch: withSupabase({ auth: "user" }, async (request, context) => {
    if (request.method !== "POST") {
      return Response.json({ code: "method_not_allowed" }, { status: 405 });
    }

    const redirectUrl = safeRedirectUrl(Deno.env.get("TEAM_INVITE_REDIRECT_URL"));
    if (!redirectUrl) return Response.json({ code: "team_invite_not_configured" }, { status: 503 });

    const payload = invitationSchema.safeParse(await request.json().catch(() => null));
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
    const userRpc = context.supabase as unknown as UserRpcClient;
    const { data: invitation, error: invitationError } = await userRpc.rpc<TeamInvitationRow>("create_team_invitation", {
      p_target_account_id: input.accountId,
      p_email: input.email,
      p_role: input.role,
      p_permissions: input.permissions,
      p_expires_at: input.expiresAt ?? null,
    });
    if (invitationError || !invitation) {
      return Response.json({ code: mapDatabaseError(invitationError?.code) }, { status: databaseStatus(invitationError?.code) });
    }

    const delivery = await context.supabaseAdmin.auth.admin.inviteUserByEmail(input.email, {
      redirectTo: redirectUrl,
      data: { team_invitation_id: invitation.id },
    });
    if (delivery.error && !isExistingUserError(delivery.error.code)) {
      const compensation = await userRpc.rpc<TeamInvitationRow>("revoke_team_invitation", {
        p_target_account_id: input.accountId,
        p_invitation_id: invitation.id,
      });
      if (compensation.error) {
        console.error("Failed to compensate team invitation", { code: compensation.error.code });
      }
      return Response.json({ code: "invite_delivery_failed" }, { status: 422 });
    }

    return Response.json(
      {
        invitation: {
          id: invitation.id,
          role: invitation.role,
          expiresAt: invitation.expires_at,
        },
        delivery: delivery.error ? "in_app" : "email",
      },
      { status: 201 },
    );
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

function isExistingUserError(code: string | undefined) {
  return code === "email_exists" || code === "user_already_exists";
}

function mapDatabaseError(code: string | undefined) {
  if (code === "42501") return "forbidden";
  if (code === "23514") return "team_limit_reached";
  if (code === "23505") return "already_member";
  if (code === "22023") return "invalid_permissions";
  return "team_invite_failed";
}

function databaseStatus(code: string | undefined) {
  if (code === "42501") return 403;
  if (code === "23514" || code === "23505") return 409;
  if (code === "22023") return 400;
  return 422;
}
