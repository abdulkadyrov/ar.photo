import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { groupByBucket, secureEqual, type StaleUpload } from "./cleanup.ts";

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ code: "method_not_allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const cleanupSecret = Deno.env.get("UPLOAD_CLEANUP_SECRET");
  if (!supabaseUrl || !serviceRoleKey || !cleanupSecret || cleanupSecret.length < 32) {
    return json({ code: "cleanup_not_configured" }, 503);
  }
  if (!secureEqual(request.headers.get("x-cleanup-secret") ?? "", cleanupSecret)) {
    return json({ code: "unauthorized" }, 401);
  }

  const requestedLimit = Number(new URL(request.url).searchParams.get("limit") ?? "100");
  const limit = Number.isInteger(requestedLimit) ? Math.max(1, Math.min(1000, requestedLimit)) : 100;
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });

  const lease = await client.rpc("expire_stale_uploads", { p_limit: limit });
  if (lease.error) {
    console.error("Failed to lease stale uploads", { code: lease.error.code });
    return json({ code: "cleanup_lease_failed" }, 500);
  }

  const stale = (lease.data ?? []) as StaleUpload[];
  const batches = groupByBucket(stale);
  let cleaned = 0;
  let failed = 0;
  for (const [bucket, sessions] of batches) {
    const removal = await client.storage.from(bucket).remove(sessions.map((session) => session.storage_path));
    const succeeded = !removal.error;
    const acknowledgement = await client.rpc("complete_upload_cleanup", {
      p_session_ids: sessions.map((session) => session.id),
      p_succeeded: succeeded,
    });
    if (acknowledgement.error) {
      console.error("Failed to acknowledge stale upload cleanup", {
        bucket,
        count: sessions.length,
        code: acknowledgement.error.code,
      });
      failed += sessions.length;
      continue;
    }
    if (succeeded) cleaned += sessions.length;
    else {
      console.error("Failed to remove stale Storage objects", { bucket, count: sessions.length });
      failed += sessions.length;
    }
  }

  return json({ leased: stale.length, cleaned, failed }, failed ? 502 : 200);
});

function json(payload: Record<string, unknown>, status: number) {
  return Response.json(payload, {
    status,
    headers: { "cache-control": "no-store" },
  });
}
