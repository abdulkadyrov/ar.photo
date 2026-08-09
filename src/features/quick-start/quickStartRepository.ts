import { z } from "zod";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { getCatalogRepository } from "../catalog/catalogRepository";

const quickStartWorkspaceSchema = z.object({
  accountId: z.string().uuid(),
  projectId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export type QuickStartWorkspace = z.infer<typeof quickStartWorkspaceSchema>;

const pendingQuickStartSchema = z.object({
  userId: z.string().min(1),
  accountId: z.string().uuid(),
  projectId: z.string().uuid(),
  groupId: z.string().uuid(),
  itemId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).min(1).max(20).optional(),
  title: z.string().min(2).max(160),
  startedAt: z.number().int().positive().optional(),
});

export type PendingQuickStart = z.infer<typeof pendingQuickStartSchema>;

export function parseQuickStartWorkspace(value: unknown): QuickStartWorkspace {
  return quickStartWorkspaceSchema.parse(value);
}

export function getPendingQuickStart(userId: string): PendingQuickStart | null {
  try {
    const raw = window.localStorage.getItem(pendingQuickStartKey(userId));
    return raw ? pendingQuickStartSchema.parse(JSON.parse(raw)) : null;
  } catch {
    try {
      window.localStorage.removeItem(pendingQuickStartKey(userId));
    } catch {
      // Storage can be unavailable in private/restricted PWA contexts.
    }
    return null;
  }
}

export function savePendingQuickStart(value: PendingQuickStart) {
  try {
    window.localStorage.setItem(
      pendingQuickStartKey(value.userId),
      JSON.stringify(pendingQuickStartSchema.parse(value)),
    );
  } catch {
    // Persistence improves recovery but must never stop server processing.
  }
}

export function clearPendingQuickStart(userId: string) {
  try {
    window.localStorage.removeItem(pendingQuickStartKey(userId));
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

function pendingQuickStartKey(userId: string) {
  return `ar-photo-quick-start-pending-v1:${userId}`;
}

export async function getQuickStartWorkspace(userId: string): Promise<QuickStartWorkspace> {
  const client = getSupabaseBrowserClient();
  if (client) {
    const { data, error } = await client.rpc("bootstrap_quick_start_workspace");
    if (error) throw error;
    return parseQuickStartWorkspace(data);
  }

  const catalog = getCatalogRepository();
  const workspace = await catalog.getWorkspace(userId);
  const options = await catalog.listProjectOptions(workspace.accountId);
  let project = options.find((candidate) => candidate.name === "Быстрые AR-фото");
  if (!project) {
    project = await catalog.createProject(
      workspace.accountId,
      { name: "Быстрые AR-фото", description: "Создано автоматически", category: "other" },
      crypto.randomUUID(),
    );
  }
  let group = (await catalog.listGroups(workspace.accountId, project.id)).find(
    (candidate) => candidate.name === "Без группы",
  );
  if (!group) {
    group = await catalog.createGroup(
      workspace.accountId,
      project.id,
      { name: "Без группы", description: "Создано автоматически" },
      crypto.randomUUID(),
    );
  }
  return { accountId: workspace.accountId, projectId: project.id, groupId: group.id };
}
