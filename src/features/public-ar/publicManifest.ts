import { z } from "zod";
import { getPublicRuntimeConfig } from "../../shared/config/env";

const assetUrl = z.string().url();
const markerSchema = z
  .object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    aspectRatio: z.number().positive(),
  })
  .strict();
const behaviorSchema = z
  .object({
    autoplay: z.boolean(),
    loop: z.boolean(),
    markerLost: z.enum(["pause_hide", "continue_audio_hide", "stop_reset"]),
    audioDefault: z.enum(["muted", "user_enabled"]),
  })
  .strict();
const assetsSchema = z
  .object({
    trackingAssetUrl: assetUrl,
    videoUrl: assetUrl,
    posterUrl: assetUrl,
  })
  .strict();
const targetSchema = z
  .object({
    targetId: z.string().min(1).max(64),
    title: z.string().min(1).max(160),
    marker: markerSchema,
    behavior: behaviorSchema,
    fallbackEnabled: z.boolean(),
    assets: assetsSchema,
  })
  .strict();
const commonManifestShape = {
  title: z.string().min(1).max(160),
  marker: markerSchema,
  behavior: behaviorSchema,
  fallbackEnabled: z.boolean(),
  assets: assetsSchema,
  signedUrlsExpireAt: z.string().datetime({ offset: true }),
};
const publicManifestSchema = z.union([
  z.object({ version: z.literal(1), ...commonManifestShape }).strict(),
  z.object({ version: z.literal(2), ...commonManifestShape, targets: z.array(targetSchema).min(2).max(20) }).strict(),
]);

export type PublicArManifest = z.infer<typeof publicManifestSchema>;
export type PublicArTarget = z.infer<typeof targetSchema>;
export type PublicManifestErrorCode = "not_found" | "rate_limited" | "unavailable" | "invalid_response";

export class PublicManifestError extends Error {
  constructor(
    readonly code: PublicManifestErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PublicManifestError";
  }
}

export function initialArMuted(manifest: PublicArManifest) {
  return publicArTargets(manifest).every((target) => target.behavior.audioDefault !== "user_enabled");
}

export function publicArTargets(manifest: PublicArManifest): PublicArTarget[] {
  if (manifest.version === 2) return manifest.targets;
  return [
    {
      targetId: "target-0",
      title: manifest.title,
      marker: manifest.marker,
      behavior: manifest.behavior,
      fallbackEnabled: manifest.fallbackEnabled,
      assets: manifest.assets,
    },
  ];
}

export async function loadPublicManifest(publicSlug: string, signal?: AbortSignal): Promise<PublicArManifest> {
  const config = getPublicRuntimeConfig();
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    if (config.authMode === "demo") return loadDemoManifest(publicSlug);
    throw new PublicManifestError("unavailable", "AR Photo временно не настроен");
  }

  const endpoint = `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/public-ar-manifest/${encodeURIComponent(publicSlug)}`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      headers: { apikey: config.supabasePublishableKey },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new PublicManifestError("unavailable", "Не удалось подключиться к AR Photo");
  }

  if (response.status === 404) throw new PublicManifestError("not_found", "AR-фотография не найдена");
  if (response.status === 429)
    throw new PublicManifestError("rate_limited", "Слишком много запросов. Попробуйте позже");
  if (!response.ok) throw new PublicManifestError("unavailable", "AR-фотография временно недоступна");

  const parsed = publicManifestSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new PublicManifestError("invalid_response", "Получен некорректный AR manifest");
  return parsed.data;
}

export function manifestRefreshDelay(expiresAt: string, now = Date.now()) {
  const expires = Date.parse(expiresAt);
  if (!Number.isFinite(expires)) return 0;
  return Math.max(0, expires - now - 45_000);
}

export function isManifestFresh(manifest: PublicArManifest, now = Date.now()) {
  return manifestRefreshDelay(manifest.signedUrlsExpireAt, now) > 0;
}

function loadDemoManifest(publicSlug: string): PublicArManifest {
  if (publicSlug !== "demo" && !/^[a-f0-9]{36}$/.test(publicSlug)) {
    throw new PublicManifestError("not_found", "AR-фотография не найдена");
  }
  const base = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  const h264Video = new URL("../../../test-assets/fixtures/h264-aac.mp4", import.meta.url).toString();
  return {
    version: 1,
    title: "Демо AR Photo",
    // `test.mind` is compiled from public/test-assets/test.jpg. Keeping the
    // source pixel dimensions here is essential: MindAR's unit-wide anchor
    // must receive the same aspect ratio as the image it tracks.
    marker: { width: 2742, height: 1542, aspectRatio: 2742 / 1542 },
    behavior: { autoplay: true, loop: true, markerLost: "pause_hide", audioDefault: "muted" },
    fallbackEnabled: true,
    assets: {
      trackingAssetUrl: new URL("test-assets/test.mind", base).toString(),
      videoUrl: h264Video,
      posterUrl: new URL("test-assets/test.jpg", base).toString(),
    },
    signedUrlsExpireAt: new Date(Date.now() + 300_000).toISOString(),
  };
}
