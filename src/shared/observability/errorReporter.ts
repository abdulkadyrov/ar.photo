export type OperationalErrorEvent = {
  id: string;
  code: string;
  scope: "route" | "window" | "promise" | "operation";
  occurredAt: string;
  errorName: string;
  message: string;
  context: Record<string, string | number | boolean | null>;
};

export type OperationalErrorSink = (event: OperationalErrorEvent) => void | Promise<void>;

const sensitiveKey = /password|secret|token|authorization|cookie|email|signed|storage.?path|session/i;
let errorSink: OperationalErrorSink = () => undefined;

export function configureOperationalErrorSink(nextSink: OperationalErrorSink) {
  const previousSink = errorSink;
  errorSink = nextSink;
  return () => {
    errorSink = previousSink;
  };
}

export function reportOperationalError(
  code: string,
  scope: OperationalErrorEvent["scope"],
  error: unknown,
  context: Record<string, unknown> = {},
) {
  const normalizedError =
    error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error");
  const event: OperationalErrorEvent = {
    id: createEventId(),
    code: normalizeCode(code),
    scope,
    occurredAt: new Date().toISOString(),
    errorName: sanitizeText(normalizedError.name || "Error", 80),
    message: sanitizeText(normalizedError.message || "Unexpected application error", 240),
    context: sanitizeContext(context),
  };
  try {
    void Promise.resolve(errorSink(event)).catch(() => undefined);
  } catch {
    // Reporting must never replace or amplify the original application error.
  }
  return event;
}

export function installGlobalErrorReporting(target: Window = window) {
  const onError = (event: ErrorEvent) => {
    reportOperationalError("unhandled_window_error", "window", event.error ?? event.message);
  };
  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportOperationalError("unhandled_promise_rejection", "promise", event.reason);
  };
  target.addEventListener("error", onError);
  target.addEventListener("unhandledrejection", onUnhandledRejection);
  return () => {
    target.removeEventListener("error", onError);
    target.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}

function sanitizeContext(context: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(context)
      .slice(0, 20)
      .map(([key, value]) => [key.slice(0, 64), sensitiveKey.test(key) ? "[REDACTED]" : sanitizeValue(value)]),
  );
}

function sanitizeValue(value: unknown): string | number | boolean | null {
  if (value === null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return sanitizeText(value, 240);
  return sanitizeText(Object.prototype.toString.call(value), 80);
}

function sanitizeText(value: string, maximumLength: number) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED_TOKEN]")
    .replace(/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]+\b/g, "[REDACTED_KEY]")
    .replace(/https?:\/\/[^\s)]+/gi, (rawUrl) => {
      try {
        const url = new URL(rawUrl);
        return `${url.origin}${url.pathname}`;
      } catch {
        return "[REDACTED_URL]";
      }
    })
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[REDACTED_ID]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, maximumLength);
}

function normalizeCode(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized.slice(0, 80) || "unexpected_error";
}

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `error_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
