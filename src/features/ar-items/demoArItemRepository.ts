import type {
  ArItem,
  CreateArItemInput,
  MediaAsset,
  PrepareArItemInput,
  ProcessingJob,
} from "../../entities/ar-item/model";
import { getMediaRepository, type MediaRepository } from "../media/mediaRepository";
import { ArItemRepositoryError, type ArItemRepository } from "./arItemRepository";

type DemoArItemState = { items: ArItem[]; jobs: ProcessingJob[] };

export interface DemoArItemStore {
  read(): DemoArItemState;
  write(state: DemoArItemState): void;
}

const DEMO_AR_ITEMS_KEY = "ar-photo-demo-ar-items-v1";
const demoUserId = "10000000-0000-4000-8000-000000000010";

export function createDemoArItemRepository(
  store: DemoArItemStore = browserStore(),
  mediaRepository: MediaRepository = getMediaRepository(),
  now: () => number = Date.now,
): ArItemRepository {
  return new DemoArItemRepository(store, mediaRepository, now);
}

export class DemoArItemRepository implements ArItemRepository {
  constructor(
    private readonly store: DemoArItemStore,
    private readonly mediaRepository: MediaRepository,
    private readonly now: () => number = Date.now,
  ) {}

  async listItems(accountId: string, projectId?: string, groupId?: string) {
    const state = this.reconcile();
    return state.items.filter(
      (item) =>
        item.account_id === accountId &&
        !item.deleted_at &&
        (!projectId || item.project_id === projectId) &&
        (!groupId || item.group_id === groupId),
    );
  }

  async getItem(accountId: string, itemId: string) {
    const item = this.reconcile().items.find(
      (candidate) => candidate.account_id === accountId && candidate.id === itemId,
    );
    if (!item) throw new ArItemRepositoryError("not_found", "AR-работа не найдена");
    return item;
  }

  async createDraft(accountId: string, input: CreateArItemInput) {
    const state = this.reconcile();
    const existing = state.items.find(
      (item) => item.account_id === accountId && item.idempotency_key === input.requestId,
    );
    if (existing) return existing;
    if (input.title.trim().length < 2 || input.title.trim().length > 160) {
      throw new ArItemRepositoryError("conflict", "Название должно содержать от 2 до 160 символов");
    }

    const timestamp = new Date(this.now()).toISOString();
    const item: ArItem = {
      id: crypto.randomUUID(),
      account_id: accountId,
      project_id: input.projectId,
      group_id: input.groupId,
      idempotency_key: input.requestId,
      title: input.title.trim(),
      description: input.description.trim() || null,
      public_slug: crypto.randomUUID(),
      status: "draft",
      visibility: "private",
      marker_asset_id: null,
      marker_image_path: null,
      marker_preview_path: null,
      marker_width: null,
      marker_height: null,
      marker_quality_score: null,
      marker_quality_details: {},
      marker_quality_overridden_at: null,
      marker_quality_overridden_by: null,
      marker_quality_override_reason: null,
      video_asset_id: null,
      video_path: null,
      video_thumbnail_path: null,
      video_duration_seconds: null,
      tracking_dataset_path: null,
      tracking_status: null,
      autoplay: true,
      loop_video: true,
      marker_lost_behavior: "pause_hide",
      audio_default: "muted",
      fallback_enabled: true,
      version: 1,
      created_by: demoUserId,
      created_at: timestamp,
      updated_at: timestamp,
      published_at: null,
      expires_at: null,
      deleted_at: null,
    };
    state.items.unshift(item);
    this.store.write(state);
    return item;
  }

  async updateDraft(accountId: string, itemId: string, title: string, description: string) {
    const state = this.reconcile();
    const index = state.items.findIndex((item) => item.account_id === accountId && item.id === itemId);
    if (index < 0) throw new ArItemRepositoryError("not_found", "AR-работа не найдена");
    state.items[index] = {
      ...state.items[index],
      title: title.trim(),
      description: description.trim() || null,
      updated_at: new Date(this.now()).toISOString(),
    };
    this.store.write(state);
    return state.items[index];
  }

  async prepare(accountId: string, itemId: string, input: PrepareArItemInput) {
    const state = this.reconcile();
    const itemIndex = state.items.findIndex((item) => item.account_id === accountId && item.id === itemId);
    if (itemIndex < 0) throw new ArItemRepositoryError("not_found", "AR-работа не найдена");
    const item = state.items[itemIndex];
    const assets = await this.mediaRepository.listAssets(accountId, item.project_id, item.group_id);
    const marker = assets.find((asset) => asset.id === input.markerAssetId && asset.kind === "marker");
    const video = assets.find((asset) => asset.id === input.videoAssetId && asset.kind === "video");
    if (!marker || !video) throw new ArItemRepositoryError("not_found", "Выбранные медиа недоступны");

    const changed = item.marker_asset_id !== marker.id || item.video_asset_id !== video.id;
    const revision = item.marker_asset_id && changed ? item.version + 1 : item.version;
    const timestamp = new Date(this.now()).toISOString();
    if (changed) {
      state.jobs = state.jobs.map((job) =>
        job.ar_item_id === item.id && (job.status === "queued" || job.status === "running")
          ? { ...job, status: "cancelled", completed_at: timestamp }
          : job,
      );
    }
    const updated: ArItem = {
      ...item,
      marker_asset_id: marker.id,
      marker_image_path: marker.storage_path,
      marker_width: metadataNumber(marker, "width"),
      marker_height: metadataNumber(marker, "height"),
      video_asset_id: video.id,
      video_path: video.storage_path,
      video_duration_seconds: metadataNumber(video, "durationSeconds"),
      autoplay: input.autoplay,
      loop_video: input.loopVideo,
      marker_lost_behavior: input.markerLostBehavior,
      audio_default: input.audioDefault,
      fallback_enabled: input.fallbackEnabled,
      status: "processing",
      tracking_status: "uploaded",
      marker_quality_score: changed ? null : item.marker_quality_score,
      marker_quality_details: changed ? {} : item.marker_quality_details,
      marker_quality_overridden_at: changed ? null : item.marker_quality_overridden_at,
      marker_quality_overridden_by: changed ? null : item.marker_quality_overridden_by,
      marker_quality_override_reason: changed ? null : item.marker_quality_override_reason,
      tracking_dataset_path: changed ? null : item.tracking_dataset_path,
      video_thumbnail_path: changed ? null : item.video_thumbnail_path,
      version: revision,
      updated_at: timestamp,
    };
    state.items[itemIndex] = updated;

    let nextJobId = Math.max(0, ...state.jobs.map((job) => job.id)) + 1;
    for (const type of ["marker_analysis", "video_inspection", "marker_compilation", "thumbnail_generation"] as const) {
      const dedupeKey = `${item.id}:v${revision}:${type}`;
      if (state.jobs.some((job) => job.dedupe_key === dedupeKey)) continue;
      state.jobs.push(createJob(nextJobId, updated, type, dedupeKey, timestamp));
      nextJobId += 1;
    }
    this.store.write(state);
    return updated;
  }

  async listJobs(accountId: string, itemId: string) {
    return this.reconcile().jobs.filter((job) => job.account_id === accountId && job.ar_item_id === itemId);
  }

  async overrideMarkerQuality(accountId: string, itemId: string, reason: string) {
    if (reason.trim().length < 10) throw new ArItemRepositoryError("conflict", "Укажите причину ручного подтверждения");
    const state = this.reconcile();
    const index = state.items.findIndex((item) => item.account_id === accountId && item.id === itemId);
    if (index < 0) throw new ArItemRepositoryError("not_found", "AR-работа не найдена");
    state.items[index] = {
      ...state.items[index],
      marker_quality_overridden_at: new Date(this.now()).toISOString(),
      marker_quality_overridden_by: demoUserId,
      marker_quality_override_reason: reason.trim(),
    };
    this.store.write(state);
    return state.items[index];
  }

  async retry(accountId: string, itemId: string) {
    const state = this.reconcile();
    const item = state.items.find((candidate) => candidate.account_id === accountId && candidate.id === itemId);
    if (!item) throw new ArItemRepositoryError("not_found", "AR-работа не найдена");
    state.jobs = state.jobs.map((job) =>
      job.ar_item_id === itemId && job.status === "failed"
        ? { ...job, status: "queued", attempt_count: 0, error_code: null, error_message: null }
        : job,
    );
    item.status = "processing";
    this.store.write(state);
    return state.jobs.filter((job) => job.ar_item_id === itemId);
  }

  private reconcile() {
    const state = this.store.read();
    let changed = false;
    for (const item of state.items) {
      if (item.status !== "processing") continue;
      const revisionJobs = state.jobs.filter(
        (job) =>
          job.ar_item_id === item.id &&
          typeof job.input_metadata === "object" &&
          job.input_metadata !== null &&
          !Array.isArray(job.input_metadata) &&
          Number(job.input_metadata.revision) === item.version,
      );
      if (!revisionJobs.length) continue;
      const elapsed = this.now() - new Date(revisionJobs[0].created_at).getTime();
      for (const job of revisionJobs) {
        const root = job.type === "marker_analysis" || job.type === "video_inspection";
        const nextStatus =
          elapsed >= 900
            ? "succeeded"
            : root
              ? elapsed >= 400
                ? "succeeded"
                : "running"
              : elapsed >= 400
                ? "running"
                : "queued";
        if (job.status !== nextStatus) {
          job.status = nextStatus;
          job.progress = nextStatus === "succeeded" ? 100 : nextStatus === "running" ? 55 : 0;
          job.output_metadata = outputFor(job);
          changed = true;
        }
      }
      if (elapsed >= 900) {
        item.status = "ready";
        item.tracking_status = "ready";
        item.marker_quality_score = 86;
        item.marker_quality_details = { score: 86, suitable: true };
        item.tracking_dataset_path = `demo/items/${item.id}/v${item.version}/target.mind`;
        item.video_thumbnail_path = `demo/items/${item.id}/v${item.version}/video.webp`;
        changed = true;
      }
    }
    if (changed) this.store.write(state);
    return state;
  }
}

function createJob(
  id: number,
  item: ArItem,
  type: ProcessingJob["type"],
  dedupeKey: string,
  timestamp: string,
): ProcessingJob {
  return {
    id,
    account_id: item.account_id,
    ar_item_id: item.id,
    type,
    dedupe_key: dedupeKey,
    status: "queued",
    progress: 0,
    attempt_count: 0,
    max_attempts: 3,
    input_metadata: { revision: item.version },
    output_metadata: {},
    error_code: null,
    error_message: null,
    locked_at: null,
    locked_by: null,
    started_at: null,
    completed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

function metadataNumber(asset: MediaAsset, key: string) {
  if (typeof asset.metadata !== "object" || Array.isArray(asset.metadata) || asset.metadata === null) return null;
  const value = Number(asset.metadata[key]);
  return Number.isFinite(value) ? value : null;
}

function outputFor(job: ProcessingJob) {
  if (job.status !== "succeeded") return {};
  if (job.type === "marker_analysis") return { score: 86, suitable: true };
  if (job.type === "video_inspection") return { videoCodec: "h264", audioCodec: "aac" };
  return { generated: true };
}

function browserStore(): DemoArItemStore {
  return {
    read() {
      try {
        return JSON.parse(localStorage.getItem(DEMO_AR_ITEMS_KEY) ?? '{"items":[],"jobs":[]}') as DemoArItemState;
      } catch {
        return { items: [], jobs: [] };
      }
    },
    write(state) {
      localStorage.setItem(DEMO_AR_ITEMS_KEY, JSON.stringify(state));
    },
  };
}
