import { describe, expect, it } from "vitest";
import {
  corsHeaders,
  parseAllowedOrigins,
  parseAnalyticsPayload,
  requestNetworkIdentifier,
  sha256Hex,
} from "./analytics";

const validPayload = {
  publicSlug: "ab".repeat(18),
  sessionToken: "session_token_with_adequate_entropy_123456789",
  event: "marker_detected",
  valueSeconds: 1.2345,
  deviceType: "mobile",
  browserFamily: "safari",
  osFamily: "ios",
  referrerDomain: "School.Example.",
};

describe("public AR analytics boundary", () => {
  it("accepts and normalizes the minimized event contract", () => {
    expect(parseAnalyticsPayload(validPayload)).toEqual({
      ...validPayload,
      valueSeconds: 1.235,
      referrerDomain: "school.example",
      errorCode: null,
    });
  });

  it("rejects raw or unexpected privacy-sensitive fields", () => {
    expect(parseAnalyticsPayload({ ...validPayload, userAgent: "full browser fingerprint" })).toBeNull();
    expect(parseAnalyticsPayload({ ...validPayload, ipAddress: "203.0.113.10" })).toBeNull();
    expect(parseAnalyticsPayload({ ...validPayload, videoUrl: "https://storage.test/file?token=secret" })).toBeNull();
  });

  it("requires a bounded error code only for error events", () => {
    expect(parseAnalyticsPayload({ ...validPayload, event: "error", errorCode: "camera_unavailable" })).not.toBeNull();
    expect(parseAnalyticsPayload({ ...validPayload, event: "error" })).toBeNull();
    expect(parseAnalyticsPayload({ ...validPayload, errorCode: "camera_unavailable" })).toBeNull();
  });

  it("rejects tokens, dimensions and numeric values outside the allowlist", () => {
    expect(parseAnalyticsPayload({ ...validPayload, sessionToken: "short" })).toBeNull();
    expect(parseAnalyticsPayload({ ...validPayload, browserFamily: "my-custom-browser" })).toBeNull();
    expect(parseAnalyticsPayload({ ...validPayload, valueSeconds: 90000 })).toBeNull();
  });

  it("hashes network and session identifiers deterministically", async () => {
    const hash = await sha256Hex("salt|session|opaque-token");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(await sha256Hex("salt|session|opaque-token"));
    expect(hash).not.toContain("opaque-token");
  });

  it("uses only the first proxy network identifier", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.10, 10.0.0.1" });
    expect(requestNetworkIdentifier(headers)).toBe("203.0.113.10");
  });

  it("allows POST only from configured HTTPS or local origins", () => {
    const origins = parseAllowedOrigins("https://ar.example,http://localhost:5173,javascript:alert(1)");
    expect(corsHeaders("https://ar.example/path", origins)?.["access-control-allow-methods"]).toBe("POST, OPTIONS");
    expect(corsHeaders("https://evil.example", origins)).toBeNull();
  });
});
