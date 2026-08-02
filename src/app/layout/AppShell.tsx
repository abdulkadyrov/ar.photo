import type { ReactNode } from "react";
import { FolderKanban, House, Image, QrCode, ScanLine, Settings, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { to: "/dashboard", label: "Главная", icon: House, end: true },
  { to: "/projects", label: "Проекты", icon: FolderKanban },
  { to: "/groups", label: "Группы", icon: Image },
  { to: "/viewer/test", label: "AR-проверка", icon: ScanLine },
  { to: "/qr-codes", label: "QR-коды", icon: QrCode },
  { to: "/settings", label: "Настройки", icon: Settings },
] as const;

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
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 font-semibold text-primary">
              AR
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Локальный режим</p>
              <p className="truncate text-xs text-muted">Prototype workspace</p>
            </div>
          </div>
          <span className="mt-3 inline-flex rounded-full bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
            FOUNDATION
          </span>
        </div>
      </aside>

      <div className="app-content pb-24 lg:pb-8">
        <header className="app-topbar">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
            ) : null}
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted md:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
        <main>{children}</main>
      </div>

      <nav aria-label="Мобильная навигация" className="mobile-nav lg:hidden">
        {navigation.slice(0, 4).map((item) => {
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
