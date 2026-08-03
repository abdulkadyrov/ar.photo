import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import {
  AnalyticsError,
  analyticsScopeOptionSchema,
  analyticsSummarySchema,
  validateAnalyticsQuery,
  type AnalyticsQuery,
  type AnalyticsScopeOption,
  type AnalyticsSummary,
} from "./analyticsSchemas";
import { createDemoAnalyticsRepository } from "./demoAnalyticsRepository";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export interface AnalyticsRepository {
  listScopes(accountId: string, accountName: string): Promise<AnalyticsScopeOption[]>;
  getSummary(accountId: string, query: AnalyticsQuery): Promise<AnalyticsSummary>;
}

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly client: SupabaseBrowserClient) {}

  async listScopes(accountId: string, accountName: string) {
    const [projects, groups, items] = await Promise.all([
      this.client.from("projects").select("id,name").eq("account_id", accountId).is("deleted_at", null).order("name"),
      this.client
        .from("groups")
        .select("id,name,project_id")
        .eq("account_id", accountId)
        .is("deleted_at", null)
        .order("name"),
      this.client
        .from("ar_items")
        .select("id,title,group_id")
        .eq("account_id", accountId)
        .is("deleted_at", null)
        .order("title"),
    ]);
    const error = projects.error ?? groups.error ?? items.error;
    if (error) throw mapAnalyticsError(error);

    return analyticsScopeOptionSchema.array().parse([
      { type: "account", id: accountId, name: accountName, parentId: null },
      ...(projects.data ?? []).map((project) => ({
        type: "project" as const,
        id: project.id,
        name: project.name,
        parentId: accountId,
      })),
      ...(groups.data ?? []).map((group) => ({
        type: "group" as const,
        id: group.id,
        name: group.name,
        parentId: group.project_id,
      })),
      ...(items.data ?? []).map((item) => ({
        type: "item" as const,
        id: item.id,
        name: item.title,
        parentId: item.group_id,
      })),
    ]);
  }

  async getSummary(accountId: string, rawQuery: AnalyticsQuery) {
    const query = validateAnalyticsQuery(rawQuery);
    const { data, error } = await this.client.rpc("get_analytics_summary", {
      p_target_account_id: accountId,
      p_scope_type: query.scopeType,
      p_scope_id: query.scopeId,
      p_from: query.from,
      p_to: query.to,
    });
    if (error) throw mapAnalyticsError(error);
    const parsed = analyticsSummarySchema.safeParse(data);
    if (!parsed.success) {
      throw new AnalyticsError("invalid_response", "Сервер вернул некорректную аналитику", parsed.error);
    }
    return parsed.data;
  }
}

function mapAnalyticsError(error: { code?: string; message?: string }) {
  if (error.code === "42501") {
    return new AnalyticsError("forbidden", "У вашей роли нет доступа к статистике", error);
  }
  if (error.code === "22023") {
    return new AnalyticsError("invalid_query", "Проверьте период и выбранный раздел аналитики", error);
  }
  return new AnalyticsError("unexpected", error.message ?? "Не удалось загрузить аналитику", error);
}

let repository: AnalyticsRepository | undefined;

export function getAnalyticsRepository(): AnalyticsRepository {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  repository = client ? new SupabaseAnalyticsRepository(client) : createDemoAnalyticsRepository();
  return repository;
}

export function setAnalyticsRepositoryForTests(nextRepository?: AnalyticsRepository) {
  repository = nextRepository;
}
