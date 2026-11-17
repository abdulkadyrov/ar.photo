import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  CircleCheck,
  Eye,
  Play,
  RefreshCw,
  ArrowRight,
  Plus,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { getArItemRepository } from "../ar-items/arItemRepository";
import { captureWorkspaceOrigin } from "../ar-items/itemNavigation";
import type { ArItem } from "../../entities/ar-item/model";
import "./AnalyticsPage.css";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, MetricCard, Panel, Select, Skeleton } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { AnalyticsError, type AnalyticsScopeOption, type AnalyticsSummary } from "./analyticsSchemas";
import { getAnalyticsRepository } from "./analyticsRepository";

const analyticsRepository = getAnalyticsRepository();
const catalogRepository = getCatalogRepository();
const arItemRepository = getArItemRepository();
const scopeLabels = { account: "Аккаунт", project: "Проект", group: "Группа", item: "AR-работа" } as const;
const dimensionLabels: Record<string, string> = {
  mobile: "Телефон",
  tablet: "Планшет",
  desktop: "Компьютер",
  other: "Другое",
  safari: "Safari",
  chrome: "Chrome",
  edge: "Edge",
  firefox: "Firefox",
  ios: "iOS",
  android: "Android",
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};
const errorLabels: Record<string, string> = {
  camera_permission_denied: "Доступ к камере запрещён",
  camera_unavailable: "Камера недоступна",
  camera_busy: "Камера занята",
  tracking_failed: "Не удалось запустить AR",
  playback_failed: "Ошибка воспроизведения",
  asset_failed: "Медиа недоступно",
  insecure_context: "Страница открыта без HTTPS",
  webgl_unavailable: "WebGL недоступен",
  unknown: "Другая ошибка",
};

type RangePreset = "7" | "30" | "90" | "custom";

export function AnalyticsRoute() {
  const auth = useAuth();
  const today = useMemo(() => new Date(), []);
  const [preset, setPreset] = useState<RangePreset>("30");
  const [customFrom, setCustomFrom] = useState(() => inputDate(addUtcDays(today, -29)));
  const [customTo, setCustomTo] = useState(() => inputDate(today));
  const [selectedScopeKey, setSelectedScopeKey] = useState("");

  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const workspace = workspaceQuery.data;
  const itemsQuery = useQuery({
    queryKey: ["ar-items", workspace?.accountId],
    queryFn: () => arItemRepository.listItems(workspace!.accountId),
    enabled: Boolean(workspace),
  });
  const scopesQuery = useQuery({
    queryKey: ["analytics", "scopes", workspace?.accountId],
    queryFn: () => analyticsRepository.listScopes(workspace!.accountId, workspace!.accountName),
    enabled: Boolean(workspace),
  });
  const scopes = scopesQuery.data ?? [];
  const scope = resolveScope(scopes, selectedScopeKey, workspace?.accountId);
  const range = useMemo(() => resolveRange(preset, customFrom, customTo, today), [customFrom, customTo, preset, today]);
  const summaryQuery = useQuery({
    queryKey: ["analytics", "summary", workspace?.accountId, scope?.type, scope?.id, range?.from, range?.to],
    queryFn: () =>
      analyticsRepository.getSummary(workspace!.accountId, {
        scopeType: scope!.type,
        scopeId: scope!.id,
        from: range!.from,
        to: range!.to,
      }),
    enabled: Boolean(workspace && scope && range),
  });

  if (workspaceQuery.isPending) return <AnalyticsLoading />;
  if (workspaceQuery.error || !workspace) {
    return <AnalyticsFailure error={workspaceQuery.error} onRetry={() => void workspaceQuery.refetch()} />;
  }

  return (
    <AppShell
      eyebrow={workspace.accountName}
      title="Статистика моих работ"
      description="Просмотры и взаимодействия с моими AR-фото"
      compactMobile
      actions={
        <>
          <Button
            variant="quiet"
            icon={<RefreshCw size={17} />}
            disabled={summaryQuery.isFetching}
            onClick={() => void summaryQuery.refetch()}
          >
            Обновить
          </Button>
          {workspace.canWrite ? (
            <Link className="btn btn-primary" to="/create">
              <Plus size={17} />
              Создать AR-фото
            </Link>
          ) : null}
        </>
      }
    >
      <Panel className="analytics-filters mt-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1.3fr)_220px]">
          <Select
            label="Раздел"
            aria-label="Раздел аналитики"
            disabled={scopesQuery.isPending || !scopes.length}
            value={scope ? scopeKey(scope) : ""}
            onChange={(event) => setSelectedScopeKey(event.target.value)}
            options={scopes.map((option) => ({
              value: scopeKey(option),
              label: `${scopeLabels[option.type]} · ${option.name}`,
            }))}
          />
          <Select
            label="Период"
            aria-label="Период аналитики"
            value={preset}
            onChange={(event) => setPreset(event.target.value as RangePreset)}
            options={[
              { value: "7", label: "Последние 7 дней" },
              { value: "30", label: "Последние 30 дней" },
              { value: "90", label: "Последние 90 дней" },
              { value: "custom", label: "Свой период" },
            ]}
          />
        </div>
        {preset === "custom" ? (
          <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
            <DateInput label="С даты" value={customFrom} onChange={setCustomFrom} />
            <DateInput label="По дату" value={customTo} onChange={setCustomTo} />
          </div>
        ) : null}
        <Button
          type="button"
          className="analytics-filter-apply"
          disabled={summaryQuery.isFetching || !range}
          onClick={() => void summaryQuery.refetch()}
        >
          Применить
        </Button>
        <Button
          type="button"
          className="analytics-filter-reset"
          variant="ghost"
          onClick={() => {
            setPreset("30");
            setSelectedScopeKey("");
          }}
        >
          Сбросить
        </Button>
        {!range ? (
          <p className="mt-4 text-sm text-rose-700" role="alert">
            Начальная дата должна быть раньше конечной, максимальный период — 366 дней.
          </p>
        ) : null}
      </Panel>

      {scopesQuery.error ? (
        <div className="mt-6">
          <ErrorState text={readableAnalyticsError(scopesQuery.error)} />
        </div>
      ) : summaryQuery.isPending || scopesQuery.isPending ? (
        <AnalyticsDashboardSkeleton />
      ) : summaryQuery.error ? (
        <div className="mt-6">
          <ErrorState
            title="Статистика недоступна"
            text={readableAnalyticsError(summaryQuery.error)}
            action={<Button onClick={() => void summaryQuery.refetch()}>Повторить</Button>}
          />
        </div>
      ) : summaryQuery.data ? (
        <AnalyticsDashboard
          data={summaryQuery.data}
          works={
            range ? (
              <AnalyticsWorkList
                items={itemsQuery.data ?? []}
                loading={itemsQuery.isPending}
                error={itemsQuery.error}
                accountId={workspace.accountId}
                range={range}
                scope={scope}
                scopes={scopes}
                onRetry={() => void itemsQuery.refetch()}
              />
            ) : null
          }
        />
      ) : null}
    </AppShell>
  );
}

function AnalyticsDashboard({ data, works }: { data: AnalyticsSummary; works: ReactNode }) {
  const summary = data.summary;
  return (
    <>
      <section className="analytics-metrics mt-5" aria-label="Ключевые показатели">
        <article className="analytics-stat">
          <Eye size={22} />
          <div>
            <span>Открытия страниц</span>
            <strong>{formatNumber(summary.pageOpens)}</strong>
          </div>
        </article>
        <article className="analytics-stat">
          <ScanLine size={22} />
          <div>
            <span>Запуски AR</span>
            <strong>{formatNumber(summary.cameraStarts)}</strong>
          </div>
        </article>
        <article className="analytics-stat">
          <Play size={22} />
          <div>
            <span>Просмотры видео</span>
            <strong>{formatNumber(summary.playbackStarts)}</strong>
          </div>
        </article>
      </section>

      <section className="analytics-chart-grid mt-5">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="mt-1 text-lg font-semibold">Динамика активности</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {data.scope.name}
            </span>
          </div>
          <AnalyticsChart series={data.series} />
        </Panel>
      </section>

      {works}
      <details className="analytics-details mt-5">
        <summary>Подробнее о просмотрах и устройствах</summary>
        <Panel>
          <div className="flex items-center gap-3">
            <span className="metric-icon">
              <Activity size={20} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Воронка</h2>
              <p className="mt-1 text-sm text-muted">От открытия до досмотра</p>
            </div>
          </div>
          <Funnel summary={summary} />
        </Panel>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<CircleCheck size={20} />}
            label="Досмотры"
            value={formatNumber(summary.completions)}
            hint={`${formatRate(summary.completionRate)} от запусков`}
          />
          <MetricCard
            icon={<Timer size={20} />}
            label="Средний просмотр"
            value={formatDuration(summary.averageWatchSeconds)}
            hint="На одну сессию"
          />
          <MetricCard
            icon={<TriangleAlert size={20} />}
            label="Ошибки"
            value={formatNumber(summary.errors)}
            hint="За выбранный период"
          />
        </section>
        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <BreakdownPanel icon={<Smartphone size={19} />} title="Устройства" rows={data.devices} />
          <BreakdownPanel icon={<BarChart3 size={19} />} title="Браузеры" rows={data.browsers} />
          <BreakdownPanel icon={<Activity size={19} />} title="Операционные системы" rows={data.operatingSystems} />
          <BreakdownPanel
            icon={<TriangleAlert size={19} />}
            title="Причины ошибок"
            rows={data.errors.map((row) => ({ name: row.code, count: row.count }))}
            errors
          />
        </section>
        <Panel className="analytics-privacy mt-5 border-primary/25">
          <div className="flex items-start gap-3">
            <span className="metric-icon">
              <ShieldCheck size={20} />
            </span>
            <div>
              <h2 className="font-semibold">Приватность по умолчанию</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">
                Отчёт строится только по агрегатам. AR Photo не сохраняет IP-адреса, полный User-Agent, кадры камеры,
                персональные данные зрителя или подписанные ссылки на медиа. Токен сессии хранится как солёный SHA‑256.
              </p>
            </div>
          </div>
        </Panel>
      </details>
    </>
  );
}

function AnalyticsWorkList({
  items,
  loading,
  error,
  accountId,
  range,
  scope,
  scopes,
  onRetry,
}: {
  items: ArItem[];
  loading: boolean;
  error: unknown;
  accountId: string;
  range: { from: string; to: string };
  scope: AnalyticsScopeOption | null | undefined;
  scopes: AnalyticsScopeOption[];
  onRetry: () => void;
}) {
  const [page, setPage] = useState(1);
  const visible = items.filter(
    (item) =>
      !scope ||
      scope.type === "account" ||
      (scope.type === "project" && item.project_id === scope.id) ||
      (scope.type === "group" && item.group_id === scope.id) ||
      (scope.type === "item" && item.id === scope.id),
  );
  const safePage = Math.min(page, Math.max(1, Math.ceil(visible.length / 6)));
  return (
    <section className="analytics-works mt-5">
      <div className="section-heading-row">
        <h2>Мои работы</h2>
        <Link className="text-link" to="/items">
          Все AR-фото <ArrowRight size={16} />
        </Link>
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-32" />
      ) : error ? (
        <ErrorState text="Не удалось загрузить работы." action={<Button onClick={onRetry}>Повторить</Button>} />
      ) : visible.length ? (
        <>
          <div className="analytics-work-table">
            <div className="analytics-work-table-heading">
              <span>Работа</span>
              <span>Открытия</span>
              <span>Запуски AR</span>
              <span>Видео</span>
              <span />
            </div>
            {visible.slice((safePage - 1) * 6, safePage * 6).map((item) => (
              <AnalyticsWorkRow
                key={item.id}
                item={item}
                projectName={
                  scopes.find((option) => option.type === "project" && option.id === item.project_id)?.name ?? ""
                }
                accountId={accountId}
                range={range}
              />
            ))}
          </div>
          {visible.length > 6 ? (
            <div className="analytics-pagination">
              <Button variant="quiet" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                Назад
              </Button>
              <span>
                {safePage} / {Math.ceil(visible.length / 6)}
              </span>
              <Button variant="quiet" disabled={safePage * 6 >= visible.length} onClick={() => setPage(safePage + 1)}>
                Далее
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <Panel className="mt-4">
          <p className="text-sm text-muted">В выбранном разделе пока нет AR-фото.</p>
        </Panel>
      )}
    </section>
  );
}
function AnalyticsWorkRow({
  item,
  projectName,
  accountId,
  range,
}: {
  item: ArItem;
  projectName: string;
  accountId: string;
  range: { from: string; to: string };
}) {
  const location = useLocation();
  const summary = useQuery({
    queryKey: ["analytics", "summary", accountId, "item", item.id, range.from, range.to],
    queryFn: () => analyticsRepository.getSummary(accountId, { scopeType: "item", scopeId: item.id, ...range }),
    staleTime: 60_000,
  });
  const preview = useQuery({
    queryKey: ["catalog", "cover", "markers-private", item.marker_image_path],
    queryFn: () => catalogRepository.getCoverUrl(item.marker_image_path, "markers-private"),
    enabled: Boolean(item.marker_image_path),
    staleTime: 8 * 60_000,
  });
  const stat = summary.data?.summary;
  return (
    <article className="analytics-work-row">
      <div className="analytics-work-name">
        {preview.data ? (
          <img alt="" src={preview.data} loading="lazy" />
        ) : (
          <span className="analytics-work-placeholder">
            <Play size={20} />
          </span>
        )}
        <div>
          <strong>{item.title}</strong>
          <span className="analytics-project-name">{projectName}</span>
          <span className="analytics-mobile-views">
            {stat
              ? `${formatNumber(stat.playbackStarts)} просмотров`
              : summary.error
                ? "Статистика недоступна"
                : "Загружаем статистику…"}
          </span>
        </div>
      </div>
      <span aria-label="Открытия страниц">
        {stat ? formatNumber(stat.pageOpens) : summary.error ? "Недоступно" : "…"}
      </span>
      <span aria-label="Запуски AR">{stat ? formatNumber(stat.cameraStarts) : "—"}</span>
      <span aria-label="Просмотры видео">{stat ? formatNumber(stat.playbackStarts) : "—"}</span>
      <Link className="btn btn-ghost" state={captureWorkspaceOrigin(location, accountId)} to={`/items/${item.id}`}>
        Открыть <ArrowRight size={15} />
      </Link>
    </article>
  );
}

function AnalyticsChart({ series }: { series: AnalyticsSummary["series"] }) {
  const width = 760;
  const height = 250;
  const inset = 40;
  const maximum = Math.max(
    1,
    ...series.flatMap((day) => [day.sessions, day.detections, day.playbacks, day.completions]),
  );
  const colors = {
    sessions: "#8b7cff",
    detections: "#9c85ff",
    playbacks: "#5c2dff",
  } as const;
  const points = (key: keyof typeof colors) =>
    series
      .map((day, index) => {
        const x = inset + (index / Math.max(1, series.length - 1)) * (width - inset * 2);
        const y = height - inset - (day[key] / maximum) * (height - inset * 2);
        return `${round(x, 1)},${round(y, 1)}`;
      })
      .join(" ");

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted" aria-label="Легенда графика">
        {Object.entries(colors).map(([key, color]) => (
          <span className="inline-flex items-center gap-2" key={key}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {chartLabels[key as keyof typeof colors]}
          </span>
        ))}
      </div>
      <div className="analytics-chart mt-4" data-testid="analytics-chart">
        <svg
          className="h-auto w-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`График активности за ${series.length} дней`}
        >
          <title>Динамика AR-просмотров</title>
          {[0, 0.25, 0.5, 0.75, 1].map((position) => {
            const y = height - inset - position * (height - inset * 2);
            return (
              <g key={position}>
                <line x1={inset} x2={width - inset} y1={y} y2={y} stroke="#e7e4e9" />
                <text x={inset - 8} y={y + 4} textAnchor="end" fill="#666471" fontSize="11">
                  {Math.round(maximum * position)}
                </text>
              </g>
            );
          })}
          {Object.keys(colors).map((key) => (
            <polyline
              key={key}
              points={points(key as keyof typeof colors)}
              fill="none"
              stroke={colors[key as keyof typeof colors]}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
      {series.length ? (
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          <span>{formatShortDate(series[0].date)}</span>
          <span>{formatShortDate(series.at(-1)!.date)}</span>
        </div>
      ) : null}
    </div>
  );
}

const chartLabels = {
  sessions: "Сессии",
  detections: "Распознавания",
  playbacks: "Запуски",
  completions: "Досмотры",
} as const;

function Funnel({ summary }: { summary: AnalyticsSummary["summary"] }) {
  const rows = [
    ["Открыли страницу", summary.pageOpens],
    ["Запустили камеру", summary.cameraStarts],
    ["Распознали фото", summary.markerDetections],
    ["Запустили видео", summary.playbackStarts],
    ["Досмотрели", summary.completions],
  ] as const;
  return (
    <div className="mt-6 grid gap-4">
      {rows.map(([label, value]) => {
        const width = summary.pageOpens ? Math.max(value ? 5 : 0, (value / summary.pageOpens) * 100) : 0;
        return (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">{label}</span>
              <strong>{formatNumber(value)}</strong>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownPanel({
  icon,
  title,
  rows,
  errors = false,
}: {
  icon: ReactNode;
  title: string;
  rows: Array<{ name: string; count: number }>;
  errors?: boolean;
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <span className="metric-icon">{icon}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-5 grid gap-4">
        {rows.length ? (
          rows.map((row) => {
            const ratio = total ? (row.count / total) * 100 : 0;
            return (
              <div key={row.name}>
                <div className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 text-muted">
                    {errors ? (errorLabels[row.name] ?? "Другая ошибка") : (dimensionLabels[row.name] ?? row.name)}
                  </span>
                  <strong>{formatNumber(row.count)}</strong>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${ratio}%` }} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted">Нет данных за период</p>
        )}
      </div>
    </Panel>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        className="field-control mt-2"
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AnalyticsLoading() {
  return (
    <AppShell title="Аналитика" description="Загружаем защищённые агрегаты…">
      <AnalyticsDashboardSkeleton />
    </AppShell>
  );
}

function AnalyticsDashboardSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton className="h-36" key={index} />
      ))}
      <Skeleton className="h-80 sm:col-span-2 xl:col-span-3" />
    </div>
  );
}

function AnalyticsFailure({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <AppShell title="Аналитика">
      <div className="mt-6">
        <ErrorState text={readableAnalyticsError(error)} action={<Button onClick={onRetry}>Повторить</Button>} />
      </div>
    </AppShell>
  );
}

function resolveScope(scopes: AnalyticsScopeOption[], key: string, accountId?: string) {
  return (
    scopes.find((scope) => scopeKey(scope) === key) ??
    scopes.find((scope) => scope.type === "account" && scope.id === accountId) ??
    null
  );
}

function scopeKey(scope: AnalyticsScopeOption) {
  return `${scope.type}:${scope.id}`;
}

function resolveRange(preset: RangePreset, customFrom: string, customTo: string, today: Date) {
  const to = startOfUtcDay(addUtcDays(today, 1));
  if (preset !== "custom") {
    return { from: startOfUtcDay(addUtcDays(today, -(Number(preset) - 1))).toISOString(), to: to.toISOString() };
  }
  const from = parseInputDate(customFrom);
  const customEnd = parseInputDate(customTo);
  if (!from || !customEnd) return null;
  customEnd.setUTCDate(customEnd.getUTCDate() + 1);
  if (from >= customEnd || customEnd.getTime() - from.getTime() > 366 * 24 * 60 * 60 * 1000) return null;
  return { from: from.toISOString(), to: customEnd.toISOString() };
}

function parseInputDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function startOfUtcDay(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function addUtcDays(value: Date, days: number) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function inputDate(value: Date) {
  return startOfUtcDay(value).toISOString().slice(0, 10);
}

function readableAnalyticsError(error: unknown) {
  if (error instanceof AnalyticsError) return error.message;
  return "Не удалось загрузить статистику. Попробуйте ещё раз.";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatRate(value: number) {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)} сек.`;
  return `${Math.floor(seconds / 60)} мин ${Math.round(seconds % 60)} сек.`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00.000Z`),
  );
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
