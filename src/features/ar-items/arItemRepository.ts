import type { ArItem, CreateArItemInput, PrepareArItemInput, ProcessingJob } from "../../entities/ar-item/model";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { createDemoArItemRepository } from "./demoArItemRepository";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export class ArItemRepositoryError extends Error {
  constructor(
    readonly code: "forbidden" | "limit_reached" | "not_found" | "conflict" | "unexpected",
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ArItemRepositoryError";
  }
}

export interface ArItemRepository {
  listItems(accountId: string, projectId?: string, groupId?: string): Promise<ArItem[]>;
  getItem(accountId: string, itemId: string): Promise<ArItem>;
  createDraft(accountId: string, input: CreateArItemInput): Promise<ArItem>;
  updateDraft(accountId: string, itemId: string, title: string, description: string): Promise<ArItem>;
  prepare(accountId: string, itemId: string, input: PrepareArItemInput): Promise<ArItem>;
  listJobs(accountId: string, itemId: string): Promise<ProcessingJob[]>;
  overrideMarkerQuality(accountId: string, itemId: string, reason: string): Promise<ArItem>;
  retry(accountId: string, itemId: string): Promise<ProcessingJob[]>;
}

export class SupabaseArItemRepository implements ArItemRepository {
  constructor(private readonly client: SupabaseBrowserClient) {}

  async listItems(accountId: string, projectId?: string, groupId?: string) {
    let query = this.client
      .from("ar_items")
      .select("*")
      .eq("account_id", accountId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    if (groupId) query = query.eq("group_id", groupId);
    const { data, error } = await query;
    if (error) throw mapArItemError(error);
    return data;
  }

  async getItem(accountId: string, itemId: string) {
    const { data, error } = await this.client
      .from("ar_items")
      .select("*")
      .eq("account_id", accountId)
      .eq("id", itemId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw mapArItemError(error);
    if (!data) throw new ArItemRepositoryError("not_found", "AR-работа не найдена");
    return data;
  }

  async createDraft(accountId: string, input: CreateArItemInput) {
    const { data, error } = await this.client.rpc("create_ar_item_draft", {
      p_target_account_id: accountId,
      p_target_project_id: input.projectId,
      p_target_group_id: input.groupId,
      p_title: input.title.trim(),
      p_description: input.description.trim(),
      p_request_id: input.requestId,
    });
    if (error) throw mapArItemError(error);
    return data;
  }

  async updateDraft(accountId: string, itemId: string, title: string, description: string) {
    const { data, error } = await this.client
      .from("ar_items")
      .update({ title: title.trim(), description: description.trim() || null })
      .eq("account_id", accountId)
      .eq("id", itemId)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();
    if (error) throw mapArItemError(error);
    if (!data) throw new ArItemRepositoryError("not_found", "AR-работа не найдена");
    return data;
  }

  async prepare(accountId: string, itemId: string, input: PrepareArItemInput) {
    const { data, error } = await this.client.rpc("prepare_ar_item_processing", {
      p_target_account_id: accountId,
      p_item_id: itemId,
      p_marker_asset_id: input.markerAssetId,
      p_video_asset_id: input.videoAssetId,
      p_autoplay: input.autoplay,
      p_loop_video: input.loopVideo,
      p_marker_lost_behavior: input.markerLostBehavior,
      p_audio_default: input.audioDefault,
      p_fallback_enabled: input.fallbackEnabled,
    });
    if (error) throw mapArItemError(error);
    return data;
  }

  async listJobs(accountId: string, itemId: string) {
    const { data, error } = await this.client
      .from("processing_jobs")
      .select("*")
      .eq("account_id", accountId)
      .eq("ar_item_id", itemId)
      .order("created_at", { ascending: true });
    if (error) throw mapArItemError(error);
    return data;
  }

  async overrideMarkerQuality(accountId: string, itemId: string, reason: string) {
    const { data, error } = await this.client.rpc("override_marker_quality", {
      p_target_account_id: accountId,
      p_item_id: itemId,
      p_reason: reason.trim(),
    });
    if (error) throw mapArItemError(error);
    return data;
  }

  async retry(accountId: string, itemId: string) {
    const { data, error } = await this.client.rpc("retry_ar_item_processing", {
      p_target_account_id: accountId,
      p_item_id: itemId,
    });
    if (error) throw mapArItemError(error);
    return data;
  }
}

function mapArItemError(error: { code?: string; message?: string }) {
  const message = error.message ?? "Не удалось выполнить операцию с AR-работой";
  if (error.code === "42501") return new ArItemRepositoryError("forbidden", message, error);
  if (error.code === "23514") return new ArItemRepositoryError("limit_reached", message, error);
  if (error.code === "23505") return new ArItemRepositoryError("conflict", message, error);
  if (error.code === "23503" || error.code === "PGRST116") {
    return new ArItemRepositoryError("not_found", message, error);
  }
  return new ArItemRepositoryError("unexpected", message, error);
}

let repository: ArItemRepository | undefined;

export function getArItemRepository(): ArItemRepository {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  repository = client ? new SupabaseArItemRepository(client) : createDemoArItemRepository();
  return repository;
}

export function setArItemRepositoryForTests(nextRepository?: ArItemRepository) {
  repository = nextRepository;
}
