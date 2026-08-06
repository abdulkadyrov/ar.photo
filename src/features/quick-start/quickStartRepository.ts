import { z } from "zod";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { getCatalogRepository } from "../catalog/catalogRepository";

const quickStartWorkspaceSchema = z.object({
  accountId: z.string().uuid(),
  projectId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export type QuickStartWorkspace = z.infer<typeof quickStartWorkspaceSchema>;

export function parseQuickStartWorkspace(value: unknown): QuickStartWorkspace {
  return quickStartWorkspaceSchema.parse(value);
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
