import { describe, expect, it } from "vitest";
import { analyticsSummarySchema } from "./analyticsSchemas";
import { createDemoAnalyticsRepository } from "./demoAnalyticsRepository";

const accountId = "20000000-0000-4000-8000-000000000001";

describe("demo analytics repository", () => {
  it("returns stable and internally consistent aggregate fixtures", async () => {
    const repository = createDemoAnalyticsRepository();
    const query = {
      scopeType: "account" as const,
      scopeId: accountId,
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-08T00:00:00.000Z",
    };
    const first = await repository.getSummary(accountId, query);
    const second = await repository.getSummary(accountId, query);

    expect(first).toEqual(second);
    expect(analyticsSummarySchema.safeParse(first).success).toBe(true);
    expect(first.series).toHaveLength(7);
    expect(first.summary.uniqueSessions).toBe(first.series.reduce((total, day) => total + day.sessions, 0));
    expect(first.devices.reduce((total, entry) => total + entry.count, 0)).toBe(first.summary.uniqueSessions);
  });

  it("supports every required scope level", async () => {
    const repository = createDemoAnalyticsRepository();
    const scopes = await repository.listScopes(accountId, "Vakha Studio");
    expect(new Set(scopes.map((scope) => scope.type))).toEqual(new Set(["account", "project", "group", "item"]));
  });
});
