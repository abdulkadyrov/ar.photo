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
  X,
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
  if (data.loading) return <SettingsLoading title="Настройки" />;
  if (data.error || !data.entitlements) return <SettingsErrorState title="Настройки" error={data.error} />;
  const entitlements = data.entitlements;

  return (
    <AppShell
      eyebrow={entitlements.accountName}
      title="Настройки"
      description="Аккаунт, доступ команды и действующие условия подписки в одном месте."
    >
      <SettingsNavigation />
      <SubscriptionNotice entitlements={entitlements} />

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <SettingsLinkCard
          icon={<CircleGauge size={22} />}
          title="Тариф и лимиты"
          text={`${entitlements.plan.name} · ${subscriptionLabels[entitlements.subscription.status]}`}
          to="/settings/subscription"
        />
        <SettingsLinkCard
          icon={<Users size={22} />}
          title="Команда"
          text={`${entitlements.usage.teamMembers} сотрудников · ${entitlements.usage.pendingInvitations} приглашений`}
          to="/settings/team"
        />
        <SettingsLinkCard
          icon={<ShieldCheck size={22} />}
          title="Безопасность"
          text="Второй фактор для защищённых операций"
          to="/settings/security"
        />
      </section>

      <Panel className="mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Рабочее пространство</p>
            <h2 className="mt-2 text-2xl font-semibold">{entitlements.accountName}</h2>
            <p className="mt-2 text-sm text-muted">Роль: {roleLabels[entitlements.memberRole]}</p>
          </div>
          <StatePill ok={entitlements.accountStatus === "active"}>
            {entitlements.accountStatus === "active" ? "Аккаунт активен" : "Аккаунт ограничен"}
          </StatePill>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {permissionKeys.map((permission) => (
            <div
              className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white/[0.025] px-4"
              key={permission}
            >
              {entitlements.permissions[permission] ? (
                <Check className="text-emerald-300" size={17} />
              ) : (
                <X className="text-muted" size={17} />
              )}
              <span className="text-sm">{permissionLabels[permission]}</span>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
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

  if (data.error) return <SettingsErrorState title="Тариф и лимиты" error={data.error} />;
  if (data.loading || billingQuery.isPending) return <SettingsLoading title="Тариф и лимиты" />;
  if (billingQuery.error || !data.entitlements) {
    return <SettingsErrorState title="Тариф и лимиты" error={data.error ?? billingQuery.error} />;
  }
  const entitlements = data.entitlements;

  return (
    <AppShell
      eyebrow={entitlements.accountName}
      title="Тариф и лимиты"
      description="Фактическое использование и серверные ограничения текущей подписки."
    >
      <SettingsNavigation />
      <SubscriptionNotice entitlements={entitlements} />

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Текущий тариф</p>
              <h2 className="mt-3 text-3xl font-semibold">{entitlements.plan.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {entitlements.plan.description ?? "Индивидуальные условия AR Photo"}
              </p>
            </div>
            <StatePill ok={entitlements.canWrite}>{subscriptionLabels[entitlements.subscription.status]}</StatePill>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-line pt-5 text-sm">
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
              <p className="mt-1 text-sm text-muted">Показатели рассчитываются на сервере по активным данным.</p>
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
              label="AR-работы"
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
        <div className="mt-4 rounded-2xl border border-sky-300/20 bg-sky-300/[0.055] p-4 text-sm leading-6 text-sky-100">
          <strong className="block">Продление без фиктивной оплаты</strong>
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
      title="Команда"
      description="Роли, точечные разрешения и доступ сотрудников к данным аккаунта."
      actions={
        canManageTeam ? (
          <Button disabled={!entitlements.canWrite} icon={<UserPlus size={17} />} onClick={() => setInviteOpen(true)}>
            Пригласить сотрудника
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
          <section aria-label="Сотрудники" className="mt-6 grid gap-3">
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
    { to: "/settings/subscription", label: "Тариф и лимиты" },
    { to: "/settings/team", label: "Команда" },
    { to: "/settings/security", label: "Безопасность" },
  ];
  return (
    <nav aria-label="Разделы настроек" className="mt-6 flex gap-2 overflow-x-auto pb-1">
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
      className={`mt-6 rounded-2xl border p-4 text-sm leading-6 ${writeBlocked ? "border-rose-300/20 bg-rose-300/[0.06] text-rose-100" : "border-amber-300/20 bg-amber-300/[0.06] text-amber-100"}`}
      role="status"
    >
      <strong className="block">{subscriptionLabels[status]}</strong>
      {writeBlocked
        ? "Создание и изменение материалов заблокировано сервером. Данные не удалены и доступны для просмотра."
        : `Изменения ещё доступны до ${formatDate(entitlements.subscription.gracePeriodEndsAt)}. Продлите подписку заранее.`}
    </div>
  );
}

function SettingsLinkCard({ icon, title, text, to }: { icon: ReactNode; title: string; text: string; to: string }) {
  return (
    <Link
      className="surface-card group flex items-center gap-4 rounded-card border border-line p-5 text-ink no-underline shadow-soft transition hover:border-primary/40"
      to={to}
    >
      <span className="metric-icon">{icon}</span>
      <span className="min-w-0 flex-1">
        <strong className="block text-lg">{title}</strong>
        <span className="mt-1 block text-sm text-muted">{text}</span>
      </span>
      <ChevronRight className="text-muted transition group-hover:translate-x-1 group-hover:text-primary" size={20} />
    </Link>
  );
}

function StatePill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${ok ? "bg-emerald-300/10 text-emerald-200" : "bg-amber-300/10 text-amber-100"}`}
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
        <span className={warning ? "text-amber-200" : "text-muted"}>
          {formatter(used)} / {limit === null ? "∞" : formatter(limit)}
        </span>
      </div>
      <div
        aria-label={`${label}: использовано ${percent}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percent}
        className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"
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
    <Panel className={!member.isActive ? "opacity-65" : ""}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
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
      title="Пригласить сотрудника"
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
          <p className="text-sm text-rose-300" role="alert">
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
