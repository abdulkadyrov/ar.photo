import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Camera, Clock3, ImagePlay, Layers3, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import type { ArItem } from "../../entities/ar-item/model";
import type { ProjectListItem } from "../../entities/catalog/model";
import { Button, ErrorState, Panel, Skeleton } from "../../shared/ui";
import { getArItemRepository } from "../ar-items/arItemRepository";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getSettingsRepository } from "../settings/settingsRepository";
import { captureWorkspaceOrigin } from "../ar-items/itemNavigation";
import "./DashboardPage.css";

const catalogRepository = getCatalogRepository();
const arItemRepository = getArItemRepository();
const settingsRepository = getSettingsRepository();
const itemStatuses: Record<ArItem["status"], string> = {
  draft: "Черновик",
  processing: "В обработке",
  ready: "Готово",
  published: "Опубликовано",
  failed: "Ошибка",
  suspended: "Приостановлено",
  archived: "В архиве",
};

export function DashboardRoute() {
  const auth = useAuth();
  const userId = auth.session!.user.id;
  const location = useLocation();
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", userId],
    queryFn: () => catalogRepository.getWorkspace(userId),
  });
  const accountId = workspaceQuery.data?.accountId;
  const projectsQuery = useQuery({
    queryKey: ["dashboard", "projects", accountId],
    queryFn: () =>
      catalogRepository.listProjects(accountId!, {
        search: "",
        filter: "all",
        sort: "updated_desc",
        page: 1,
        pageSize: 3,
      }),
    enabled: Boolean(accountId),
  });
  const itemsQuery = useQuery({
    queryKey: ["ar-items", accountId],
    queryFn: () => arItemRepository.listItems(accountId!),
    enabled: Boolean(accountId),
  });
  const entitlementsQuery = useQuery({
    queryKey: ["settings", "entitlements", accountId],
    queryFn: () => settingsRepository.getEntitlements(accountId!),
    enabled: Boolean(accountId),
  });
  if (workspaceQuery.isPending) return <DashboardLoading />;
  if (workspaceQuery.error)
    return (
      <AppShell title="Главная" compactMobile>
        <ErrorState
          text="Не удалось открыть кабинет."
          action={<Button onClick={() => void workspaceQuery.refetch()}>Повторить</Button>}
        />
      </AppShell>
    );
  const workspace = workspaceQuery.data;
  const entitlements = entitlementsQuery.data;
  const items = itemsQuery.data ?? [];
  const draft = items.find((item) => item.status === "draft");
  const projects = projectsQuery.data?.items ?? [];
  return (
    <AppShell
      eyebrow={workspace.accountName}
      title="Главная"
      compactMobile
      actions={
        workspace.canWrite ? (
          <Link className="btn btn-primary dashboard-top-create" to="/create">
            <Plus size={18} /> Создать AR-фото
          </Link>
        ) : undefined
      }
    >
      <section aria-label="Мой пакет" className="dashboard-summary">
        <Link to="/settings/subscription">
          <Layers3 size={22} />
          <span>
            {entitlementsQuery.isPending ? (
              "Загружаем пакет…"
            ) : entitlements ? (
              <>
                Осталось{" "}
                <strong>
                  {entitlements.limits.arItems === null
                    ? "без ограничений"
                    : Math.max(0, entitlements.limits.arItems - entitlements.usage.arItems).toLocaleString("ru")}
                </strong>
                {entitlements.limits.arItems === null ? "" : " добавлений"}
              </>
            ) : (
              "Пакет недоступен"
            )}
          </span>
        </Link>
        <Link to="/settings/subscription">
          <CalendarClock size={22} />
          <span>
            {workspace.subscriptionExpiresAt ? (
              <>
                Срок до <strong>{shortDate(workspace.subscriptionExpiresAt)}</strong>
              </>
            ) : (
              "Без даты окончания"
            )}
          </span>
        </Link>
        <Link to="/items">
          <Clock3 size={22} />
          <span>
            В обработке{" "}
            <strong>
              {itemsQuery.isPending
                ? "…"
                : itemsQuery.error
                  ? "—"
                  : items.filter((item) => item.status === "processing").length}
            </strong>
          </span>
        </Link>
      </section>
      {!workspace.canWrite ? (
        <p className="dashboard-readonly" role="status">
          Кабинет доступен для просмотра. Условия доступа — в разделе «Мой пакет».
        </p>
      ) : null}
      <Panel className="dashboard-section">
        <div className="section-heading-row">
          <h2>Недавние AR-фото</h2>
          <Link
            className="text-link"
            state={captureWorkspaceOrigin(location, accountId)}
            to={draft ? `/items/${draft.id}/edit` : "/items"}
          >
            {draft ? "Продолжить черновик" : "Все AR-фото"}
            <ArrowRight size={16} />
          </Link>
        </div>
        {itemsQuery.isPending ? (
          <Skeleton className="mt-4 h-48" />
        ) : itemsQuery.error ? (
          <ErrorState
            text="Не удалось загрузить AR-фото."
            action={<Button onClick={() => void itemsQuery.refetch()}>Повторить</Button>}
          />
        ) : items.length ? (
          <div className="dashboard-work-grid">
            {items.slice(0, 3).map((item) => (
              <RecentWork key={item.id} item={item} canWrite={workspace.canWrite} />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <Camera size={28} />
            <p>Пока нет AR-фото. Добавьте фотографию и видео, чтобы создать первую работу.</p>
          </div>
        )}
      </Panel>
      <Panel className="dashboard-section">
        <div className="section-heading-row">
          <h2>Недавние проекты</h2>
          <Link className="text-link" to="/projects">
            Все проекты <ArrowRight size={16} />
          </Link>
        </div>
        {projectsQuery.isPending ? (
          <Skeleton className="mt-4 h-32" />
        ) : projectsQuery.error ? (
          <ErrorState
            text="Не удалось загрузить проекты."
            action={<Button onClick={() => void projectsQuery.refetch()}>Повторить</Button>}
          />
        ) : projects.length ? (
          <div className="dashboard-project-list">
            {projects.map((project) => (
              <RecentProject key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="dashboard-empty-projects">
            Созданные проекты появятся здесь.{" "}
            <Link className="text-link" to="/projects">
              Перейти в проекты <ArrowRight size={15} />
            </Link>
          </p>
        )}
      </Panel>
    </AppShell>
  );
}

function Preview({ path, bucket }: { path: string | null; bucket?: string | null }) {
  const query = useQuery({
    queryKey: ["catalog", "cover", path, bucket],
    queryFn: () => catalogRepository.getCoverUrl(path, bucket),
    enabled: Boolean(path),
    staleTime: 8 * 60_000,
  });
  return query.data ? <img alt="" loading="lazy" src={query.data} /> : <ImagePlay aria-hidden="true" size={25} />;
}
function RecentWork({ item, canWrite }: { item: ArItem; canWrite: boolean }) {
  const location = useLocation();
  const origin = captureWorkspaceOrigin(location, item.account_id);
  return (
    <article className="dashboard-work">
      <Link className="dashboard-work-preview" state={origin} to={`/items/${item.id}`}>
        <Preview path={item.marker_image_path} bucket="markers-private" />
        <span className="dashboard-state">{itemStatuses[item.status]}</span>
      </Link>
      <div className="dashboard-work-copy">
        <Link className="dashboard-work-title" state={origin} to={`/items/${item.id}`}>
          {item.title}
        </Link>
        <p>
          <span>{itemStatuses[item.status]}</span> · {shortDate(item.updated_at)}
        </p>
      </div>
      <div className="dashboard-work-actions">
        {canWrite ? (
          <Link className="btn btn-ghost" state={origin} to={`/items/${item.id}/edit`}>
            Изменить
          </Link>
        ) : null}
        <Link className="btn btn-primary" state={origin} to={`/items/${item.id}`}>
          Открыть
        </Link>
      </div>
    </article>
  );
}
function RecentProject({ project }: { project: ProjectListItem }) {
  const location = useLocation();
  const origin = captureWorkspaceOrigin(location, project.account_id);
  return (
    <article className="dashboard-project-row">
      <Link className="dashboard-project-thumbnail" state={origin} to={`/projects/${project.id}`}>
        <Preview path={project.previewPath ?? project.cover_path} bucket={project.previewBucket} />
      </Link>
      <div className="dashboard-project-copy">
        <Link className="dashboard-work-title" state={origin} to={`/projects/${project.id}`}>
          {project.name}
        </Link>
        <p>
          {project.arItemCount} AR-фото · обновлён {shortDate(project.updated_at)}
        </p>
      </div>
      <span className="dashboard-state">
        {project.status === "active" ? "Активен" : project.status === "draft" ? "Черновик" : "Архив"}
      </span>
      <Link
        aria-label={`Открыть проект «${project.name}»`}
        className="btn btn-ghost"
        state={origin}
        to={`/projects/${project.id}`}
      >
        Открыть <ArrowRight size={16} />
      </Link>
    </article>
  );
}
function DashboardLoading() {
  return (
    <AppShell title="Главная" compactMobile>
      <Skeleton className="mt-6 h-20" />
      <Skeleton className="mt-5 h-64" />
      <Skeleton className="mt-5 h-40" />
    </AppShell>
  );
}
function shortDate(value: string) {
  return new Intl.DateTimeFormat("ru", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}
