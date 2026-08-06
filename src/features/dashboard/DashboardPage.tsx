import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Camera, FolderKanban, ImagePlay, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import type { Project } from "../../entities/catalog/model";
import { ErrorState, MetricCard, Panel, Skeleton } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";

const catalogRepository = getCatalogRepository();

export function DashboardRoute() {
  const auth = useAuth();
  const userId = auth.session!.user.id;
  const workspaceQuery = useQuery({
    queryKey: ["dashboard", "workspace", userId],
    queryFn: () => catalogRepository.getWorkspace(userId),
  });
  const projectsQuery = useQuery({
    queryKey: ["dashboard", "projects", workspaceQuery.data?.accountId],
    queryFn: () =>
      catalogRepository.listProjects(workspaceQuery.data!.accountId, {
        search: "",
        filter: "all",
        sort: "updated_desc",
        page: 1,
        pageSize: 6,
      }),
    enabled: Boolean(workspaceQuery.data),
  });

  if (workspaceQuery.isPending) return <DashboardLoading />;
  if (workspaceQuery.error) {
    return (
      <AppShell title="Главная" description="Ваше пространство AR Photo">
        <div className="mt-6">
          <ErrorState text="Не удалось открыть рабочее пространство. Повторите попытку немного позже." />
        </div>
      </AppShell>
    );
  }

  const workspace = workspaceQuery.data;
  const projects = projectsQuery.data?.items ?? [];
  const arItems = projects.reduce((sum, project) => sum + project.arItemCount, 0);
  const expiration = workspace.subscriptionExpiresAt
    ? new Intl.DateTimeFormat("ru", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(workspace.subscriptionExpiresAt),
      )
    : "Без ограничения";

  return (
    <AppShell
      eyebrow={workspace.accountName}
      title="Главная"
      description="Создайте оживающую фотографию — загрузку, обработку и QR-код AR Photo подготовит автоматически."
      actions={
        <Link className="btn btn-primary" to="/create">
          <Plus size={18} /> Создать AR-фото
        </Link>
      }
    >
      <section className="dashboard-hero" aria-labelledby="dashboard-hero-title">
        <div>
          <span className="dashboard-hero-kicker">
            <Sparkles size={15} /> Фото + видео = готовый WebAR
          </span>
          <h2 id="dashboard-hero-title">Оживите важный момент</h2>
          <p>Добавьте одну фотографию и одно видео. Через несколько минут вы получите QR-код для просмотра.</p>
          <div className="dashboard-hero-actions">
            <Link className="btn btn-primary" to="/create">
              <Camera size={18} /> Создать AR-фото
            </Link>
            <Link className="btn btn-ghost" to="/projects">
              Мои проекты <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className="dashboard-hero-art" aria-hidden="true">
          <span className="dashboard-art-photo" />
          <span className="dashboard-art-play">
            <ImagePlay size={30} />
          </span>
          <span className="dashboard-art-spark">✦</span>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Сводка кабинета">
        <MetricCard
          icon={<FolderKanban size={20} />}
          label="Проекты"
          value={projectsQuery.data?.total ?? 0}
          hint="В вашем кабинете"
        />
        <MetricCard icon={<ImagePlay size={20} />} label="AR-фото" value={arItems} hint="В последних проектах" />
        <MetricCard
          icon={<Sparkles size={20} />}
          label="Статус"
          value={subscriptionLabel(workspace.subscriptionStatus)}
          hint={workspace.canWrite ? "Создание доступно" : "Только просмотр"}
        />
        <MetricCard icon={<CalendarClock size={20} />} label="Доступ до" value={expiration} hint="Период подписки" />
      </section>

      <section className="mt-7" aria-labelledby="recent-projects-title">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">Продолжить работу</p>
            <h2 id="recent-projects-title">Недавние проекты</h2>
          </div>
          <Link className="text-link" to="/projects">
            Все проекты <ArrowRight size={16} />
          </Link>
        </div>
        {projectsQuery.isPending ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton className="h-64" key={item} />
            ))}
          </div>
        ) : projects.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <RecentProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <Panel className="mt-4 dashboard-empty">
            <span className="dashboard-empty-icon">
              <Camera size={25} />
            </span>
            <h3>Первое AR-фото можно создать прямо сейчас</h3>
            <p>Не нужно заранее создавать проект или группу — достаточно названия, фотографии и видео.</p>
            <Link className="btn btn-primary" to="/create">
              <Plus size={17} /> Создать AR-фото
            </Link>
          </Panel>
        )}
      </section>
    </AppShell>
  );
}

function RecentProjectCard({ project }: { project: Project & { groupCount: number; arItemCount: number } }) {
  const coverQuery = useQuery({
    queryKey: ["catalog", "cover", project.cover_path],
    queryFn: () => catalogRepository.getCoverUrl(project.cover_path),
    enabled: Boolean(project.cover_path),
    staleTime: 8 * 60_000,
  });
  return (
    <article className="dashboard-project-card">
      <Link className="dashboard-project-cover" to={`/projects/${project.id}`}>
        {coverQuery.data ? <img alt="" src={coverQuery.data} /> : <FolderKanban size={28} />}
        <span className={`project-state project-state-${project.status}`}>{projectStatus(project.status)}</span>
      </Link>
      <div>
        <Link className="dashboard-project-title" to={`/projects/${project.id}`}>
          {project.name}
        </Link>
        <p>
          {project.arItemCount} AR-фото · обновлён {shortDate(project.updated_at)}
        </p>
      </div>
    </article>
  );
}

function DashboardLoading() {
  return (
    <AppShell title="Главная" description="Подготавливаем ваш кабинет">
      <Skeleton className="mt-6 h-64" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton className="h-32" key={item} />
        ))}
      </div>
    </AppShell>
  );
}

function projectStatus(status: Project["status"]) {
  return status === "active" ? "Активен" : status === "archived" ? "Архив" : "Черновик";
}

function subscriptionLabel(status: string) {
  const labels: Record<string, string> = {
    trial: "Пробный",
    active: "Активна",
    grace_period: "Льготный период",
    expired: "Истекла",
    suspended: "Приостановлена",
    cancelled: "Отменена",
  };
  return labels[status] ?? status;
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("ru", { day: "numeric", month: "short" }).format(new Date(value));
}
