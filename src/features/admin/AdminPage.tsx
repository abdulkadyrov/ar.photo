import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Modal, Panel, Select, Skeleton, Toast } from "../../shared/ui";
import {
  AdminError,
  type AdminAccount,
  type AdminAccountDetail,
  type AdminContentResult,
  type AdminPlan,
  type AdminSetting,
} from "./adminSchemas";
import { getAdminRepository } from "./adminRepository";
import { PlanEditor } from "./PlanEditor";
import {
  AccountDetailSection,
  AccountsSection,
  ActivitySection,
  AnalyticsSection,
  AuditSection,
  ErrorsSection,
  ItemsSection,
  OverviewSection,
  PlansSection,
  SettingsSection,
  StorageSection,
  SubscriptionsSection,
  UsersSection,
} from "./AdminWorkspaceViews";
import "./AdminWorkspace.css";
import { AdminNavigationProvider } from "./AdminNavigation";
import { useAdminNavigation } from "./useAdminNavigation";

const adminRepository = getAdminRepository();
const tabTitles = {
  overview: "Обзор платформы",
  accounts: "Аккаунты",
  users: "Пользователи",
  subscriptions: "Подписки",
  plans: "Тарифы и дополнения",
  analytics: "Аналитика платформы",
  activity: "Входы и активность",
  items: "Контент платформы",
  errors: "Обработка и ошибки",
  storage: "Хранилище и ресурсы",
  settings: "Настройки платформы",
  audit: "История действий",
} as const;
type TabId = keyof typeof tabTitles;

type ConfirmAction =
  | { kind: "account"; account: AdminAccount; nextStatus: "active" | "suspended" }
  | { kind: "account-delete"; account: AdminAccount }
  | { kind: "item"; item: AdminContentResult; suspended: boolean }
  | { kind: "retry"; accountId: string; jobId: number; label: string }
  | { kind: "reset"; accountId: string; userId: string; label: string }
  | { kind: "user-status"; accountId: string; userId: string; label: string; active: boolean }
  | { kind: "user-delete"; accountId: string; userId: string; label: string }
  | { kind: "setting"; setting: AdminSetting; value: AdminSetting["value"] }
  | { kind: "subscription"; detail: AdminAccountDetail; planId: string; status: SubscriptionStatus; days: number };
type SubscriptionStatus = "trial" | "active" | "grace_period" | "expired" | "suspended" | "cancelled";

export function AdminRoute() {
  return (
    <AdminNavigationProvider>
      <AdminWorkspaceRoute />
    </AdminNavigationProvider>
  );
}

function AdminWorkspaceRoute() {
  const queryClient = useQueryClient();
  const navigation = useAdminNavigation();
  const searchParams = navigation.params;
  const section = searchParams.get("section") ?? "overview";
  const tab: TabId = Object.hasOwn(tabTitles, section) ? (section as TabId) : "overview";
  const setTab = (next: TabId) => navigation.open({ section: next });
  const accountSearch = searchParams.get("accountSearch") ?? "";
  const submittedSearch = searchParams.get("accountQuery") ?? "";
  const selectedAccountId = searchParams.get("account");
  const showAccountDetail =
    tab === "accounts" && searchParams.get("accountView") === "detail" && Boolean(selectedAccountId);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [contentResults, setContentResults] = useState<AdminContentResult[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; tone: "success" | "error" } | null>(null);

  const accessQuery = useQuery({ queryKey: ["admin", "access"], queryFn: () => adminRepository.getAccess() });
  const canLoad = Boolean(
    accessQuery.data?.isSuperadmin && (accessQuery.data.mfaRequired === false || accessQuery.data.mfaVerified),
  );
  const snapshotQuery = useQuery({
    queryKey: ["admin", "snapshot", submittedSearch],
    queryFn: () => adminRepository.getSnapshot(submittedSearch),
    enabled: canLoad,
  });

  const detailQuery = useQuery({
    queryKey: ["admin", "account", selectedAccountId],
    queryFn: async () => {
      const next = await adminRepository.getAccountDetail(
        selectedAccountId!,
        "Просмотр карточки аккаунта администратором",
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
      return next;
    },
    enabled: canLoad && Boolean(selectedAccountId),
  });
  const detail = detailQuery.data ?? null;
  const openAccount = (account: AdminAccount, next: TabId) =>
    navigation.open({
      section: next,
      account: account.id,
      accountView: next === "accounts" ? "detail" : null,
      accountTab: next === "accounts" ? "overview" : null,
      user: null,
      userEdit: null,
    });
  const closeAccount = () => navigation.back({ account: null, accountView: null, accountTab: null, accountEdit: null });
  const supportError = detailQuery.error;

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!confirmAction) return;
      const auditReason = `${actionTitle(confirmAction)} администратором${reason.trim() ? `: ${reason.trim()}` : ""}`;
      if (confirmAction.kind === "account") {
        await adminRepository.setAccountStatus(confirmAction.account.id, confirmAction.nextStatus, auditReason);
      } else if (confirmAction.kind === "account-delete") {
        await adminRepository.deleteAccount(confirmAction.account.id, "УДАЛИТЬ АККАУНТ", auditReason);
      } else if (confirmAction.kind === "item") {
        await adminRepository.setItemSuspended(
          confirmAction.item.accountId,
          confirmAction.item.arItemId,
          confirmAction.suspended,
          auditReason,
        );
      } else if (confirmAction.kind === "retry") {
        await adminRepository.retryProcessingJob(confirmAction.accountId, confirmAction.jobId, auditReason);
      } else if (confirmAction.kind === "reset") {
        await adminRepository.requestPasswordReset(confirmAction.accountId, confirmAction.userId, auditReason);
      } else if (confirmAction.kind === "user-status") {
        await adminRepository.setUserActive(
          confirmAction.accountId,
          confirmAction.userId,
          confirmAction.active,
          auditReason,
        );
      } else if (confirmAction.kind === "user-delete") {
        await adminRepository.deleteUser(confirmAction.accountId, confirmAction.userId, "УДАЛИТЬ", auditReason);
      } else if (confirmAction.kind === "setting") {
        await adminRepository.updateSetting(confirmAction.setting.key, confirmAction.value, auditReason);
      } else {
        const expiresAt = addDaysIso(confirmAction.days);
        await adminRepository.updateSubscription(confirmAction.detail.account.id, {
          planId: confirmAction.planId,
          status: confirmAction.status,
          startsAt: confirmAction.detail.subscription.startsAt,
          expiresAt,
          gracePeriodEndsAt: null,
          customLimits: confirmAction.detail.subscription.customLimits,
          reason: auditReason,
        });
      }
    },
    onSuccess: async () => {
      const completedAction = confirmAction;
      const wasItem = confirmAction?.kind === "item";
      if (completedAction?.kind === "user-status" || completedAction?.kind === "user-delete") {
        await queryClient.invalidateQueries({ queryKey: ["admin", "account", selectedAccountId] });
      }
      if (completedAction?.kind === "account-delete" && selectedAccountId === completedAction.account.id) {
        navigation.update({
          account: null,
          accountView: null,
          accountTab: null,
          accountEdit: null,
          user: null,
          userEdit: null,
        });
      }
      setToast({ title: "Операция выполнена", message: "Изменение записано в историю действий.", tone: "success" });
      closeConfirmation();
      if (completedAction?.kind === "setting") await accessQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
      if (detail && (completedAction?.kind === "subscription" || completedAction?.kind === "account")) {
        try {
          await refreshDetail();
        } catch {
          setToast({
            title: "Изменение сохранено",
            message: "Не удалось обновить карточку. Откройте аккаунт заново.",
            tone: "error",
          });
        }
      }
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
        workspaceKind="account"
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
  if (accessQuery.data.mfaRequired !== false && !accessQuery.data.mfaVerified) {
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
      eyebrow={
        accessQuery.data.mfaRequired === false
          ? "MFA временно отключена · история действий включена"
          : "MFA подтверждена · действия аудируются"
      }
      title={tabTitles[tab]}
      description={
        tab === "overview"
          ? "Состояние сервиса, аккаунты, обработка и ключевые показатели."
          : "Администратор платформы KHANZAMA"
      }
      actions={
        <Button variant="quiet" icon={<RefreshCw size={17} />} onClick={() => void snapshotQuery.refetch()}>
          Обновить
        </Button>
      }
    >
      <div className="admin-workspace">
        {tab === "overview" ? <OverviewSection snapshot={snapshot} onNavigate={setTab} /> : null}
        {showAccountDetail && detail ? (
          <AccountDetailSection
            detail={detail}
            audit={snapshot.audit.items}
            account={snapshot.accounts.items.find((a) => a.id === detail.account.id)}
            onUpdated={refreshDetail}
            onClose={closeAccount}
            onUsers={() => setTab("users")}
            onSubscription={() => setTab("subscriptions")}
            onStatus={(account) =>
              openConfirm({
                kind: "account",
                account,
                nextStatus: account.status === "suspended" ? "active" : "suspended",
              })
            }
            onDelete={(account) => openConfirm({ kind: "account-delete", account })}
          />
        ) : null}
        {tab === "accounts" && !showAccountDetail ? (
          <AccountsSection
            accounts={snapshot.accounts.items}
            total={snapshot.accounts.total}
            search={accountSearch}
            onSearch={(value) => navigation.update({ accountSearch: value })}
            onSubmit={() => navigation.update({ accountQuery: navigation.read("accountSearch")?.trim() ?? "" })}
            onCreate={() => setCreateOpen(true)}
            onSupport={(account) => openAccount(account, "accounts")}
            onStatus={(account) =>
              openConfirm({
                kind: "account",
                account,
                nextStatus: account.status === "suspended" ? "active" : "suspended",
              })
            }
            onDelete={(account) => openConfirm({ kind: "account-delete", account })}
          />
        ) : null}
        {tab === "users" ? (
          <UsersSection
            onUpdated={refreshDetail}
            detail={detail}
            accounts={snapshot.accounts.items}
            onSelectAccount={(account) => openAccount(account, "users")}
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
            accounts={snapshot.accounts.items}
            onSelectAccount={(account) => openAccount(account, "subscriptions")}
            detail={detail}
            plans={snapshot.plans}
            onGranted={async () => {
              try {
                await queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
                await detailQuery.refetch({ throwOnError: true });
              } catch {
                setToast({
                  title: "Пакет начислен",
                  message: "Не удалось обновить данные. Нажмите «Обновить», не начисляя пакет повторно.",
                  tone: "error",
                });
              }
            }}
            onEdit={(planId, status, days) =>
              openConfirm({ kind: "subscription", detail: detail!, planId, status, days })
            }
          />
        ) : null}
        {tab === "plans" ? (
          <PlansSection
            plans={snapshot.plans}
            onCreate={() => {
              setEditingPlan(null);
              setPlanOpen(true);
            }}
            onEdit={(plan) => {
              setEditingPlan(plan);
              setPlanOpen(true);
            }}
          />
        ) : null}
        {tab === "storage" ? (
          <StorageSection
            accounts={snapshot.accounts.items}
            plans={snapshot.plans}
            totalBytes={snapshot.overview.storageBytes}
          />
        ) : null}
        {tab === "analytics" ? <AnalyticsSection snapshot={snapshot} onActivity={() => setTab("activity")} /> : null}
        {tab === "activity" ? (
          <ActivitySection
            detail={detail}
            accounts={snapshot.accounts.items}
            onSelectAccount={(account) => openAccount(account, "activity")}
          />
        ) : null}
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
      </div>
      {selectedAccountId && detailQuery.isPending ? (
        <div className="mt-3">
          <p role="status" className="text-sm text-muted">
            Открываем аккаунт…
          </p>
          {showAccountDetail ? (
            <Button variant="quiet" onClick={closeAccount}>
              Назад к аккаунтам
            </Button>
          ) : null}
        </div>
      ) : null}
      {supportError ? (
        <div>
          <p role="alert" className="text-rose-700">
            {readableAdminError(supportError)}
          </p>
          {showAccountDetail ? (
            <Button variant="quiet" onClick={closeAccount}>
              Назад к аккаунтам
            </Button>
          ) : null}
        </div>
      ) : null}
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
      {planOpen ? (
        <PlanEditor
          plan={editingPlan}
          onClose={() => setPlanOpen(false)}
          onSuccess={async () => {
            setPlanOpen(false);
            setToast({
              title: "Тариф сохранён",
              message: "Условия обновлены. Уже выданные фото и срок сохранены.",
              tone: "success",
            });
            await queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
          }}
        />
      ) : null}
      {toast ? (
        <Toast title={toast.title} message={toast.message} tone={toast.tone} onDismiss={() => setToast(null)} />
      ) : null}
    </AppShell>
  );

  async function refreshDetail() {
    if (!detail) return;
    await queryClient.invalidateQueries({ queryKey: ["admin", "snapshot"] });
    await detailQuery.refetch({ throwOnError: true });
  }

  function closeConfirmation() {
    setConfirmAction(null);
    setConfirmation("");
    setReason("");
    actionMutation.reset();
  }
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
  const requiresWord = action?.kind === "user-delete";
  return (
    <Modal
      open={Boolean(action)}
      title={actionTitle(action)}
      description={
        action?.kind === "account-delete"
          ? `Удалить аккаунт «${action.account.name}»? Он исчезнет из списка, подписка и доступы пользователей будут отключены. Данные и история останутся в архиве.`
          : action?.kind === "setting" && action.setting.key === "admin_mfa_required" && action.value === false
            ? "Отключение требования MFA уменьшает защиту административных операций. Подтвердите изменение настройки."
            : action?.kind === "user-delete"
              ? `Удаление пользователя необратимо. Введите «${word}», чтобы подтвердить удаление.`
              : action?.kind === "subscription"
                ? `Будет изменён тариф и статус подписки аккаунта «${action.detail.account.name}». Новый срок: ${new Date(addDaysIso(action.days)).toLocaleDateString("ru-RU")}.`
                : "Проверьте название объекта и подтвердите действие. Изменение автоматически записывается в историю."
      }
      onClose={onClose}
      actions={
        <Button
          variant={
            action?.kind === "account" ||
            action?.kind === "account-delete" ||
            action?.kind === "item" ||
            action?.kind === "user-status" ||
            action?.kind === "user-delete"
              ? "danger"
              : "primary"
          }
          disabled={pending || (requiresWord && confirmation !== word)}
          onClick={onSubmit}
        >
          {pending ? "Выполняем…" : action?.kind === "account-delete" ? "Удалить аккаунт" : "Подтвердить"}
        </Button>
      }
    >
      {action?.kind !== "account-delete" ? (
        <div className="grid gap-4">
          <LabeledInput
            label="Комментарий (необязательно)"
            placeholder="Можно оставить пустым"
            value={reason}
            onChange={onReason}
          />
          {requiresWord ? (
            <LabeledInput label={`Введите ${word}`} value={confirmation} onChange={onConfirmation} />
          ) : null}
        </div>
      ) : null}
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
      adminRepository.createAccount({
        email,
        fullName,
        accountName,
        accountSlug: slug,
        planId,
        reason: `Создание аккаунта «${accountName}» администратором${reason.trim() ? `: ${reason.trim()}` : ""}`,
      }),
    onSuccess,
  });
  return (
    <Modal
      open={open}
      title="Создать аккаунт и владельца"
      description="Владельцу отправляется Auth invitation. Администратор не создаёт и не видит пароль."
      onClose={onClose}
      actions={
        <Button disabled={mutation.isPending || !email.trim() || !accountName.trim()} onClick={() => mutation.mutate()}>
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
            options={plans
              .filter((plan) => plan.productKind === "subscription")
              .map((plan) => ({ value: plan.id, label: plan.name }))}
          />
        </div>
        <div className="sm:col-span-2">
          <LabeledInput label="Комментарий (необязательно)" value={reason} onChange={setReason} />
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

function MfaRequired({ onVerified }: { onVerified: () => void }) {
  const [code, setCode] = useState("");
  const mutation = useMutation({ mutationFn: () => adminRepository.verifyMfa(code), onSuccess: onVerified });
  return (
    <AppShell
      eyebrow="Защищённый доступ"
      title="Требуется MFA"
      description="Подтвердите второй фактор для доступа к административным данным."
    >
      <Panel className="mt-6 max-w-2xl">
        <SectionTitle icon={<ShieldCheck size={20} />} title="Подтвердите второй фактор" />
        <p className="mt-3 text-sm leading-6 text-muted">
          Введите одноразовый код из приложения-аутентификатора. Данные аккаунтов откроются после проверки.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">
          Если это первый вход, сначала{" "}
          <Link className="font-semibold text-primary" to="/settings/security">
            подключите MFA в настройках безопасности
          </Link>
          .
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
function actionWord(action: ConfirmAction | null) {
  if (!action) return "";
  if (action.kind === "retry") return "ПОВТОРИТЬ";
  if (action.kind === "reset") return "СБРОС";
  if (action.kind === "user-delete") return "УДАЛИТЬ";
  if (action.kind === "account-delete") return "УДАЛИТЬ АККАУНТ";
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
  if (action.kind === "account-delete") return `Удалить аккаунт ${action.account.name}?`;
  if (action.kind === "item")
    return `${action.suspended ? "Приостановить" : "Восстановить"} ${action.item.arItemTitle}?`;
  if (action.kind === "retry") return `Повторить обработку: ${action.label}?`;
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
function addDaysIso(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
