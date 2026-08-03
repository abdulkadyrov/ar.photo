import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { batchLimit, retentionDays, secureEqual } from "./cleanup.ts";

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ code: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const cleanupSecret = Deno.env.get("ANALYTICS_CLEANUP_SECRET");
  if (!supabaseUrl || !serviceRoleKey || !cleanupSecret || cleanupSecret.length < 32) {
    return json({ code: "cleanup_not_configured" }, 503);
  }
  if (!secureEqual(request.headers.get("x-cleanup-secret") ?? "", cleanupSecret)) {
    return json({ code: "unauthorized" }, 401);
  }

  const days = retentionDays(Deno.env.get("ANALYTICS_RETENTION_DAYS"));
  const limit = batchLimit(new URL(request.url).searchParams.get("limit"));
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  const deletion = await client.rpc("purge_analytics_before", {
    p_cutoff: cutoff,
    p_batch_limit: limit,
  });
  if (deletion.error) {
    console.error("Analytics retention cleanup failed", { code: deletion.error.code });
    return json({ code: "cleanup_failed" }, 500);
  }

  return json({ deleted: Number(deletion.data ?? 0), retentionDays: days }, 200);
});

function json(payload: Record<string, unknown>, status: number) {
  return Response.json(payload, {
    status,
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}
