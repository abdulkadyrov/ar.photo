export const ANALYTICS_BODY_LIMIT_BYTES = 4096;
export const PUBLIC_SLUG_PATTERN = /^[a-f0-9]{36}$/;
export const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22,128}$/;

const eventTypes = new Set([
  "page_open",
  "camera_started",
  "marker_detected",
  "playback_started",
  "progress_25",
  "progress_50",
  "progress_75",
  "completed",
  "error",
] as const);
const deviceTypes = new Set(["mobile", "tablet", "desktop", "other"] as const);
const browserFamilies = new Set(["chrome", "safari", "edge", "firefox", "other"] as const);
const osFamilies = new Set(["ios", "android", "macos", "windows", "linux", "other"] as const);
const errorCodePattern = /^[a-z][a-z0-9_]{0,63}$/;
const hostnamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

export type AnalyticsEventType =
  | "page_open"
  | "camera_started"
  | "marker_detected"
  | "playback_started"
  | "progress_25"
  | "progress_50"
  | "progress_75"
  | "completed"
  | "error";

export type PublicAnalyticsPayload = {
  publicSlug: string;
  sessionToken: string;
  event: AnalyticsEventType;
  valueSeconds: number | null;
  deviceType: "mobile" | "tablet" | "desktop" | "other";
  browserFamily: "chrome" | "safari" | "edge" | "firefox" | "other";
  osFamily: "ios" | "android" | "macos" | "windows" | "linux" | "other";
  referrerDomain: string | null;
  errorCode: string | null;
};

const allowedKeys = new Set([
  "publicSlug",
  "sessionToken",
  "event",
  "valueSeconds",
  "deviceType",
  "browserFamily",
  "osFamily",
  "referrerDomain",
  "errorCode",
]);

export function parseAnalyticsPayload(value: unknown): PublicAnalyticsPayload | null {
  if (!isRecord(value) || Object.keys(value).some((key) => !allowedKeys.has(key))) return null;

  const publicSlug = value.publicSlug;
  const sessionToken = value.sessionToken;
  const event = value.event;
  const deviceType = value.deviceType ?? "other";
  const browserFamily = value.browserFamily ?? "other";
  const osFamily = value.osFamily ?? "other";
  const valueSeconds = value.valueSeconds ?? null;
  const errorCode = value.errorCode ?? null;
  const referrerDomain = normalizeReferrerDomain(value.referrerDomain ?? null);

  if (
    typeof publicSlug !== "string" ||
    !PUBLIC_SLUG_PATTERN.test(publicSlug) ||
    typeof sessionToken !== "string" ||
    !SESSION_TOKEN_PATTERN.test(sessionToken) ||
    typeof event !== "string" ||
    !eventTypes.has(event as AnalyticsEventType) ||
    typeof deviceType !== "string" ||
    !deviceTypes.has(deviceType as PublicAnalyticsPayload["deviceType"]) ||
    typeof browserFamily !== "string" ||
    !browserFamilies.has(browserFamily as PublicAnalyticsPayload["browserFamily"]) ||
    typeof osFamily !== "string" ||
    !osFamilies.has(osFamily as PublicAnalyticsPayload["osFamily"]) ||
    (valueSeconds !== null &&
      (typeof valueSeconds !== "number" ||
        !Number.isFinite(valueSeconds) ||
        valueSeconds < 0 ||
        valueSeconds > 86400)) ||
    (value.referrerDomain != null && referrerDomain === null) ||
    (errorCode !== null && (typeof errorCode !== "string" || !errorCodePattern.test(errorCode))) ||
    (event === "error" && errorCode === null) ||
    (event !== "error" && errorCode !== null)
  ) {
    return null;
  }

  return {
    publicSlug,
    sessionToken,
    event: event as AnalyticsEventType,
    valueSeconds: valueSeconds === null ? null : Math.round(valueSeconds * 1000) / 1000,
    deviceType: deviceType as PublicAnalyticsPayload["deviceType"],
    browserFamily: browserFamily as PublicAnalyticsPayload["browserFamily"],
    osFamily: osFamily as PublicAnalyticsPayload["osFamily"],
    referrerDomain,
    errorCode,
  };
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
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "apikey, content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}

function normalizeReferrerDomain(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/\.$/, "");
  return normalized.length > 0 && normalized.length <= 253 && hostnamePattern.test(normalized) ? normalized : null;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
