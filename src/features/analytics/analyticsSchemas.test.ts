import { describe, expect, it } from "vitest";
import { analyticsSummarySchema, validateAnalyticsQuery } from "./analyticsSchemas";

const summary = {
  scope: { type: "account", id: "20000000-0000-4000-8000-000000000001", name: "Studio" },
  range: { from: "2026-07-01T00:00:00.000Z", to: "2026-08-01T00:00:00.000Z" },
  summary: {
    uniqueSessions: 12,
    pageOpens: 12,
    cameraStarts: 11,
    markerDetections: 10,
    playbackStarts: 9,
    completions: 8,
    errors: 1,
    averageWatchSeconds: 27.5,
    detectionRate: 83.3,
    playbackRate: 90,
    completionRate: 88.9,
  },
  series: [{ date: "2026-07-31", sessions: 12, detections: 10, playbacks: 9, completions: 8, errors: 1 }],
  devices: [{ name: "mobile", count: 12 }],
  browsers: [{ name: "safari", count: 12 }],
  operatingSystems: [{ name: "ios", count: 12 }],
  errors: [{ code: "camera_unavailable", count: 1 }],
};

describe("analytics contracts", () => {
  it("accepts the strict aggregate-only response", () => {
    expect(analyticsSummarySchema.parse(summary).summary.completionRate).toBe(88.9);
  });

  it("rejects negative counts and unexpected raw fields", () => {
    expect(
      analyticsSummarySchema.safeParse({
        ...summary,
        summary: { ...summary.summary, uniqueSessions: -1 },
      }).success,
    ).toBe(false);
    expect(analyticsSummarySchema.safeParse({ ...summary, rawSessions: [{ ip: "203.0.113.10" }] }).success).toBe(false);
  });

  it("bounds custom queries to one year", () => {
    const valid = {
      scopeType: "item" as const,
      scopeId: "88000000-0000-4000-8000-000000000001",
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-08-01T00:00:00.000Z",
    };
    expect(validateAnalyticsQuery(valid)).toEqual(valid);
    expect(() => validateAnalyticsQuery({ ...valid, from: "2025-01-01T00:00:00.000Z" })).toThrow(/период/i);
  });
});
