import type { BeginMediaUploadInput, MediaAsset, PreparedMedia, UploadProgress } from "../../entities/media/model";
import type { MediaRepository } from "./mediaRepository";

export type DemoMediaStore = {
  read(): MediaAsset[];
  write(assets: MediaAsset[]): void;
};

const DEMO_MEDIA_KEY = "ar-photo-demo-media-v1";
const demoAssetUrls = new Map<string, string>();

export function createDemoMediaRepository(store: DemoMediaStore = browserStore()): MediaRepository {
  return new DemoMediaRepository(store);
}

export class DemoMediaRepository implements MediaRepository {
  constructor(private readonly store: DemoMediaStore) {}

  async upload(
    input: BeginMediaUploadInput,
    prepared: PreparedMedia,
    onProgress: (progress: UploadProgress) => void,
    signal: AbortSignal,
  ) {
    const existing = this.store.read().find((asset) => hasRequestId(asset, input.requestId));
    if (existing) return existing;

    const steps = Math.max(4, Math.min(20, Math.ceil(prepared.file.size / (256 * 1024))));
    for (let step = 1; step <= steps; step += 1) {
      await wait(45, signal);
      onProgress({ uploadedBytes: Math.round((prepared.file.size * step) / steps), totalBytes: prepared.file.size });
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const currentAssets = this.store.read();
    const version =
      Math.max(
        0,
        ...currentAssets
          .filter((asset) => asset.group_id === input.groupId && asset.kind === input.kind)
          .map((asset) => asset.version),
      ) + 1;
    const asset: MediaAsset = {
      id,
      account_id: input.accountId,
      project_id: input.projectId,
      group_id: input.groupId,
      ar_item_id: null,
      kind: input.kind,
      storage_bucket: input.kind === "marker" ? "markers-private" : "videos-private",
      storage_path: `demo/${input.accountId}/${input.groupId}/${id}`,
      original_file_name: prepared.file.name,
      mime_type: prepared.file.type,
      size_bytes: prepared.file.size,
      sha256: prepared.sha256,
      version,
      metadata: { ...prepared.metadata, requestId: input.requestId },
      created_by: "10000000-0000-4000-8000-000000000010",
      created_at: timestamp,
      deleted_at: null,
    };
    const assets = [asset, ...currentAssets];
    this.store.write(assets);
    demoAssetUrls.set(id, URL.createObjectURL(prepared.file));
    return asset;
  }

  async listAssets(accountId: string, projectId?: string, groupId?: string) {
    return this.store
      .read()
      .filter(
        (asset) =>
          asset.account_id === accountId &&
          (!projectId || asset.project_id === projectId) &&
          (!groupId || asset.group_id === groupId),
      );
  }

  async getAssetUrl(asset: MediaAsset) {
    return demoAssetUrls.get(asset.id) ?? "";
  }
}

function browserStore(): DemoMediaStore {
  return {
    read: () => {
      try {
        return JSON.parse(localStorage.getItem(DEMO_MEDIA_KEY) ?? "[]") as MediaAsset[];
      } catch {
        return [];
      }
    },
    write: (assets) => localStorage.setItem(DEMO_MEDIA_KEY, JSON.stringify(assets)),
  };
}

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Загрузка отменена", "AbortError"));
      return;
    }
    const timeout = window.setTimeout(resolve, milliseconds);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Загрузка отменена", "AbortError"));
      },
      { once: true },
    );
  });
}

function hasRequestId(asset: MediaAsset, requestId: string) {
  return (
    typeof asset.metadata === "object" && !Array.isArray(asset.metadata) && asset.metadata?.requestId === requestId
  );
}
