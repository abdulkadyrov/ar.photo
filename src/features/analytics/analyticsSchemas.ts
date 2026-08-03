import { z } from "zod";

export const analyticsScopeTypeSchema = z.enum(["account", "project", "group", "item"]);

export const analyticsScopeOptionSchema = z.object({
  type: analyticsScopeTypeSchema,
  id: z.string().uuid(),
  name: z.string().min(1).max(160),
  parentId: z.string().uuid().nullable(),
});

const countSchema = z.number().int().nonnegative();
const rateSchema = z.number().min(0).max(100);

export const analyticsSummarySchema = z
  .object({
    scope: z
      .object({
        type: analyticsScopeTypeSchema,
        id: z.string().uuid(),
        name: z.string().min(1).max(160),
      })
      .strict(),
    range: z
      .object({
        from: z.string().datetime({ offset: true }),
        to: z.string().datetime({ offset: true }),
      })
      .strict(),
    summary: z
      .object({
        uniqueSessions: countSchema,
        pageOpens: countSchema,
        cameraStarts: countSchema,
        markerDetections: countSchema,
        playbackStarts: countSchema,
        completions: countSchema,
        errors: countSchema,
        averageWatchSeconds: z.number().nonnegative(),
        detectionRate: rateSchema,
        playbackRate: rateSchema,
        completionRate: rateSchema,
      })
      .strict(),
    series: z.array(
      z
        .object({
          date: z.iso.date(),
          sessions: countSchema,
          detections: countSchema,
          playbacks: countSchema,
          completions: countSchema,
          errors: countSchema,
        })
        .strict(),
    ),
    devices: z.array(z.object({ name: z.string().min(1).max(64), count: countSchema }).strict()),
    browsers: z.array(z.object({ name: z.string().min(1).max(64), count: countSchema }).strict()),
    operatingSystems: z.array(z.object({ name: z.string().min(1).max(64), count: countSchema }).strict()),
    errors: z.array(z.object({ code: z.string().min(1).max(64), count: countSchema }).strict()),
  })
  .strict();

export type AnalyticsScopeType = z.infer<typeof analyticsScopeTypeSchema>;
export type AnalyticsScopeOption = z.infer<typeof analyticsScopeOptionSchema>;
export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;

export type AnalyticsQuery = {
  scopeType: AnalyticsScopeType;
  scopeId: string;
  from: string;
  to: string;
};

export function validateAnalyticsQuery(query: AnalyticsQuery) {
  const from = Date.parse(query.from);
  const to = Date.parse(query.to);
  if (
    !analyticsScopeTypeSchema.safeParse(query.scopeType).success ||
    !z.string().uuid().safeParse(query.scopeId).success ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from >= to ||
    to - from > 366 * 24 * 60 * 60 * 1000
  ) {
    throw new AnalyticsError("invalid_query", "Проверьте период и выбранный раздел аналитики");
  }
  return query;
}

export type AnalyticsErrorCode = "forbidden" | "invalid_query" | "invalid_response" | "unexpected";

export class AnalyticsError extends Error {
  constructor(
    readonly code: AnalyticsErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AnalyticsError";
  }
}
