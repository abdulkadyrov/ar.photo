import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Boxes,
  Building2,
  CircleAlert,
  CreditCard,
  Database,
  FileSearch,
  HardDrive,
  KeyRound,
  ListChecks,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  WandSparkles,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, MetricCard, Modal, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import {
  AdminError,
  type AdminAccount,
  type AdminAccountDetail,
  type AdminContentResult,
  type AdminPlan,
  type AdminSetting,
} from "./adminSchemas";
import { getAdminRepository } from "./adminRepository";

const adminRepository = getAdminRepository();
const tabs = [
  { id: "overview", label: "Обзор", icon: Activity },
  { id: "accounts", label: "Аккаунты", icon: Building2 },
  { id: "users", label: "Пользователь", icon: Users },
  { id: "subscriptions", label: "Подписки", icon: CreditCard },
  { id: "items", label: "Проекты и AR", icon: WandSparkles },
  { id: "errors", label: "Ошибки", icon: CircleAlert },
  { id: "audit", label: "История действий", icon: ListChecks },
  { id: "plans", label: "Тарифы", icon: Boxes },
  { id: "storage", label: "Хранилище", icon: HardDrive },
  { id: "settings", label: "Настройки", icon: Settings },
] as const;
type TabId = (typeof tabs)[number]["id"];

type ConfirmAction =
  | { kind: "account"; account: AdminAccount; nextStatus: "active" | "suspended" }
  | { kind: "item"; item: AdminContentResult; suspended: boolean }
  | { kind: "retry"; accountId: string; jobId: number; label: string }
  | { kind: "reset"; accountId: string; userId: string; label: string }
  | { kind: "user-status"; accountId: string; userId: string; label: string; active: boolean }
  | { kind: "user-delete"; accountId: string; userId: string; label: string }
  | { kind: "setting"; setting: AdminSetting; value: AdminSetting["value"] }
  | { kind: "subscription"; detail: AdminAccountDetail; planId: string; status: SubscriptionStatus; days: number };
type SubscriptionStatus = "trial" | "active" | "grace_period" | "expired" | "suspended" | "cancelled";

export function AdminRoute() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("overview");
  const [accountSearch, setAccountSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [supportAccount, setSupportAccount] = useState<AdminAccount | null>(null);
  const [supportReason, setSupportReason] = useState("");
  const [detail, setDetail] = useState<AdminAccountDetail | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [contentResults, setContentResults] = useState<AdminContentResult[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; tone: "success" | "error" } | null>(null);

  const accessQuery = useQuery({ queryKey: ["admin", "access"], queryFn: () => adminRepository.getAccess() });
  const canLoad = Boolean(accessQuery.data?.isSuperadmin && accessQuery.data.mfaVerified);
  const snapshotQuery = useQuery({
    queryKey: ["admin", "snapshot", submittedSearch],
    queryFn: () => adminRepository.getSnapshot(submittedSearch),
    enabled: canLoad,
  });

  const supportMutation = useMutation({
    mutationFn: () => adminRepository.getAccountDetail(supportAccount!.id, supportReason),
    onSuccess: (nextDetail) => {
      setDetail(nextDetail);
      setSupportAccount(null);
      setSupportReason("");
      setTab("users");
      setToast({ title: "Support access открыт", message: "Причина записана в admin audit.", tone: "success" });
      void queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!confirmAction) return;
      if (confirmAction.kind === "account") {
        await adminRepository.setAccountStatus(confirmAction.account.id, confirmAction.nextStatus, reason);
      } else if (confirmAction.kind === "item") {
        await adminRepository.setItemSuspended(
          confirmAction.item.accountId,
          confirmAction.item.arItemId,
          confirmAction.suspended,
          reason,
        );
      } else if (confirmAction.kind === "retry") {
        await adminRepository.retryProcessingJob(confirmAction.accountId, confirmAction.jobId, reason);
      } else if (confirmAction.kind === "reset") {
        await adminRepository.requestPasswordReset(confirmAction.accountId, confirmAction.userId, reason);
      } else if (confirmAction.kind === "user-status") {
        await adminRepository.setUserActive(
          confirmAction.accountId,
          confirmAction.userId,
          confirmAction.active,
          reason,
        );
      } else if (confirmAction.kind === "user-delete") {
        await adminRepository.deleteUser(confirmAction.accountId, confirmAction.userId, "УДАЛИТЬ", reason);
      } else if (confirmAction.kind === "setting") {
        await adminRepository.updateSetting(confirmAction.setting.key, confirmAction.value, reason);
      } else {
        const expiresAt = addDaysIso(confirmAction.days);
        await adminRepository.updateSubscription(confirmAction.detail.account.id, {
          planId: confirmAction.planId,
          status: confirmAction.status,
          startsAt: confirmAction.detail.subscription.startsAt,
          expiresAt,
          gracePeriodEndsAt: null,
          customLimits: confirmAction.detail.subscription.customLimits,
          reason,
        });
      }
    },
    onSuccess: async () => {
      const completedAction = confirmAction;
      const wasItem = confirmAction?.kind === "item";
      if (completedAction?.kind === "user-status") {
        setDetail((current) =>
          current
            ? {
                ...current,
                users: current.users.map((user) =>
                  user.id === completedAction.userId ? { ...user, isActive: completedAction.active } : user,
                ),
              }
            : current,
        );
      }
      if (completedAction?.kind === "user-delete") {
        setDetail((current) =>
          current ? { ...current, users: current.users.filter((user) => user.id !== completedAction.userId) } : current,
        );
      }
      setToast({ title: "Операция выполнена", message: "Изменение записано в admin audit.", tone: "success" });
      closeConfirmation();
      await queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
      if (wasItem && contentSearch.trim().length >= 2) {
        setContentResults(await adminRepository.searchContent(contentSearch));
      }
    },
  });

  const contentMutation = useMutation({
    mutationFn: () => adminRepository.searchContent(contentSearch),
    onSuccess: setContentResults,
  });

  const showError = (error: unknown) =>
    setToast({ title: "Операция отклонена", message: readableAdminError(error), tone: "error" });

  if (accessQuery.isPending) return <AdminLoading />;
  if (accessQuery.error) return <AdminFailure error={accessQuery.error} onRetry={() => void accessQuery.refetch()} />;
  if (!accessQuery.data?.isSuperadmin) {
    return (
      <AppShell
        eyebrow="Защищённые операции"
        title="Супер-админ"
        description="Доступ только для активного суперадминистратора."
      >
        <div className="mt-6">
          <ErrorState
            title="Доступ запрещён"
            text="Текущая учётная запись не является суперадминистратором AR Photo."
          />
        </div>
      </AppShell>
    );
  }
  if (!accessQuery.data.mfaVerified) {
    return <MfaRequired onVerified={() => void accessQuery.refetch()} />;
  }
  if (snapshotQuery.isPending) return <AdminLoading />;
  if (snapshotQuery.error || !snapshotQuery.data) {
    return <AdminFailure error={snapshotQuery.error} onRetry={() => void snapshotQuery.refetch()} />;
  }

  const snapshot = snapshotQuery.data;
  const openConfirm = (action: ConfirmAction) => {
    setConfirmAction(action);
    setConfirmation("");
    setReason("");
  };

  return (
    <AppShell
      eyebrow="MFA подтверждена · действия аудируются"
      title="Супер-админ"
      description="Пользователи, подписки, проекты и системные события AR Photo в одном защищённом пространстве."
      actions={
        <Button variant="quiet" icon={<RefreshCw size={17} />} onClick={() => void snapshotQuery.refetch()}>
          Обновить
        </Button>
      }
    >
      <Panel className="mt-6 p-2">
        <nav aria-label="Разделы admin-панели" className="flex gap-2 overflow-x-auto p-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${tab === item.id ? "bg-primary text-white" : "text-muted hover:bg-white/[0.04] hover:text-ink"}`}
                onClick={() => setTab(item.id)}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>
      </Panel>

      {tab === "overview" ? <OverviewSection snapshot={snapshot} /> : null}
      {tab === "accounts" ? (
        <AccountsSection
          accounts={snapshot.accounts.items}
          search={accountSearch}
          onSearch={setAccountSearch}
          onSubmit={() => setSubmittedSearch(accountSearch.trim())}
          onCreate={() => setCreateOpen(true)}
          onSupport={setSupportAccount}
          onStatus={(account) =>
            openConfirm({
              kind: "account",
              account,
              nextStatus: account.status === "suspended" ? "active" : "suspended",
            })
          }
        />
      ) : null}
      {tab === "users" ? (
        <UsersSection
          detail={detail}
          onReset={(userId, label) => openConfirm({ kind: "reset", accountId: detail!.account.id, userId, label })}
          onStatus={(userId, label, active) =>
            openConfirm({ kind: "user-status", accountId: detail!.account.id, userId, label, active })
          }
          onDelete={(userId, label) =>
            openConfirm({ kind: "user-delete", accountId: detail!.account.id, userId, label })
          }
        />
      ) : null}
      {tab === "subscriptions" ? (
        <SubscriptionsSection
          key={detail?.account.id ?? "no-account"}
          detail={detail}
          plans={snapshot.plans}
          onEdit={(planId, status, days) =>
            openConfirm({ kind: "subscription", detail: detail!, planId, status, days })
          }
        />
      ) : null}
      {tab === "plans" ? <PlansSection plans={snapshot.plans} onCreate={() => setPlanOpen(true)} /> : null}
      {tab === "storage" ? <StorageSection accounts={snapshot.accounts.items} /> : null}
      {tab === "items" ? (
        <ItemsSection
          search={contentSearch}
          results={contentResults}
          pending={contentMutation.isPending}
          error={contentMutation.error}
          onSearch={setContentSearch}
          onSubmit={() => contentMutation.mutate()}
          onSuspend={(item) => openConfirm({ kind: "item", item, suspended: item.arItemStatus !== "suspended" })}
        />
      ) : null}
      {tab === "errors" ? (
        <ErrorsSection
          errors={snapshot.errors.items}
          onRetry={(error) =>
            openConfirm({ kind: "retry", accountId: error.accountId, jobId: error.id, label: error.arItemTitle })
          }
        />
      ) : null}
      {tab === "audit" ? <AuditSection audit={snapshot.audit.items} /> : null}
      {tab === "settings" ? (
        <SettingsSection
          settings={snapshot.settings}
          onChange={(setting, value) => openConfirm({ kind: "setting", setting, value })}
        />
      ) : null}

      <SupportModal
        account={supportAccount}
        reason={supportReason}
        pending={supportMutation.isPending}
        error={supportMutation.error}
        onReason={setSupportReason}
        onClose={() => {
          setSupportAccount(null);
          setSupportReason("");
          supportMutation.reset();
        }}
        onSubmit={() => supportMutation.mutate()}
      />
      <ConfirmModal
        action={confirmAction}
        confirmation={confirmation}
        reason={reason}
        pending={actionMutation.isPending}
        error={actionMutation.error}
        onConfirmation={setConfirmation}
        onReason={setReason}
        onClose={closeConfirmation}
        onSubmit={() => actionMutation.mutate(undefined, { onError: showError })}
      />
      <CreateAccountModal
        open={createOpen}
        plans={snapshot.plans}
        onClose={() => setCreateOpen(false)}
        onSuccess={async () => {
          setCreateOpen(false);
          setToast({
            title: "Аккаунт создан",
            message: "Владельцу отправлено приглашение без передачи пароля администратору.",
            tone: "success",
          });
          await queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
        }}
      />
      <CreatePlanModal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        onSuccess={async () => {
          setPlanOpen(false);
          setToast({ title: "Тариф сохранён", message: "Изменение записано в admin audit.", tone: "success" });
          await queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
        }}
      />
      {toast ? (
        <Toast title={toast.title} message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      ) : null}
    </AppShell>
  );

  function closeConfirmation() {
    setConfirmAction(null);
    setConfirmation("");
    setReason("");
    actionMutation.reset();
  }
}

function OverviewSection({ snapshot }: { snapshot: Awaited<ReturnType<typeof adminRepository.getSnapshot>> }) {
  const overview = snapshot.overview;
  return (
    <>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Сводка супер-админа">
        <MetricCard
          icon={<Building2 size={20} />}
          label="Аккаунты"
          value={overview.accounts.total}
          hint={`${overview.accounts.suspended} приостановлено`}
        />
        <MetricCard
          icon={<Users size={20} />}
          label="Пользователи"
          value={overview.users.active}
          hint={`${overview.users.total} всего`}
        />
        <MetricCard
          icon={<HardDrive size={20} />}
          label="Хранилище"
          value={formatBytes(overview.storageBytes)}
          hint={`${overview.arItems} AR-работ`}
        />
        <MetricCard
          icon={<CircleAlert size={20} />}
          label="Ошибки обработки"
          value={overview.failedJobs}
          hint={`${overview.publishedItems} опубликовано`}
        />
      </section>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel>
          <SectionTitle icon={<ShieldCheck size={19} />} title="Защита операций" />
          <p className="mt-3 text-sm leading-6 text-muted">
            Данные доступны только активному супер-админу после MFA. Пароли и их хэши отсутствуют во всех контрактах.
          </p>
        </Panel>
        <Panel>
          <SectionTitle icon={<FileSearch size={19} />} title="Доступ поддержки" />
          <p className="mt-3 text-sm leading-6 text-muted">
            Открытие карточки требует причину от 10 символов. Администратор, аккаунт, причина и время сохраняются в
            неизменяемой истории действий.
          </p>
        </Panel>
      </div>
    </>
  );
}

function AccountsSection({
  accounts,
  search,
  onSearch,
  onSubmit,
  onCreate,
  onSupport,
  onStatus,
}: {
  accounts: AdminAccount[];
  search: string;
  onSearch: (value: string) => void;
  onSubmit: () => void;
  onCreate: () => void;
  onSupport: (account: AdminAccount) => void;
  onStatus: (account: AdminAccount) => void;
}) {
  return (
    <Panel className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Аккаунты пользователей</h2>
          <p className="mt-1 text-sm text-muted">Поиск, просмотр по указанной причине и безопасная блокировка.</p>
        </div>
        <Button icon={<UserPlus size={17} />} onClick={onCreate}>
          Создать аккаунт
        </Button>
      </div>
      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Input
          aria-label="Поиск аккаунтов"
          placeholder="Название, slug или UUID"
          value={search}
          onValueChange={onSearch}
        />
        <Button type="submit" variant="ghost">
          Найти
        </Button>
      </form>
      <div className="mt-5 grid gap-3">
        {accounts.map((account) => (
          <article key={account.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{account.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {account.slug} · {account.planName ?? "Без тарифа"}
                </p>
              </div>
              <StatusPill tone={account.status === "active" ? "success" : "danger"}>{account.status}</StatusPill>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-3">
              <span>{formatBytes(account.storageUsedBytes)}</span>
              <span>{account.arItemCount} AR-работ</span>
              <span>{account.failedJobCount} ошибок</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => onSupport(account)}>
                Открыть с причиной
              </Button>
              <Button variant={account.status === "active" ? "danger" : "quiet"} onClick={() => onStatus(account)}>
                {account.status === "active" ? "Приостановить" : "Восстановить"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function UsersSection({
  detail,
  onReset,
  onStatus,
  onDelete,
}: {
  detail: AdminAccountDetail | null;
  onReset: (userId: string, label: string) => void;
  onStatus: (userId: string, label: string, active: boolean) => void;
  onDelete: (userId: string, label: string) => void;
}) {
  if (!detail)
    return (
      <EmptyAdminSection
        title="Пользователь не выбран"
        text="Откройте аккаунт в разделе «Аккаунты» и укажите причину доступа."
      />
    );
  return (
    <Panel className="mt-6">
      <SectionTitle icon={<Users size={19} />} title={`Пользователи · ${detail.account.name}`} />
      <p className="mt-2 text-sm text-muted">
        Пароли недоступны администратору. Можно отправить письмо сброса, заблокировать или удалить допустимого
        пользователя.
      </p>
      <div className="mt-5 grid gap-3">
        {detail.users.map((user) => (
          <article key={user.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{user.fullName ?? "Без имени"}</h3>
                  <StatusPill tone={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Активен" : "Заблокирован"}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {user.emailDisplay ?? "Email скрыт"} · {user.role}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <Button
                variant="quiet"
                icon={<KeyRound size={16} />}
                onClick={() => onReset(user.id, user.fullName ?? "пользователь")}
              >
                Сбросить пароль
              </Button>
              <Button
                variant={user.isActive ? "danger" : "quiet"}
                icon={user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                onClick={() => onStatus(user.id, user.fullName ?? "пользователь", !user.isActive)}
                disabled={!user.acceptedAt}
              >
                {user.isActive ? "Заблокировать" : "Разблокировать"}
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 size={16} />}
                onClick={() => onDelete(user.id, user.fullName ?? "пользователь")}
                disabled={user.role === "owner"}
                title={user.role === "owner" ? "Сначала назначьте другого владельца аккаунта" : "Удалить пользователя"}
              >
                Удалить
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function SubscriptionsSection({
  detail,
  plans,
  onEdit,
}: {
  detail: AdminAccountDetail | null;
  plans: AdminPlan[];
  onEdit: (planId: string, status: SubscriptionStatus, days: number) => void;
}) {
  const [planId, setPlanId] = useState(detail?.subscription.planId ?? plans[0]?.id ?? "");
  const [status, setStatus] = useState<SubscriptionStatus>(detail?.subscription.status ?? "active");
  const [days, setDays] = useState("90");
  if (!detail)
    return <EmptyAdminSection title="Подписка не выбрана" text="Сначала откройте аккаунт и укажите причину доступа." />;
  return (
    <Panel className="mt-6">
      <SectionTitle icon={<CreditCard size={19} />} title={`Подписка · ${detail.account.name}`} />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Select
          label="Тариф"
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
          options={plans.map((plan) => ({ value: plan.id, label: plan.name }))}
        />
        <Select
          label="Статус"
          value={status}
          onChange={(event) => setStatus(event.target.value as SubscriptionStatus)}
          options={["trial", "active", "grace_period", "expired", "suspended", "cancelled"].map((value) => ({
            value,
            label: value,
          }))}
        />
        <LabeledInput label="Продлить на дней" type="number" min="1" max="730" value={days} onChange={setDays} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Особые лимиты:{" "}
          {Object.keys(detail.subscription.customLimits).length
            ? JSON.stringify(detail.subscription.customLimits)
            : "по тарифу"}
        </p>
        <Button
          variant={status === "suspended" ? "danger" : "primary"}
          onClick={() => onEdit(planId, status, Math.max(1, Number(days) || 90))}
        >
          Проверить и применить
        </Button>
      </div>
    </Panel>
  );
}

function PlansSection({ plans, onCreate }: { plans: AdminPlan[]; onCreate: () => void }) {
  return (
    <Panel className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle icon={<Boxes size={19} />} title="Тарифы" />
        <Button onClick={onCreate}>Новый тариф</Button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-line p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">{plan.name}</h3>
              <StatusPill tone={plan.isActive ? "success" : "muted"}>
                {plan.isActive ? "Активен" : "Отключён"}
              </StatusPill>
            </div>
            <p className="mt-2 text-sm text-muted">
              {plan.code} · {plan.projectLimit ?? "∞"} проектов · {plan.teamLimit ?? "∞"} сотрудников
            </p>
            <p className="mt-2 text-sm text-muted">Хранилище: {formatBytes(plan.storageLimitBytes ?? 0)}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function StorageSection({ accounts }: { accounts: AdminAccount[] }) {
  return (
    <Panel className="mt-6">
      <SectionTitle icon={<Database size={19} />} title="Использование хранилища" />
      <div className="mt-5 grid gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-2xl border border-line p-4">
            <div className="flex justify-between gap-3">
              <span className="font-semibold">{account.name}</span>
              <span className="text-sm text-muted">{formatBytes(account.storageUsedBytes)}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, Math.max(3, account.storageUsedBytes / 1_073_741_824))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ItemsSection({
  search,
  results,
  pending,
  error,
  onSearch,
  onSubmit,
  onSuspend,
}: {
  search: string;
  results: AdminContentResult[];
  pending: boolean;
  error: unknown;
  onSearch: (value: string) => void;
  onSubmit: () => void;
  onSuspend: (item: AdminContentResult) => void;
}) {
  return (
    <Panel className="mt-6">
      <SectionTitle icon={<WandSparkles size={19} />} title="Проекты и AR-работы" />
      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Input
          aria-label="Поиск проектов и AR-работ"
          placeholder="Проект, группа, работа или UUID"
          value={search}
          onValueChange={onSearch}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Ищем…" : "Найти"}
        </Button>
      </form>
      {error ? (
        <p className="mt-3 text-sm text-rose-700" role="alert">
          {readableAdminError(error)}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3">
        {results.map((item) => (
          <article
            key={item.arItemId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line p-4"
          >
            <div>
              <h3 className="font-semibold">{item.arItemTitle}</h3>
              <p className="mt-1 text-sm text-muted">
                {item.accountName} · {item.projectName} · {item.groupName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill tone={item.arItemStatus === "suspended" ? "danger" : "success"}>
                {item.arItemStatus}
              </StatusPill>
              <Button variant={item.arItemStatus === "suspended" ? "quiet" : "danger"} onClick={() => onSuspend(item)}>
                {item.arItemStatus === "suspended" ? "Восстановить" : "Приостановить"}
              </Button>
            </div>
          </article>
        ))}
        {!results.length ? (
          <p className="text-sm text-muted">Введите минимум два символа для поиска по всем клиентским проектам.</p>
        ) : null}
      </div>
    </Panel>
  );
}

function ErrorsSection({
  errors,
  onRetry,
}: {
  errors: Awaited<ReturnType<typeof adminRepository.getSnapshot>>["errors"]["items"];
  onRetry: (error: Awaited<ReturnType<typeof adminRepository.getSnapshot>>["errors"]["items"][number]) => void;
}) {
  return (
    <Panel className="mt-6">
      <SectionTitle icon={<CircleAlert size={19} />} title="Ошибки обработки" />
      <div className="mt-5 grid gap-3">
        {errors.map((error) => (
          <article key={error.id} className="rounded-2xl border border-line p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h3 className="font-semibold">{error.arItemTitle}</h3>
                <p className="mt-1 text-sm text-muted">
                  {error.accountName} · {error.type}
                </p>
              </div>
              <StatusPill tone="danger">{error.errorCode}</StatusPill>
            </div>
            <p className="mt-3 text-sm text-muted">{error.errorMessage}</p>
            <div className="mt-4">
              <Button variant="ghost" onClick={() => onRetry(error)}>
                Повторить задачу
              </Button>
            </div>
          </article>
        ))}
        {!errors.length ? <p className="text-sm text-muted">Необработанных ошибок нет.</p> : null}
      </div>
    </Panel>
  );
}

function AuditSection({ audit }: { audit: Awaited<ReturnType<typeof adminRepository.getSnapshot>>["audit"]["items"] }) {
  return (
    <Panel className="mt-6">
      <SectionTitle icon={<ListChecks size={19} />} title="История действий" />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="pb-3">Время</th>
              <th className="pb-3">Actor</th>
              <th className="pb-3">Action</th>
              <th className="pb-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {audit.map((log) => (
              <tr key={log.id} className="border-t border-line">
                <td className="py-3 text-muted">{formatDate(log.createdAt)}</td>
                <td className="py-3">{log.actorName ?? log.actorUserId}</td>
                <td className="py-3 font-mono text-xs text-primary">{log.action}</td>
                <td className="py-3 text-muted">{log.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SettingsSection({
  settings,
  onChange,
}: {
  settings: AdminSetting[];
  onChange: (setting: AdminSetting, value: AdminSetting["value"]) => void;
}) {
  const [retention, setRetention] = useState(
    String(settings.find((item) => item.key === "analytics_retention_days")?.value ?? 90),
  );
  return (
    <Panel className="mt-6">
      <SectionTitle icon={<Settings size={19} />} title="Protected system settings" />
      <div className="mt-5 grid gap-3">
        {settings.map((setting) => (
          <article key={setting.key} className="rounded-2xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-mono text-sm font-semibold text-primary">{setting.key}</h3>
                <p className="mt-1 text-sm text-muted">{setting.description}</p>
              </div>
              {typeof setting.value === "boolean" ? (
                <Button variant={setting.value ? "danger" : "quiet"} onClick={() => onChange(setting, !setting.value)}>
                  {setting.value ? "Выключить" : "Включить"}
                </Button>
              ) : setting.key === "analytics_retention_days" ? (
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Analytics retention days"
                    className="w-28"
                    type="number"
                    min="30"
                    max="730"
                    value={retention}
                    onValueChange={setRetention}
                  />
                  <Button variant="ghost" onClick={() => onChange(setting, Number(retention))}>
                    Изменить
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-muted">{String(setting.value) || "Не задано"}</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function SupportModal({
  account,
  reason,
  pending,
  error,
  onReason,
  onClose,
  onSubmit,
}: {
  account: AdminAccount | null;
  reason: string;
  pending: boolean;
  error: unknown;
  onReason: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal
      open={Boolean(account)}
      title={`Support access: ${account?.name ?? ""}`}
      description="Причина будет сохранена вместе с actor, account и временем."
      onClose={onClose}
      actions={
        <Button disabled={pending || reason.trim().length < 10} onClick={onSubmit}>
          {pending ? "Открываем…" : "Открыть аккаунт"}
        </Button>
      }
    >
      <LabeledInput
        label="Причина обращения"
        placeholder="Например, обращение SUPPORT-1042"
        value={reason}
        onChange={onReason}
      />
      {error ? (
        <p className="mt-3 text-sm text-rose-700" role="alert">
          {readableAdminError(error)}
        </p>
      ) : null}
    </Modal>
  );
}

function ConfirmModal({
  action,
  confirmation,
  reason,
  pending,
  error,
  onConfirmation,
  onReason,
  onClose,
  onSubmit,
}: {
  action: ConfirmAction | null;
  confirmation: string;
  reason: string;
  pending: boolean;
  error: unknown;
  onConfirmation: (value: string) => void;
  onReason: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const word = actionWord(action);
  return (
    <Modal
      open={Boolean(action)}
      title={actionTitle(action)}
      description={`Опасная операция требует причину и точный ввод «${word}».`}
      onClose={onClose}
      actions={
        <Button
          variant={
            action?.kind === "account" ||
            action?.kind === "item" ||
            action?.kind === "user-status" ||
            action?.kind === "user-delete"
              ? "danger"
              : "primary"
          }
          disabled={pending || reason.trim().length < 10 || confirmation !== word}
          onClick={onSubmit}
        >
          {pending ? "Выполняем…" : "Подтвердить"}
        </Button>
      }
    >
      <div className="grid gap-4">
        <LabeledInput label="Причина" placeholder="Номер обращения и основание" value={reason} onChange={onReason} />
        <LabeledInput label={`Введите ${word}`} value={confirmation} onChange={onConfirmation} />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-rose-700" role="alert">
          {readableAdminError(error)}
        </p>
      ) : null}
    </Modal>
  );
}

function CreateAccountModal({
  open,
  plans,
  onClose,
  onSuccess,
}: {
  open: boolean;
  plans: AdminPlan[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [slug, setSlug] = useState("");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      adminRepository.createAccount({ email, fullName, accountName, accountSlug: slug, planId, reason }),
    onSuccess,
  });
  return (
    <Modal
      open={open}
      title="Создать аккаунт и владельца"
      description="Владельцу отправляется Auth invitation. Администратор не создаёт и не видит пароль."
      onClose={onClose}
      actions={
        <Button disabled={mutation.isPending || reason.trim().length < 10} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Создаём…" : "Создать и пригласить"}
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <LabeledInput label="Email владельца" type="email" value={email} onChange={setEmail} />
        <LabeledInput label="Имя владельца" value={fullName} onChange={setFullName} />
        <LabeledInput label="Название аккаунта" value={accountName} onChange={setAccountName} />
        <LabeledInput label="Slug" placeholder="studio-name" value={slug} onChange={setSlug} />
        <div className="sm:col-span-2">
          <Select
            label="Тариф"
            value={planId}
            onChange={(event) => setPlanId(event.target.value)}
            options={plans.map((plan) => ({ value: plan.id, label: plan.name }))}
          />
        </div>
        <div className="sm:col-span-2">
          <LabeledInput label="Причина создания" value={reason} onChange={setReason} />
        </div>
      </div>
      {mutation.error ? (
        <p className="mt-3 text-sm text-rose-700" role="alert">
          {readableAdminError(mutation.error)}
        </p>
      ) : null}
    </Modal>
  );
}

function CreatePlanModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      adminRepository.upsertPlan({
        code,
        name,
        description: "Тариф AR Photo",
        storageLimitBytes: 107_374_182_400,
        projectLimit: 100,
        groupLimit: 1000,
        arItemLimit: 10_000,
        videoDurationLimitSeconds: 600,
        maxVideoSizeBytes: 524_288_000,
        teamLimit: 20,
        isActive: true,
        reason,
      }),
    onSuccess,
  });
  return (
    <Modal
      open={open}
      title="Новый тариф"
      description="Лимиты применяются сервером; изменение записывается в audit."
      onClose={onClose}
      actions={
        <Button disabled={mutation.isPending || reason.trim().length < 10} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Сохраняем…" : "Создать тариф"}
        </Button>
      }
    >
      <div className="grid gap-4">
        <LabeledInput label="Код тарифа" placeholder="agency" value={code} onChange={setCode} />
        <LabeledInput label="Название" placeholder="Agency" value={name} onChange={setName} />
        <LabeledInput label="Причина" value={reason} onChange={setReason} />
      </div>
      {mutation.error ? (
        <p className="mt-3 text-sm text-rose-700" role="alert">
          {readableAdminError(mutation.error)}
        </p>
      ) : null}
    </Modal>
  );
}

function MfaRequired({ onVerified }: { onVerified: () => void }) {
  const [code, setCode] = useState("");
  const mutation = useMutation({ mutationFn: () => adminRepository.verifyMfa(code), onSuccess: onVerified });
  return (
    <AppShell
      eyebrow="Protected operations"
      title="Требуется MFA"
      description="Admin RPC доступны только с assurance level aal2."
    >
      <Panel className="mt-6 max-w-2xl">
        <SectionTitle icon={<ShieldCheck size={20} />} title="Подтвердите второй фактор" />
        <p className="mt-3 text-sm leading-6 text-muted">
          Введите код подтверждённого TOTP-фактора. До успешного challenge клиентские данные и mutations не загружаются.
        </p>
        <form
          className="mt-5 flex max-w-sm gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <Input
            aria-label="Код MFA"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onValueChange={setCode}
          />
          <Button type="submit" disabled={mutation.isPending}>
            Подтвердить
          </Button>
        </form>
        {mutation.error ? (
          <p className="mt-3 text-sm text-rose-700" role="alert">
            {readableAdminError(mutation.error)}
          </p>
        ) : null}
      </Panel>
    </AppShell>
  );
}

function AdminLoading() {
  return (
    <AppShell eyebrow="Защищённые операции" title="Супер-админ" description="Проверяем MFA и загружаем данные.">
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Panel key={index}>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-9 w-20" />
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
function AdminFailure({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <AppShell eyebrow="Защищённые операции" title="Супер-админ" description="Безопасная операционная панель.">
      <div className="mt-6">
        <ErrorState
          title="Admin-панель недоступна"
          text={readableAdminError(error)}
          action={<Button onClick={onRetry}>Повторить</Button>}
        />
      </div>
    </AppShell>
  );
}
function EmptyAdminSection({ title, text }: { title: string; text: string }) {
  return (
    <Panel className="mt-6 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </Panel>
  );
}
function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}
function LabeledInput({
  label,
  value,
  onChange,
  ...props
}: { label: string; value: string; onChange: (value: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>
      <Input {...props} className="mt-2" value={value} onValueChange={onChange} />
    </label>
  );
}
function StatusPill({ tone, children }: { tone: "success" | "danger" | "muted"; children: ReactNode }) {
  const colors =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "danger"
        ? "bg-rose-50 text-rose-700"
        : "bg-stone-100 text-muted";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}>{children}</span>;
}
function actionWord(action: ConfirmAction | null) {
  if (!action) return "";
  if (action.kind === "retry") return "ПОВТОРИТЬ";
  if (action.kind === "reset") return "СБРОС";
  if (action.kind === "user-delete") return "УДАЛИТЬ";
  if (action.kind === "user-status") return action.active ? "РАЗБЛОКИРОВАТЬ" : "ЗАБЛОКИРОВАТЬ";
  if (action.kind === "setting" || action.kind === "subscription") return "ИЗМЕНИТЬ";
  return action.kind === "account"
    ? action.nextStatus === "suspended"
      ? "ПРИОСТАНОВИТЬ"
      : "ВОССТАНОВИТЬ"
    : action.suspended
      ? "ПРИОСТАНОВИТЬ"
      : "ВОССТАНОВИТЬ";
}
function actionTitle(action: ConfirmAction | null) {
  if (!action) return "Подтвердить";
  if (action.kind === "account")
    return `${action.nextStatus === "suspended" ? "Приостановить" : "Восстановить"} ${action.account.name}?`;
  if (action.kind === "item")
    return `${action.suspended ? "Приостановить" : "Восстановить"} ${action.item.arItemTitle}?`;
  if (action.kind === "retry") return `Повторить processing: ${action.label}?`;
  if (action.kind === "reset") return `Отправить сброс: ${action.label}?`;
  if (action.kind === "user-status") return `${action.active ? "Разблокировать" : "Заблокировать"} ${action.label}?`;
  if (action.kind === "user-delete") return `Безвозвратно удалить ${action.label}?`;
  if (action.kind === "setting") return `Изменить ${action.setting.key}?`;
  return `Изменить подписку ${action.detail.account.name}?`;
}
function readableAdminError(error: unknown) {
  if (error instanceof AdminError) return error.message;
  if (error instanceof Error) return error.message;
  return "Не удалось выполнить admin-операцию";
}
function formatBytes(value: number) {
  if (value >= 1_073_741_824)
    return `${(value / 1_073_741_824).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} ГБ`;
  return `${Math.round(value / 1_048_576).toLocaleString("ru-RU")} МБ`;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
function addDaysIso(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
