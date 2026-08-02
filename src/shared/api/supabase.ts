import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicRuntimeConfig } from "../config/env";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | null | undefined;

export function getSupabaseBrowserClient() {
  if (browserClient !== undefined) return browserClient;

  const config = getPublicRuntimeConfig();
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient<Database>(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}
