import type { AnalyticsRepository } from "./analyticsRepository";
import {
  AnalyticsError,
  validateAnalyticsQuery,
  type AnalyticsQuery,
  type AnalyticsScopeOption,
} from "./analyticsSchemas";

const demoScopes: AnalyticsScopeOption[] = [
  {
    type: "project",
    id: "50000000-0000-4000-8000-000000000001",
    name: "Выпускной 2027",
    parentId: "20000000-0000-4000-8000-000000000001",
  },
  {
    type: "project",
    id: "50000000-0000-4000-8000-000000000002",
    name: "Свадьба Алины и Мансура",
    parentId: "20000000-0000-4000-8000-000000000001",
  },
  {
    type: "group",
    id: "60000000-0000-4000-8000-000000000001",
    name: "11А класс",
    parentId: "50000000-0000-4000-8000-000000000001",
  },
  {
    type: "group",
    id: "60000000-0000-4000-8000-000000000002",
    name: "11Б класс",
    parentId: "50000000-0000-4000-8000-000000000001",
  },
  {
    type: "group",
    id: "60000000-0000-4000-8000-000000000003",
    name: "Общие фото",
    parentId: "50000000-0000-4000-8000-000000000002",
  },
  {
    type: "item",
    id: "70000000-0000-4000-8000-000000000001",
    name: "Алексей Иванов",
    parentId: "60000000-0000-4000-8000-000000000001",
  },
  {
    type: "item",
    id: "70000000-0000-4000-8000-000000000002",
    name: "Мария Петрова",
    parentId: "60000000-0000-4000-8000-000000000001",
  },
  {
    type: "item",
    id: "70000000-0000-4000-8000-000000000003",
    name: "Алина и Мансур",
    parentId: "60000000-0000-4000-8000-000000000003",
  },
];

export function createDemoAnalyticsRepository(): AnalyticsRepository {
  return new DemoAnalyticsRepository();
}

export class DemoAnalyticsRepository implements AnalyticsRepository {
  async listScopes(accountId: string, accountName: string) {
    return [{ type: "account" as const, id: accountId, name: accountName, parentId: null }, ...demoScopes];
  }

  async getSummary(accountId: string, rawQuery: AnalyticsQuery) {
    const query = validateAnalyticsQuery(rawQuery);
    const scopes = await this.listScopes(accountId, "Vakha Studio");
    const scope = scopes.find((candidate) => candidate.type === query.scopeType && candidate.id === query.scopeId);
    if (!scope) throw new AnalyticsError("invalid_query", "Выбранный раздел аналитики не найден");

    const factor = { account: 1, project: 0.62, group: 0.34, item: 0.13 }[scope.type];
    const identitySeed = [...scope.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const dates = utcDates(query.from, query.to);
    const series = dates.map((date, index) => {
      const wave = (identitySeed + index * 7 + date.charCodeAt(9)) % 17;
      const sessions = Math.max(1, Math.round((32 + wave) * factor));
      const detections = Math.round(sessions * (0.78 + ((index + identitySeed) % 8) / 100));
      const playbacks = Math.round(detections * 0.91);
      const completions = Math.round(playbacks * (0.68 + (index % 7) / 100));
      const errors = (index + identitySeed) % 9 === 0 ? Math.max(1, Math.round(sessions * 0.05)) : 0;
      return { date, sessions, detections, playbacks, completions, errors };
    });

    const pageOpens = sum(series, "sessions");
    const markerDetections = sum(series, "detections");
    const playbackStarts = sum(series, "playbacks");
    const completions = sum(series, "completions");
    const errors = sum(series, "errors");
    const cameraStarts = Math.round(pageOpens * 0.94);

    return {
      scope: { type: scope.type, id: scope.id, name: scope.name },
      range: { from: query.from, to: query.to },
      summary: {
        uniqueSessions: pageOpens,
        pageOpens,
        cameraStarts,
        markerDetections,
        playbackStarts,
        completions,
        errors,
        averageWatchSeconds: round(31.4 + factor * 18.6, 1),
        detectionRate: percent(markerDetections, pageOpens),
        playbackRate: percent(playbackStarts, markerDetections),
        completionRate: percent(completions, playbackStarts),
      },
      series,
      devices: partition(pageOpens, [
        ["mobile", 0.7],
        ["desktop", 0.2],
        ["tablet", 0.08],
        ["other", 0.02],
      ]),
      browsers: partition(pageOpens, [
        ["safari", 0.48],
        ["chrome", 0.39],
        ["edge", 0.08],
        ["firefox", 0.05],
      ]),
      operatingSystems: partition(pageOpens, [
        ["ios", 0.46],
        ["android", 0.31],
        ["windows", 0.15],
        ["macos", 0.08],
      ]),
      errors: partition(errors, [
        ["camera_unavailable", 0.45],
        ["tracking_failed", 0.35],
        ["playback_failed", 0.2],
      ]).map(({ name, count }) => ({ code: name, count })),
    };
  }
}

function utcDates(from: string, to: string) {
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(to);
  const dates: string[] = [];
  while (cursor < end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function sum<T extends "sessions" | "detections" | "playbacks" | "completions" | "errors">(
  rows: Array<Record<T, number>>,
  key: T,
) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function percent(value: number, total: number) {
  return total ? round((value / total) * 100, 1) : 0;
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function partition(total: number, weights: Array<[string, number]>) {
  let allocated = 0;
  return weights.map(([name, weight], index) => {
    const count = index === weights.length - 1 ? total - allocated : Math.round(total * weight);
    allocated += count;
    return { name, count: Math.max(0, count) };
  });
}
