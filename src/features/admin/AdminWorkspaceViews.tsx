import { useEffect, useId, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CircleAlert,
  CreditCard,
  CalendarDays,
  Image,
  Pencil,
  KeyRound,
  Search,
  RefreshCw,
  ChevronRight,
  X,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button, Input, Select } from "../../shared/ui";
import type { AdminSnapshot } from "./adminRepository";
import type { AdminAccount, AdminAccountDetail, AdminContentResult, AdminPlan, AdminSetting } from "./adminSchemas";
import { PackageGrant } from "./PackageGrant";
import { AccountProfileEditor, UserProfileEditor } from "./AdminProfileEditors";
import { useAdminNavigation } from "./useAdminNavigation";

type SubscriptionStatus = AdminAccountDetail["subscription"]["status"];
type AccountOp = (account: AdminAccount) => void;
const statusNames: Record<string, string> = {
  active: "Активен",
  suspended: "Приостановлен",
  closed: "Закрыт",
  trial: "Пробный",
  grace_period: "Льготный период",
  expired: "Истёк",
  cancelled: "Отменён",
  draft: "Черновик",
  processing: "В обработке",
  ready: "Готово",
  published: "Опубликовано",
  failed: "Ошибка",
  archived: "Архив",
};
const auditActionNames: Record<string, string> = {
  "admin.support_access": "Открыт аккаунт",
  "admin.account.create": "Создан аккаунт",
  "admin.account.profile.update": "Изменены данные аккаунта",
  "admin.user.profile.update": "Изменено имя пользователя",
  "admin.subscription.update": "Изменена подписка",
  "admin.account.status": "Изменён статус аккаунта",
  "admin.account.close": "Закрыт аккаунт",
  "admin.user.activate": "Восстановлен доступ",
  "admin.user.suspend": "Заблокирован пользователь",
  "admin.user.delete.authorized": "Подтверждено удаление",
  "admin.ar_item.suspend": "Приостановлена AR-работа",
  "admin.ar_item.restore": "Восстановлена AR-работа",
  "admin.processing.retry": "Повторена обработка",
  "admin.plan.upsert": "Сохранён тариф",
  "admin.package.grant": "Назначен пакет",
  "admin.settings.update": "Изменены настройки",
  "admin.password_reset.request": "Запрошен сброс пароля",
};
const auditActionName = (value: string) => auditActionNames[value] ?? value;
const roleNames: Record<string, string> = {
  owner: "Владелец",
  manager: "Менеджер",
  editor: "Редактор",
  viewer: "Просмотр",
};
const settingNames: Record<AdminSetting["key"], string> = {
  admin_mfa_required: "Подтверждение MFA в админке",
  maintenance_mode: "Техническое обслуживание",
  registration_enabled: "Регистрация новых пользователей",
  public_ar_enabled: "Публичный просмотр AR",
  analytics_retention_days: "Хранение аналитики, дней",
  support_banner: "Сообщение для пользователей",
};
const settingDescriptions: Record<AdminSetting["key"], string> = {
  admin_mfa_required: "Требовать одноразовый код для административных операций.",
  maintenance_mode: "Приостановить клиентские операции на время технических работ.",
  registration_enabled: "Разрешить самостоятельную регистрацию в сервисе.",
  public_ar_enabled: "Разрешить гостям открывать опубликованные AR-работы.",
  analytics_retention_days: "Сколько дней хранить статистику просмотров.",
  support_banner: "Короткое сообщение об изменениях и состоянии сервиса.",
};
function formatBytes(value: number) {
  return value >= 1_073_741_824
    ? `${(value / 1_073_741_824).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} ГБ`
    : value >= 1_048_576
      ? `${(value / 1_048_576).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} МБ`
      : `${value.toLocaleString("ru-RU")} Б`;
}
function date(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
    : "Нет данных";
}
function expiry(value: string | null) {
  return value ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(value)) : "Без срока";
}
function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Не удалось выполнить действие. Повторите попытку.";
}
function Badge({ value, children }: { value?: string; children?: ReactNode }) {
  return (
    <span
      className={`admin-badge ${value === "active" || value === "published" || value === "ready" ? "is-positive" : value === "suspended" || value === "failed" || value === "expired" ? "is-danger" : ""}`}
    >
      {children ?? statusNames[value ?? ""] ?? value}
    </span>
  );
}
function Heading({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="admin-section-heading">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}
function PageHeading({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="admin-section-heading admin-page-heading">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}
function RefreshAction({ onRefresh }: { onRefresh?: () => void }) {
  return onRefresh ? (
    <Button
      type="button"
      variant="quiet"
      className="admin-refresh-button"
      icon={<RefreshCw size={16} />}
      onClick={onRefresh}
    >
      Обновить
    </Button>
  ) : null;
}

function Inspector({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <aside className="admin-inspector" role="dialog" aria-modal="false" aria-labelledby={titleId}>
      <header>
        <h2 id={titleId}>{title}</h2>
        <button type="button" aria-label="Закрыть просмотр" onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      <div className="admin-inspector-body">{children}</div>
      <Button type="button" variant="quiet" onClick={onClose}>
        Закрыть
      </Button>
    </aside>
  );
}

function subscribeMobile(listener: () => void) {
  const media = window.matchMedia?.("(max-width:700px)");
  media?.addEventListener("change", listener);
  return () => media?.removeEventListener("change", listener);
}
function mobileSnapshot() {
  return window.matchMedia?.("(max-width:700px)").matches ?? false;
}
function ResponsivePanel({
  title,
  children,
  initialMobileOpen = false,
}: {
  title: string;
  children: ReactNode;
  initialMobileOpen?: boolean;
}) {
  const mobile = useSyncExternalStore(subscribeMobile, mobileSnapshot, () => false);
  const [expanded, setExpanded] = useState(initialMobileOpen);
  return (
    <details
      className="admin-surface admin-responsive-panel"
      open={!mobile || expanded}
      onToggle={(event) => {
        if (mobile) setExpanded(event.currentTarget.open);
      }}
    >
      <summary>
        <h2>{title}</h2>
        <ChevronRight size={17} />
      </summary>
      <div>{children}</div>
    </details>
  );
}

function Surface({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`admin-surface ${className}`}>{children}</section>;
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="admin-empty">
      <Search size={24} aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
function Notice({ children }: { children: ReactNode }) {
  return <p className="admin-note">{children}</p>;
}
function Stats({ items }: { items: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }[] }) {
  return (
    <div className={`admin-stats admin-stats-${items.length}`}>
      {items.map((item) => (
        <div className="admin-stat" key={item.label}>
          <span className="admin-stat-label">
            {item.icon}
            {item.label}
          </span>
          <strong>{item.value}</strong>
          {item.hint ? <small>{item.hint}</small> : null}
        </div>
      ))}
    </div>
  );
}
function SearchField({
  value,
  onChange,
  placeholder = "Поиск",
  label = "Поиск",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="admin-search">
      <Search size={17} aria-hidden="true" />
      <Input aria-label={label} placeholder={placeholder} value={value} onValueChange={onChange} />
    </div>
  );
}
function Segments<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="admin-segments" role="group" aria-label={label}>
      {items.map((item) => (
        <button type="button" key={item.value} aria-pressed={value === item.value} onClick={() => onChange(item.value)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function OverviewSection({
  snapshot,
  onNavigate,
  onRefresh,
}: {
  onRefresh?: () => void;
  snapshot: AdminSnapshot;
  onNavigate: (id: "accounts" | "errors" | "analytics" | "activity") => void;
}) {
  const overview = snapshot.overview;
  const recent = [...snapshot.accounts.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <div className="admin-page">
      <PageHeading
        title="Обзор платформы"
        description="Состояние сервиса, аккаунты и обработка"
        actions={<RefreshAction onRefresh={onRefresh} />}
      />
      <Stats
        items={[
          {
            label: "Аккаунты",
            value: overview.accounts.total,
            hint: `${overview.accounts.active} активных`,
            icon: <Building2 size={19} />,
          },
          {
            label: "Пользователи",
            value: overview.users.total,
            hint: `${overview.users.active} с доступом`,
            icon: <Users size={19} />,
          },
          {
            label: "AR-работы",
            value: overview.arItems,
            hint: `${overview.publishedItems} опубликовано`,
            icon: <Activity size={19} />,
          },
          { label: "Ошибки обработки", value: overview.failedJobs, icon: <CircleAlert size={19} /> },
        ]}
      />
      <div className="admin-two-column">
        <Surface>
          <Heading
            title="Новые аккаунты"
            actions={
              <Button variant="quiet" onClick={() => onNavigate("accounts")}>
                Все аккаунты <ArrowUpRight size={15} />
              </Button>
            }
          />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Аккаунт</th>
                  <th>Создан</th>
                  <th>Работы</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name}</strong>
                    </td>
                    <td>{date(a.createdAt)}</td>
                    <td>{a.arItemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!recent.length ? <Empty>Новых аккаунтов пока нет.</Empty> : null}
        </Surface>
        <Surface>
          <Heading title="Состояние платформы" />
          <dl className="admin-key-values">
            <div>
              <dt>Активные подписки</dt>
              <dd>{overview.subscriptions.active}</dd>
            </div>
            <div>
              <dt>Подписки требуют внимания</dt>
              <dd>{overview.subscriptions.attention}</dd>
            </div>
            <div>
              <dt>Использовано медиа</dt>
              <dd>{formatBytes(overview.storageBytes)}</dd>
            </div>
            <div>
              <dt>Задачи с ошибкой</dt>
              <dd>
                <Badge value={overview.failedJobs ? "failed" : "active"}>{overview.failedJobs}</Badge>
              </dd>
            </div>
          </dl>
          <Notice>Очередь, время обработки и активные сеансы пока не передаются сервером.</Notice>
          <Button variant="quiet" onClick={() => onNavigate("errors")}>
            Перейти к обработке
          </Button>
        </Surface>
      </div>
      <div className="admin-two-column admin-overview-bottom">
        <Surface>
          <Heading
            title="Активность пользователей"
            actions={
              <Button type="button" variant="quiet" onClick={() => onNavigate("analytics")}>
                Аналитика <ArrowUpRight size={15} />
              </Button>
            }
          />
          <Empty>История активности пока не собирается.</Empty>
          <p className="admin-footnote">
            График появится после подключения измерения активности. Вход и открытая вкладка не считаются активным
            временем.
          </p>
        </Surface>
        <Surface>
          <Heading title="Быстрые действия" />
          <div className="admin-quick-actions">
            <button onClick={() => onNavigate("accounts")}>
              <Building2 size={22} />
              <span>
                <strong>Аккаунты</strong>
                <small>Подписки, пользователи и доступ</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
            <button onClick={() => onNavigate("analytics")}>
              <Activity size={22} />
              <span>
                <strong>Аналитика</strong>
                <small>Доступные показатели платформы</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          </div>
        </Surface>
      </div>
    </div>
  );
}

export function AccountsSection({
  accounts,
  search,
  onSearch,
  onSubmit,
  onCreate,
  onSupport,
  onStatus,
  onDelete,
  total,
}: {
  accounts: AdminAccount[];
  search: string;
  onSearch: (v: string) => void;
  onSubmit: () => void;
  onCreate: () => void;
  onSupport: AccountOp;
  onStatus: AccountOp;
  onDelete: AccountOp;
  total: number;
}) {
  const navigation = useAdminNavigation();
  const rawFilter = navigation.params.get("accountStatus");
  const filter = rawFilter === "active" || rawFilter === "suspended" ? rawFilter : "all";
  const setFilter = (value: string) => navigation.update({ accountStatus: value === "all" ? null : value });
  const visible = accounts.filter((a) => filter === "all" || a.status === filter);
  return (
    <div className="admin-page admin-accounts-page">
      <PageHeading title="Управление аккаунтами" description="Аккаунты студий и организаций на платформе KHANZAMA." />
      <form
        className="admin-toolbar admin-account-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <SearchField
          label="Поиск аккаунтов"
          placeholder="Название, владелец или UUID"
          value={search}
          onChange={onSearch}
        />
        <Button type="submit" variant="ghost" className="admin-find-button">
          Найти
        </Button>
      </form>
      <Button type="button" className="admin-create-account" icon={<UserPlus size={17} />} onClick={onCreate}>
        Создать аккаунт
      </Button>
      <Segments
        label="Статус аккаунтов"
        value={filter}
        onChange={setFilter}
        items={[
          { value: "all", label: `Все (${accounts.length})` },
          { value: "active", label: `Активные (${accounts.filter((a) => a.status === "active").length})` },
          {
            value: "suspended",
            label: `Приост. (${accounts.filter((a) => a.status === "suspended").length})`,
          },
        ]}
      />
      <Surface className="admin-list-surface">
        <div className="admin-desktop-list admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Владелец</th>
                <th>Пакет</th>
                <th>Работ</th>
                <th>Срок</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button
                      className="admin-text-action"
                      data-admin-focus={`account-title-${a.id}`}
                      onClick={() => onSupport(a)}
                    >
                      {a.name}
                    </button>
                  </td>
                  <td>{a.ownerName ?? "Не указан"}</td>
                  <td>
                    <Badge>{a.planName ?? "Без тарифа"}</Badge>
                  </td>
                  <td>{a.arItemCount}</td>
                  <td>{a.subscriptionStatus ? expiry(a.subscriptionExpiresAt) : "Нет подписки"}</td>
                  <td>
                    <Badge value={a.status} />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <Button
                        type="button"
                        variant="quiet"
                        aria-label="Открыть аккаунт"
                        data-admin-focus={`account-${a.id}`}
                        onClick={() => onSupport(a)}
                      >
                        Открыть <ArrowUpRight size={14} />
                      </Button>
                      <details className="admin-action-menu">
                        <summary aria-label={`Другие действия: ${a.name}`}>•••</summary>
                        <div>
                          <button onClick={() => onStatus(a)}>
                            {a.status === "active" ? "Приостановить" : "Восстановить"}
                          </button>
                          <button className="admin-danger" onClick={() => onDelete(a)}>
                            Удалить аккаунт
                          </button>
                        </div>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-mobile-list">
          {visible.map((a) => (
            <article className="admin-mobile-card admin-account-card" key={a.id}>
              <div className="admin-card-top">
                <button
                  className="admin-text-action"
                  data-admin-focus={`account-title-${a.id}`}
                  onClick={() => onSupport(a)}
                >
                  {a.name}
                </button>
                <Button
                  type="button"
                  variant="quiet"
                  data-admin-focus={`account-${a.id}`}
                  aria-label="Открыть аккаунт"
                  onClick={() => onSupport(a)}
                >
                  Открыть <ArrowUpRight size={14} />
                </Button>
              </div>
              <p>Владелец: {a.ownerName ?? "Не указан"}</p>
              <p>
                Пакет: <Badge>{a.planName ?? "Без тарифа"}</Badge>
              </p>
              <p>
                Работ: {a.arItemCount} · {formatBytes(a.storageUsedBytes)}
              </p>
              <p>Срок: {a.subscriptionStatus ? expiry(a.subscriptionExpiresAt) : "Нет подписки"}</p>
              <div className="admin-row-actions">
                <Badge value={a.status} />
                <details className="admin-action-menu">
                  <summary aria-label={`Другие действия: ${a.name}`}>•••</summary>
                  <div>
                    <button onClick={() => onStatus(a)}>
                      {a.status === "active" ? "Приостановить" : "Восстановить"}
                    </button>
                    <button className="admin-danger" onClick={() => onDelete(a)}>
                      Удалить аккаунт
                    </button>
                  </div>
                </details>
              </div>
            </article>
          ))}
        </div>
        {!visible.length ? <Empty>Аккаунты не найдены. Измените поиск или фильтр.</Empty> : null}
      </Surface>
      <div className="admin-list-footer">
        <p className="admin-footnote">
          Показано {visible.length} из {total} аккаунтов
        </p>
        <details className="admin-data-notes">
          <summary>О данных пакета</summary>
          <p>Остатки расходуемых добавлений сервер пока не передаёт. Число работ не заменяет остаток пакета.</p>
        </details>
      </div>
    </div>
  );
}

export function AccountDetailSection({
  detail,
  audit,
  onClose,
  onUsers,
  onSubscription,
  account,
  onStatus,
  onDelete,
  onUpdated,
}: {
  detail: AdminAccountDetail;
  audit: AdminSnapshot["audit"]["items"];
  onClose: () => void;
  onUsers: () => void;
  onSubscription: () => void;
  account?: AdminAccount;
  onStatus: AccountOp;
  onDelete: AccountOp;
  onUpdated: () => Promise<void>;
}) {
  const navigation = useAdminNavigation();
  const editing = navigation.params.get("accountEdit") === "1";
  const setEditing = (value: boolean) =>
    value ? navigation.open({ accountEdit: "1" }) : navigation.back({ accountEdit: null });
  const rawPane = navigation.params.get("accountTab");
  const pane = rawPane === "works" || rawPane === "history" ? rawPane : "overview";
  const setPane = (value: string) => navigation.update({ accountTab: value });
  const owner = detail.users.find((u) => u.role === "owner");
  if (editing) return <AccountProfileEditor detail={detail} onCancel={() => setEditing(false)} onSaved={onUpdated} />;
  return (
    <div className="admin-page">
      <button className="admin-back" onClick={onClose}>
        <ArrowLeft size={16} /> Аккаунты
      </button>
      <Surface>
        <div className="admin-identity">
          <div className="admin-avatar">{detail.account.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <h1>
              {detail.account.name} <Badge value={detail.account.status} />
            </h1>
            <p>
              Владелец: {owner?.emailDisplay ?? owner?.fullName ?? "Не указан"} · Участников: {detail.users.length}
            </p>
          </div>
          <Button
            type="button"
            variant="quiet"
            className="admin-edit-account"
            icon={<Pencil size={16} />}
            aria-label="Изменить"
            onClick={() => setEditing(true)}
          >
            <span>Изменить</span>
          </Button>
          {account ? (
            <details className="admin-action-menu">
              <summary aria-label="Управление аккаунтом">•••</summary>
              <div>
                <button onClick={() => onStatus(account)}>
                  {account.status === "active" ? "Приостановить" : "Восстановить"}
                </button>
                <button className="admin-danger" onClick={() => onDelete(account)}>
                  Удалить аккаунт
                </button>
              </div>
            </details>
          ) : null}
        </div>
        <dl className="admin-detail-metrics">
          <div>
            <dt>Пакет</dt>
            <dd>{detail.subscription.planName}</dd>
          </div>
          <div>
            <dt>Осталось добавлений</dt>
            <dd>Нет данных</dd>
          </div>
          <div>
            <dt>Действует до</dt>
            <dd>{expiry(detail.subscription.expiresAt)}</dd>
          </div>
          <div>
            <dt>Использовано</dt>
            <dd>{formatBytes(detail.usage.storageBytes)}</dd>
          </div>
        </dl>
      </Surface>
      <div className="admin-underlined-tabs">
        <Segments
          label="Карточка аккаунта"
          value={pane}
          onChange={(v) => {
            if (v === "users") onUsers();
            else if (v === "subscription") onSubscription();
            else setPane(v);
          }}
          items={[
            { value: "overview", label: "Обзор" },
            { value: "users", label: "Пользователи" },
            { value: "subscription", label: "Подписка" },
            { value: "works", label: "Работы" },
            { value: "history", label: "История" },
          ]}
        />
      </div>
      {pane === "history" ? (
        <AuditSection embedded audit={audit.filter((a) => a.accountId === detail.account.id)} />
      ) : pane === "works" ? (
        <Surface>
          <Heading title="Работы аккаунта" />
          <Stats
            items={[
              { label: "Проекты", value: detail.usage.projects },
              { label: "Группы", value: detail.usage.groups },
              { label: "AR-работы", value: detail.usage.arItems },
              { label: "Опубликовано", value: detail.usage.publishedItems },
            ]}
          />
          <Notice>
            Для поиска конкретной работы используйте «Контент». Просмотр чужих файлов выполняется только через
            разрешённый сервером доступ.
          </Notice>
        </Surface>
      ) : (
        <>
          <div className="admin-account-package-actions">
            <Button type="button" icon={<CreditCard size={18} />} onClick={onSubscription}>
              Назначить пакет
            </Button>
            <Button type="button" variant="quiet" icon={<Image size={18} />} onClick={onSubscription}>
              Добавить фото
            </Button>
            <Button type="button" variant="quiet" icon={<CalendarDays size={18} />} onClick={onSubscription}>
              Продлить срок
            </Button>
          </div>
          <div className="admin-two-column">
            <ResponsivePanel title="Основные данные">
              <dl className="admin-key-values">
                <div>
                  <dt>Название</dt>
                  <dd>{detail.account.name}</dd>
                </div>
                <div>
                  <dt>Статус</dt>
                  <dd>
                    <Badge value={detail.account.status} />
                  </dd>
                </div>
                <div>
                  <dt>Владелец (контакт)</dt>
                  <dd>{owner?.emailDisplay ?? owner?.fullName ?? "Не указан"}</dd>
                </div>
                <div>
                  <dt>Участники</dt>
                  <dd>{detail.users.length}</dd>
                </div>
                <div>
                  <dt>Пакет</dt>
                  <dd>{detail.subscription.planName}</dd>
                </div>
                <div>
                  <dt>Срок действия</dt>
                  <dd>{expiry(detail.subscription.expiresAt)}</dd>
                </div>
                <div>
                  <dt>Осталось добавлений</dt>
                  <dd>Нет данных</dd>
                </div>
                <div>
                  <dt>Хранилище</dt>
                  <dd>{formatBytes(detail.usage.storageBytes)}</dd>
                </div>
              </dl>
            </ResponsivePanel>
            <ResponsivePanel title="Быстрые действия">
              <div className="admin-detail-action-list">
                <button type="button" onClick={onSubscription}>
                  <CreditCard size={22} />
                  <span>
                    <strong>Назначить пакет</strong>
                    <small>Выбрать тариф или дополнение</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
                <button type="button" onClick={onSubscription}>
                  <Image size={22} />
                  <span>
                    <strong>Добавить фото</strong>
                    <small>Начислить дополнительные добавления</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
                <button type="button" onClick={onSubscription}>
                  <CalendarDays size={22} />
                  <span>
                    <strong>Продлить срок</strong>
                    <small>Выбрать пакет продления</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </ResponsivePanel>
          </div>
          <ResponsivePanel title="Недавняя активность аккаунта">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Дата и время</th>
                    <th>Событие</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {audit
                    .filter((record) => record.accountId === detail.account.id)
                    .slice(0, 3)
                    .map((record) => (
                      <tr key={record.id}>
                        <td>{date(record.createdAt)}</td>
                        <td>{record.action}</td>
                        <td>{record.reason}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!audit.some((record) => record.accountId === detail.account.id) ? (
              <p className="admin-footnote">В загруженном журнале пока нет событий этого аккаунта.</p>
            ) : null}
          </ResponsivePanel>
        </>
      )}
    </div>
  );
}

export function UsersSection({
  detail,
  accounts,
  onSelectAccount,
  onReset,
  onStatus,
  onDelete,
  onUpdated,
}: {
  onUpdated: () => Promise<void>;
  detail: AdminAccountDetail | null;
  accounts: AdminAccount[];
  onSelectAccount: AccountOp;
  onReset: (id: string, label: string) => void;
  onStatus: (id: string, label: string, active: boolean) => void;
  onDelete: (id: string, label: string) => void;
}) {
  const navigation = useAdminNavigation();
  const params = navigation.params;
  const search = params.get("userSearch") ?? "";
  const setSearch = (value: string) => navigation.update({ userSearch: value });
  const rawStatus = params.get("userStatus");
  const status = rawStatus === "active" || rawStatus === "blocked" ? rawStatus : "all";
  const setStatus = (value: string) => navigation.update({ userStatus: value === "all" ? null : value });
  const rawRole = params.get("userRole");
  const role = rawRole && Object.hasOwn(roleNames, rawRole) ? rawRole : "all";
  const setRole = (value: string) => navigation.update({ userRole: value === "all" ? null : value });
  const editingUser = detail?.users.find((user) => user.id === params.get("userEdit")) ?? null;
  const setEditingUser = (user: AdminAccountDetail["users"][number] | null) =>
    user ? navigation.open({ userEdit: user.id }) : navigation.back({ userEdit: null });
  const selected = detail?.users.find((user) => user.id === params.get("user")) ?? null;
  const setSelected = (user: AdminAccountDetail["users"][number] | null) =>
    user ? navigation.open({ user: user.id }) : navigation.back({ user: null, userEdit: null });
  const users = (detail?.users ?? []).filter(
    (u) =>
      `${u.fullName} ${u.emailDisplay}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" || u.isActive === (status === "active")) &&
      (role === "all" || u.role === role),
  );
  if (selected && detail)
    return (
      <UserDetailWorkspace
        detail={detail}
        user={selected}
        onBack={() => setSelected(null)}
        onEdit={() => setEditingUser(selected)}
        onReset={() => {
          onReset(selected.id, selected.fullName ?? "пользователь");
          setSelected(null);
        }}
        onStatus={() => {
          onStatus(selected.id, selected.fullName ?? "пользователь", !selected.isActive);
          setSelected(null);
        }}
        onDelete={() => {
          onDelete(selected.id, selected.fullName ?? "пользователь");
          setSelected(null);
        }}
      >
        {editingUser ? (
          <UserProfileEditor
            accountId={detail.account.id}
            user={editingUser}
            onCancel={() => setEditingUser(null)}
            onSaved={onUpdated}
          />
        ) : null}
      </UserDetailWorkspace>
    );
  return (
    <div className="admin-page">
      <PageHeading title="Пользователи платформы" description="Доступ, контакты и роли внутри выбранного аккаунта." />
      <div className="admin-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          label="Поиск пользователей"
          placeholder="Поиск по имени или email"
        />
        <Select
          label="Аккаунт"
          value={detail?.account.id ?? ""}
          onChange={(e) => {
            const account = accounts.find((a) => a.id === e.target.value);
            if (account) onSelectAccount(account);
          }}
          options={[{ value: "", label: "Выберите аккаунт" }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
        />
        <Select
          label="Статус"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "all", label: "Все статусы" },
            { value: "active", label: "Активные" },
            { value: "blocked", label: "Заблокированные" },
          ]}
        />
        <Select
          label="Роль в аккаунте"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "all", label: "Все роли" },
            ...Object.entries(roleNames).map(([value, label]) => ({ value, label })),
          ]}
        />
      </div>
      {!detail ? (
        <Surface>
          <Empty>
            Выберите аккаунт, чтобы открыть его пользователей. Данные загружаются с проверкой прав и записью просмотра в
            историю.
          </Empty>
        </Surface>
      ) : (
        <Surface className="admin-list-surface">
          <div className="admin-desktop-list admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Роль в аккаунте</th>
                  <th>Последний вход</th>
                  <th>Статус</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.fullName ?? "Без имени"}</strong>
                      <small>{u.emailDisplay ?? "Email скрыт"}</small>
                    </td>
                    <td>
                      <Badge>{roleNames[u.role]}</Badge>
                    </td>
                    <td>{date(u.lastLoginAt)}</td>
                    <td>
                      <Badge value={u.isActive ? "active" : "suspended"} />
                    </td>
                    <td>
                      <Button variant="quiet" data-admin-focus={`user-${u.id}`} onClick={() => setSelected(u)}>
                        Открыть
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-mobile-list">
            {users.map((u) => (
              <article className="admin-mobile-card" key={u.id}>
                <div className="admin-card-top">
                  <strong>{u.fullName ?? "Без имени"}</strong>
                  <Badge value={u.isActive ? "active" : "suspended"} />
                </div>
                <p>{u.emailDisplay ?? "Email скрыт"}</p>
                <p>Роль в аккаунте: {roleNames[u.role]}</p>
                <p>Последний вход: {date(u.lastLoginAt)}</p>
                <Button variant="quiet" data-admin-focus={`user-${u.id}`} onClick={() => setSelected(u)}>
                  Открыть
                </Button>
              </article>
            ))}
          </div>
          {!users.length ? <Empty>Пользователи не найдены.</Empty> : null}
        </Surface>
      )}
      {editingUser && detail ? (
        <UserProfileEditor
          accountId={detail.account.id}
          user={editingUser}
          onCancel={() => setEditingUser(null)}
          onSaved={onUpdated}
        />
      ) : null}
    </div>
  );
}

function UserDetailWorkspace({
  detail,
  user,
  onBack,
  onEdit,
  onReset,
  onStatus,
  onDelete,
  children,
}: {
  detail: AdminAccountDetail;
  user: AdminAccountDetail["users"][number];
  onBack: () => void;
  onEdit: () => void;
  onReset: () => void;
  onStatus: () => void;
  onDelete: () => void;
  children?: ReactNode;
}) {
  const titleId = useId();
  return (
    <section className="admin-page admin-user-workspace" role="dialog" aria-modal="false" aria-labelledby={titleId}>
      <button type="button" className="admin-back" onClick={onBack} aria-label="Назад к пользователям">
        <ArrowLeft size={16} />
        Пользователи
      </button>
      <header className="admin-section-heading admin-page-heading">
        <div>
          <h1 id={titleId}>Карточка пользователя</h1>
        </div>
      </header>
      <Surface>
        <div className="admin-user-summary">
          <div className="admin-identity">
            <div className="admin-avatar">
              {(user.fullName ?? "П")
                .split(/\s+/)
                .slice(0, 2)
                .map((value) => value[0])
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <h2>{user.fullName ?? "Без имени"}</h2>
              <p>{user.emailDisplay ?? "Email скрыт"}</p>
              <small className="admin-footnote">
                ID: <span title={user.id}>{user.id.slice(0, 8)}…</span>
              </small>
            </div>
          </div>
          <dl className="admin-key-values">
            <div>
              <dt>Роль в аккаунте</dt>
              <dd>
                <Badge>{roleNames[user.role]}</Badge>
              </dd>
            </div>
            <div>
              <dt>Приглашение принято</dt>
              <dd>{date(user.acceptedAt)}</dd>
            </div>
            <div>
              <dt>Последний вход</dt>
              <dd>{date(user.lastLoginAt)}</dd>
            </div>
          </dl>
          <Badge value={user.isActive ? "active" : "suspended"} />
        </div>
      </Surface>
      <div className="admin-user-detail-columns">
        <div className="admin-detail-primary">
          <ResponsivePanel title="Участие в аккаунте" initialMobileOpen>
            <div className="admin-membership-row">
              <Building2 size={22} />
              <div>
                <strong>{detail.account.name}</strong>
                <p>
                  <Badge>{roleNames[user.role]}</Badge> · {detail.subscription.planName}
                </p>
                <small className="admin-footnote">{expiry(detail.subscription.expiresAt)}</small>
              </div>
            </div>
            <p className="admin-footnote">Показан выбранный аккаунт.</p>
          </ResponsivePanel>
          <ResponsivePanel title="Сеансы и активность">
            <dl className="admin-key-values">
              <div>
                <dt>Последний вход</dt>
                <dd>{date(user.lastLoginAt)}</dd>
              </div>
              <div>
                <dt>История сеансов</dt>
                <dd>Нет данных</dd>
              </div>
              <div>
                <dt>Активное время</dt>
                <dd>Не измеряется</dd>
              </div>
            </dl>
          </ResponsivePanel>
        </div>
        <div className="admin-detail-toolbar admin-user-primary-actions">
          <Button type="button" variant="quiet" icon={<KeyRound size={16} />} onClick={onReset}>
            Сбросить пароль
          </Button>
          <Button type="button" onClick={onEdit}>
            Изменить данные
          </Button>
        </div>
        <div className="admin-detail-secondary">
          <Surface>
            <Heading title="Управление пользователем" />
            <div className="admin-detail-actions">
              <Button type="button" variant="danger" disabled={!user.acceptedAt} onClick={onStatus}>
                {user.isActive ? "Заблокировать" : "Разблокировать"}
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={<Trash2 size={16} />}
                disabled={user.role === "owner"}
                title={user.role === "owner" ? "Сначала назначьте другого владельца аккаунта" : undefined}
                onClick={onDelete}
              >
                Удалить
              </Button>
            </div>
          </Surface>
          <Surface>
            <Heading title="Безопасность" />
            <dl className="admin-key-values">
              <div>
                <dt>Статус</dt>
                <dd>
                  <Badge value={user.isActive ? "active" : "suspended"} />
                </dd>
              </div>
              <div>
                <dt>MFA</dt>
                <dd>Нет данных</dd>
              </div>
            </dl>
            <Notice>Пароль и секреты MFA администратору недоступны.</Notice>
          </Surface>
        </div>
      </div>
      {children}
    </section>
  );
}

export function SubscriptionsSection({
  detail,
  plans,
  accounts,
  onSelectAccount,
  onEdit,
  onGranted,
}: {
  detail: AdminAccountDetail | null;
  plans: AdminPlan[];
  accounts: AdminAccount[];
  onSelectAccount: AccountOp;
  onEdit: (planId: string, status: SubscriptionStatus, days: number) => void;
  onGranted: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [planId, setPlanId] = useState(
    detail?.subscription.planId ?? plans.find((p) => p.productKind === "subscription")?.id ?? "",
  );
  const [status, setStatus] = useState<SubscriptionStatus>(detail?.subscription.status ?? "active");
  const [days, setDays] = useState("30");
  const visible = accounts.filter(
    (a) =>
      `${a.name} ${a.planName}`.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || a.subscriptionStatus === filter),
  );
  return (
    <div className="admin-page">
      <PageHeading title="Подписки" description="Назначение пакетов и управление подписками всех аккаунтов." />
      <div className="admin-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          label="Поиск подписок"
          placeholder="Поиск по аккаунту или пакету"
        />
        <Select
          label="Статус"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: "all", label: "Все статусы" },
            ...Object.entries(statusNames)
              .filter(([k]) => ["active", "trial", "grace_period", "expired", "suspended", "cancelled"].includes(k))
              .map(([value, label]) => ({ value, label })),
          ]}
        />
      </div>
      <div className="admin-subscription-layout">
        <Surface className="admin-list-surface">
          <div className="admin-desktop-list admin-table-wrap">
            <table className="admin-table admin-subscription-table">
              <thead>
                <tr>
                  <th>Аккаунт</th>
                  <th>Пакет</th>
                  <th>Окончание</th>
                  <th>Статус</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id} className={detail?.account.id === a.id ? "is-selected" : ""}>
                    <td>
                      <strong>{a.name}</strong>
                    </td>
                    <td>
                      <Badge>{a.planName ?? "Без тарифа"}</Badge>
                    </td>
                    <td>{a.subscriptionStatus ? expiry(a.subscriptionExpiresAt) : "—"}</td>
                    <td>{a.subscriptionStatus ? <Badge value={a.subscriptionStatus} /> : "—"}</td>
                    <td>
                      <Button variant="quiet" onClick={() => onSelectAccount(a)}>
                        Выбрать
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-mobile-list">
            {visible.map((account) => (
              <article key={account.id} className="admin-mobile-card admin-subscription-card">
                <div className="admin-card-top">
                  <strong>{account.name}</strong>
                  {account.subscriptionStatus ? <Badge value={account.subscriptionStatus} /> : null}
                </div>
                <p>
                  <Badge>{account.planName ?? "Без тарифа"}</Badge> ·{" "}
                  {account.subscriptionStatus ? expiry(account.subscriptionExpiresAt) : "Нет подписки"}
                </p>
                <Button
                  type="button"
                  variant="quiet"
                  className="admin-subscription-select"
                  aria-label="Выбрать аккаунт"
                  onClick={() => onSelectAccount(account)}
                >
                  <ChevronRight size={18} />
                </Button>
              </article>
            ))}
          </div>
          {!visible.length ? <Empty>Подписки не найдены.</Empty> : null}
        </Surface>
        <Surface>
          <Heading title="Назначение пакета" />
          {detail ? (
            <>
              <div className="admin-selected-account">
                <Building2 size={24} />
                <div>
                  <strong>{detail.account.name}</strong>
                  <p>Текущий пакет: {detail.subscription.planName}</p>
                  <small>{expiry(detail.subscription.expiresAt)}</small>
                </div>
              </div>
              <PackageGrant detail={detail} plans={plans} onSuccess={onGranted} />
              <details className="admin-disclosure">
                <summary>Ручное управление состоянием подписки</summary>
                <div className="admin-form-grid">
                  <Select
                    label="Тариф"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    options={plans
                      .filter((p) => p.productKind === "subscription")
                      .map((p) => ({ value: p.id, label: p.name }))}
                  />
                  <Select
                    label="Статус"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                    options={["trial", "active", "grace_period", "expired", "suspended", "cancelled"].map((value) => ({
                      value,
                      label: statusNames[value],
                    }))}
                  />
                  <label>
                    Окончание через дней от сегодня
                    <Input type="number" min="1" max="730" value={days} onValueChange={setDays} />
                  </label>
                  <Notice>
                    Это действие заменяет состояние и срок подписки. Для добавления фото или времени используйте пакет
                    выше.
                  </Notice>
                  <Button onClick={() => onEdit(planId, status, Math.max(1, Number(days) || 30))}>
                    Проверить и применить
                  </Button>
                </div>
              </details>
            </>
          ) : (
            <Empty>Выберите аккаунт слева. Перед начислением появятся состав пакета и итоговая дата.</Empty>
          )}
        </Surface>
      </div>
    </div>
  );
}

export function PlansSection({
  plans,
  onCreate,
  onEdit,
}: {
  plans: AdminPlan[];
  onCreate: () => void;
  onEdit: (plan: AdminPlan) => void;
}) {
  const navigation = useAdminNavigation();
  const kind = navigation.params.get("planKind") === "addon" ? "addon" : "subscription";
  const groups: ("subscription" | "addon")[] = kind === "addon" ? ["addon", "subscription"] : ["subscription", "addon"];
  return (
    <div className="admin-page">
      <PageHeading
        title="Тарифы и дополнения"
        description="Каталог тарифов платформы и дополнительных опций"
        actions={
          <Button type="button" onClick={onCreate}>
            Новый тариф
          </Button>
        }
      />
      <div className="admin-underlined-tabs">
        <Segments
          label="Тип тарифа"
          value={kind}
          onChange={(value) => navigation.update({ planKind: value })}
          items={[
            { value: "subscription", label: "Базовые тарифы" },
            { value: "addon", label: "Дополнения" },
          ]}
        />
      </div>
      {groups.map((group) => (
        <section className="admin-plan-group" key={group}>
          <Heading
            title={group === "subscription" ? "Базовые тарифы" : "Дополнения"}
            description={
              group === "subscription"
                ? "Основные планы с лимитом добавлений и сроком действия."
                : "Дополнительные фото и время к действующему пакету."
            }
          />
          <div className="admin-plan-grid">
            {plans
              .filter((plan) => plan.productKind === group)
              .map((plan) => (
                <Surface key={plan.id} className="admin-plan-card">
                  <div className="admin-card-top">
                    <Badge>{group === "addon" ? "Дополнение" : "Базовый тариф"}</Badge>
                    <Badge value={plan.isActive ? "active" : "closed"}>{plan.isActive ? "Включён" : "Отключён"}</Badge>
                  </div>
                  <h3>{plan.name}</h3>
                  {plan.description ? <p className="admin-plan-description">{plan.description}</p> : null}
                  <div className="admin-plan-features">
                    <p>
                      <Image size={17} />
                      <span>
                        {plan.arItemLimit === null
                          ? "Без лимита фото"
                          : `${plan.arItemLimit.toLocaleString("ru-RU")} добавлений фото`}
                      </span>
                    </p>
                    <p>
                      <CalendarDays size={17} />
                      <span>
                        {plan.durationDays === null ? "Без срока" : `Срок действия: ${plan.durationDays} дней`}
                      </span>
                    </p>
                  </div>
                  <strong className="admin-price">
                    {new Intl.NumberFormat("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                      maximumFractionDigits: 2,
                    }).format(plan.priceKopecks / 100)}
                  </strong>
                  <Button type="button" onClick={() => onEdit(plan)}>
                    Редактировать
                  </Button>
                </Surface>
              ))}
          </div>
          {!plans.some((plan) => plan.productKind === group) ? (
            <Surface>
              <p className="admin-footnote">
                {group === "addon" ? "Дополнительных пакетов пока нет." : "Базовых тарифов пока нет."}
              </p>
            </Surface>
          ) : null}
        </section>
      ))}
      <p className="admin-footnote">
        Удаление работы не возвращает добавление. Цена в каталоге не списывает деньги с аккаунтов автоматически.
      </p>
    </div>
  );
}

export function StorageSection({
  accounts,
  plans,
  totalBytes,
  onRefresh,
}: {
  accounts: AdminAccount[];
  plans: AdminPlan[];
  totalBytes: number;
  onRefresh?: () => void;
}) {
  const [search, setSearch] = useState("");
  const visible = accounts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="admin-page">
      <PageHeading
        actions={<RefreshAction onRefresh={onRefresh} />}
        title="Хранилище и ресурсы"
        description="Использование медиа аккаунтами и состояние источников мониторинга."
      />
      <div className="admin-two-column">
        <Surface>
          <Heading title="Сервер (VPS)" />
          <dl className="admin-key-values">
            <div>
              <dt>Диск</dt>
              <dd>Нет данных</dd>
            </div>
            <div>
              <dt>Оперативная память</dt>
              <dd>Нет данных</dd>
            </div>
          </dl>
          <Notice>Мониторинг физических ресурсов сервера пока не подключён.</Notice>
        </Surface>
        <Surface>
          <Heading title="Медиа и S3" />
          <strong className="admin-price">{formatBytes(totalBytes)}</strong>
          <p className="admin-footnote">Учтённый объём медиа по данным платформы.</p>
          <Notice>
            Объём и свободное место самого S3, корзина версий и резервные копии не измеряются этим показателем.
          </Notice>
        </Surface>
      </div>
      <Surface>
        <Heading
          title="Хранилище аккаунтов"
          actions={
            <SearchField value={search} onChange={setSearch} label="Поиск в хранилище" placeholder="Найти аккаунт" />
          }
        />
        <div className="admin-desktop-list admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Аккаунт</th>
                <th>Пакет</th>
                <th>Использовано</th>
                <th>Лимит по тарифу</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => {
                const plan = plans.find((p) => p.code === a.planCode);
                const limit = plan?.storageLimitBytes;
                return (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name}</strong>
                    </td>
                    <td>
                      <Badge>{a.planName ?? "Без тарифа"}</Badge>
                    </td>
                    <td>
                      {formatBytes(a.storageUsedBytes)}
                      {limit && limit > 0 ? (
                        <progress
                          aria-label={`Хранилище: ${a.name}`}
                          max={limit}
                          value={Math.min(a.storageUsedBytes, limit)}
                        />
                      ) : null}
                    </td>
                    <td>{!plan ? "Нет данных" : limit === null ? "Без лимита" : formatBytes(limit ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="admin-mobile-list">
          {visible.map((account) => {
            const plan = plans.find((item) => item.code === account.planCode);
            return (
              <div className="admin-storage-row" key={account.id}>
                <Building2 size={16} />
                <strong>{account.name}</strong>
                <span>
                  {formatBytes(account.storageUsedBytes)} /{" "}
                  {plan ? (plan.storageLimitBytes === null ? "∞" : formatBytes(plan.storageLimitBytes)) : "—"}
                </span>
              </div>
            );
          })}
        </div>
        {!visible.length ? <Empty>Аккаунты не найдены.</Empty> : null}
      </Surface>
      <Surface>
        <Heading title="Резервные копии" />
        <Notice>
          Данные о последней проверенной копии и восстановлении пока не подключены. Наличие S3 не подтверждает наличие
          резервной копии базы данных.
        </Notice>
      </Surface>
    </div>
  );
}

export function ItemsSection({
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
  onSearch: (v: string) => void;
  onSubmit: () => void;
  onSuspend: (i: AdminContentResult) => void;
}) {
  const [account, setAccount] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminContentResult | null>(null);
  const visible = results.filter(
    (i) => (account === "all" || account === i.accountId) && (status === "all" || status === i.arItemStatus),
  );
  return (
    <div className={`admin-page ${selected ? "admin-with-inspector" : ""}`}>
      <PageHeading title="Контент платформы" description="Проекты, группы и AR-работы всех аккаунтов." />
      <form
        className="admin-toolbar admin-content-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <SearchField
          label="Поиск проектов и AR-работ"
          placeholder="Проект, группа, работа или UUID"
          value={search}
          onChange={onSearch}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Ищем…" : "Найти"}
        </Button>
        <Select
          label="Аккаунт"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          options={[
            { value: "all", label: "Все аккаунты" },
            ...Array.from(new Map(results.map((i) => [i.accountId, i.accountName]))).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
        />
        <Select
          label="Публикация"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "all", label: "Все статусы" },
            ...Array.from(new Set(results.map((i) => i.arItemStatus))).map((value) => ({
              value,
              label: statusNames[value] ?? value,
            })),
          ]}
        />
      </form>
      {error ? (
        <p role="alert" className="admin-danger">
          {errorText(error)}
        </p>
      ) : null}
      <Surface className="admin-list-surface">
        <div className="admin-desktop-list admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Проект / AR-работа</th>
                <th>Аккаунт</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr key={i.arItemId}>
                  <td>
                    <strong>{i.arItemTitle}</strong>
                    <small>
                      {i.projectName} / {i.groupName}
                    </small>
                  </td>
                  <td>{i.accountName}</td>
                  <td>
                    <Badge value={i.arItemStatus} />
                  </td>
                  <td>
                    <Button variant="quiet" onClick={() => setSelected(i)}>
                      Открыть
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-mobile-list">
          {visible.map((item) => (
            <article key={item.arItemId} className="admin-content-row">
              <span className="admin-content-placeholder" aria-label="Превью недоступно">
                <Image size={20} />
              </span>
              <div>
                <strong>{item.arItemTitle}</strong>
                <small>{item.accountName}</small>
                <Badge value={item.arItemStatus} />
              </div>
              <Button type="button" variant="quiet" onClick={() => setSelected(item)}>
                Открыть
              </Button>
            </article>
          ))}
        </div>
        {!visible.length ? (
          <Empty>
            {results.length
              ? "Работы по выбранным фильтрам не найдены."
              : "Введите минимум два символа для поиска по клиентским проектам."}
          </Empty>
        ) : null}
      </Surface>
      {selected ? (
        <Inspector title={selected.arItemTitle} onClose={() => setSelected(null)}>
          {selected ? (
            <>
              <dl className="admin-key-values">
                <div>
                  <dt>Аккаунт</dt>
                  <dd>{selected.accountName}</dd>
                </div>
                <div>
                  <dt>Проект</dt>
                  <dd>{selected.projectName}</dd>
                </div>
                <div>
                  <dt>Группа</dt>
                  <dd>{selected.groupName}</dd>
                </div>
                <div>
                  <dt>Статус</dt>
                  <dd>
                    <Badge value={selected.arItemStatus} />
                  </dd>
                </div>
              </dl>
              <Notice>
                Просмотр фото, видео и QR в админке пока недоступен. Приватные файлы доступны только участникам с
                нужными правами.
              </Notice>
              <Button
                variant={selected.arItemStatus === "suspended" ? "quiet" : "danger"}
                onClick={() => {
                  onSuspend(selected);
                  setSelected(null);
                }}
              >
                {selected.arItemStatus === "suspended" ? "Восстановить" : "Приостановить"}
              </Button>
            </>
          ) : null}
        </Inspector>
      ) : null}
    </div>
  );
}

export function ErrorsSection({
  errors,
  onRetry,
  onRefresh,
}: {
  onRefresh?: () => void;
  errors: AdminSnapshot["errors"]["items"];
  onRetry: (e: AdminSnapshot["errors"]["items"][number]) => void;
}) {
  const [search, setSearch] = useState("");
  const visible = errors.filter((e) =>
    `${e.arItemTitle} ${e.accountName}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="admin-page">
      <PageHeading
        actions={<RefreshAction onRefresh={onRefresh} />}
        title="Обработка и ошибки"
        description="Неуспешные задачи и безопасный повтор обработки."
      />
      <Stats
        items={[
          { label: "С ошибками в выборке", value: errors.length, icon: <CircleAlert size={19} /> },
          { label: "В очереди", value: "—", hint: "Не передаётся сервером" },
          { label: "Обрабатываются", value: "—", hint: "Не передаётся сервером" },
        ]}
      />
      <SearchField value={search} onChange={setSearch} label="Поиск задач" placeholder="Работа или аккаунт" />
      <Surface className="admin-list-surface">
        {visible.map((e) => (
          <details className="admin-job" key={e.id}>
            <summary>
              <span>
                <strong>{e.arItemTitle}</strong>
                <small>{e.accountName}</small>
              </span>
              <Badge value="failed">Ошибка</Badge>
              <span className="admin-job-date">{date(e.updatedAt)}</span>
            </summary>
            <div className="admin-job-detail">
              <p>
                Не удалось завершить {e.type.includes("video") ? "подготовку видео" : "обработку AR-работы"}. Проверьте
                исходные файлы и попробуйте повторить задачу.
              </p>
              <dl className="admin-key-values">
                <div>
                  <dt>Код ошибки</dt>
                  <dd>{e.errorCode}</dd>
                </div>
                <div>
                  <dt>Попытки</dt>
                  <dd>
                    {e.attemptCount} из {e.maxAttempts}
                  </dd>
                </div>
              </dl>
              <Button variant="quiet" onClick={() => onRetry(e)}>
                Повторить задачу
              </Button>
            </div>
          </details>
        ))}
        {!visible.length ? <Empty>{errors.length ? "Задачи не найдены." : "Необработанных ошибок нет."}</Empty> : null}
      </Surface>
      <Notice>
        Здесь показаны ошибки из серверного списка. Полная очередь, время этапов и завершённые задачи пока недоступны.
      </Notice>
    </div>
  );
}

export function AuditSection({
  audit,
  onRefresh,
  accounts = [],
  embedded = false,
}: {
  embedded?: boolean;
  audit: AdminSnapshot["audit"]["items"];
  onRefresh?: () => void;
  accounts?: AdminAccount[];
}) {
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState("all");
  const [period, setPeriod] = useState("all");
  const [now] = useState(() => Date.now());
  const [selected, setSelected] = useState<AdminSnapshot["audit"]["items"][number] | null>(null);
  const visible = audit.filter(
    (a) =>
      `${a.action} ${a.reason} ${a.actorName ?? ""} ${a.entityId ?? ""}`.toLowerCase().includes(search.toLowerCase()) &&
      (actor === "all" || a.actorUserId === actor) &&
      (period === "all" || Date.parse(a.createdAt) >= now - Number(period) * 86400000),
  );
  return (
    <div className={`admin-page ${selected ? "admin-with-inspector" : ""}`}>
      {embedded ? (
        <Heading title="История действий" />
      ) : (
        <PageHeading
          actions={<RefreshAction onRefresh={onRefresh} />}
          title="История действий"
          description="Неизменяемый журнал административных действий."
        />
      )}
      <div className="admin-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          label="Поиск в журнале"
          placeholder="Действие, исполнитель или описание"
        />
        <Select
          label="Период"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={[
            { value: "all", label: "Всё доступное время" },
            { value: "7", label: "Последние 7 дней" },
            { value: "30", label: "Последние 30 дней" },
          ]}
        />
        <Select
          label="Исполнитель"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          options={[
            { value: "all", label: "Все исполнители" },
            ...Array.from(new Map(audit.map((a) => [a.actorUserId, a.actorName ?? a.actorUserId]))).map(
              ([value, label]) => ({ value, label }),
            ),
          ]}
        />
      </div>
      <Surface className="admin-list-surface">
        <div className="admin-desktop-list admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Дата и время</th>
                <th>Исполнитель</th>
                <th>Действие</th>
                <th>Аккаунт</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>{date(a.createdAt)}</td>
                  <td>{a.actorName ?? "Администратор"}</td>
                  <td>
                    <strong className="admin-audit-action-label">{auditActionName(a.action)}</strong>
                    <small className="admin-action-code">{a.action}</small>
                  </td>
                  <td>
                    {accounts.find((account) => account.id === a.accountId)?.name ??
                      (a.accountId ? "Аккаунт" : "Платформа")}
                  </td>
                  <td>
                    <Button variant="quiet" onClick={() => setSelected(a)}>
                      Детали
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-mobile-list">
          {visible.map((a) => (
            <button className="admin-audit-card" key={a.id} onClick={() => setSelected(a)}>
              <small>{date(a.createdAt)}</small>
              <strong>{auditActionName(a.action)}</strong>
              <small className="admin-action-code">{a.action}</small>
              <span>{a.actorName ?? "Администратор"}</span>
              <p>{a.reason}</p>
            </button>
          ))}
        </div>
        {!visible.length ? <Empty>Записи не найдены.</Empty> : null}
      </Surface>
      <p className="admin-footnote">
        Найдено {visible.length} записей в последней загруженной выборке. Журнал нельзя изменить или удалить.
      </p>
      {selected ? (
        <Inspector title="Детали действия" onClose={() => setSelected(null)}>
          {selected ? (
            <>
              <Badge>{auditActionName(selected.action)}</Badge>
              <p className="admin-action-code">{selected.action}</p>
              <dl className="admin-key-values">
                <div>
                  <dt>Время</dt>
                  <dd>{date(selected.createdAt)}</dd>
                </div>
                <div>
                  <dt>Исполнитель</dt>
                  <dd>{selected.actorName ?? selected.actorUserId}</dd>
                </div>
                <div>
                  <dt>Объект</dt>
                  <dd>{selected.entityType}</dd>
                </div>
                <div>
                  <dt>Идентификатор</dt>
                  <dd>{selected.entityId ?? "—"}</dd>
                </div>
              </dl>
              <h3 className="admin-subtitle">Автоматическое описание</h3>
              <p>{selected.reason}</p>
              {Object.keys(selected.metadataSafe).length ? (
                <>
                  <h3 className="admin-subtitle">Записанные изменения</h3>
                  <dl className="admin-key-values">
                    {Object.entries(selected.metadataSafe).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <Notice>Детали «было / стало» для этого действия не записаны.</Notice>
              )}
            </>
          ) : null}
        </Inspector>
      ) : null}
    </div>
  );
}

export function SettingsSection({
  settings,
  onChange,
}: {
  settings: AdminSetting[];
  onChange: (s: AdminSetting, v: AdminSetting["value"]) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(settings.map((s) => [s.key, String(s.value)])),
  );
  return (
    <div className="admin-page">
      <PageHeading title="Настройки платформы" description="Регистрация, публикация, сервис и безопасность." />
      {[
        { name: "Регистрация", keys: ["registration_enabled"] },
        { name: "Публикация", keys: ["public_ar_enabled"] },
        { name: "Сервис", keys: ["maintenance_mode", "support_banner", "analytics_retention_days"] },
        { name: "Безопасность", keys: ["admin_mfa_required"] },
      ].map((group) => (
        <Surface key={group.name}>
          <h3 className="admin-setting-group">{group.name}</h3>
          {settings
            .filter((s) => group.keys.includes(s.key))
            .map((s) => (
              <div className="admin-setting-row" key={s.key}>
                <div>
                  <strong>{settingNames[s.key]}</strong>
                  <p>{settingDescriptions[s.key]}</p>
                </div>
                {typeof s.value === "boolean" ? (
                  <button
                    className="admin-toggle"
                    role="switch"
                    aria-checked={s.value}
                    aria-label={settingNames[s.key]}
                    onClick={() => onChange(s, !s.value)}
                  >
                    <span />
                    {s.value ? "Включено" : "Выключено"}
                  </button>
                ) : (
                  <div className="admin-setting-input">
                    <Input
                      aria-label={settingNames[s.key]}
                      type={typeof s.value === "number" ? "number" : "text"}
                      min={s.key === "analytics_retention_days" ? "30" : undefined}
                      max={s.key === "analytics_retention_days" ? "730" : undefined}
                      value={values[s.key] ?? ""}
                      onValueChange={(value) => setValues((v) => ({ ...v, [s.key]: value }))}
                    />
                    <Button
                      variant="quiet"
                      disabled={String(s.value) === values[s.key]}
                      onClick={() => onChange(s, typeof s.value === "number" ? Number(values[s.key]) : values[s.key])}
                    >
                      Сохранить
                    </Button>
                  </div>
                )}
              </div>
            ))}
          {group.name === "Безопасность" ? (
            <Notice>
              Изменение требования MFA подтверждается отдельно. Роли администратора платформы и права аккаунтов остаются
              разделены.
            </Notice>
          ) : null}
        </Surface>
      ))}
    </div>
  );
}

export function AnalyticsSection({
  snapshot,
  onActivity,
  onRefresh,
}: {
  snapshot: AdminSnapshot;
  onActivity: () => void;
  onRefresh?: () => void;
}) {
  const [period, setPeriod] = useState("30");
  const [now] = useState(() => Date.now());
  const threshold = now - Number(period) * 86400000;
  const accounts = snapshot.accounts.items.filter((a) => Date.parse(a.createdAt) >= threshold);
  const daily = new Map<string, number>();
  accounts.forEach((a) => {
    const day = new Date(a.createdAt).toLocaleDateString("ru-RU");
    daily.set(day, (daily.get(day) ?? 0) + 1);
  });
  return (
    <div className="admin-page admin-analytics-page">
      <PageHeading
        actions={<RefreshAction onRefresh={onRefresh} />}
        title="Аналитика платформы"
        description="Доступные показатели по данным аккаунтов и общей сводки."
      />
      <div className="admin-toolbar admin-filter-panel">
        <Select
          label="Регистрации аккаунтов за период"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={[
            { value: "7", label: "Последние 7 дней" },
            { value: "30", label: "Последние 30 дней" },
            { value: "90", label: "Последние 90 дней" },
          ]}
        />
      </div>
      <Stats
        items={[
          { label: "Новые аккаунты в выборке", value: accounts.length, hint: `За ${period} дней` },
          {
            label: "Аккаунты с доступом",
            value: snapshot.overview.accounts.active,
            hint: "Сейчас, не активность за период",
          },
          { label: "Создано AR-работ", value: snapshot.overview.arItems, hint: "За всё время" },
          { label: "Вернувшиеся пользователи", value: "—", hint: "Не измеряется" },
        ]}
      />
      <div className="admin-two-column">
        <Surface>
          <Heading title="Регистрации аккаунтов по дням" />
          {daily.size ? (
            <div className="admin-bars" aria-label="Регистрации в загруженной выборке">
              {Array.from(daily)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, count]) => (
                  <div key={day}>
                    <span>{day}</span>
                    <meter min={0} max={Math.max(...daily.values())} value={count} />
                    <strong>{count}</strong>
                  </div>
                ))}
            </div>
          ) : (
            <Empty>В выбранном периоде нет новых аккаунтов в загруженной выборке.</Empty>
          )}
          <Notice>
            Это распределение до 100 загруженных аккаунтов. Оно не подменяет полную статистику регистраций
            пользователей.
          </Notice>
        </Surface>
        <Surface>
          <Heading title="Активность пользователей" />
          <Empty>Дневная активность и возвращаемость пока не собираются.</Empty>
          <Notice>
            Число пользователей с разрешённым доступом не означает число вошедших или работавших за период.
          </Notice>
        </Surface>
      </div>
      <Surface>
        <Heading
          title="Детализация активности"
          description="Последний вход пользователей выбранного аккаунта."
          actions={
            <Button variant="quiet" onClick={onActivity}>
              Перейти к активности <ArrowUpRight size={16} />
            </Button>
          }
        />
      </Surface>
    </div>
  );
}

export function ActivitySection({
  detail,
  accounts,
  onSelectAccount,
}: {
  detail: AdminAccountDetail | null;
  accounts: AdminAccount[];
  onSelectAccount: AccountOp;
}) {
  const [mode, setMode] = useState("logins");
  const [search, setSearch] = useState("");
  const visible = (detail?.users ?? []).filter((u) =>
    `${u.fullName} ${u.emailDisplay}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="admin-page">
      <PageHeading title="Входы и активность" description="Последние входы и состояние доступных источников данных." />
      <Segments
        value={mode}
        onChange={setMode}
        label="Вид активности"
        items={[
          { value: "registrations", label: "Регистрации" },
          { value: "logins", label: "Входы" },
          { value: "time", label: "Активное время" },
        ]}
      />
      <div className="admin-toolbar">
        <SearchField
          value={search}
          onChange={setSearch}
          label="Поиск активности"
          placeholder="Пользователь или email"
        />
        <Select
          label="Аккаунт"
          value={detail?.account.id ?? ""}
          onChange={(e) => {
            const a = accounts.find((a) => a.id === e.target.value);
            if (a) onSelectAccount(a);
          }}
          options={[{ value: "", label: "Выберите аккаунт" }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
        />
      </div>
      {mode === "time" ? (
        <Surface>
          <Empty>Измерение активного времени пока не подключено.</Empty>
          <Notice>
            Открытая вкладка, последний вход и время регистрации не считаются временем работы. Исторические минуты и
            сеансы не восстанавливаются из этих данных.
          </Notice>
        </Surface>
      ) : mode === "registrations" ? (
        <Surface>
          <Heading title="Создание аккаунтов" />
          <div className="admin-desktop-list admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Аккаунт</th>
                  <th>Владелец</th>
                  <th>Дата создания</th>
                </tr>
              </thead>
              <tbody>
                {accounts
                  .filter(
                    (a) =>
                      `${a.name} ${a.ownerName}`.toLowerCase().includes(search.toLowerCase()) &&
                      (!detail || a.id === detail.account.id),
                  )
                  .map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.name}</strong>
                      </td>
                      <td>{a.ownerName ?? "Не указан"}</td>
                      <td>{date(a.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="admin-mobile-list">
            {accounts
              .filter(
                (account) =>
                  `${account.name} ${account.ownerName}`.toLowerCase().includes(search.toLowerCase()) &&
                  (!detail || account.id === detail.account.id),
              )
              .map((account) => (
                <article className="admin-activity-card" key={account.id}>
                  <strong>{account.name}</strong>
                  <p>{account.ownerName ?? "Владелец не указан"}</p>
                  <p>
                    <CalendarDays size={15} />
                    {date(account.createdAt)}
                  </p>
                </article>
              ))}
          </div>
          <Notice>Это даты создания аккаунтов, а не регистраций пользователей.</Notice>
        </Surface>
      ) : (
        <Surface>
          {detail ? (
            <>
              <Heading title={`Последний вход · ${detail.account.name}`} />
              <div className="admin-desktop-list admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Пользователь</th>
                      <th>Последний вход</th>
                      <th>Активное время</th>
                      <th>Сеансы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.fullName ?? "Без имени"}</strong>
                          <small>{u.emailDisplay ?? "Email скрыт"}</small>
                        </td>
                        <td>{date(u.lastLoginAt)}</td>
                        <td>Не измеряется</td>
                        <td>Нет данных</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-mobile-list">
                {visible.map((user) => (
                  <article className="admin-activity-card" key={user.id}>
                    <div className="admin-card-top">
                      <strong>{user.fullName ?? "Без имени"}</strong>
                      <Badge>{detail.account.name}</Badge>
                    </div>
                    <p>
                      <CalendarDays size={15} />
                      {date(user.lastLoginAt)}
                    </p>
                    <div className="admin-activity-unavailable">
                      <span>Активное время: —</span>
                      <span>Сеансы: —</span>
                    </div>
                  </article>
                ))}
              </div>
              {!visible.length ? <Empty>Пользователи не найдены.</Empty> : null}
            </>
          ) : (
            <Empty>Выберите аккаунт для просмотра последних входов его пользователей.</Empty>
          )}
        </Surface>
      )}
    </div>
  );
}
