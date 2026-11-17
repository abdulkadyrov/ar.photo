import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Headphones, KeyRound, Layers3, LogOut, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../app/layout/AppShell";
import { Button, ErrorState, Input, Skeleton, Toast } from "../../shared/ui";
import { useAuth } from "../auth/authContext";
import { getCatalogRepository } from "../catalog/catalogRepository";
import { getProfileRepository } from "./profileRepository";
import "./ProfilePage.css";

const profileRepository = getProfileRepository();
const catalogRepository = getCatalogRepository();
const roleLabels = {
  owner: "Владелец студии",
  manager: "Менеджер",
  editor: "Редактор",
  viewer: "Наблюдатель",
  superadmin: "Администратор платформы",
} as const;

export function ProfileRoute() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const userId = auth.session!.user.id;
  const email = auth.session!.user.email;
  const [name, setName] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ title: string; tone: "success" | "error" } | null>(null);
  const profileQuery = useQuery({ queryKey: ["profile", userId], queryFn: () => profileRepository.getProfile(userId) });
  const workspaceQuery = useQuery({
    queryKey: ["catalog", "workspace", userId],
    queryFn: () => catalogRepository.getWorkspace(userId),
  });
  const updateName = useMutation({
    mutationFn: () => profileRepository.updateName(userId, name ?? profileQuery.data?.full_name ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setName(null);
      setNotice({ title: "Профиль сохранён", tone: "success" });
    },
    onError: (error) => setNotice({ title: readableError(error), tone: "error" }),
  });
  if (profileQuery.isPending || workspaceQuery.isPending) return <ProfileLoading />;
  if (profileQuery.error || workspaceQuery.error || !profileQuery.data || !workspaceQuery.data)
    return (
      <AppShell title="Мой профиль" compactMobile>
        <ErrorState
          text={readableError(profileQuery.error ?? workspaceQuery.error)}
          action={
            <Button
              onClick={() => {
                void profileQuery.refetch();
                void workspaceQuery.refetch();
              }}
            >
              Повторить
            </Button>
          }
        />
      </AppShell>
    );
  const profile = profileQuery.data;
  const workspace = workspaceQuery.data;
  const displayName = profile.full_name ?? email.split("@")[0] ?? "Пользователь";
  const dirty = name !== null && name !== (profile.full_name ?? "");
  return (
    <AppShell title="Мой профиль" description="Мои данные и настройки аккаунта" compactMobile>
      <div className="profile-page">
        <form
          className="profile-identity-card"
          onSubmit={(event) => {
            event.preventDefault();
            if (dirty && !updateName.isPending) updateName.mutate();
          }}
        >
          <span className="profile-avatar" aria-hidden="true">
            {initials(displayName)}
          </span>
          <div className="profile-mobile-identity">
            <strong>{displayName}</strong>
            <span>{profile.email_display ?? email}</span>
            <span className="profile-role">{roleLabels[workspace.memberRole]}</span>
          </div>
          <div className="profile-fields">
            <label>
              <span>Имя и фамилия</span>
              <Input
                aria-label="Имя и фамилия"
                disabled={updateName.isPending}
                maxLength={120}
                value={name ?? profile.full_name ?? ""}
                onValueChange={setName}
              />
            </label>
            <label>
              <span>Контакт (email)</span>
              <input
                className="field-control"
                aria-label="Контакт (email)"
                readOnly
                value={profile.email_display ?? email}
              />
            </label>
            <label>
              <span>Название аккаунта</span>
              <input className="field-control" aria-label="Название аккаунта" readOnly value={workspace.accountName} />
            </label>
            <div className="profile-role-field">
              <span className="profile-field-label">Моя роль</span>
              <span className="profile-role">{roleLabels[workspace.memberRole]}</span>
            </div>
          </div>
          <div className="profile-form-actions">
            <Button disabled={!dirty || updateName.isPending} type="submit">
              {updateName.isPending ? "Сохраняем…" : "Сохранить"}
            </Button>
            <Button
              disabled={!dirty || updateName.isPending}
              variant="ghost"
              onClick={() => setName(null)}
              type="button"
            >
              Отмена
            </Button>
          </div>
        </form>
        <nav aria-label="Разделы профиля" className="profile-links">
          <ProfileLink
            icon={<Layers3 size={22} />}
            label="Мой пакет"
            description="Текущий пакет, лимиты и продление"
            to="/settings/subscription"
          />
          <ProfileLink
            icon={<Users size={22} />}
            label="Команда"
            description="Участники моей студии и их роли"
            to="/settings/team"
          />
          <ProfileLink
            icon={<KeyRound size={22} />}
            label="Безопасность"
            description="Пароль и двухфакторная защита"
            to="/settings/security"
          />
          <ProfileLink
            icon={<Headphones size={22} />}
            label="Поддержка"
            description="Помощь, инструкции и связь с командой"
            to="/support"
          />
        </nav>
        <Button
          className="profile-sign-out"
          icon={<LogOut size={18} />}
          onClick={() => void auth.signOut()}
          variant="danger"
        >
          Выйти из аккаунта
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
function ProfileLink({
  icon,
  label,
  description,
  to,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  to: string;
}) {
  return (
    <Link className="profile-link" to={to}>
      <span>{icon}</span>
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <ChevronRight size={19} />
    </Link>
  );
}
function ProfileLoading() {
  return (
    <AppShell title="Мой профиль" compactMobile>
      <div className="profile-page">
        <Skeleton className="h-56" />
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
function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Не удалось загрузить профиль";
}
