import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  CircleGauge,
  Clock3,
  FolderKanban,
  HardDrive,
  KeyRound,
  Layers3,
  MailPlus,
  Pencil,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  WandSparkles,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Modal, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { useAuth } from "../auth/authContext";
import { getBillingProvider } from "./billingProvider";
import { getSettingsRepository, SettingsError } from "./settingsRepository";
import {
  accountSettingsSchema,
  type AccountSettings,
  defaultPermissions,
  inviteTeamMemberSchema,
  normalizePermissions,
  permissionCanBeEnabled,
  permissionKeys,
  type AccountEntitlements,
  type AssignableMemberRole,
  type InviteTeamMemberInput,
  type Permissions,
  type TeamMember,
} from "./settingsSchemas";
import "./SettingsPages.css";

const catalogRepository = getCatalogRepository();
const settingsRepository = getSettingsRepository();
const billingProvider = getBillingProvider();

const roleLabels = {
  owner: "Владелец",
  manager: "Менеджер",
  editor: "Редактор",
  viewer: "Наблюдатель",
  superadmin: "Суперадминистратор",
} as const;

const permissionLabels: Record<(typeof permissionKeys)[number], string> = {
  upload: "Загрузка файлов",
  edit: "Редактирование",
  publish: "Публикация",
  delete: "Удаление",
  analytics: "Статистика",
  manage_groups: "Управление группами",
  manage_team: "Управление командой",
};

const subscriptionLabels = {
  trial: "Пробный период",
  active: "Активна",
  grace_period: "Льготный период",
  expired: "Истекла",
  suspended: "Приостановлена",
  cancelled: "Отменена",
} as const;

type Notice = { title: string; message?: string; tone: "success" | "error" };

export function SettingsRoute() {
  const data = useSettingsData();
  const accountId = data.workspace?.accountId;
  const settingsQuery = useQuery({
    queryKey: ["settings", "account", accountId],
    queryFn: () => settingsRepository.getAccountSettings(accountId!),
    enabled: Boolean(accountId),
  });
  if (data.loading || settingsQuery.isPending) return <SettingsLoading title="Настройки аккаунта" />;
  if (data.error || settingsQuery.error || !data.entitlements || !settingsQuery.data)
    return <SettingsErrorState title="Настройки аккаунта" error={data.error ?? settingsQuery.error} />;
  return (
    <AppShell
      eyebrow={data.entitlements.accountName}
      title="Настройки аккаунта"
      description="Основные параметры вашей студии"
      compactMobile
    >
      <SettingsNavigation />
      <SubscriptionNotice entitlements={data.entitlements} />
      <AccountSettingsForm settings={settingsQuery.data} entitlements={data.entitlements} />
    </AppShell>
  );
}

function AccountSettingsForm({
  settings,
  entitlements,
}: {
  settings: AccountSettings;
  entitlements: AccountEntitlements;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const canEdit = entitlements.canWrite && ["owner", "manager", "superadmin"].includes(entitlements.memberRole);
  const parsed = accountSettingsSchema.safeParse(form);
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);
  const saveMutation = useMutation({
    mutationFn: () => settingsRepository.updateAccountSettings(entitlements.accountId, form),
    onSuccess: async (next) => {
      setForm(next);
      setSaved(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["settings"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog", "workspace"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
  const reloadMutation = useMutation({
    mutationFn: () => settingsRepository.getAccountSettings(entitlements.accountId),
    onSuccess: (next) => {
      queryClient.setQueryData(["settings", "account", entitlements.accountId], next);
      setForm(next);
      setSaved(false);
      saveMutation.reset();
    },
  });
  const editingLocked = !canEdit || saveMutation.isPending || reloadMutation.isPending;
  const change = (next: AccountSettings) => {
    setSaved(false);
    setForm(next);
  };
  return (
    <form
      className="account-settings-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!editingLocked && dirty && parsed.success) saveMutation.mutate();
      }}
    >
      <Panel>
        <h2>Основная информация</h2>
        <label>
          <span>
            Название студии <span aria-hidden="true">*</span>
          </span>
          <Input
            aria-label="Название студии"
            disabled={editingLocked}
            maxLength={120}
            value={form.name}
            onValueChange={(name) => change({ ...form, name })}
          />
        </label>
        <label>
          <span>Описание</span>
          <textarea
            className="field-control"
            disabled={editingLocked}
            rows={3}
            maxLength={160}
            value={form.description}
            onChange={(event) => change({ ...form, description: event.target.value })}
          />
          <small>{form.description.length} / 160</small>
        </label>
      </Panel>
      <Panel>
        <h2>Язык интерфейса</h2>
        <div className="account-setting-language">
          <span>Язык</span>
          <span>Русский</span>
        </div>
      </Panel>
      <Panel>
        <h2>Уведомления</h2>
        <p className="settings-helper">
          Сохранённые предпочтения. Доставка уведомлений появится после подключения сервиса.
        </p>
        {(
          [
            ["projects", "Обновления по проектам", "Готовность AR-фото и изменения публикаций"],
            ["team", "События команды", "Приглашения и изменения состава"],
            ["news", "Новости KHANZAMA", "Новые возможности сервиса"],
          ] as const
        ).map(([key, title, text]) => (
          <label className="account-notification-row" key={key}>
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-label={title}
              disabled={editingLocked}
              checked={form.notifications[key]}
              onChange={(event) =>
                change({ ...form, notifications: { ...form.notifications, [key]: event.target.checked } })
              }
            />
          </label>
        ))}
      </Panel>
      <Link className="account-settings-link" to="/settings/team">
        <Users size={21} />
        <span>Команда и безопасность</span>
        <ChevronRight size={18} />
      </Link>
      {!canEdit ? (
        <p className="settings-helper">Изменять настройки может владелец или менеджер студии с действующим пакетом.</p>
      ) : null}
      {!parsed.success ? (
        <p role="alert" className="text-sm text-rose-700">
          {parsed.error.issues[0]?.message}
        </p>
      ) : null}
      {saveMutation.error ? (
        <p role="alert" className="text-sm text-rose-700">
          {readableError(saveMutation.error)}
        </p>
      ) : null}
      {saveMutation.error instanceof SettingsError && saveMutation.error.code === "conflict" ? (
        <div>
          <p className="settings-helper">Загрузка актуальных настроек заменит несохранённый ввод в этой форме.</p>
          <Button type="button" variant="quiet" disabled={editingLocked} onClick={() => reloadMutation.mutate()}>
            {reloadMutation.isPending ? "Загружаем…" : "Загрузить актуальные настройки"}
          </Button>
        </div>
      ) : null}
      {reloadMutation.error ? (
        <p role="alert" className="text-sm text-rose-700">
          {readableError(reloadMutation.error)}
        </p>
      ) : null}
      {saved ? (
        <p className="settings-saved" role="status">
          <Check size={16} />
          Настройки сохранены
        </p>
      ) : null}
      <div className="account-settings-actions">
        <Button type="submit" disabled={editingLocked || !dirty || !parsed.success}>
          {saveMutation.isPending ? "Сохраняем…" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={editingLocked || !dirty}
          onClick={() => {
            setForm(settings);
            setSaved(false);
            saveMutation.reset();
          }}
        >
          Отменить
        </Button>
      </div>
    </form>
  );
}

export function SubscriptionRoute() {
  const data = useSettingsData();
  const accountId = data.workspace?.accountId;
  const billingQuery = useQuery({
    queryKey: ["settings", "billing", accountId],
    queryFn: () => billingProvider.getAvailability(accountId!),
    enabled: Boolean(accountId),
  });

  if (data.error) return <SettingsErrorState title="Мой пакет" error={data.error} />;
  if (data.loading || billingQuery.isPending) return <SettingsLoading title="Мой пакет" />;
  if (billingQuery.error || !data.entitlements) {
    return <SettingsErrorState title="Мой пакет" error={data.error ?? billingQuery.error} />;
  }
  const entitlements = data.entitlements;

  return (
    <AppShell
      eyebrow={entitlements.accountName}
      title="Мой пакет"
      description="Текущий пакет, остатки и дополнительные возможности для вашего аккаунта."
      compactMobile
    >
      <SettingsNavigation />
      <SubscriptionNotice entitlements={entitlements} />

      <section className="package-summary mt-5">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Текущий пакет</p>
              <h2 className="mt-3 text-3xl font-semibold">{entitlements.plan.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {entitlements.plan.description ?? "Индивидуальные условия AR Photo"}
              </p>
            </div>
            <StatePill ok={entitlements.canWrite}>{subscriptionLabels[entitlements.subscription.status]}</StatePill>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-sm">
            <TextFact
              label="Осталось добавлений фото"
              value={
                entitlements.limits.arItems === null
                  ? "Без ограничений"
                  : String(Math.max(0, entitlements.limits.arItems - entitlements.usage.arItems))
              }
            />
            <DateFact label="Начало" value={entitlements.subscription.startsAt} />
            <DateFact label="Окончание" value={entitlements.subscription.expiresAt} />
            <DateFact label="Льготный период до" value={entitlements.subscription.gracePeriodEndsAt} />
            <TextFact label="Максимальный файл" value={formatLimit(entitlements.limits.maxVideoBytes, formatBytes)} />
            <TextFact
              label="Длительность видео"
              value={formatLimit(entitlements.limits.videoDurationSeconds, (value) => `${value} сек.`)}
            />
          </dl>
        </Panel>

        <Panel>
          <div className="flex items-center gap-3">
            <span className="metric-icon">
              <CircleGauge size={20} />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Использование</h2>
              <p className="mt-1 text-sm text-muted">
                Добавления фото расходуются при создании AR-работы и не возвращаются после удаления. Хранилище и
                остальные показатели считаются по текущим данным.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-5">
            <UsageMeter
              label="Хранилище"
              icon={<HardDrive size={17} />}
              used={entitlements.usage.storageBytes}
              limit={entitlements.limits.storageBytes}
              formatter={formatBytes}
            />
            <UsageMeter
              label="Проекты"
              icon={<FolderKanban size={17} />}
              used={entitlements.usage.projects}
              limit={entitlements.limits.projects}
            />
            <UsageMeter
              label="Группы"
              icon={<Layers3 size={17} />}
              used={entitlements.usage.groups}
              limit={entitlements.limits.groups}
            />
            <UsageMeter
              label="Использовано добавлений AR-фото"
              icon={<WandSparkles size={17} />}
              used={entitlements.usage.arItems}
              limit={entitlements.limits.arItems}
            />
            <UsageMeter
              label="Сотрудники"
              icon={<Users size={17} />}
              used={entitlements.usage.teamMembers}
              limit={entitlements.limits.teamMembers}
            />
          </div>
        </Panel>
      </section>

      {billingQuery.data?.status === "available" ? (
        <Panel className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Управление оплатой</h2>
            <p className="mt-1 text-sm text-muted">Платёжный кабинет провайдера доступен по защищённой ссылке.</p>
          </div>
          <a className="btn btn-primary" href={billingQuery.data.portalUrl} rel="noreferrer">
            Открыть кабинет
          </a>
        </Panel>
      ) : (
        <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/[0.055] p-4 text-sm leading-6 text-sky-800">
          <strong className="block">Дополнения и продление</strong>
          {billingQuery.data?.message}
        </div>
      )}
    </AppShell>
  );
}

export function TeamRoute() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberAction, setMemberAction] = useState<{ member: TeamMember; nextActive: boolean } | null>(null);
  const [revokingInvitation, setRevokingInvitation] = useState<{ id: string; email: string } | null>(null);
  const data = useSettingsData();
  const accountId = data.workspace?.accountId;
  const pendingQuery = useQuery({
    queryKey: ["settings", "pending-invitations", auth.session!.user.id],
    queryFn: () => settingsRepository.getPendingInvitations(),
  });
  const canManageTeam = data.entitlements?.permissions.manage_team ?? false;
  const rosterQuery = useQuery({
    queryKey: ["settings", "team", accountId],
    queryFn: () => settingsRepository.getTeamRoster(accountId!),
    enabled: Boolean(accountId && canManageTeam),
  });

  const refreshTeam = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["settings"] }),
      queryClient.invalidateQueries({ queryKey: ["catalog", "workspace"] }),
    ]);
  };
  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => settingsRepository.acceptInvitation(invitationId),
    onSuccess: async () => {
      await refreshTeam();
      setNotice({ title: "Приглашение принято", message: "Рабочее пространство обновлено.", tone: "success" });
    },
    onError: (error) =>
      setNotice({ title: "Не удалось принять приглашение", message: readableError(error), tone: "error" }),
  });
  const inviteMutation = useMutation({
    mutationFn: (input: InviteTeamMemberInput) => settingsRepository.inviteMember(accountId!, input),
    onSuccess: async (result) => {
      await refreshTeam();
      setInviteOpen(false);
      setNotice({
        title: "Приглашение создано",
        message:
          result.delivery === "email"
            ? "Письмо отправлено сотруднику."
            : "Приглашение доступно сотруднику в приложении.",
        tone: "success",
      });
    },
    onError: (error) => setNotice({ title: "Приглашение не создано", message: readableError(error), tone: "error" }),
  });
  const updateMutation = useMutation({
    mutationFn: (input: { memberId: string; role: AssignableMemberRole; permissions: Permissions }) =>
      settingsRepository.updateMember(accountId!, input.memberId, input.role, input.permissions),
    onSuccess: async () => {
      await refreshTeam();
      setEditingMember(null);
      setNotice({ title: "Права сотрудника сохранены", tone: "success" });
    },
    onError: (error) => setNotice({ title: "Права не сохранены", message: readableError(error), tone: "error" }),
  });
  const activeMutation = useMutation({
    mutationFn: ({ memberId, isActive }: { memberId: string; isActive: boolean }) =>
      settingsRepository.setMemberActive(accountId!, memberId, isActive),
    onSuccess: async (_, input) => {
      await refreshTeam();
      setMemberAction(null);
      setNotice({
        title: input.isActive ? "Доступ сотрудника восстановлен" : "Доступ сотрудника отключён",
        tone: "success",
      });
    },
    onError: (error) => setNotice({ title: "Доступ не изменён", message: readableError(error), tone: "error" }),
  });
  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => settingsRepository.revokeInvitation(accountId!, invitationId),
    onSuccess: async () => {
      await refreshTeam();
      setRevokingInvitation(null);
      setNotice({ title: "Приглашение отозвано", tone: "success" });
    },
    onError: (error) => setNotice({ title: "Приглашение не отозвано", message: readableError(error), tone: "error" }),
  });

  if (data.loading || pendingQuery.isPending || (canManageTeam && rosterQuery.isPending)) {
    return <SettingsLoading title="Команда" />;
  }
  if (pendingQuery.error) return <SettingsErrorState title="Команда" error={pendingQuery.error} />;
  if (data.error || !data.entitlements) {
    if (pendingQuery.data?.length) {
      return (
        <AppShell
          eyebrow="Приглашения"
          title="Присоединиться к команде"
          description="Выберите рабочее пространство, к которому хотите присоединиться."
        >
          <PendingInvitations
            invitations={pendingQuery.data}
            loading={acceptMutation.isPending}
            onAccept={(id) => acceptMutation.mutate(id)}
          />
        </AppShell>
      );
    }
    return <SettingsErrorState title="Команда" error={data.error} />;
  }
  const entitlements = data.entitlements;

  return (
    <AppShell
      eyebrow={entitlements.accountName}
      title="Моя команда"
      description="Участники вашей студии и совместная работа над проектами"
      compactMobile
      actions={
        canManageTeam ? (
          <Button disabled={!entitlements.canWrite} icon={<UserPlus size={17} />} onClick={() => setInviteOpen(true)}>
            Пригласить участника
          </Button>
        ) : undefined
      }
    >
      <SettingsNavigation />
      {notice ? (
        <div className="fixed right-5 top-5 z-50">
          <Toast {...notice} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}
      {pendingQuery.data?.length ? (
        <PendingInvitations
          invitations={pendingQuery.data}
          loading={acceptMutation.isPending}
          onAccept={(id) => acceptMutation.mutate(id)}
        />
      ) : null}
      <SubscriptionNotice entitlements={entitlements} />

      {!canManageTeam ? (
        <div className="mt-6">
          <ErrorState
            title="Управление командой недоступно"
            text="Ваша роль не содержит разрешение «Управление командой». Состав команды скрыт сервером."
          />
        </div>
      ) : rosterQuery.error || !rosterQuery.data ? (
        <div className="mt-6">
          <ErrorState text={readableError(rosterQuery.error)} />
        </div>
      ) : (
        <>
          <TeamUsage entitlements={entitlements} />
          <section aria-label="Сотрудники" className="team-members mt-5">
            {rosterQuery.data.members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                protectedMember={
                  member.role === "owner" ||
                  member.email?.toLowerCase() === auth.session!.user.email.toLowerCase() ||
                  (member.role === "manager" && entitlements.memberRole !== "owner")
                }
                onEdit={() => setEditingMember(member)}
                onToggle={() => setMemberAction({ member, nextActive: !member.isActive })}
              />
            ))}
          </section>

          <Panel className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Ожидают принятия</h2>
                <p className="mt-1 text-sm text-muted">
                  Приглашения действуют ограниченное время и учитываются в лимите.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {rosterQuery.data.invitations.length}
              </span>
            </div>
            {rosterQuery.data.invitations.length ? (
              <div className="mt-5 grid gap-3">
                {rosterQuery.data.invitations.map((invitation) => (
                  <div
                    className="flex flex-col gap-3 rounded-2xl border border-line bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between"
                    key={invitation.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{invitation.email}</p>
                      <p className="mt-1 text-xs text-muted">
                        {roleLabels[invitation.role]} · до {formatDate(invitation.expiresAt)}
                      </p>
                    </div>
                    <Button
                      variant="quiet"
                      onClick={() => setRevokingInvitation({ id: invitation.id, email: invitation.email })}
                    >
                      Отозвать
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-muted">Активных приглашений нет.</p>
            )}
          </Panel>
        </>
      )}

      {inviteOpen ? (
        <InviteMemberModal
          open
          loading={inviteMutation.isPending}
          onClose={() => setInviteOpen(false)}
          onSubmit={(input) => inviteMutation.mutate(input)}
        />
      ) : null}
      {editingMember ? (
        <EditMemberModal
          member={editingMember}
          loading={updateMutation.isPending}
          onClose={() => setEditingMember(null)}
          onSubmit={(role, permissions) => updateMutation.mutate({ memberId: editingMember.id, role, permissions })}
        />
      ) : null}
      <Modal
        open={Boolean(memberAction)}
        title={memberAction?.nextActive ? "Восстановить доступ?" : "Отключить сотрудника?"}
        description={
          memberAction?.nextActive
            ? "Сотрудник снова сможет работать в аккаунте в рамках своей роли."
            : "Сессия потеряет доступ к данным аккаунта. Материалы сотрудника сохранятся."
        }
        onClose={() => setMemberAction(null)}
        actions={
          <Button
            variant={memberAction?.nextActive ? "primary" : "danger"}
            disabled={activeMutation.isPending}
            onClick={() =>
              memberAction &&
              activeMutation.mutate({ memberId: memberAction.member.id, isActive: memberAction.nextActive })
            }
          >
            {activeMutation.isPending ? "Сохраняем…" : memberAction?.nextActive ? "Восстановить" : "Отключить"}
          </Button>
        }
      />
      <Modal
        open={Boolean(revokingInvitation)}
        title="Отозвать приглашение?"
        description={
          revokingInvitation ? `${revokingInvitation.email} больше не сможет принять это приглашение.` : undefined
        }
        onClose={() => setRevokingInvitation(null)}
        actions={
          <Button
            variant="danger"
            disabled={revokeMutation.isPending}
            onClick={() => revokingInvitation && revokeMutation.mutate(revokingInvitation.id)}
          >
            {revokeMutation.isPending ? "Отзываем…" : "Отозвать"}
          </Button>
        }
      />
    </AppShell>
  );
}

function useSettingsData() {
  const auth = useAuth();
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", auth.session!.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
  });
  const entitlementsQuery = useQuery({
    queryKey: ["settings", "entitlements", workspaceQuery.data?.accountId],
    queryFn: () => settingsRepository.getEntitlements(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });
  return {
    workspace: workspaceQuery.data,
    entitlements: entitlementsQuery.data,
    loading: workspaceQuery.isPending || (Boolean(workspaceQuery.data) && entitlementsQuery.isPending),
    error: workspaceQuery.error ?? entitlementsQuery.error,
  };
}

function SettingsNavigation() {
  const links = [
    { to: "/settings", label: "Аккаунт", end: true },
    { to: "/settings/subscription", label: "Мой пакет" },
    { to: "/settings/team", label: "Команда" },
    { to: "/settings/security", label: "Безопасность" },
  ];
  return (
    <nav aria-label="Разделы настроек" className="settings-navigation">
      {links.map((link) => (
        <NavLink
          className={({ isActive }) => `btn whitespace-nowrap ${isActive ? "btn-primary" : "btn-quiet"}`}
          end={link.end}
          key={link.to}
          to={link.to}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

function SubscriptionNotice({ entitlements }: { entitlements: AccountEntitlements }) {
  const status = entitlements.subscription.status;
  if (status === "active" || status === "trial") return null;
  const writeBlocked = !entitlements.canWrite;
  return (
    <div
      className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${writeBlocked ? "border-rose-300/20 bg-rose-300/[0.06] text-rose-800" : "border-amber-300/20 bg-amber-300/[0.06] text-amber-800"}`}
      role="status"
    >
      <strong className="block">{subscriptionLabels[status]}</strong>
      {writeBlocked
        ? "Создание и изменение материалов заблокировано сервером. Данные не удалены и доступны для просмотра."
        : `Изменения ещё доступны до ${formatDate(entitlements.subscription.gracePeriodEndsAt)}. Продлите подписку заранее.`}
    </div>
  );
}

function StatePill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${ok ? "bg-emerald-300/10 text-emerald-700" : "bg-amber-300/10 text-amber-800"}`}
    >
      {ok ? <BadgeCheck size={15} /> : <Clock3 size={15} />}
      {children}
    </span>
  );
}

function UsageMeter({
  label,
  icon,
  used,
  limit,
  formatter = formatCount,
}: {
  label: string;
  icon: ReactNode;
  used: number;
  limit: number | null;
  formatter?: (value: number) => string;
}) {
  const percent = limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const warning = percent >= 85;
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          {icon}
          {label}
        </span>
        <span className={warning ? "text-amber-700" : "text-muted"}>
          {formatter(used)} / {limit === null ? "без лимита по пакету" : formatter(limit)}
        </span>
      </div>
      <div
        aria-label={`${label}: использовано ${percent}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percent}
        className="settings-usage-track"
        role="progressbar"
      >
        <div
          className={`h-full rounded-full ${warning ? "bg-amber-300" : "bg-gradient-to-r from-primary to-violet-400"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function TeamUsage({ entitlements }: { entitlements: AccountEntitlements }) {
  const used = entitlements.usage.teamMembers + entitlements.usage.pendingInvitations;
  return (
    <Panel className="mt-6">
      <div className="flex items-center gap-3">
        <span className="metric-icon">
          <Users size={20} />
        </span>
        <div>
          <h2 className="text-xl font-semibold">Места в команде</h2>
          <p className="mt-1 text-sm text-muted">Активные сотрудники и ожидающие приглашения.</p>
        </div>
      </div>
      <div className="mt-5">
        <UsageMeter label="Занято" icon={<UserCheck size={17} />} used={used} limit={entitlements.limits.teamMembers} />
      </div>
    </Panel>
  );
}

function MemberCard({
  member,
  protectedMember,
  onEdit,
  onToggle,
}: {
  member: TeamMember;
  protectedMember: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <Panel className={`team-member ${!member.isActive ? "opacity-65" : ""}`}>
      <div className="team-member-row">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 font-semibold uppercase text-primary">
          {initials(member.fullName ?? member.email ?? "AR")}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{member.fullName ?? "Без имени"}</h2>
          <p className="truncate text-sm text-muted">{member.email ?? "Email скрыт"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatePill ok={member.isActive}>{member.isActive ? "Активен" : "Отключён"}</StatePill>
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {roleLabels[member.role]}
          </span>
        </div>
        {!protectedMember ? (
          <div className="flex gap-2">
            <Button variant="quiet" icon={<Pencil size={16} />} onClick={onEdit}>
              Права
            </Button>
            <Button
              variant={member.isActive ? "danger" : "ghost"}
              icon={member.isActive ? <UserMinus size={16} /> : <UserCheck size={16} />}
              onClick={onToggle}
            >
              {member.isActive ? "Отключить" : "Включить"}
            </Button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <ShieldCheck size={16} /> Защищённая роль
          </span>
        )}
      </div>
    </Panel>
  );
}

function PendingInvitations({
  invitations,
  loading,
  onAccept,
}: {
  invitations: Array<{ id: string; accountName: string; role: AssignableMemberRole; expiresAt: string }>;
  loading: boolean;
  onAccept: (id: string) => void;
}) {
  return (
    <Panel className="mt-6 border-primary/30">
      <div className="flex items-center gap-3">
        <span className="metric-icon">
          <MailPlus size={20} />
        </span>
        <div>
          <h2 className="text-xl font-semibold">Ваши приглашения</h2>
          <p className="mt-1 text-sm text-muted">Принятие меняет рабочее пространство профиля.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {invitations.map((invitation) => (
          <div
            className="flex flex-col gap-3 rounded-2xl border border-line p-4 sm:flex-row sm:items-center sm:justify-between"
            key={invitation.id}
          >
            <div>
              <strong>{invitation.accountName}</strong>
              <p className="mt-1 text-xs text-muted">
                {roleLabels[invitation.role]} · до {formatDate(invitation.expiresAt)}
              </p>
            </div>
            <Button disabled={loading} onClick={() => onAccept(invitation.id)}>
              {loading ? "Принимаем…" : "Принять"}
            </Button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function InviteMemberModal({
  open,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: InviteTeamMemberInput) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableMemberRole>("editor");
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions("editor"));
  const [validationError, setValidationError] = useState("");
  const changeRole = (nextRole: AssignableMemberRole) => {
    setRole(nextRole);
    setPermissions(defaultPermissions(nextRole));
  };
  const submit = () => {
    const result = inviteTeamMemberSchema.safeParse({
      email,
      role,
      permissions: normalizePermissions(role, permissions),
    });
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? "Проверьте данные приглашения");
      return;
    }
    setValidationError("");
    onSubmit(result.data);
  };
  return (
    <Modal
      open={open}
      title="Пригласить участника"
      description="Письмо отправляет защищённая серверная функция. Приглашение занимает место в тарифе."
      onClose={onClose}
      actions={
        <Button disabled={loading} icon={<MailPlus size={16} />} onClick={submit}>
          {loading ? "Отправляем…" : "Отправить приглашение"}
        </Button>
      }
    >
      <div className="grid gap-4">
        <label className="text-sm font-semibold">
          Email
          <Input
            className="mt-2"
            autoComplete="email"
            placeholder="employee@example.com"
            type="email"
            value={email}
            onValueChange={setEmail}
          />
        </label>
        {validationError ? (
          <p className="text-sm text-rose-700" role="alert">
            {validationError}
          </p>
        ) : null}
        <Select
          label="Роль"
          value={role}
          onChange={(event) => changeRole(event.target.value as AssignableMemberRole)}
          options={[
            { value: "manager", label: "Менеджер" },
            { value: "editor", label: "Редактор" },
            { value: "viewer", label: "Наблюдатель" },
          ]}
        />
        <PermissionEditor role={role} permissions={permissions} onChange={setPermissions} />
      </div>
    </Modal>
  );
}

function EditMemberModal({
  member,
  loading,
  onClose,
  onSubmit,
}: {
  member: TeamMember;
  loading: boolean;
  onClose: () => void;
  onSubmit: (role: AssignableMemberRole, permissions: Permissions) => void;
}) {
  const initialRole = member.role === "owner" ? "manager" : member.role;
  const [role, setRole] = useState<AssignableMemberRole>(initialRole);
  const [permissions, setPermissions] = useState<Permissions>(member.permissions);
  const changeRole = (nextRole: AssignableMemberRole) => {
    setRole(nextRole);
    setPermissions(normalizePermissions(nextRole, permissions));
  };
  return (
    <Modal
      open
      title={`Права: ${member.fullName ?? member.email ?? "сотрудник"}`}
      description="Ограничения роли дополнительно проверяются сервером."
      onClose={onClose}
      actions={
        <Button
          disabled={loading}
          icon={<KeyRound size={16} />}
          onClick={() => onSubmit(role, normalizePermissions(role, permissions))}
        >
          {loading ? "Сохраняем…" : "Сохранить права"}
        </Button>
      }
    >
      <div className="grid gap-4">
        <Select
          label="Роль"
          value={role}
          onChange={(event) => changeRole(event.target.value as AssignableMemberRole)}
          options={[
            { value: "manager", label: "Менеджер" },
            { value: "editor", label: "Редактор" },
            { value: "viewer", label: "Наблюдатель" },
          ]}
        />
        <PermissionEditor role={role} permissions={permissions} onChange={setPermissions} />
      </div>
    </Modal>
  );
}

function PermissionEditor({
  role,
  permissions,
  onChange,
}: {
  role: AssignableMemberRole;
  permissions: Permissions;
  onChange: (next: Permissions) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Разрешения</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {permissionKeys.map((permission) => {
          const available = permissionCanBeEnabled(role, permission);
          return (
            <label
              className={`flex min-h-12 items-center gap-3 rounded-xl border border-line px-3 text-sm ${available ? "cursor-pointer" : "opacity-45"}`}
              key={permission}
            >
              <input
                checked={available && permissions[permission]}
                disabled={!available}
                type="checkbox"
                onChange={(event) => onChange({ ...permissions, [permission]: event.target.checked })}
              />
              <span>{permissionLabels[permission]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SettingsLoading({ title }: { title: string }) {
  return (
    <AppShell eyebrow="AR Photo" title={title} description="Проверяем права и действующие ограничения.">
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel>
          <Skeleton className="h-32" />
        </Panel>
        <Panel>
          <Skeleton className="h-32" />
        </Panel>
      </div>
    </AppShell>
  );
}

function SettingsErrorState({ title, error }: { title: string; error: unknown }) {
  return (
    <AppShell eyebrow="Доступ" title={title}>
      <div className="mt-8">
        <ErrorState text={readableError(error)} />
      </div>
    </AppShell>
  );
}

function DateFact({ label, value }: { label: string; value: string | null }) {
  return <TextFact label={label} value={formatDate(value)} />;
}
function TextFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value))
    : "Без срока";
}
function formatBytes(value: number) {
  if (value < 1024) return `${value} Б`;
  const units = ["КБ", "МБ", "ГБ", "ТБ"];
  let size = value;
  let index = -1;
  do {
    size /= 1024;
    index += 1;
  } while (size >= 1024 && index < units.length - 1);
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(size)} ${units[index]}`;
}
function formatCount(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}
function formatLimit(limit: number | null, formatter: (value: number) => string) {
  return limit === null ? "Без лимита" : formatter(limit);
}
function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}
function readableError(error: unknown) {
  if (error instanceof SettingsError) return error.message;
  if (error instanceof Error) return error.message;
  return "Не удалось загрузить настройки";
}
