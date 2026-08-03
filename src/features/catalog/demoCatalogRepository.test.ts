import { beforeEach, describe, expect, it } from "vitest";
import type { DemoCatalogStore } from "./demoCatalogRepository";
import { createDemoCatalogRepository } from "./demoCatalogRepository";

describe("demo catalog repository", () => {
  let value: ReturnType<DemoCatalogStore["read"]>;
  let store: DemoCatalogStore;

  beforeEach(() => {
    value = null;
    store = {
      read: () => value,
      write: (state) => {
        value = structuredClone(state);
      },
    };
  });

  it("keeps project creation idempotent", async () => {
    const repository = createDemoCatalogRepository(store);
    const workspace = await repository.getWorkspace("demo-user");
    const input = { name: "Выпускной 2027", description: "Школа №25", category: "graduation" as const };

    const first = await repository.createProject(workspace.accountId, input, "request-1");
    const repeated = await repository.createProject(workspace.accountId, input, "request-1");
    const page = await repository.listProjects(workspace.accountId, {
      search: "",
      filter: "all",
      sort: "updated_desc",
      page: 1,
      pageSize: 12,
    });

    expect(repeated.id).toBe(first.id);
    expect(page.total).toBe(1);
  });

  it("filters, archives, soft-deletes and restores projects", async () => {
    const repository = createDemoCatalogRepository(store);
    const workspace = await repository.getWorkspace("demo-user");
    const project = await repository.createProject(
      workspace.accountId,
      { name: "Свадьба Анны", description: "", category: "wedding" },
      "request-2",
    );

    await repository.archiveProject(workspace.accountId, project.id);
    const archived = await repository.listProjects(workspace.accountId, {
      search: "анны",
      filter: "archived",
      sort: "name_asc",
      page: 1,
      pageSize: 12,
    });
    expect(archived.items).toHaveLength(1);

    await repository.softDeleteProject(workspace.accountId, project.id);
    const deleted = await repository.listProjects(workspace.accountId, {
      search: "",
      filter: "deleted",
      sort: "updated_desc",
      page: 1,
      pageSize: 12,
    });
    expect(deleted.items).toHaveLength(1);

    await repository.restoreDeletedProject(workspace.accountId, project.id);
    await repository.restoreProject(workspace.accountId, project.id);
    expect((await repository.getProject(workspace.accountId, project.id)).status).toBe("active");
  });

  it("keeps group creation idempotent and excludes deleted groups", async () => {
    const repository = createDemoCatalogRepository(store);
    const workspace = await repository.getWorkspace("demo-user");
    const project = await repository.createProject(
      workspace.accountId,
      { name: "Проект", description: "", category: "other" },
      "request-project",
    );
    const input = { name: "11А", description: "Класс" };
    const first = await repository.createGroup(workspace.accountId, project.id, input, "request-group");
    const repeated = await repository.createGroup(workspace.accountId, project.id, input, "request-group");

    expect(repeated.id).toBe(first.id);
    await repository.softDeleteGroup(workspace.accountId, first.id);
    expect(await repository.listGroups(workspace.accountId, project.id)).toEqual([]);
    expect(await repository.listGroups(workspace.accountId, project.id, true)).toHaveLength(1);
  });

  it("reorders and moves groups without losing their catalog data", async () => {
    const repository = createDemoCatalogRepository(store);
    const workspace = await repository.getWorkspace("demo-user");
    const source = await repository.createProject(
      workspace.accountId,
      { name: "Источник", description: "", category: "other" },
      "source-project",
    );
    const destination = await repository.createProject(
      workspace.accountId,
      { name: "Назначение", description: "", category: "other" },
      "destination-project",
    );
    const first = await repository.createGroup(
      workspace.accountId,
      source.id,
      { name: "Первая", description: "" },
      "first-group",
    );
    const second = await repository.createGroup(
      workspace.accountId,
      source.id,
      { name: "Вторая", description: "" },
      "second-group",
    );

    const reordered = await repository.reorderGroups(workspace.accountId, source.id, [second.id, first.id]);
    expect(reordered.map((group) => group.id)).toEqual([second.id, first.id]);

    const moved = await repository.moveGroup(workspace.accountId, first.id, destination.id);
    expect(moved.project_id).toBe(destination.id);
    expect(await repository.listGroups(workspace.accountId, source.id)).toHaveLength(1);
    expect(await repository.listGroups(workspace.accountId, destination.id)).toHaveLength(1);
  });
});
