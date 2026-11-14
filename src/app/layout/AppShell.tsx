import { useQuery } from "@tanstack/react-query";
import { useRef, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  Camera,
  CreditCard,
  Database,
  FileClock,
  FolderKanban,
  Headphones,
  House,
  Images,
  Layers3,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  QrCode,
  Settings,
  ShieldCheck,
  Tags,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getCatalogRepository } from "../../features/catalog/catalogRepository";
import { getAdminRepository } from "../../features/admin/adminRepository";
import { useAuth } from "../../features/auth/authContext";

import "./AppShell.css";

const catalogRepository = getCatalogRepository();
const navigation = [
  { to: "/dashboard", label: "Главная", icon: House, end: true },
  { to: "/projects", label: "Проекты", icon: FolderKanban },
  { to: "/items", label: "AR-фото", icon: Layers3 },
  { to: "/qr-codes", label: "QR-коды", icon: QrCode },
  { to: "/analytics", label: "Статистика", icon: BarChart3 },
] as const;
const accountNavigation = [
  { to: "/settings/subscription", label: "Мой пакет", icon: CreditCard },
  { to: "/settings/team", label: "Команда", icon: Users },
  { to: "/settings", label: "Настройки", icon: Settings, end: true },
  { to: "/support", label: "Поддержка", icon: Headphones },
] as const;
const mobileNavigation = [
  { to: "/dashboard", label: "Главная", icon: House, end: true },
  { to: "/projects", label: "Проекты", icon: FolderKanban },
  { to: "/create", label: "Создать", icon: Plus },
  { to: "/camera", label: "AR-камера", icon: Camera },
  { to: "/profile", label: "Профиль", icon: UserRound },
] as const;
const adminNavigation = [
  { id: "overview", label: "Обзор", icon: House },
  { id: "accounts", label: "Аккаунты", icon: Building2 },
  { id: "users", label: "Пользователи", icon: Users },
  { id: "subscriptions", label: "Подписки", icon: CreditCard },
  { id: "plans", label: "Тарифы", icon: Tags },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "activity", label: "Активность", icon: Activity },
  { id: "items", label: "Контент", icon: Images },
  { id: "errors", label: "Обработка", icon: Layers3 },
  { id: "storage", label: "Хранилище", icon: Database },
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "audit", label: "Журнал", icon: FileClock },
] as const;

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  compactMobile = false,
  showDescriptionOnMobile = false,
  children,
  workspaceKind,
}: {
  workspaceKind?: "account" | "admin";
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  compactMobile?: boolean;
  showDescriptionOnMobile?: boolean;
  children: ReactNode;
}) {
  const auth = useAuth();
  const location = useLocation();
  const admin = workspaceKind ? workspaceKind === "admin" : location.pathname === "/admin";
  const section = new URLSearchParams(location.search).get("section") ?? "overview";
  const adminTo = (id: string) => {
    const next = new URLSearchParams(location.search);
    next.set("section", id);
    return `/admin?${next}`;
  };
  const menu = useRef<HTMLDialogElement>(null);
  const workspace = useQuery({
    queryKey: ["catalog", "workspace", auth.session?.user.id],
    queryFn: () => catalogRepository.getWorkspace(auth.session!.user.id),
    enabled: Boolean(auth.session) && !admin,
  });
  const access = useQuery({
    queryKey: ["admin", "navigation-access", auth.session?.user.id],
    queryFn: () => getAdminRepository().getAccess(),
    enabled: Boolean(auth.session) && auth.mode === "supabase" && !admin,
    staleTime: 300_000,
    retry: false,
  });
  const canSwitchToAdmin =
    !admin && (auth.mode === "demo" ? auth.session?.user.email?.startsWith("admin") : access.data?.isSuperadmin);
  const email = auth.session?.user.email ?? "";
  const scope = admin ? "Администратор платформы" : "Кабинет студии";
  const accountName = workspace.data?.accountName ?? "Мой кабинет";
  const brand = (
    <span className="workspace-wordmark">
      KHANZAMA<small>{scope}</small>
    </span>
  );
  const adminLinks = (close = false) =>
    adminNavigation.map(({ id, label, icon: Icon }) => (
      <Link
        key={id}
        to={adminTo(id)}
        aria-current={section === id ? "page" : undefined}
        className={`sidebar-link ${section === id ? "sidebar-link-active" : ""}`}
        onClick={() => {
          if (close) menu.current?.close();
        }}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    ));
  return (
    <div
      className={`app-shell workspace-shell min-h-screen bg-background text-ink ${admin ? "admin-shell" : "account-shell"}`}
    >
      <aside className="app-sidebar hidden lg:flex">
        <Link className="brand-mark" to={admin ? "/admin" : "/dashboard"}>
          {brand}
        </Link>
        <nav aria-label={admin ? "Разделы администрации" : "Основная навигация"} className="sidebar-navigation">
          {admin
            ? adminLinks()
            : navigation.map(({ to, label, icon: Icon, ...item }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={"end" in item ? item.end : undefined}
                  className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
        </nav>
        <div className="sidebar-account">
          {admin ? (
            <Link className="sidebar-settings-link" to="/dashboard">
              <UserRound size={17} />
              Мой кабинет
            </Link>
          ) : (
            accountNavigation.map(({ to, label, icon: Icon, ...item }) => (
              <NavLink
                key={to}
                to={to}
                end={"end" in item ? item.end : undefined}
                className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))
          )}
          <div className="sidebar-user-row">
            <Link className="sidebar-avatar" to={admin ? "/admin?section=settings" : "/profile"} aria-label="Профиль">
              {admin ? <ShieldCheck size={18} /> : <UserRound size={18} />}
            </Link>
            <div className="min-w-0">
              <p title={email}>{email}</p>
              <span>{auth.mode === "demo" ? "Демо-режим" : scope}</span>
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
        <div className="workspace-context">
          <Link to={admin ? "/admin" : "/dashboard"} className="workspace-mobile-brand lg:hidden">
            {brand}
          </Link>
          {!admin ? <span className="workspace-account-name">{accountName}</span> : null}
          {canSwitchToAdmin ? (
            <Link className="workspace-admin-switch" to="/admin">
              <ShieldCheck size={16} />
              Администрирование
            </Link>
          ) : null}
          {!admin ? (
            <button className="btn btn-ghost lg:hidden" onClick={() => menu.current?.showModal()}>
              <Menu size={17} />
              Разделы
            </button>
          ) : null}
          {admin ? (
            <button className="btn btn-ghost lg:hidden" onClick={() => menu.current?.showModal()}>
              <Menu size={17} />
              Разделы
            </button>
          ) : (
            <Link className="workspace-profile" to="/profile" aria-label="Мой профиль">
              <UserRound size={19} />
            </Link>
          )}
        </div>
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
      {admin ? (
        <>
          <nav aria-label="Мобильная навигация администрации" className="mobile-nav admin-mobile-nav lg:hidden">
            {adminNavigation
              .filter(({ id }) => ["overview", "accounts", "analytics"].includes(id))
              .map(({ id, label, icon: Icon }) => (
                <Link
                  key={id}
                  to={adminTo(id)}
                  aria-current={section === id ? "page" : undefined}
                  className={`mobile-nav-link ${section === id ? "mobile-nav-link-active" : ""}`}
                >
                  <Icon size={19} />
                  <span>{label}</span>
                </Link>
              ))}
            <button className="mobile-nav-link" onClick={() => menu.current?.showModal()}>
              <MoreHorizontal size={19} />
              <span>Ещё</span>
            </button>
          </nav>
        </>
      ) : (
        <nav aria-label="Мобильная навигация" className="mobile-nav lg:hidden">
          {mobileNavigation.map(({ to, label, icon: Icon, ...item }) => {
            const create = to === "/create";
            return (
              <NavLink
                key={to}
                to={to}
                end={"end" in item ? item.end : undefined}
                className={({ isActive }) =>
                  `mobile-nav-link ${create ? "mobile-nav-create" : ""} ${isActive ? "mobile-nav-link-active" : ""}`
                }
              >
                <span className={create ? "mobile-create-icon" : ""}>
                  <Icon size={create ? 22 : 19} />
                </span>
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
      <dialog
        ref={menu}
        className="workspace-menu"
        aria-labelledby="workspace-menu-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) menu.current?.close();
        }}
      >
        <div className="workspace-menu-heading">
          <h2 id="workspace-menu-title">{admin ? "Разделы администрации" : "Разделы кабинета"}</h2>
          <button aria-label="Закрыть разделы" className="btn btn-quiet" onClick={() => menu.current?.close()}>
            <X size={20} />
          </button>
        </div>
        <nav aria-label={admin ? "Все разделы администрации" : "Все разделы кабинета"}>
          {admin
            ? adminLinks(true)
            : [
                ...navigation,
                { to: "/media", label: "Медиа", icon: Images },
                { to: "/groups", label: "Группы", icon: FolderKanban },
                ...accountNavigation,
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} className="sidebar-link" to={to} onClick={() => menu.current?.close()}>
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
        </nav>
        {admin ? (
          <Link className="sidebar-link" to="/dashboard" onClick={() => menu.current?.close()}>
            <UserRound size={18} />
            Мой кабинет
          </Link>
        ) : canSwitchToAdmin ? (
          <Link className="sidebar-link" to="/admin" onClick={() => menu.current?.close()}>
            <ShieldCheck size={18} />
            Администрирование
          </Link>
        ) : null}
      </dialog>
    </div>
  );
}
