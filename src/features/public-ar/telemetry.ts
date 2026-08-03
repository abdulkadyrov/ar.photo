import { getPublicRuntimeConfig } from "../../shared/config/env";

export type PublicArAnalyticsEvent =
  | "page_open"
  | "camera_started"
  | "marker_detected"
  | "playback_started"
  | "progress_25"
  | "progress_50"
  | "progress_75"
  | "completed"
  | "error";

export type PublicArTelemetryPayload = {
  publicSlug: string;
  sessionToken: string;
  event: PublicArAnalyticsEvent;
  valueSeconds: number | null;
  deviceType: "mobile" | "tablet" | "desktop" | "other";
  browserFamily: "chrome" | "safari" | "edge" | "firefox" | "other";
  osFamily: "ios" | "android" | "macos" | "windows" | "linux" | "other";
  referrerDomain: string | null;
  errorCode: string | null;
};

export type PublicArTelemetry = {
  track(event: PublicArAnalyticsEvent, valueSeconds?: number | null, errorCode?: string | null): boolean;
};

type TelemetryTransport = (payload: PublicArTelemetryPayload) => void | Promise<void>;

export function createPublicArTelemetry(
  publicSlug: string,
  options: {
    transport?: TelemetryTransport;
    sessionToken?: string;
    userAgent?: string;
    maxTouchPoints?: number;
    referrer?: string;
  } = {},
): PublicArTelemetry {
  const sessionToken = options.sessionToken ?? createSessionToken();
  const context = classifyClientContext(
    options.userAgent ?? navigator.userAgent,
    options.maxTouchPoints ?? navigator.maxTouchPoints,
  );
  const referrerDomain = referrerHostname(options.referrer ?? document.referrer);
  const transport = options.transport ?? sendPublicAnalytics;
  const milestones = new Set<PublicArAnalyticsEvent>();

  return {
    track(event, valueSeconds = null, errorCode = null) {
      if (milestones.has(event)) return false;
      milestones.add(event);
      const payload: PublicArTelemetryPayload = {
        publicSlug,
        sessionToken,
        event,
        valueSeconds: finiteDuration(valueSeconds),
        ...context,
        referrerDomain,
        errorCode: event === "error" ? (errorCode ?? "unknown") : null,
      };
      queueMicrotask(() => {
        try {
          void Promise.resolve(transport(payload)).catch(() => undefined);
        } catch {
          // Analytics must never affect camera or playback behavior.
        }
      });
      return true;
    },
  };
}

export function classifyClientContext(userAgent: string, maxTouchPoints = 0) {
  const ua = userAgent.toLowerCase();
  const tablet = /ipad|tablet/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua));
  const mobile = !tablet && /iphone|ipod|android.+mobile|mobile/.test(ua);
  const deviceType = tablet ? "tablet" : mobile ? "mobile" : ua ? "desktop" : "other";

  const browserFamily = /edg\//.test(ua)
    ? "edge"
    : /firefox|fxios/.test(ua)
      ? "firefox"
      : /chrome|crios/.test(ua)
        ? "chrome"
        : /safari/.test(ua)
          ? "safari"
          : "other";

  const osFamily =
    /iphone|ipad|ipod/.test(ua) || (/macintosh/.test(ua) && maxTouchPoints > 1)
      ? "ios"
      : /android/.test(ua)
        ? "android"
        : /windows/.test(ua)
          ? "windows"
          : /mac os x|macintosh/.test(ua)
            ? "macos"
            : /linux/.test(ua)
              ? "linux"
              : "other";

  return { deviceType, browserFamily, osFamily } as const;
}

export function videoMilestones(currentTime: number, duration: number): PublicArAnalyticsEvent[] {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || currentTime < 0 || duration <= 0) return [];
  const ratio = currentTime / duration;
  const events: PublicArAnalyticsEvent[] = [];
  if (ratio >= 0.25) events.push("progress_25");
  if (ratio >= 0.5) events.push("progress_50");
  if (ratio >= 0.75) events.push("progress_75");
  if (ratio >= 0.98) events.push("completed");
  return events;
}

export function viewerErrorCode(error: unknown) {
  const name = error instanceof DOMException ? error.name : error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "camera_permission_denied";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "camera_unavailable";
  if (name === "NotReadableError" || name === "TrackStartError") return "camera_busy";
  return "tracking_failed";
}

function createSessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function referrerHostname(referrer: string) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.toLowerCase().replace(/\.$/, "") || null;
  } catch {
    return null;
  }
}

function finiteDuration(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(86400, Math.round(value * 1000) / 1000));
}

async function sendPublicAnalytics(payload: PublicArTelemetryPayload) {
  const config = getPublicRuntimeConfig();
  if (!config.supabaseUrl || !config.supabasePublishableKey) return;
  const endpoint = `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/public-ar-analytics`;
  await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    credentials: "omit",
    keepalive: true,
    headers: { apikey: config.supabasePublishableKey, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}
