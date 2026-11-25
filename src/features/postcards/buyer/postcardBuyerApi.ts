import { z } from "zod";
import { postcardTemplateCodes } from "../postcardTemplates";
import { getPublicRuntimeConfig, type PublicRuntimeConfig } from "../../../shared/config/env";

export const publicCardTokenPattern = /^[a-f0-9]{32}$/;
export const editTokenPattern = /^[a-f0-9]{64}$/;
export const buyerModeSchema = z.enum(["frame", "full"]);
export type BuyerMode = z.infer<typeof buyerModeSchema>;
const safeSlug = z.string().regex(/^[a-f0-9]{36}$/);
const frameSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().positive().max(1),
    height: z.number().positive().max(1),
  })
  .refine((frame) => frame.x + frame.width <= 1.000001 && frame.y + frame.height <= 1.000001);
export const buyerSnapshotSchema = z.object({
  card: z.object({
    publicToken: z.string().regex(publicCardTokenPattern),
    templateCode: z.enum(postcardTemplateCodes),
    title: z.string().max(160),
    state: z.enum(["available", "claimed", "processing", "ready", "published", "unavailable"]),
    mode: buyerModeSchema,
    frame: frameSchema,
    publicSlug: safeSlug.nullable().optional(),
  }),
  limits: z.object({
    maxVideoBytes: z.number().int().positive(),
    maxVideoSeconds: z.number().positive(),
  }),
  owned: z.boolean(),
  jobs: z
    .array(
      z.object({
        stage: z.string(),
        status: z.string(),
        progress: z.number().min(0).max(100),
        errorCode: z.string().nullable().optional(),
      }),
    )
    .optional(),
  videoPreviewUrl: z.string().url().nullable().optional(),
  previewImageUrl: z.string().url().nullable().optional(),
});
export type BuyerSnapshot = z.infer<typeof buyerSnapshotSchema>;
export type BuyerVideoMetadata = {
  name: string;
  mimeType: "video/mp4" | "video/quicktime" | "video/webm";
  sizeBytes: number;
  width: number;
  height: number;
  durationSeconds: number;
  sha256: string;
};
const uploadSchema = z.object({
  uploadId: z.string().uuid(),
  video: z.object({ signedUrl: z.string().url(), headers: z.record(z.string(), z.string()).optional() }),
});
export type BuyerUpload = z.infer<typeof uploadSchema>;

const errorMessages: Record<string, string> = {
  invalid_card: "Не удалось подтвердить доступ. Проверьте код на вкладыше или откройте сохранённую личную ссылку.",
  activation_unavailable:
    "Сейчас открытку не удалось активировать. Обратитесь в магазин или студию — доступ и пакет издателя требуют проверки.",
  media_limit_reached: "Видео превышает допустимый размер или длительность. Выберите файл поменьше.",
  storage_limit_reached: "В хранилище издателя недостаточно места. Обратитесь в студию.",
  too_many_uploads: "Есть незавершённые загрузки. Повторите последнюю загрузку или обратитесь в студию.",
  request_conflict: "Данные загрузки изменились. Выберите видео заново.",
  upload_expired: "Время загрузки истекло. Выберите видео заново.",
  upload_superseded: "На другом устройстве начата новая загрузка. Обновите страницу.",
  upload_not_ready: "Загрузка ещё не завершена или файл не прошёл проверку. Повторите загрузку.",
  upload_size_mismatch: "Размер полученного файла отличается от выбранного. Повторите загрузку.",
  upload_failed: "Не удалось передать видео. Проверьте соединение и повторите загрузку.",
  service_unavailable: "Сервис временно недоступен. Повторите немного позже.",
  activation_failed:
    "Не удалось активировать открытку. Проверьте код на вкладыше. Если открытку уже активировали, откройте сохранённую ссылку управления.",
  invalid_activation:
    "Не удалось активировать открытку. Проверьте код на вкладыше или откройте свою ссылку управления.",
  invalid_code: "Не удалось активировать открытку. Проверьте код на вкладыше или откройте свою ссылку управления.",
  invalid_access: "Доступ к управлению не подтверждён. Откройте сохранённую личную ссылку.",
  forbidden: "Доступ к управлению не подтверждён. Откройте сохранённую личную ссылку.",
  not_found: "Открытка не найдена или временно недоступна. Проверьте QR на открытке.",
  card_unavailable: "Эта открытка пока недоступна для активации. Обратитесь в магазин.",
  rate_limited: "Слишком много попыток. Подождите и повторите.",
  quota_exceeded: "Сейчас не удалось подготовить открытку. Обратитесь в магазин или поддержку студии.",
  limit_reached: "Сейчас не удалось подготовить открытку. Обратитесь в магазин или поддержку студии.",
  file_too_large: "Видео превышает доступный размер. Выберите файл поменьше.",
  invalid_video: "Не удалось прочитать видео. Попробуйте сохранить его в MP4 и выбрать снова.",
  invalid_media: "Файл не прошёл проверку. Выберите исходное видео заново.",
  upload_incomplete: "Загрузка завершена не полностью. Повторите загрузку этого видео.",
  processing_incomplete: "Видео ещё подготавливается. Дождитесь окончания обработки.",
  processing_failed: "Не удалось подготовить видео. Выберите файл заново и повторите загрузку.",
  backend_unavailable: "Сервис временно недоступен. Повторите немного позже.",
};

export class PostcardBuyerError extends Error {
  constructor(
    readonly code: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(errorMessages[code] ?? "Не удалось выполнить действие. Проверьте соединение и повторите.");
    this.name = "PostcardBuyerError";
  }
}

export class PostcardBuyerApi {
  private readonly previewCache = new Map<string, { url: string; refreshAt: number }>();
  clearPreviewCache() {
    this.previewCache.clear();
  }

  constructor(private readonly config: PublicRuntimeConfig = getPublicRuntimeConfig()) {}

  private async request(action: string, input: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
    if (!this.config.supabaseUrl || !this.config.supabasePublishableKey)
      throw new PostcardBuyerError("backend_unavailable");
    let response: Response;
    try {
      response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, "")}/functions/v1/postcard-buyer`, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: this.config.supabasePublishableKey },
        body: JSON.stringify({ action, ...input }),
        signal,
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new PostcardBuyerError("network_error");
    }
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error = z
        .object({ code: z.string(), retryAfterSeconds: z.number().nonnegative().optional() })
        .safeParse(payload);
      throw new PostcardBuyerError(
        response.status === 429 ? "rate_limited" : error.success ? error.data.code : "unexpected",
        error.success ? error.data.retryAfterSeconds : undefined,
      );
    }
    return payload;
  }

  private async snapshot(action: string, publicToken: string, input: Record<string, unknown>, signal?: AbortSignal) {
    const data = buyerSnapshotSchema.safeParse(await this.request(action, { publicToken, ...input }, signal));
    if (!data.success || data.data.card.publicToken !== publicToken) throw new PostcardBuyerError("unexpected");
    // Signed media lives for five minutes. Keep a stable URL during polling so
    // a 4MB marker or a video is not reloaded every few seconds on a phone.
    for (const field of ["previewImageUrl", "videoPreviewUrl"] as const) {
      const candidate = data.data[field];
      if (!candidate) continue;
      const path = new URL(candidate).origin + new URL(candidate).pathname;
      const key = `${publicToken}:${data.data.owned}:${field}:${path}`;
      const previous = this.previewCache.get(key);
      if (previous && performance.now() < previous.refreshAt) data.data[field] = previous.url;
      else this.previewCache.set(key, { url: candidate, refreshAt: performance.now() + 240_000 });
    }
    return data.data;
  }
  lookup(publicToken: string, editToken?: string | null, signal?: AbortSignal) {
    return this.snapshot("lookup", publicToken, editToken ? { editToken } : {}, signal);
  }
  claim(publicToken: string, shopCode: string, editToken: string, signal?: AbortSignal) {
    return this.snapshot(
      "claim",
      publicToken,
      { shopCode: shopCode.replace(/[\s·-]+/g, "").toUpperCase(), editToken },
      signal,
    );
  }
  state(publicToken: string, editToken: string, signal?: AbortSignal) {
    return this.snapshot("state", publicToken, { editToken }, signal);
  }
  completeUpload(publicToken: string, editToken: string, uploadId: string, signal?: AbortSignal) {
    return this.snapshot("completeUpload", publicToken, { editToken, uploadId }, signal);
  }
  publish(publicToken: string, editToken: string, signal?: AbortSignal) {
    return this.snapshot("publish", publicToken, { editToken }, signal);
  }
  async upload(
    publicToken: string,
    editToken: string,
    requestId: string,
    mode: BuyerMode,
    video: BuyerVideoMetadata,
    signal?: AbortSignal,
  ) {
    const result = uploadSchema.safeParse(
      await this.request("upload", { publicToken, editToken, requestId, mode, video }, signal),
    );
    if (!result.success) throw new PostcardBuyerError("unexpected");
    this.assertUploadUrl(result.data.video.signedUrl, publicToken, result.data.uploadId);
    return {
      ...result.data,
      video: {
        ...result.data.video,
        headers: {
          ...result.data.video.headers,
          apikey: this.config.supabasePublishableKey!,
          "x-postcard-edit-token": editToken,
        },
      },
    };
  }
  private assertUploadUrl(url: string, publicToken: string, uploadId: string) {
    const target = new URL(url);
    const backend = new URL(this.config.supabaseUrl!);
    if (
      target.origin !== backend.origin ||
      target.pathname !== `/functions/v1/postcard-buyer/upload/${publicToken}/${uploadId}`
    )
      throw new PostcardBuyerError("unexpected");
  }
}

export function uploadSignedBlob(
  url: string,
  blob: Blob,
  onProgress: (progress: number) => void,
  signal: AbortSignal,
  headers: Record<string, string> = {},
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abort = () => request.abort();
    const cleanup = () => signal.removeEventListener("abort", abort);
    request.open("PUT", url);
    request.setRequestHeader("content-type", blob.type || "application/octet-stream");
    for (const [name, value] of Object.entries(headers)) request.setRequestHeader(name, value);
    request.timeout = 15 * 60_000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    request.onload = () => {
      cleanup();
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
      } else reject(new PostcardBuyerError("upload_failed"));
    };
    request.onerror = request.ontimeout = () => {
      cleanup();
      reject(new PostcardBuyerError("upload_failed"));
    };
    request.onabort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    request.send(blob);
  });
}
