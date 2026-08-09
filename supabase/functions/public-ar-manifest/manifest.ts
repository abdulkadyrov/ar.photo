export const PUBLIC_SLUG_PATTERN = /^[a-f0-9]{36}$/;
export const SIGNED_URL_TTL_SECONDS = 300;

export type PublicManifestSource = {
  target_index: number;
  title: string;
  marker_width: number;
  marker_height: number;
  autoplay: boolean;
  loop_video: boolean;
  marker_lost_behavior: "pause_hide" | "continue_audio_hide" | "stop_reset";
  audio_default: string;
  fallback_enabled: boolean;
  tracking_bucket: string;
  tracking_path: string;
  video_bucket: string;
  video_path: string;
  poster_bucket: string;
  poster_path: string;
};

export type SignedManifestAssets = {
  trackingAssetUrl: string;
  videoUrl: string;
  posterUrl: string;
};

export function extractPublicSlug(requestUrl: string) {
  const parts = new URL(requestUrl).pathname.split("/").filter(Boolean);
  const candidate = parts.at(-1) ?? "";
  return PUBLIC_SLUG_PATTERN.test(candidate) ? candidate : null;
}

export function requestNetworkIdentifier(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("cf-connecting-ip")?.trim() || headers.get("x-real-ip")?.trim() || "missing";
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function parseAllowedOrigins(value: string) {
  return new Set(
    value
      .split(",")
      .map((origin) => normalizeOrigin(origin))
      .filter((origin): origin is string => Boolean(origin)),
  );
}

export function corsHeaders(requestOrigin: string | null, allowedOrigins: Set<string>) {
  const normalized = requestOrigin ? normalizeOrigin(requestOrigin) : null;
  if (normalized && !allowedOrigins.has(normalized)) return null;
  const origin = normalized ?? [...allowedOrigins][0];
  if (!origin) return null;
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "apikey, content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}

export function createPublicManifest(
  sources: PublicManifestSource[],
  assets: SignedManifestAssets[],
  signedUrlsExpireAt: string,
) {
  if (!sources.length || sources.length !== assets.length) throw new Error("Invalid public AR bundle");
  const targets = sources.map((source, index) => createTarget(source, assets[index]));
  const primary = targets[0];
  return {
    version: targets.length > 1 ? (2 as const) : (1 as const),
    title: primary.title,
    marker: primary.marker,
    behavior: primary.behavior,
    fallbackEnabled: primary.fallbackEnabled,
    assets: primary.assets,
    ...(targets.length > 1 ? { targets } : {}),
    signedUrlsExpireAt,
  };
}

function createTarget(source: PublicManifestSource, assets: SignedManifestAssets) {
  return {
    targetId: `target-${source.target_index}`,
    title: source.title,
    marker: {
      width: source.marker_width,
      height: source.marker_height,
      aspectRatio: source.marker_width / source.marker_height,
    },
    behavior: {
      autoplay: source.autoplay,
      loop: source.loop_video,
      markerLost: source.marker_lost_behavior,
      audioDefault: source.audio_default === "user_enabled" ? ("user_enabled" as const) : ("muted" as const),
    },
    fallbackEnabled: source.fallback_enabled,
    assets,
  };
}

function normalizeOrigin(value: string) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"
      ? parsed.origin
      : null;
  } catch {
    return null;
  }
}
