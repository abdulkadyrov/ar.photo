import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  FolderPlus,
  Image,
  Layers3,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type {
  Group,
  GroupInput,
  Project,
  ProjectCategory,
  ProjectInput,
  ProjectListFilter,
  ProjectListSort,
  Workspace,
} from "../../entities/catalog/model";
import { groupFormSchema, projectCategories, projectFormSchema } from "../../entities/catalog/catalogSchemas";
import { useAuth } from "../auth/authContext";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Modal, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { CatalogError, getCatalogRepository } from "./catalogRepository";

const catalogRepository = getCatalogRepository();
const projectPageSize = 8;

const projectCategoryLabels: Record<ProjectCategory, string> = {
  graduation: "Выпускной",
  wedding: "Свадьба",
  family: "Семья",
  birthday: "День рождения",
  travel: "Путешествие",
  advertising: "Реклама",
  museum: "Музей",
  other: "Другое",
};

const projectStatusLabels = {
  draft: "Черновик",
  active: "Активный",
  archived: "В архиве",
} as const;

export function ProjectsRoute() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmation, setConfirmation] = useState<ProjectAction | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const workspaceQuery = useWorkspaceQuery(auth.session!.user.id);
  const filter = parseFilter(searchParams.get("status"));
  const sort = parseSort(searchParams.get("sort"));
  const page = parsePositiveInteger(searchParams.get("page"));
  const search = searchParams.get("search") ?? "";

  const projectsQuery = useQuery({
    queryKey: ["catalog", "projects", workspaceQuery.data?.accountId, search, filter, sort, page],
    queryFn: () =>
      catalogRepository.listProjects(workspaceQuery.data!.accountId, {
        search,
        filter,
        sort,
        page,
        pageSize: projectPageSize,
      }),
    enabled: Boolean(workspaceQuery.data),
    placeholderData: (previous) => previous,
  });

  const refreshProjects = async () => {
    await queryClient.invalidateQueries({ queryKey: ["catalog", "projects"] });
  };

  const actionMutation = useMutation({
    mutationFn: async (action: ProjectAction) => {
      const accountId = workspaceQuery.data!.accountId;
      if (action.type === "archive") return catalogRepository.archiveProject(accountId, action.project.id);
      if (action.type === "restore") return catalogRepository.restoreProject(accountId, action.project.id);
      if (action.type === "delete") return catalogRepository.softDeleteProject(accountId, action.project.id);
      return catalogRepository.restoreDeletedProject(accountId, action.project.id);
    },
    onSuccess: async (_, action) => {
      setConfirmation(null);
      setNotice({ tone: "success", title: projectActionSuccess[action.type] });
      await refreshProjects();
    },
    onError: (error) => setNotice({ tone: "error", title: readableCatalogError(error) }),
  });

  const changeParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  if (workspaceQuery.isPending) return <CatalogLoading title="Проекты" />;
  if (workspaceQuery.error) return <WorkspaceError error={workspaceQuery.error} />;
  const workspace = workspaceQuery.data;

  const totalPages = Math.max(1, Math.ceil((projectsQuery.data?.total ?? 0) / projectPageSize));

  return (
    <AppShell
      eyebrow={workspace.accountName}
      title="Проекты"
      description="Создавайте коллекции, управляйте группами и отслеживайте готовность AR-материалов."
      actions={
        <Button disabled={!workspace.canWrite} onClick={() => setCreating(true)} icon={<Plus size={18} />}>
          Создать проект
        </Button>
      }
    >
      {!workspace.canWrite ? <WorkspaceReadOnlyNotice workspace={workspace} /> : null}

      <Panel className="mt-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_210px_auto]">
          <ProjectSearchForm key={search} initialSearch={search} onSearch={(value) => changeParam("search", value)} />
          <Select
            aria-label="Статус проектов"
            label=""
            options={projectFilterOptions}
            value={filter}
            onChange={(event) => changeParam("status", event.target.value)}
          />
          <Select
            aria-label="Сортировка проектов"
            label=""
            options={projectSortOptions}
            value={sort}
            onChange={(event) => changeParam("sort", event.target.value)}
          />
          <Button
            type="button"
            variant="quiet"
            onClick={() => {
              setSearchParams({});
            }}
          >
            Сбросить
          </Button>
        </div>
      </Panel>

      {projectsQuery.isPending ? (
        <ProjectGridSkeleton />
      ) : projectsQuery.error ? (
        <div className="mt-6">
          <ErrorState
            text={readableCatalogError(projectsQuery.error)}
            action={<Button onClick={() => void projectsQuery.refetch()}>Повторить</Button>}
          />
        </div>
      ) : projectsQuery.data.items.length ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3" aria-label="Список проектов">
            {projectsQuery.data.items.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                canWrite={workspace.canWrite}
                onAction={(type) => setConfirmation({ type, project })}
                onEdit={() => setEditing(project)}
              />
            ))}
          </section>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={(nextPage) => changeParam("page", String(nextPage))}
          />
        </>
      ) : (
        <EmptyCatalog
          filtered={Boolean(search || filter !== "all")}
          canWrite={workspace.canWrite}
          onCreate={() => setCreating(true)}
        />
      )}

      <ProjectFormModal
        accountId={workspace.accountId}
        open={creating || Boolean(editing)}
        project={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={async (title) => {
          setCreating(false);
          setEditing(null);
          setNotice({ tone: "success", title });
          await refreshProjects();
        }}
      />
      <ProjectActionModal
        action={confirmation}
        pending={actionMutation.isPending}
        onClose={() => setConfirmation(null)}
        onConfirm={() => confirmation && actionMutation.mutate(confirmation)}
      />
      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6">
          <Toast {...notice} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}
    </AppShell>
  );
}

export function ProjectDetailsRoute() {
  const { projectId = "" } = useParams<{ projectId: string }>();
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [groupModal, setGroupModal] = useState<{ open: boolean; group: Group | null }>({ open: false, group: null });
  const [groupAction, setGroupAction] = useState<GroupAction | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const workspaceQuery = useWorkspaceQuery(auth.session!.user.id);
  const accountId = workspaceQuery.data?.accountId;
  const tab = searchParams.get("tab") === "settings" ? "settings" : "groups";

  const projectQuery = useQuery({
    queryKey: ["catalog", "project", accountId, projectId],
    queryFn: () => catalogRepository.getProject(accountId!, projectId),
    enabled: Boolean(accountId && projectId),
  });
  const groupsQuery = useQuery({
    queryKey: ["catalog", "groups", accountId, projectId],
    queryFn: () => catalogRepository.listGroups(accountId!, projectId),
    enabled: Boolean(accountId && projectId),
  });

  const refreshGroups = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["catalog", "groups", accountId, projectId] }),
      queryClient.invalidateQueries({ queryKey: ["catalog", "projects"] }),
    ]);
  };

  const groupActionMutation = useMutation({
    mutationFn: async (action: GroupAction) => {
      if (action.type === "archive") return catalogRepository.archiveGroup(accountId!, action.group.id);
      if (action.type === "restore") return catalogRepository.restoreGroup(accountId!, action.group.id);
      if (action.type === "delete") return catalogRepository.softDeleteGroup(accountId!, action.group.id);
      return catalogRepository.restoreDeletedGroup(accountId!, action.group.id);
    },
    onSuccess: async (_, action) => {
      setGroupAction(null);
      setNotice({ tone: "success", title: groupActionSuccess[action.type] });
      await refreshGroups();
    },
    onError: (error) => setNotice({ tone: "error", title: readableCatalogError(error) }),
  });

  if (workspaceQuery.isPending || projectQuery.isPending) return <CatalogLoading title="Проект" />;
  if (workspaceQuery.error) return <WorkspaceError error={workspaceQuery.error} />;
  if (projectQuery.error) {
    return (
      <AppShell eyebrow="Проекты" title="Проект недоступен">
        <div className="mt-8">
          <ErrorState
            text={readableCatalogError(projectQuery.error)}
            action={<Button onClick={() => navigate("/projects")}>К списку проектов</Button>}
          />
        </div>
      </AppShell>
    );
  }

  const workspace = workspaceQuery.data;
  const project = projectQuery.data;
  return (
    <AppShell
      eyebrow={projectCategoryLabels[project.category]}
      title={project.name}
      description={project.description ?? "Добавьте описание, чтобы команде было проще ориентироваться в проекте."}
      actions={
        <>
          <Button variant="quiet" onClick={() => navigate("/projects")} icon={<ArrowLeft size={17} />}>
            Проекты
          </Button>
          <Button
            disabled={!workspace.canWrite || project.status === "archived" || Boolean(project.deleted_at)}
            onClick={() => setGroupModal({ open: true, group: null })}
            icon={<Plus size={17} />}
          >
            Добавить группу
          </Button>
        </>
      }
    >
      {!workspace.canWrite ? <WorkspaceReadOnlyNotice workspace={workspace} /> : null}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <ProjectMetric icon={<Layers3 size={19} />} label="Группы" value={groupsQuery.data?.length ?? 0} />
        <ProjectMetric icon={<Image size={19} />} label="AR-работы" value="0" />
        <ProjectMetric icon={<CalendarDays size={19} />} label="Обновлён" value={formatShortDate(project.updated_at)} />
      </section>
      <div className="mt-6 flex gap-2 border-b border-line" role="tablist" aria-label="Разделы проекта">
        {(["groups", "settings"] as const).map((item) => (
          <button
            key={item}
            aria-selected={tab === item}
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === item ? "border-primary text-ink" : "border-transparent text-muted"}`}
            onClick={() => setSearchParams(item === "groups" ? {} : { tab: item })}
            role="tab"
          >
            {item === "groups" ? "Группы" : "Настройки"}
          </button>
        ))}
      </div>

      {tab === "groups" ? (
        groupsQuery.isPending ? (
          <ProjectGridSkeleton />
        ) : groupsQuery.error ? (
          <div className="mt-6">
            <ErrorState text={readableCatalogError(groupsQuery.error)} />
          </div>
        ) : groupsQuery.data.length ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Группы проекта">
            {groupsQuery.data.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                canWrite={workspace.canWrite}
                onEdit={() => setGroupModal({ open: true, group })}
                onAction={(type) => setGroupAction({ type, group })}
              />
            ))}
          </section>
        ) : (
          <EmptyGroups canWrite={workspace.canWrite} onCreate={() => setGroupModal({ open: true, group: null })} />
        )
      ) : (
        <Panel className="mt-6">
          <h2 className="text-xl font-semibold">Состояние проекта</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <Detail label="Категория" value={projectCategoryLabels[project.category]} />
            <Detail label="Статус" value={projectStatusLabels[project.status]} />
            <Detail label="Создан" value={formatDate(project.created_at)} />
            <Detail label="Обновлён" value={formatDate(project.updated_at)} />
          </dl>
        </Panel>
      )}

      <GroupFormModal
        accountId={workspace.accountId}
        projectId={project.id}
        open={groupModal.open}
        group={groupModal.group}
        onClose={() => setGroupModal({ open: false, group: null })}
        onSaved={async (title) => {
          setGroupModal({ open: false, group: null });
          setNotice({ tone: "success", title });
          await refreshGroups();
        }}
      />
      <GroupActionModal
        action={groupAction}
        pending={groupActionMutation.isPending}
        onClose={() => setGroupAction(null)}
        onConfirm={() => groupAction && groupActionMutation.mutate(groupAction)}
      />
      {notice ? (
        <div className="fixed bottom-24 right-5 z-50 lg:bottom-6">
          <Toast {...notice} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}
    </AppShell>
  );
}

function useWorkspaceQuery(userId: string) {
  return useQuery({
    queryKey: ["catalog", "workspace", userId],
    queryFn: () => catalogRepository.getWorkspace(userId),
    staleTime: 60_000,
  });
}

function ProjectFormModal({
  accountId,
  open,
  project,
  onClose,
  onSaved,
}: {
  accountId: string;
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSaved: (title: string) => Promise<void>;
}) {
  const requestId = useRef(crypto.randomUUID());
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { name: "", description: "", category: "graduation" },
  });
  const mutation = useMutation({
    mutationFn: (input: ProjectInput) =>
      project
        ? catalogRepository.updateProject(accountId, project.id, input)
        : catalogRepository.createProject(accountId, input, requestId.current),
    onSuccess: () => onSaved(project ? "Проект обновлён" : "Проект создан"),
  });

  useEffect(() => {
    if (!open) return;
    requestId.current = crypto.randomUUID();
    reset(
      project
        ? { name: project.name, description: project.description ?? "", category: project.category }
        : { name: "", description: "", category: "graduation" },
    );
  }, [open, project, reset]);

  const closeModal = () => {
    mutation.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={project ? "Редактировать проект" : "Новый проект"}
      description="Название обязательно. Категория помогает организовать каталог и будущую аналитику."
      onClose={closeModal}
      actions={
        <Button disabled={mutation.isPending} onClick={() => void handleSubmit((input) => mutation.mutate(input))()}>
          {mutation.isPending ? "Сохраняем…" : project ? "Сохранить" : "Создать проект"}
        </Button>
      }
    >
      <form className="space-y-4" onSubmit={(event) => void handleSubmit((input) => mutation.mutate(input))(event)}>
        <FormField label="Название" error={errors.name?.message}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                autoFocus
                placeholder="Например, Выпускной 2027"
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </FormField>
        <FormField label="Описание" error={errors.description?.message}>
          <textarea
            className="field-control min-h-28 resize-y"
            placeholder="Краткое описание проекта"
            {...register("description")}
          />
        </FormField>
        <FormField label="Категория" error={errors.category?.message}>
          <select className="field-control" {...register("category")}>
            {projectCategories.map((category) => (
              <option key={category} value={category}>
                {projectCategoryLabels[category]}
              </option>
            ))}
          </select>
        </FormField>
        {mutation.error ? <InlineError>{readableCatalogError(mutation.error)}</InlineError> : null}
        <button className="sr-only" type="submit">
          Сохранить
        </button>
      </form>
    </Modal>
  );
}

function GroupFormModal({
  accountId,
  projectId,
  open,
  group,
  onClose,
  onSaved,
}: {
  accountId: string;
  projectId: string;
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSaved: (title: string) => Promise<void>;
}) {
  const requestId = useRef(crypto.randomUUID());
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupInput>({ resolver: zodResolver(groupFormSchema), defaultValues: { name: "", description: "" } });
  const mutation = useMutation({
    mutationFn: (input: GroupInput) =>
      group
        ? catalogRepository.updateGroup(accountId, group.id, input)
        : catalogRepository.createGroup(accountId, projectId, input, requestId.current),
    onSuccess: () => onSaved(group ? "Группа обновлена" : "Группа создана"),
  });

  useEffect(() => {
    if (!open) return;
    requestId.current = crypto.randomUUID();
    reset(group ? { name: group.name, description: group.description ?? "" } : { name: "", description: "" });
  }, [group, open, reset]);

  const closeModal = () => {
    mutation.reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={group ? "Редактировать группу" : "Новая группа"}
      description="Например: 11А класс, Учителя или Общие фотографии."
      onClose={closeModal}
      actions={
        <Button disabled={mutation.isPending} onClick={() => void handleSubmit((input) => mutation.mutate(input))()}>
          {mutation.isPending ? "Сохраняем…" : group ? "Сохранить" : "Создать группу"}
        </Button>
      }
    >
      <form className="space-y-4" onSubmit={(event) => void handleSubmit((input) => mutation.mutate(input))(event)}>
        <FormField label="Название" error={errors.name?.message}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input autoFocus placeholder="Например, 11А класс" value={field.value} onValueChange={field.onChange} />
            )}
          />
        </FormField>
        <FormField label="Описание" error={errors.description?.message}>
          <textarea
            className="field-control min-h-28 resize-y"
            placeholder="Описание группы"
            {...register("description")}
          />
        </FormField>
        {mutation.error ? <InlineError>{readableCatalogError(mutation.error)}</InlineError> : null}
        <button className="sr-only" type="submit">
          Сохранить
        </button>
      </form>
    </Modal>
  );
}

function ProjectCard({
  project,
  canWrite,
  onEdit,
  onAction,
}: {
  project: Project & { groupCount: number; arItemCount: number };
  canWrite: boolean;
  onEdit: () => void;
  onAction: (type: ProjectAction["type"]) => void;
}) {
  const deleted = Boolean(project.deleted_at);
  return (
    <article className="surface-card overflow-hidden rounded-card border border-line shadow-soft">
      <Link
        className="group block aspect-[16/7] bg-[radial-gradient(circle_at_25%_20%,rgba(139,92,246,.34),transparent_35%),linear-gradient(145deg,#151e2d,#0b1018)] p-5"
        to={`/projects/${project.id}`}
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-black/20 text-primary transition group-hover:scale-105">
          <FolderKanban size={22} />
        </span>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={deleted ? "danger" : project.status === "active" ? "success" : "muted"}>
                {deleted ? "Удалён" : projectStatusLabels[project.status]}
              </StatusPill>
              <span className="text-xs text-muted">{projectCategoryLabels[project.category]}</span>
            </div>
            <Link
              className="mt-3 block truncate text-xl font-semibold hover:text-primary"
              to={`/projects/${project.id}`}
            >
              {project.name}
            </Link>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
              {project.description || "Описание пока не добавлено"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-xs text-muted">
          <span>{project.groupCount} групп</span>
          <span>{project.arItemCount} AR-работ</span>
          <span className="ml-auto">{formatShortDate(project.updated_at)}</span>
        </div>
        {canWrite ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {deleted ? (
              <Button variant="quiet" onClick={() => onAction("restoreDeleted")} icon={<RotateCcw size={15} />}>
                Восстановить
              </Button>
            ) : (
              <>
                <Button variant="quiet" onClick={onEdit} icon={<Pencil size={15} />}>
                  Изменить
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => onAction(project.status === "archived" ? "restore" : "archive")}
                  icon={project.status === "archived" ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                >
                  {project.status === "archived" ? "Вернуть" : "В архив"}
                </Button>
                <Button variant="danger" onClick={() => onAction("delete")} icon={<Trash2 size={15} />}>
                  Удалить
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function GroupCard({
  group,
  canWrite,
  onEdit,
  onAction,
}: {
  group: Group;
  canWrite: boolean;
  onEdit: () => void;
  onAction: (type: GroupAction["type"]) => void;
}) {
  return (
    <Panel>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-primary/10 text-primary">
          <Layers3 size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{group.name}</h3>
            {group.archived_at ? <StatusPill tone="muted">В архиве</StatusPill> : null}
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
            {group.description || "Описание пока не добавлено"}
          </p>
        </div>
      </div>
      <div className="mt-4 border-t border-line pt-4 text-xs text-muted">Позиция {group.sort_order + 1}</div>
      {canWrite ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="quiet" onClick={onEdit} icon={<Pencil size={15} />}>
            Изменить
          </Button>
          <Button
            variant="quiet"
            onClick={() => onAction(group.archived_at ? "restore" : "archive")}
            icon={group.archived_at ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          >
            {group.archived_at ? "Вернуть" : "В архив"}
          </Button>
          <Button variant="danger" onClick={() => onAction("delete")} icon={<Trash2 size={15} />}>
            Удалить
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}

type ProjectAction = { type: "archive" | "restore" | "delete" | "restoreDeleted"; project: Project };
type GroupAction = { type: "archive" | "restore" | "delete" | "restoreDeleted"; group: Group };
type Notice = { tone: "success" | "error"; title: string; message?: string };

const projectActionSuccess: Record<ProjectAction["type"], string> = {
  archive: "Проект перемещён в архив",
  restore: "Проект возвращён из архива",
  delete: "Проект перемещён в корзину",
  restoreDeleted: "Проект восстановлен",
};

const groupActionSuccess: Record<GroupAction["type"], string> = {
  archive: "Группа перемещена в архив",
  restore: "Группа возвращена из архива",
  delete: "Группа перемещена в корзину",
  restoreDeleted: "Группа восстановлена",
};

function ProjectActionModal({
  action,
  pending,
  onClose,
  onConfirm,
}: {
  action: ProjectAction | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;
  const destructive = action.type === "delete";
  return (
    <Modal
      open
      title={projectActionTitles[action.type]}
      description={
        destructive
          ? `Проект «${action.project.name}» и его содержимое перестанут отображаться в рабочем каталоге. Данные можно восстановить из корзины.`
          : `Подтвердите действие для проекта «${action.project.name}».`
      }
      onClose={onClose}
      actions={
        <Button disabled={pending} variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
          {pending ? "Выполняем…" : "Подтвердить"}
        </Button>
      }
    />
  );
}

function GroupActionModal({
  action,
  pending,
  onClose,
  onConfirm,
}: {
  action: GroupAction | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;
  const destructive = action.type === "delete";
  return (
    <Modal
      open
      title={groupActionTitles[action.type]}
      description={
        destructive
          ? `Группа «${action.group.name}» будет скрыта вместе с её AR-работами. Это soft delete, восстановление останется доступно.`
          : `Подтвердите действие для группы «${action.group.name}».`
      }
      onClose={onClose}
      actions={
        <Button disabled={pending} variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
          {pending ? "Выполняем…" : "Подтвердить"}
        </Button>
      }
    />
  );
}

const projectActionTitles: Record<ProjectAction["type"], string> = {
  archive: "Архивировать проект?",
  restore: "Вернуть проект из архива?",
  delete: "Переместить проект в корзину?",
  restoreDeleted: "Восстановить проект?",
};

const groupActionTitles: Record<GroupAction["type"], string> = {
  archive: "Архивировать группу?",
  restore: "Вернуть группу из архива?",
  delete: "Переместить группу в корзину?",
  restoreDeleted: "Восстановить группу?",
};

function CatalogLoading({ title }: { title: string }) {
  return (
    <AppShell eyebrow="AR Photo" title={title} description="Загружаем рабочее пространство и проверяем доступ.">
      <ProjectGridSkeleton />
    </AppShell>
  );
}

function ProjectGridSkeleton() {
  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Загрузка данных">
      {[0, 1, 2].map((item) => (
        <Panel key={item}>
          <Skeleton className="h-28" />
          <Skeleton className="mt-4 h-6 w-2/3" />
          <Skeleton className="mt-3 h-4" />
        </Panel>
      ))}
    </section>
  );
}

function WorkspaceError({ error }: { error: unknown }) {
  return (
    <AppShell eyebrow="Доступ" title="Рабочее пространство недоступно">
      <div className="mt-8">
        <ErrorState text={readableCatalogError(error)} />
      </div>
    </AppShell>
  );
}

function WorkspaceReadOnlyNotice({ workspace }: { workspace: Workspace }) {
  return (
    <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100">
      Доступ только для чтения. Роль: {workspace.memberRole}; подписка: {workspace.subscriptionStatus}.
    </div>
  );
}

function EmptyCatalog({
  filtered,
  canWrite,
  onCreate,
}: {
  filtered: boolean;
  canWrite: boolean;
  onCreate: () => void;
}) {
  return (
    <Panel className="mt-6 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <FolderPlus size={25} />
      </span>
      <h2 className="mt-4 text-2xl font-semibold">{filtered ? "Проекты не найдены" : "Создайте первый проект"}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
        {filtered ? "Измените поиск или фильтры." : "Проект объединяет группы и будущие AR-работы одного события."}
      </p>
      {canWrite && !filtered ? (
        <Button className="mt-5" onClick={onCreate} icon={<Plus size={17} />}>
          Создать проект
        </Button>
      ) : null}
    </Panel>
  );
}

function EmptyGroups({ canWrite, onCreate }: { canWrite: boolean; onCreate: () => void }) {
  return (
    <Panel className="mt-6 py-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Layers3 size={25} />
      </span>
      <h2 className="mt-4 text-2xl font-semibold">Групп пока нет</h2>
      <p className="mt-2 text-sm text-muted">Добавьте класс, категорию гостей или подборку фотографий.</p>
      {canWrite ? (
        <Button className="mt-5" onClick={onCreate} icon={<Plus size={17} />}>
          Добавить группу
        </Button>
      ) : null}
    </Panel>
  );
}

function ProjectSearchForm({ initialSearch, onSearch }: { initialSearch: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(initialSearch);
  return (
    <form
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value.trim());
      }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={17} />
      <Input
        aria-label="Поиск проектов"
        className="pl-10"
        placeholder="Поиск по названию"
        value={value}
        onValueChange={setValue}
      />
    </form>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Пагинация проектов" className="mt-6 flex items-center justify-center gap-3">
      <Button aria-label="Предыдущая страница" disabled={page <= 1} variant="quiet" onClick={() => onPage(page - 1)}>
        <ChevronLeft size={18} />
      </Button>
      <span className="text-sm text-muted">
        Страница {page} из {totalPages}
      </span>
      <Button
        aria-label="Следующая страница"
        disabled={page >= totalPages}
        variant="quiet"
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight size={18} />
      </Button>
    </nav>
  );
}

function ProjectMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <span className="metric-icon">{icon}</span>
        <div>
          <p className="text-xs text-muted">{label}</p>
          <strong className="mt-1 block text-lg">{value}</strong>
        </div>
      </div>
    </Panel>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1.5 block text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

function InlineError({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-3 text-sm text-rose-200" role="alert">
      {children}
    </p>
  );
}

function StatusPill({ children, tone }: { children: ReactNode; tone: "success" | "muted" | "danger" }) {
  const toneClass = {
    success: "bg-emerald-400/10 text-emerald-300",
    muted: "bg-white/[0.06] text-muted",
    danger: "bg-rose-400/10 text-rose-300",
  }[tone];
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${toneClass}`}>{children}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

const projectFilterOptions = [
  { value: "all", label: "Все активные" },
  { value: "draft", label: "Черновики" },
  { value: "active", label: "Активные" },
  { value: "archived", label: "Архив" },
  { value: "deleted", label: "Корзина" },
];

const projectSortOptions = [
  { value: "updated_desc", label: "Сначала обновлённые" },
  { value: "updated_asc", label: "Сначала старые" },
  { value: "name_asc", label: "Название А–Я" },
  { value: "name_desc", label: "Название Я–А" },
];

function parseFilter(value: string | null): ProjectListFilter {
  return ["draft", "active", "archived", "deleted"].includes(value ?? "") ? (value as ProjectListFilter) : "all";
}

function parseSort(value: string | null): ProjectListSort {
  return ["updated_asc", "name_asc", "name_desc"].includes(value ?? "") ? (value as ProjectListSort) : "updated_desc";
}

function parsePositiveInteger(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function readableCatalogError(error: unknown) {
  if (error instanceof CatalogError) {
    if (error.code === "limit_reached") return "Лимит тарифа исчерпан. Проверьте подписку и доступный остаток.";
    if (error.code === "forbidden") return "Недостаточно прав или подписка не разрешает изменения.";
    return error.message;
  }
  return "Не удалось выполнить операцию. Проверьте соединение и повторите попытку.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(new Date(value));
}
