import { Upload, type UploadOptions } from "tus-js-client";
import type {
  BeginMediaUploadInput,
  MediaAsset,
  PreparedMedia,
  UploadProgress,
  UploadSession,
} from "../../entities/media/model";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { assertDemoRuntimeEnabled, getPublicRuntimeConfig } from "../../shared/config/env";
import type { Json } from "../../shared/api/database.types";
import { createDemoMediaRepository } from "./demoMediaRepository";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export class MediaRepositoryError extends Error {
  constructor(
    readonly code: "unauthorized" | "forbidden" | "limit_reached" | "expired" | "cancelled" | "unexpected",
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MediaRepositoryError";
  }
}

export interface MediaRepository {
  upload(
    input: BeginMediaUploadInput,
    prepared: PreparedMedia,
    onProgress: (progress: UploadProgress) => void,
    signal: AbortSignal,
  ): Promise<MediaAsset>;
  listAssets(accountId: string, projectId?: string, groupId?: string): Promise<MediaAsset[]>;
  getAssetUrl(asset: MediaAsset): Promise<string>;
}

export class SupabaseMediaRepository implements MediaRepository {
  constructor(
    private readonly client: SupabaseBrowserClient,
    private readonly config = getPublicRuntimeConfig(),
  ) {}

  async upload(
    input: BeginMediaUploadInput,
    prepared: PreparedMedia,
    onProgress: (progress: UploadProgress) => void,
    signal: AbortSignal,
  ) {
    let session: UploadSession | undefined;
    try {
      session = await this.begin(input, prepared.file);
      if (session.status === "finalized" && session.asset_id) return this.getAsset(session.asset_id);
      if (new Date(session.expires_at).getTime() <= Date.now() || session.status === "expired") {
        throw new MediaRepositoryError("expired", "Сессия загрузки истекла. Повторите добавление файла.");
      }
      const started = await this.rpcSession("start_media_upload", { p_session_id: session.id });
      if (started.status === "expired") {
        throw new MediaRepositoryError("expired", "Сессия загрузки истекла. Повторите добавление файла.");
      }
      await this.uploadWithTus(started, prepared.file, onProgress, signal);
      const { data, error } = await this.client.rpc("finalize_media_upload", {
        p_session_id: started.id,
        p_sha256: prepared.sha256,
        p_metadata: prepared.metadata as unknown as Json,
      });
      if (error) throw mapMediaError(error);
      return data;
    } catch (error) {
      if (session && isAbort(error, signal)) {
        await this.client.storage.from(session.storage_bucket).remove([session.storage_path]);
        await this.client.rpc("abort_media_upload", { p_session_id: session.id });
        throw new MediaRepositoryError("cancelled", "Загрузка отменена", error);
      }
      if (session) {
        await this.client.rpc("fail_media_upload", {
          p_session_id: session.id,
          p_error_code: errorCode(error),
        });
      }
      if (error instanceof MediaRepositoryError) throw error;
      throw mapMediaError(error);
    }
  }

  async listAssets(accountId: string, projectId?: string, groupId?: string) {
    let query = this.client
      .from("media_assets")
      .select("*")
      .eq("account_id", accountId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    if (groupId) query = query.eq("group_id", groupId);
    const { data, error } = await query;
    if (error) throw mapMediaError(error);
    return data;
  }

  async getAssetUrl(asset: MediaAsset) {
    const { data, error } = await this.client.storage
      .from(asset.storage_bucket)
      .createSignedUrl(asset.storage_path, 600);
    if (error) throw mapMediaError(error);
    return data.signedUrl;
  }

  private async begin(input: BeginMediaUploadInput, file: File) {
    const { data, error } = await this.client.rpc("begin_media_upload", {
      p_target_account_id: input.accountId,
      p_target_project_id: input.projectId,
      p_target_group_id: input.groupId,
      p_kind: input.kind,
      p_original_file_name: file.name,
      p_mime_type: file.type,
      p_size_bytes: file.size,
      p_request_id: input.requestId,
    });
    if (error) throw mapMediaError(error);
    return data;
  }

  private async rpcSession(name: "start_media_upload", args: { p_session_id: string }): Promise<UploadSession> {
    const { data, error } = await this.client.rpc(name, args);
    if (error) throw mapMediaError(error);
    return data;
  }

  private async getAsset(assetId: string) {
    const { data, error } = await this.client.from("media_assets").select("*").eq("id", assetId).maybeSingle();
    if (error || !data) throw mapMediaError(error ?? new Error("Media asset not found"));
    return data;
  }

  private async uploadWithTus(
    session: UploadSession,
    file: File,
    onProgress: (progress: UploadProgress) => void,
    signal: AbortSignal,
  ) {
    const auth = await this.client.auth.getSession();
    if (auth.error) throw mapMediaError(auth.error);
    const token = auth.data.session?.access_token;
    if (!token) throw new MediaRepositoryError("unauthorized", "Войдите снова, чтобы загрузить файл");
    if (!this.config.supabaseUrl || !this.config.supabasePublishableKey) {
      throw new MediaRepositoryError("unexpected", "Supabase Storage не настроен");
    }

    const options: UploadOptions = {
      endpoint: getResumableUploadEndpoint(this.config.supabaseUrl),
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
      headers: {
        authorization: `Bearer ${token}`,
        apikey: this.config.supabasePublishableKey,
      },
      metadata: {
        bucketName: session.storage_bucket,
        objectName: session.storage_path,
        contentType: session.mime_type,
        cacheControl: "31536000",
      },
      chunkSize: 6 * 1024 * 1024,
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
    };

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener("abort", cancel);
        callback();
      };
      const upload = new Upload(file, {
        ...options,
        onError: (error) => finish(() => reject(error)),
        onProgress: (uploadedBytes, totalBytes) => onProgress({ uploadedBytes, totalBytes }),
        onSuccess: () => finish(resolve),
      });
      const cancel = () => {
        void upload.abort(true).finally(() => finish(() => reject(new DOMException("Upload aborted", "AbortError"))));
      };
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) {
        cancel();
        return;
      }
      void upload
        .findPreviousUploads()
        .then((previousUploads) => {
          if (previousUploads[0]) upload.resumeFromPreviousUpload(previousUploads[0]);
          upload.start();
        })
        .catch((error: unknown) => finish(() => reject(error)));
    });
  }
}

export function getResumableUploadEndpoint(supabaseUrl: string) {
  const url = new URL(supabaseUrl);
  if (url.hostname.endsWith(".supabase.co") && !url.hostname.includes(".storage.supabase.co")) {
    url.hostname = url.hostname.replace(/\.supabase\.co$/, ".storage.supabase.co");
  }
  url.pathname = `${url.pathname.replace(/\/$/, "")}/storage/v1/upload/resumable`;
  return url.toString();
}

function isAbort(error: unknown, signal: AbortSignal) {
  return signal.aborted || (error instanceof DOMException && error.name === "AbortError");
}

function errorCode(error: unknown) {
  if (error instanceof Error) return error.name.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80);
  return "upload_failed";
}

function mapMediaError(error: unknown) {
  const candidate = error as { code?: string; message?: string } | null;
  const message = candidate?.message ?? "Не удалось загрузить медиафайл";
  if (candidate?.code === "42501") return new MediaRepositoryError("forbidden", message, error);
  if (candidate?.code === "23514") return new MediaRepositoryError("limit_reached", message, error);
  if (/jwt|session|auth/i.test(message)) return new MediaRepositoryError("unauthorized", message, error);
  return new MediaRepositoryError("unexpected", message, error);
}

let repository: MediaRepository | undefined;

export function getMediaRepository(): MediaRepository {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  if (client) repository = new SupabaseMediaRepository(client);
  else {
    assertDemoRuntimeEnabled();
    repository = createDemoMediaRepository();
  }
  return repository;
}

export function setMediaRepositoryForTests(nextRepository?: MediaRepository) {
  repository = nextRepository;
}
