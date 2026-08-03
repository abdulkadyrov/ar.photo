import type { ReactNode } from "react";
import {
  BarChart3,
  FolderKanban,
  House,
  Images,
  Layers3,
  LogOut,
  QrCode,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/authContext";

const navigation = [
  { to: "/dashboard", label: "Главная", icon: House, end: true },
  { to: "/projects", label: "Проекты", icon: FolderKanban },
  { to: "/groups", label: "Группы", icon: Layers3 },
  { to: "/media", label: "Медиа", icon: Images },
  { to: "/items", label: "AR-работы", icon: WandSparkles },
  { to: "/viewer/test", label: "AR-проверка", icon: ScanLine },
  { to: "/qr-codes", label: "QR-коды", icon: QrCode },
  { to: "/analytics", label: "Аналитика", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
  { to: "/settings/team", label: "Команда", icon: Users },
  { to: "/settings", label: "Настройки", icon: Settings },
] as const;

const mobileNavigation = navigation.filter((item) =>
  ["/dashboard", "/projects", "/items", "/analytics", "/settings"].includes(item.to),
);

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const auth = useAuth();

  return (
    <div className="app-shell min-h-screen bg-background text-ink">
      <aside className="app-sidebar hidden lg:flex">
        <NavLink className="brand-mark" to="/">
          <span className="brand-symbol">
            <Sparkles size={20} />
          </span>
          <span>
            <strong>AR</strong> Photo
          </span>
        </NavLink>

        <nav aria-label="Основная навигация" className="mt-8 grid gap-1.5">
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
        </nav>

        <div className="mt-auto rounded-2xl border border-line bg-white/[0.025] p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 font-semibold uppercase text-primary-soft">
              {auth.session?.user.email.slice(0, 2) ?? "AR"}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{auth.session?.user.email ?? "AR Photo"}</p>
              <p className="truncate text-xs text-muted">
                {auth.mode === "demo" ? "Demo workspace" : auth.mode === "supabase" ? "Supabase session" : "Offline"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
              {auth.mode === "demo" ? "DEMO" : auth.mode === "supabase" ? "ONLINE" : "OFFLINE"}
            </span>
            <button
              aria-label="Выйти"
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-white/[0.05] hover:text-ink"
              onClick={() => void auth.signOut()}
              title="Выйти"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-content pb-24 lg:pb-8">
        <header className="app-topbar">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-soft">{eyebrow}</p>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted md:text-base">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {actions}
            <button
              aria-label="Выйти"
              className="btn btn-quiet lg:hidden"
              onClick={() => void auth.signOut()}
              title="Выйти"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main>{children}</main>
      </div>

      <nav aria-label="Мобильная навигация" className="mobile-nav lg:hidden">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              className={({ isActive }) => `mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`}
              end={"end" in item ? item.end : undefined}
              to={item.to}
            >
              <Icon size={19} />
              <span>{item.label === "AR-проверка" ? "AR" : item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
