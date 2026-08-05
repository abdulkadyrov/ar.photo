import { z } from "zod";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";

const quickStartWorkspaceSchema = z.object({
  accountId: z.string().uuid(),
  projectId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export type QuickStartWorkspace = z.infer<typeof quickStartWorkspaceSchema>;

export function parseQuickStartWorkspace(value: unknown): QuickStartWorkspace {
  return quickStartWorkspaceSchema.parse(value);
}

export async function getQuickStartWorkspace(): Promise<QuickStartWorkspace> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Backend AR Photo не настроен");
  const { data, error } = await client.rpc("bootstrap_quick_start_workspace");
  if (error) throw error;
  return parseQuickStartWorkspace(data);
}
