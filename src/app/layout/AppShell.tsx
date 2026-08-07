import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Camera,
  FolderKanban,
  Headphones,
  House,
  LogOut,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { getAdminRepository } from "../../features/admin/adminRepository";
import { useAuth } from "../../features/auth/authContext";

const adminRepository = getAdminRepository();

const navigation = [
  { to: "/dashboard", label: "Главная", icon: House, end: true },
  { to: "/projects", label: "Мои проекты", icon: FolderKanban },
  { to: "/create", label: "Добавить фото", icon: Plus },
  { to: "/camera", label: "AR-камера", icon: Camera },
  { to: "/support", label: "Поддержка", icon: Headphones },
] as const;

const mobileNavigation = [
  { to: "/dashboard", label: "Главная", icon: House, end: true },
  { to: "/projects", label: "Проекты", icon: FolderKanban },
  { to: "/create", label: "Создать", icon: Plus },
  { to: "/camera", label: "AR-камера", icon: Camera },
  { to: "/profile", label: "Профиль", icon: UserRound },
] as const;

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  compactMobile = false,
  showDescriptionOnMobile = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  compactMobile?: boolean;
  showDescriptionOnMobile?: boolean;
  children: ReactNode;
}) {
  const auth = useAuth();
  const adminAccess = useQuery({
    queryKey: ["admin", "navigation-access", auth.session?.user.id],
    queryFn: () => adminRepository.getAccess(),
    enabled: Boolean(auth.session) && auth.mode === "supabase",
    retry: false,
    staleTime: 5 * 60_000,
  });
  const email = auth.session?.user.email ?? "AR Photo";
  const adminVisible =
    auth.mode === "demo" ? email.toLocaleLowerCase("ru").startsWith("admin") : adminAccess.data?.isSuperadmin;

  return (
    <div className="app-shell min-h-screen bg-background text-ink">
      <aside className="app-sidebar hidden lg:flex">
        <Link className="brand-mark" to="/dashboard">
          <span className="brand-symbol">
            <Sparkles size={20} />
          </span>
          <span>
            <strong>AR</strong> Photo
          </span>
        </Link>

        <Link className="sidebar-create" to="/create">
          <Plus size={17} /> Создать AR-фото
        </Link>

        <nav aria-label="Основная навигация" className="sidebar-navigation">
          <p className="sidebar-caption">Рабочее пространство</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                end={"end" in item ? item.end : undefined}
                to={item.to}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          {adminVisible ? (
            <>
              <p className="sidebar-caption sidebar-admin-caption">Управление</p>
              <NavLink
                className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                to="/admin"
              >
                <ShieldCheck size={18} />
                <span>Супер-админ</span>
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="sidebar-account">
          <Link className="sidebar-settings-link" to="/settings">
            <Settings size={17} /> Настройки
          </Link>
          <div className="sidebar-user-row">
            <span className="sidebar-avatar">
              <UserRound size={18} />
            </span>
            <div className="min-w-0">
              <p>{email}</p>
              <span>{auth.mode === "demo" ? "Демо-кабинет" : "Личный кабинет"}</span>
            </div>
            <button aria-label="Выйти" onClick={() => void auth.signOut()} title="Выйти">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div
        className={`app-content pb-24 lg:pb-10 ${compactMobile ? "app-content-compact-mobile" : ""} ${showDescriptionOnMobile ? "app-content-mobile-description" : ""}`}
      >
        <header className="app-topbar">
          <div>
            {eyebrow ? <p className="app-eyebrow">{eyebrow}</p> : null}
            <h1>{title}</h1>
            {description ? <p className="app-description">{description}</p> : null}
          </div>
          <div className="app-topbar-actions">{actions}</div>
        </header>
        <main>{children}</main>
      </div>

      <nav aria-label="Мобильная навигация" className="mobile-nav lg:hidden">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const create = item.to === "/create";
          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `mobile-nav-link ${create ? "mobile-nav-create" : ""} ${isActive ? "mobile-nav-link-active" : ""}`
              }
              end={"end" in item ? item.end : undefined}
              to={item.to}
            >
              <span className={create ? "mobile-create-icon" : ""}>
                <Icon size={create ? 22 : 19} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
