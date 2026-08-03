import type {
  Group,
  GroupInput,
  PaginatedProjects,
  Project,
  ProjectInput,
  ProjectListParams,
  Workspace,
} from "../../entities/catalog/model";
import { groupFormSchema, projectFormSchema, projectListParamsSchema } from "../../entities/catalog/catalogSchemas";
import type { CatalogRepository } from "./catalogRepository";
import { CatalogError } from "./catalogRepository";
import { validateCoverFile } from "./coverFile";

type DemoState = {
  workspace: Workspace;
  projects: Project[];
  groups: Group[];
  arItemProjectIds: string[];
};

export interface DemoCatalogStore {
  read(): DemoState | null;
  write(state: DemoState): void;
}

const DEMO_CATALOG_KEY = "ar-photo-demo-catalog-v2";
const demoAccountId = "20000000-0000-4000-8000-000000000001";
const demoUserId = "10000000-0000-4000-8000-000000000010";
const demoCoverUrls = new Map<string, string>();

export function createDemoCatalogRepository(store: DemoCatalogStore = browserStore()): CatalogRepository {
  return new DemoCatalogRepository(store);
}

export class DemoCatalogRepository implements CatalogRepository {
  constructor(private readonly store: DemoCatalogStore) {}

  async getWorkspace() {
    return this.state().workspace;
  }

  async listProjects(_accountId: string, rawParams: ProjectListParams): Promise<PaginatedProjects> {
    const params = projectListParamsSchema.parse(rawParams);
    const state = this.state();
    const search = params.search.toLocaleLowerCase("ru");
    const filtered = state.projects
      .filter((project) => {
        const deletionMatches = params.filter === "deleted" ? project.deleted_at : !project.deleted_at;
        const statusMatches =
          params.filter === "all" || params.filter === "deleted" || project.status === params.filter;
        return Boolean(deletionMatches) && statusMatches && project.name.toLocaleLowerCase("ru").includes(search);
      })
      .sort(projectComparators[params.sort]);
    const offset = (params.page - 1) * params.pageSize;
    return {
      items: filtered.slice(offset, offset + params.pageSize).map((project) => ({
        ...project,
        groupCount: state.groups.filter((group) => group.project_id === project.id && !group.deleted_at).length,
        arItemCount: state.arItemProjectIds.filter((projectId) => projectId === project.id).length,
      })),
      page: params.page,
      pageSize: params.pageSize,
      total: filtered.length,
    };
  }

  async getProject(_accountId: string, projectId: string) {
    const project = this.state().projects.find((item) => item.id === projectId);
    if (!project) throw new CatalogError("not_found", "Проект не найден");
    return project;
  }

  async createProject(_accountId: string, rawInput: ProjectInput, requestId: string) {
    const input = projectFormSchema.parse(rawInput);
    const state = this.state();
    const existing = state.projects.find((project) => project.idempotency_key === requestId);
    if (existing) return existing;
    const timestamp = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      account_id: state.workspace.accountId,
      name: input.name,
      description: input.description || null,
      category: input.category,
      cover_path: null,
      status: "draft",
      sort_order: state.projects.length,
      idempotency_key: requestId,
      created_by: demoUserId,
      created_at: timestamp,
      updated_at: timestamp,
      archived_at: null,
      deleted_at: null,
    };
    state.projects.unshift(project);
    this.store.write(state);
    return project;
  }

  updateProject(_accountId: string, projectId: string, rawInput: ProjectInput) {
    const input = projectFormSchema.parse(rawInput);
    return this.updateProjectRecord(projectId, { ...input, description: input.description || null });
  }

  archiveProject(_accountId: string, projectId: string) {
    return this.updateProjectRecord(projectId, { status: "archived", archived_at: new Date().toISOString() });
  }

  restoreProject(_accountId: string, projectId: string) {
    return this.updateProjectRecord(projectId, { status: "active", archived_at: null });
  }

  softDeleteProject(_accountId: string, projectId: string) {
    return this.updateProjectRecord(projectId, { deleted_at: new Date().toISOString() });
  }

  restoreDeletedProject(_accountId: string, projectId: string) {
    return this.updateProjectRecord(projectId, { deleted_at: null });
  }

  async listProjectOptions() {
    return this.state()
      .projects.filter((project) => !project.deleted_at && project.status !== "archived")
      .map(({ id, name }) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name, "ru"));
  }

  async uploadProjectCover(_accountId: string, projectId: string, file: File) {
    return this.setDemoCover("project", projectId, file) as Promise<Project>;
  }

  async listGroups(_accountId: string, projectId: string, includeDeleted = false) {
    return this.state()
      .groups.filter((group) => group.project_id === projectId && (includeDeleted || !group.deleted_at))
      .sort((left, right) => left.sort_order - right.sort_order || left.created_at.localeCompare(right.created_at));
  }

  async createGroup(_accountId: string, projectId: string, rawInput: GroupInput, requestId: string) {
    const input = groupFormSchema.parse(rawInput);
    const state = this.state();
    const existing = state.groups.find(
      (group) => group.project_id === projectId && group.idempotency_key === requestId,
    );
    if (existing) return existing;
    const project = state.projects.find(
      (item) => item.id === projectId && !item.deleted_at && item.status !== "archived",
    );
    if (!project) throw new CatalogError("not_found", "Активный проект не найден");
    const timestamp = new Date().toISOString();
    const group: Group = {
      id: crypto.randomUUID(),
      account_id: state.workspace.accountId,
      project_id: projectId,
      name: input.name,
      description: input.description || null,
      cover_path: null,
      sort_order: state.groups.filter((item) => item.project_id === projectId).length,
      idempotency_key: requestId,
      created_by: demoUserId,
      created_at: timestamp,
      updated_at: timestamp,
      archived_at: null,
      deleted_at: null,
    };
    state.groups.push(group);
    this.store.write(state);
    return group;
  }

  updateGroup(_accountId: string, groupId: string, rawInput: GroupInput) {
    const input = groupFormSchema.parse(rawInput);
    return this.updateGroupRecord(groupId, { ...input, description: input.description || null });
  }

  archiveGroup(_accountId: string, groupId: string) {
    return this.updateGroupRecord(groupId, { archived_at: new Date().toISOString() });
  }

  restoreGroup(_accountId: string, groupId: string) {
    return this.updateGroupRecord(groupId, { archived_at: null });
  }

  softDeleteGroup(_accountId: string, groupId: string) {
    return this.updateGroupRecord(groupId, { deleted_at: new Date().toISOString() });
  }

  restoreDeletedGroup(_accountId: string, groupId: string) {
    return this.updateGroupRecord(groupId, { deleted_at: null });
  }

  async reorderGroups(_accountId: string, projectId: string, orderedGroupIds: string[]) {
    const state = this.state();
    const active = state.groups.filter((group) => group.project_id === projectId && !group.deleted_at);
    if (
      orderedGroupIds.length !== active.length ||
      new Set(orderedGroupIds).size !== active.length ||
      active.some((group) => !orderedGroupIds.includes(group.id))
    ) {
      throw new CatalogError("conflict", "Список сортировки не совпадает с группами проекта");
    }
    const timestamp = new Date().toISOString();
    state.groups = state.groups.map((group) => {
      const sortOrder = orderedGroupIds.indexOf(group.id);
      return sortOrder < 0 ? group : { ...group, sort_order: sortOrder, updated_at: timestamp };
    });
    this.store.write(state);
    return state.groups
      .filter((group) => group.project_id === projectId && !group.deleted_at)
      .sort((left, right) => left.sort_order - right.sort_order);
  }

  async moveGroup(_accountId: string, groupId: string, destinationProjectId: string) {
    const state = this.state();
    const destination = state.projects.find(
      (project) => project.id === destinationProjectId && !project.deleted_at && project.status !== "archived",
    );
    if (!destination) throw new CatalogError("not_found", "Активный проект назначения не найден");
    const group = state.groups.find((item) => item.id === groupId && !item.deleted_at);
    if (!group) throw new CatalogError("not_found", "Группа не найдена");
    if (group.project_id === destinationProjectId) return group;
    const nextOrder = state.groups.filter(
      (item) => item.project_id === destinationProjectId && !item.deleted_at,
    ).length;
    const moved = {
      ...group,
      project_id: destinationProjectId,
      sort_order: nextOrder,
      updated_at: new Date().toISOString(),
    };
    state.groups[state.groups.findIndex((item) => item.id === groupId)] = moved;
    this.store.write(state);
    return moved;
  }

  async uploadGroupCover(_accountId: string, groupId: string, file: File) {
    return this.setDemoCover("group", groupId, file) as Promise<Group>;
  }

  async getCoverUrl(path: string | null) {
    return path ? (demoCoverUrls.get(path) ?? null) : null;
  }

  private async updateProjectRecord(projectId: string, values: Partial<Project>) {
    const state = this.state();
    const index = state.projects.findIndex((project) => project.id === projectId);
    if (index < 0) throw new CatalogError("not_found", "Проект не найден");
    const project = { ...state.projects[index], ...values, updated_at: new Date().toISOString() };
    state.projects[index] = project;
    this.store.write(state);
    return project;
  }

  private async updateGroupRecord(groupId: string, values: Partial<Group>) {
    const state = this.state();
    const index = state.groups.findIndex((group) => group.id === groupId);
    if (index < 0) throw new CatalogError("not_found", "Группа не найдена");
    const group = { ...state.groups[index], ...values, updated_at: new Date().toISOString() };
    state.groups[index] = group;
    this.store.write(state);
    return group;
  }

  private async setDemoCover(ownerType: "project" | "group", ownerId: string, file: File) {
    const format = await validateCoverFile(file);
    const path = `demo-cover://${ownerType}/${ownerId}/${crypto.randomUUID()}.${format.extension}`;
    const state = this.state();
    const records = ownerType === "project" ? state.projects : state.groups;
    const index = records.findIndex((record) => record.id === ownerId);
    if (index < 0)
      throw new CatalogError("not_found", ownerType === "project" ? "Проект не найден" : "Группа не найдена");
    const previousPath = records[index].cover_path;
    if (previousPath) {
      const previousUrl = demoCoverUrls.get(previousPath);
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      demoCoverUrls.delete(previousPath);
    }
    demoCoverUrls.set(path, URL.createObjectURL(file));
    const record = { ...records[index], cover_path: path, updated_at: new Date().toISOString() };
    if (ownerType === "project") state.projects[index] = record as Project;
    else state.groups[index] = record as Group;
    this.store.write(state);
    return record;
  }

  private state() {
    const state = this.store.read();
    if (state) return structuredClone(state);
    const seed = createSeed();
    this.store.write(seed);
    return structuredClone(seed);
  }
}

const projectComparators: Record<ProjectListParams["sort"], (left: Project, right: Project) => number> = {
  updated_desc: (left, right) => right.updated_at.localeCompare(left.updated_at),
  updated_asc: (left, right) => left.updated_at.localeCompare(right.updated_at),
  name_asc: (left, right) => left.name.localeCompare(right.name, "ru"),
  name_desc: (left, right) => right.name.localeCompare(left.name, "ru"),
};

function browserStore(): DemoCatalogStore {
  return {
    read() {
      const raw = window.localStorage.getItem(DEMO_CATALOG_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as DemoState;
      } catch {
        window.localStorage.removeItem(DEMO_CATALOG_KEY);
        return null;
      }
    },
    write(state) {
      window.localStorage.setItem(DEMO_CATALOG_KEY, JSON.stringify(state));
    },
  };
}

function createSeed(): DemoState {
  return {
    workspace: {
      accountId: demoAccountId,
      accountName: "Vakha Studio",
      accountStatus: "active",
      memberRole: "owner",
      canWrite: true,
      subscriptionStatus: "active",
      subscriptionExpiresAt: "2027-08-03T00:00:00.000Z",
    },
    projects: [],
    groups: [],
    arItemProjectIds: [],
  };
}
