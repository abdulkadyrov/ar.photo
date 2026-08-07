import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  ChevronRight,
  Clock3,
  Crown,
  Headphones,
  KeyRound,
  LogOut,
  Pencil,
  Save,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Skeleton, Toast } from "../../shared/ui";
import { getAdminRepository } from "../admin/adminRepository";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getSettingsRepository } from "../settings/settingsRepository";
import type { AccountEntitlements } from "../settings/settingsSchemas";
import { getProfileRepository } from "./profileRepository";
import "./ProfilePage.css";

const profileRepository = getProfileRepository();
const catalogRepository = getCatalogRepository();
const settingsRepository = getSettingsRepository();
const adminRepository = getAdminRepository();

const subscriptionLabels = {
  trial: "Пробный период",
  active: "Активна",
  grace_period: "Льготный период",
  expired: "Истекла",
  suspended: "Приостановлена",
  cancelled: "Отменена",
} as const;

const roleLabels = {
  owner: "Владелец",
  manager: "Менеджер",
  editor: "Редактор",
  viewer: "Наблюдатель",
  superadmin: "Суперадминистратор",
} as const;

export function ProfileRoute() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const userId = auth.session!.user.id;
  const email = auth.session!.user.email;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<{ title: string; tone: "success" | "error" } | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileRepository.getProfile(userId),
  });
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", userId],
    queryFn: () => catalogRepository.getWorkspace(userId),
  });
  const entitlementsQuery = useQuery({
    queryKey: ["settings", "entitlements", workspaceQuery.data?.accountId],
    queryFn: () => settingsRepository.getEntitlements(workspaceQuery.data!.accountId),
    enabled: Boolean(workspaceQuery.data?.accountId),
  });
  const adminQuery = useQuery({
    queryKey: ["admin", "profile-access", userId],
    queryFn: () => adminRepository.getAccess(),
    enabled: auth.mode === "supabase",
    retry: false,
    staleTime: 5 * 60_000,
  });
  const updateName = useMutation({
    mutationFn: () => profileRepository.updateName(userId, name),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setEditing(false);
      setNotice({ title: "Имя сохранено", tone: "success" });
    },
    onError: (error) => setNotice({ title: readableError(error), tone: "error" }),
  });

  const loading =
    profileQuery.isPending || workspaceQuery.isPending || (Boolean(workspaceQuery.data) && entitlementsQuery.isPending);
  const error = profileQuery.error ?? workspaceQuery.error ?? entitlementsQuery.error;
  if (loading) return <ProfileLoading />;
  if (error || !profileQuery.data || !workspaceQuery.data || !entitlementsQuery.data) {
    return (
      <AppShell title="Профиль" compactMobile>
        <div className="mt-6">
          <ErrorState text={readableError(error)} />
        </div>
      </AppShell>
    );
  }

  const profile = profileQuery.data;
  const workspace = workspaceQuery.data;
  const entitlements = entitlementsQuery.data;
  const displayName = profile.full_name ?? email.split("@")[0] ?? "Пользователь";
  const adminVisible =
    auth.mode === "demo" ? email.toLocaleLowerCase("ru").startsWith("admin") : adminQuery.data?.isSuperadmin;

  return (
    <AppShell title="Профиль" compactMobile>
      <div className="profile-page">
        <section className="profile-identity-card" aria-labelledby="profile-user-name">
          <span className="profile-avatar" aria-hidden="true">
            {initials(displayName)}
          </span>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="profile-name-form">
                <Input aria-label="Отображаемое имя" autoFocus maxLength={120} value={name} onValueChange={setName} />
                <button
                  aria-label="Сохранить имя"
                  disabled={updateName.isPending}
                  onClick={() => updateName.mutate()}
                  type="button"
                >
                  <Save size={17} />
                </button>
                <button aria-label="Отменить изменение имени" onClick={() => setEditing(false)} type="button">
                  <X size={17} />
                </button>
              </div>
            ) : (
              <div className="profile-name-row">
                <div className="min-w-0">
                  <h2 id="profile-user-name">{displayName}</h2>
                  <p>{profile.email_display ?? email}</p>
                </div>
                <button
                  aria-label="Изменить имя"
                  onClick={() => {
                    setName(displayName);
                    setEditing(true);
                  }}
                  type="button"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
            <span className="profile-account-name">{workspace.accountName}</span>
          </div>
        </section>

        <SubscriptionCard entitlements={entitlements} />

        <nav aria-label="Разделы профиля" className="profile-links">
          <ProfileLink icon={<Settings size={19} />} label="Настройки аккаунта" to="/settings" />
          <ProfileLink icon={<Crown size={19} />} label="Тариф и лимиты" to="/settings/subscription" />
          <ProfileLink icon={<KeyRound size={19} />} label="Безопасность" to="/settings/security" />
          <ProfileLink icon={<Headphones size={19} />} label="Поддержка" to="/support" />
          {adminVisible ? (
            <ProfileLink icon={<ShieldCheck size={19} />} label="Суперадмин" to="/admin" tone="primary" />
          ) : null}
        </nav>

        <Button
          className="profile-sign-out"
          icon={<LogOut size={18} />}
          onClick={() => void auth.signOut()}
          variant="danger"
        >
          Выйти
        </Button>
      </div>
      {notice ? (
        <div className="profile-toast-wrapper">
          <Toast title={notice.title} tone={notice.tone} onDismiss={() => setNotice(null)} />
        </div>
      ) : null}
    </AppShell>
  );
}

function SubscriptionCard({ entitlements }: { entitlements: AccountEntitlements }) {
  const active = entitlements.subscription.status === "active" || entitlements.subscription.status === "trial";
  return (
    <section className="profile-subscription-card" aria-labelledby="profile-plan-title">
      <span className="profile-plan-icon">
        <Crown size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p>Подписка</p>
        <h2 id="profile-plan-title">{entitlements.plan.name}</h2>
        <span>
          {entitlements.subscription.expiresAt
            ? `Действует до ${formatDate(entitlements.subscription.expiresAt)}`
            : "Без даты окончания"}
        </span>
      </div>
      <span className={`profile-status ${active ? "profile-status-active" : ""}`}>
        {active ? <BadgeCheck size={14} /> : <Clock3 size={14} />}
        {subscriptionLabels[entitlements.subscription.status]}
      </span>
      <span className="profile-role">{roleLabels[entitlements.memberRole]}</span>
    </section>
  );
}

function ProfileLink({ icon, label, to, tone }: { icon: ReactNode; label: string; to: string; tone?: "primary" }) {
  return (
    <Link className={tone === "primary" ? "profile-link profile-link-primary" : "profile-link"} to={to}>
      <span>{icon}</span>
      <strong>{label}</strong>
      <ChevronRight size={19} />
    </Link>
  );
}

function ProfileLoading() {
  return (
    <AppShell title="Профиль" compactMobile>
      <div className="profile-page">
        <Skeleton className="h-28" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    </AppShell>
  );
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru"))
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(value))
    .replace(" г.", "");
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Не удалось загрузить профиль";
}
