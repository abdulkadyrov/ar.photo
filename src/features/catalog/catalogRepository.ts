import { z } from "zod";
import type {
  Group,
  GroupInput,
  PaginatedProjects,
  Project,
  ProjectInput,
  ProjectListParams,
  ProjectOption,
  Workspace,
} from "../../entities/catalog/model";
import { groupFormSchema, projectFormSchema, projectListParamsSchema } from "../../entities/catalog/catalogSchemas";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import type { Database } from "../../shared/api/database.types";
import { assertDemoRuntimeEnabled } from "../../shared/config/env";
import { validateCoverFile } from "./coverFile";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export type CatalogErrorCode =
  | "workspace_unavailable"
  | "forbidden"
  | "subscription_inactive"
  | "limit_reached"
  | "not_found"
  | "conflict"
  | "unexpected";

export class CatalogError extends Error {
  constructor(
    readonly code: CatalogErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "CatalogError";
  }
}

export interface CatalogRepository {
  getWorkspace(userId: string): Promise<Workspace>;
  listProjects(accountId: string, params: ProjectListParams): Promise<PaginatedProjects>;
  getProject(accountId: string, projectId: string): Promise<Project>;
  createProject(accountId: string, input: ProjectInput, requestId: string): Promise<Project>;
  updateProject(accountId: string, projectId: string, input: ProjectInput): Promise<Project>;
  archiveProject(accountId: string, projectId: string): Promise<Project>;
  restoreProject(accountId: string, projectId: string): Promise<Project>;
  softDeleteProject(accountId: string, projectId: string): Promise<Project>;
  restoreDeletedProject(accountId: string, projectId: string): Promise<Project>;
  uploadProjectCover(accountId: string, projectId: string, file: File): Promise<Project>;
  listProjectOptions(accountId: string): Promise<ProjectOption[]>;
  listGroups(accountId: string, projectId: string, includeDeleted?: boolean): Promise<Group[]>;
  createGroup(accountId: string, projectId: string, input: GroupInput, requestId: string): Promise<Group>;
  updateGroup(accountId: string, groupId: string, input: GroupInput): Promise<Group>;
  archiveGroup(accountId: string, groupId: string): Promise<Group>;
  restoreGroup(accountId: string, groupId: string): Promise<Group>;
  softDeleteGroup(accountId: string, groupId: string): Promise<Group>;
  restoreDeletedGroup(accountId: string, groupId: string): Promise<Group>;
  reorderGroups(accountId: string, projectId: string, orderedGroupIds: string[]): Promise<Group[]>;
  moveGroup(accountId: string, groupId: string, destinationProjectId: string): Promise<Group>;
  uploadGroupCover(accountId: string, groupId: string, file: File): Promise<Group>;
  getCoverUrl(path: string | null, bucket?: string | null): Promise<string | null>;
}

export class SupabaseCatalogRepository implements CatalogRepository {
  constructor(private readonly client: SupabaseBrowserClient) {}

  async getWorkspace(userId: string): Promise<Workspace> {
    const { data: profile, error: profileError } = await this.client
      .from("profiles")
      .select("account_id,is_active")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw mapCatalogError(profileError);
    if (!profile?.is_active || !profile.account_id) {
      throw new CatalogError("workspace_unavailable", "Аккаунт пользователя не активирован");
    }

    const accountId = profile.account_id;
    const { data, error } = await this.client.rpc("get_account_entitlements", { p_target_account_id: accountId });
    if (error) throw mapCatalogError(error);
    const entitlement = workspaceEntitlementSchema.safeParse(data);
    if (!entitlement.success) {
      throw new CatalogError(
        "workspace_unavailable",
        "Сервер вернул некорректные параметры доступа",
        entitlement.error,
      );
    }

    return {
      accountId,
      accountName: entitlement.data.accountName,
      accountStatus: entitlement.data.accountStatus,
      memberRole: entitlement.data.memberRole,
      canWrite: entitlement.data.canWrite,
      subscriptionStatus: entitlement.data.subscription.status,
      subscriptionExpiresAt: entitlement.data.subscription.expiresAt,
    };
  }

  async listProjects(accountId: string, rawParams: ProjectListParams): Promise<PaginatedProjects> {
    const params = projectListParamsSchema.parse(rawParams);
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const sort = projectSort[params.sort];

    let query = this.client
      .from("projects")
      .select("*", { count: "exact" })
      .eq("account_id", accountId)
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    query = params.filter === "deleted" ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
    if (params.filter !== "all" && params.filter !== "deleted") query = query.eq("status", params.filter);
    if (params.search) query = query.ilike("name", `%${params.search}%`);

    const { data, error, count } = await query;
    if (error) throw mapCatalogError(error);

    const projects = data ?? [];
    const ids = projects.map((project) => project.id);
    const [groups, items] = ids.length
      ? await Promise.all([
          this.client.from("groups").select("project_id").in("project_id", ids).is("deleted_at", null),
          this.client
            .from("ar_items")
            .select("project_id,marker_asset_id,updated_at")
            .in("project_id", ids)
            .is("deleted_at", null)
            .order("updated_at", { ascending: false }),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ];

    if (groups.error) throw mapCatalogError(groups.error);
    if (items.error) throw mapCatalogError(items.error);

    const previewItemsByProject = new Map<string, NonNullable<typeof items.data>[number]>();
    for (const item of items.data ?? []) {
      if (item.marker_asset_id && !previewItemsByProject.has(item.project_id)) {
        previewItemsByProject.set(item.project_id, item);
      }
    }
    const markerIds = [...new Set([...previewItemsByProject.values()].map((item) => item.marker_asset_id!))];
    const markerAssets = markerIds.length
      ? await this.client
          .from("media_assets")
          .select("id,storage_bucket,storage_path")
          .eq("account_id", accountId)
          .in("id", markerIds)
          .is("deleted_at", null)
      : { data: [], error: null };
    if (markerAssets.error) throw mapCatalogError(markerAssets.error);

    return {
      items: projects.map((project) => {
        const previewItem = previewItemsByProject.get(project.id);
        const previewAsset = markerAssets.data?.find((asset) => asset.id === previewItem?.marker_asset_id);
        return {
          ...project,
          groupCount: groups.data?.filter((group) => group.project_id === project.id).length ?? 0,
          arItemCount: items.data?.filter((item) => item.project_id === project.id).length ?? 0,
          previewBucket: project.cover_path ? "project-covers-private" : (previewAsset?.storage_bucket ?? null),
          previewPath: project.cover_path ?? previewAsset?.storage_path ?? null,
        };
      }),
      page: params.page,
      pageSize: params.pageSize,
      total: count ?? 0,
    };
  }

  async getProject(accountId: string, projectId: string) {
    const { data, error } = await this.client
      .from("projects")
      .select("*")
      .eq("account_id", accountId)
      .eq("id", projectId)
      .maybeSingle();
    if (error) throw mapCatalogError(error);
    if (!data) throw new CatalogError("not_found", "Проект не найден");
    return data;
  }

  async createProject(accountId: string, rawInput: ProjectInput, requestId: string) {
    const input = projectFormSchema.parse(rawInput);
    const { data, error } = await this.client.rpc("create_project", {
      target_account_id: accountId,
      project_name: input.name,
      project_description: input.description,
      project_category: input.category,
      request_id: requestId,
    });
    if (error) throw mapCatalogError(error);
    return data;
  }

  updateProject(accountId: string, projectId: string, rawInput: ProjectInput) {
    const input = projectFormSchema.parse(rawInput);
    return this.updateProjectFields(accountId, projectId, input);
  }

  archiveProject(accountId: string, projectId: string) {
    return this.updateProjectFields(accountId, projectId, {
      status: "archived",
      archived_at: new Date().toISOString(),
    });
  }

  restoreProject(accountId: string, projectId: string) {
    return this.updateProjectFields(accountId, projectId, { status: "active", archived_at: null });
  }

  softDeleteProject(accountId: string, projectId: string) {
    return this.updateProjectFields(accountId, projectId, { deleted_at: new Date().toISOString() });
  }

  restoreDeletedProject(accountId: string, projectId: string) {
    return this.updateProjectFields(accountId, projectId, { deleted_at: null });
  }

  async uploadProjectCover(accountId: string, projectId: string, file: File) {
    const { data: current, error } = await this.client
      .from("projects")
      .select("cover_path")
      .eq("account_id", accountId)
      .eq("id", projectId)
      .maybeSingle();
    if (error) throw mapCatalogError(error);
    if (!current) throw new CatalogError("not_found", "Проект не найден");
    return this.uploadCover(accountId, projectId, "projects", projectId, current.cover_path, file, (path) =>
      this.updateProjectFields(accountId, projectId, { cover_path: path }),
    );
  }

  async listProjectOptions(accountId: string) {
    const { data, error } = await this.client
      .from("projects")
      .select("id,name")
      .eq("account_id", accountId)
      .is("deleted_at", null)
      .neq("status", "archived")
      .order("name", { ascending: true });
    if (error) throw mapCatalogError(error);
    return data;
  }

  async listGroups(accountId: string, projectId: string, includeDeleted = false) {
    let query = this.client
      .from("groups")
      .select("*")
      .eq("account_id", accountId)
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!includeDeleted) query = query.is("deleted_at", null);
    const { data, error } = await query;
    if (error) throw mapCatalogError(error);
    return data;
  }

  async createGroup(accountId: string, projectId: string, rawInput: GroupInput, requestId: string) {
    const input = groupFormSchema.parse(rawInput);
    const { data, error } = await this.client.rpc("create_group", {
      target_account_id: accountId,
      target_project_id: projectId,
      group_name: input.name,
      group_description: input.description,
      request_id: requestId,
    });
    if (error) throw mapCatalogError(error);
    return data;
  }

  updateGroup(accountId: string, groupId: string, rawInput: GroupInput) {
    const input = groupFormSchema.parse(rawInput);
    return this.updateGroupFields(accountId, groupId, input);
  }

  archiveGroup(accountId: string, groupId: string) {
    return this.updateGroupFields(accountId, groupId, { archived_at: new Date().toISOString() });
  }

  restoreGroup(accountId: string, groupId: string) {
    return this.updateGroupFields(accountId, groupId, { archived_at: null });
  }

  softDeleteGroup(accountId: string, groupId: string) {
    return this.updateGroupFields(accountId, groupId, { deleted_at: new Date().toISOString() });
  }

  restoreDeletedGroup(accountId: string, groupId: string) {
    return this.updateGroupFields(accountId, groupId, { deleted_at: null });
  }

  async reorderGroups(accountId: string, projectId: string, orderedGroupIds: string[]) {
    const { data, error } = await this.client.rpc("reorder_groups", {
      p_target_account_id: accountId,
      p_target_project_id: projectId,
      p_ordered_group_ids: orderedGroupIds,
    });
    if (error) throw mapCatalogError(error);
    return data;
  }

  async moveGroup(accountId: string, groupId: string, destinationProjectId: string) {
    const { data, error } = await this.client.rpc("move_group", {
      p_target_account_id: accountId,
      p_target_group_id: groupId,
      p_destination_project_id: destinationProjectId,
    });
    if (error) throw mapCatalogError(error);
    return data;
  }

  async uploadGroupCover(accountId: string, groupId: string, file: File) {
    const { data: current, error } = await this.client
      .from("groups")
      .select("project_id,cover_path")
      .eq("account_id", accountId)
      .eq("id", groupId)
      .maybeSingle();
    if (error) throw mapCatalogError(error);
    if (!current) throw new CatalogError("not_found", "Группа не найдена");
    return this.uploadCover(accountId, current.project_id, "groups", groupId, current.cover_path, file, (path) =>
      this.updateGroupFields(accountId, groupId, { cover_path: path }),
    );
  }

  async getCoverUrl(path: string | null, bucket = "project-covers-private") {
    if (!path) return null;
    const { data, error } = await this.client.storage
      .from(bucket || "project-covers-private")
      .createSignedUrl(path, 600);
    if (error) throw mapCatalogError(error);
    return data.signedUrl;
  }

  private async updateProjectFields(
    accountId: string,
    projectId: string,
    values: Database["public"]["Tables"]["projects"]["Update"],
  ) {
    const { data, error } = await this.client
      .from("projects")
      .update(values)
      .eq("account_id", accountId)
      .eq("id", projectId)
      .select("*")
      .maybeSingle();
    if (error) throw mapCatalogError(error);
    if (!data) throw new CatalogError("not_found", "Проект не найден или недоступен");
    return data;
  }

  private async updateGroupFields(
    accountId: string,
    groupId: string,
    values: Database["public"]["Tables"]["groups"]["Update"],
  ) {
    const { data, error } = await this.client
      .from("groups")
      .update(values)
      .eq("account_id", accountId)
      .eq("id", groupId)
      .select("*")
      .maybeSingle();
    if (error) throw mapCatalogError(error);
    if (!data) throw new CatalogError("not_found", "Группа не найдена или недоступна");
    return data;
  }

  private async uploadCover<T>(
    accountId: string,
    projectId: string,
    ownerType: "projects" | "groups",
    ownerId: string,
    previousPath: string | null,
    file: File,
    updateRecord: (path: string) => Promise<T>,
  ): Promise<T> {
    const format = await validateCoverFile(file);
    const path = `accounts/${accountId}/projects/${projectId}/${ownerType}/${ownerId}/covers/${crypto.randomUUID()}.${format.extension}`;
    const bucket = this.client.storage.from("project-covers-private");
    const upload = await bucket.upload(path, file, { contentType: format.mime, upsert: false, cacheControl: "3600" });
    if (upload.error) throw mapCatalogError(upload.error);

    try {
      const updated = await updateRecord(path);
      if (previousPath && previousPath !== path) await bucket.remove([previousPath]);
      return updated;
    } catch (error) {
      await bucket.remove([path]);
      throw error;
    }
  }
}

const projectSort = {
  updated_desc: { column: "updated_at", ascending: false },
  updated_asc: { column: "updated_at", ascending: true },
  name_asc: { column: "name", ascending: true },
  name_desc: { column: "name", ascending: false },
} as const;

export const workspaceEntitlementSchema = z.object({
  accountName: z.string().min(1),
  accountStatus: z.enum(["active", "suspended", "closed"]),
  memberRole: z.enum(["owner", "manager", "editor", "viewer", "superadmin"]),
  canWrite: z.boolean(),
  subscription: z.object({
    status: z.enum(["trial", "active", "grace_period", "expired", "suspended", "cancelled"]),
    // Postgres `timestamptz` values returned through PostgREST use an explicit
    // offset (for example `+00:00`) rather than always ending in `Z`.
    expiresAt: z.string().datetime({ offset: true }).nullable(),
  }),
});

function mapCatalogError(error: { code?: string; message?: string }) {
  const message = error.message ?? "Не удалось выполнить операцию";
  if (error.code === "42501") return new CatalogError("forbidden", message, error);
  if (error.code === "23514" && /limit/i.test(message)) return new CatalogError("limit_reached", message, error);
  if (error.code === "23505") return new CatalogError("conflict", message, error);
  if (error.code === "PGRST116") return new CatalogError("not_found", message, error);
  return new CatalogError("unexpected", message, error);
}

let repository: CatalogRepository | undefined;

export function getCatalogRepository(): CatalogRepository {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  if (client) repository = new SupabaseCatalogRepository(client);
  else {
    assertDemoRuntimeEnabled();
    repository = createDemoCatalogRepository();
  }
  return repository;
}

export function setCatalogRepositoryForTests(nextRepository?: CatalogRepository) {
  repository = nextRepository;
}

import { createDemoCatalogRepository } from "./demoCatalogRepository";
