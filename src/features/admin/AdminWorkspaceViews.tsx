import { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CircleAlert,
  CreditCard,
  KeyRound,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Button, Input, Modal, Select } from "../../shared/ui";
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
    <div className="admin-stats">
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
}: {
  snapshot: AdminSnapshot;
  onNavigate: (id: "accounts" | "errors" | "analytics" | "activity") => void;
}) {
  const overview = snapshot.overview;
  const recent = [...snapshot.accounts.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <div className="admin-page">
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
                      <small>{a.ownerName ?? "Владелец не указан"}</small>
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
    <div className="admin-page">
      <Heading
        title="Управление аккаунтами"
        description="Аккаунты студий и организаций на платформе KHANZAMA."
        actions={
          <Button icon={<UserPlus size={17} />} onClick={onCreate}>
            Создать аккаунт
          </Button>
        }
      />
      <form
        className="admin-toolbar"
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
        <Button type="submit" variant="ghost">
          Найти
        </Button>
      </form>
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
                    <small>{a.slug}</small>
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
                      <Button variant="quiet" data-admin-focus={`account-${a.id}`} onClick={() => onSupport(a)}>
                        Открыть аккаунт
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
            <article className="admin-mobile-card" key={a.id}>
              <div className="admin-card-top">
                <button
                  className="admin-text-action"
                  data-admin-focus={`account-title-${a.id}`}
                  onClick={() => onSupport(a)}
                >
                  {a.name}
                </button>
                <Badge value={a.status} />
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
                <Button variant="quiet" data-admin-focus={`account-${a.id}`} onClick={() => onSupport(a)}>
                  Открыть аккаунт
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
            </article>
          ))}
        </div>
        {!visible.length ? <Empty>Аккаунты не найдены. Измените поиск или фильтр.</Empty> : null}
      </Surface>
      <p className="admin-footnote">
        Показано {visible.length} из {total} аккаунтов. Остатки расходуемых добавлений сервер пока не передаёт; число
        работ не заменяет остаток пакета.
      </p>
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
            <h2>
              {detail.account.name} <Badge value={detail.account.status} />
            </h2>
            <p>
              Владелец: {owner?.emailDisplay ?? owner?.fullName ?? "Не указан"} · Участников: {detail.users.length}
            </p>
          </div>
          <Button variant="quiet" onClick={() => setEditing(true)}>
            Изменить
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
      {pane === "history" ? (
        <AuditSection audit={audit.filter((a) => a.accountId === detail.account.id)} />
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
          <div className="admin-quick-actions">
            <button onClick={onSubscription}>
              <CreditCard size={22} />
              <span>
                <strong>Назначить пакет</strong>
                <small>Добавления фото и продление срока</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
            <button onClick={onUsers}>
              <Users size={22} />
              <span>
                <strong>Пользователи</strong>
                <small>Роли внутри этого аккаунта</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="admin-two-column">
            <Surface>
              <Heading title="Основные данные" />
              <dl className="admin-key-values">
                <div>
                  <dt>Название</dt>
                  <dd>{detail.account.name}</dd>
                </div>
                <div>
                  <dt>Адрес аккаунта</dt>
                  <dd>{detail.account.slug}</dd>
                </div>
                <div>
                  <dt>Часовой пояс</dt>
                  <dd>{detail.account.timezone}</dd>
                </div>
                <div>
                  <dt>Создан</dt>
                  <dd>{date(detail.account.createdAt)}</dd>
                </div>
                <div>
                  <dt>Подписка</dt>
                  <dd>
                    <Badge value={detail.subscription.status} />
                  </dd>
                </div>
              </dl>
              <Notice>
                Название и часовой пояс меняются через «Изменить». Назначение пакета не выдаёт роль администратора
                платформы.
              </Notice>
            </Surface>
            <Surface>
              <Heading title="Использование" />
              <dl className="admin-key-values">
                <div>
                  <dt>Проекты</dt>
                  <dd>{detail.usage.projects}</dd>
                </div>
                <div>
                  <dt>AR-работы</dt>
                  <dd>{detail.usage.arItems}</dd>
                </div>
                <div>
                  <dt>Опубликовано</dt>
                  <dd>{detail.usage.publishedItems}</dd>
                </div>
                <div>
                  <dt>Ошибки</dt>
                  <dd>{detail.usage.failedJobs}</dd>
                </div>
              </dl>
            </Surface>
          </div>
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
  return (
    <div className="admin-page">
      <Heading title="Пользователи платформы" description="Доступ, контакты и роли внутри выбранного аккаунта." />
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
      <Modal
        open={Boolean(selected && detail && !editingUser)}
        title="Карточка пользователя"
        onClose={() => setSelected(null)}
      >
        {selected && detail ? (
          <div className="admin-user-detail">
            <div className="admin-identity">
              <div className="admin-avatar">{(selected.fullName ?? "П").slice(0, 2).toUpperCase()}</div>
              <div>
                <h3>{selected.fullName ?? "Без имени"}</h3>
                <p>{selected.emailDisplay ?? "Email скрыт"}</p>
              </div>
            </div>
            <dl className="admin-key-values">
              <div>
                <dt>Аккаунт</dt>
                <dd>{detail.account.name}</dd>
              </div>
              <div>
                <dt>Роль в аккаунте</dt>
                <dd>{roleNames[selected.role]}</dd>
              </div>
              <div>
                <dt>Приглашение принято</dt>
                <dd>{date(selected.acceptedAt)}</dd>
              </div>
              <div>
                <dt>Последний вход</dt>
                <dd>{date(selected.lastLoginAt)}</dd>
              </div>
            </dl>
            <Notice>Данные MFA и полная история сеансов не передаются этим административным API.</Notice>
            <div className="admin-detail-actions">
              <Button
                variant="quiet"
                onClick={() => {
                  setEditingUser(selected);
                }}
              >
                Изменить данные
              </Button>
              <Button
                variant="quiet"
                icon={<KeyRound size={16} />}
                onClick={() => {
                  onReset(selected.id, selected.fullName ?? "пользователь");
                  setSelected(null);
                }}
              >
                Сбросить пароль
              </Button>
              <Button
                variant="danger"
                disabled={!selected.acceptedAt}
                onClick={() => {
                  onStatus(selected.id, selected.fullName ?? "пользователь", !selected.isActive);
                  setSelected(null);
                }}
              >
                {selected.isActive ? "Заблокировать" : "Разблокировать"}
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 size={16} />}
                disabled={selected.role === "owner"}
                title={selected.role === "owner" ? "Сначала назначьте другого владельца аккаунта" : undefined}
                onClick={() => {
                  onDelete(selected.id, selected.fullName ?? "пользователь");
                  setSelected(null);
                }}
              >
                Удалить
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
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
      <Heading title="Подписки" description="Назначение пакетов и управление подписками всех аккаунтов." />
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
              <article key={account.id} className="admin-mobile-card">
                <div className="admin-card-top">
                  <strong>{account.name}</strong>
                  {account.subscriptionStatus ? <Badge value={account.subscriptionStatus} /> : null}
                </div>
                <p>
                  <Badge>{account.planName ?? "Без тарифа"}</Badge> ·{" "}
                  {account.subscriptionStatus ? expiry(account.subscriptionExpiresAt) : "Нет подписки"}
                </p>
                <Button variant="quiet" className="mt-3 w-full" onClick={() => onSelectAccount(account)}>
                  Выбрать аккаунт
                </Button>
              </article>
            ))}
          </div>
          {!visible.length ? <Empty>Подписки не найдены.</Empty> : null}
        </Surface>
        <Surface>
          <Heading title={detail ? `Подписка · ${detail.account.name}` : "Назначение пакета"} />
          {detail ? (
            <>
              <dl className="admin-key-values">
                <div>
                  <dt>Текущий пакет</dt>
                  <dd>{detail.subscription.planName}</dd>
                </div>
                <div>
                  <dt>Действует до</dt>
                  <dd>{expiry(detail.subscription.expiresAt)}</dd>
                </div>
              </dl>
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
  onEdit: (p: AdminPlan) => void;
}) {
  const [kind, setKind] = useState<"subscription" | "addon">("subscription");
  const visible = plans.filter((p) => p.productKind === kind);
  return (
    <div className="admin-page">
      <Heading
        title="Тарифы и дополнения"
        description="Каталог продуктов платформы: добавления фото и срок действия."
        actions={<Button onClick={onCreate}>Новый тариф</Button>}
      />
      <Segments
        label="Тип тарифа"
        value={kind}
        onChange={setKind}
        items={[
          { value: "subscription", label: "Базовые тарифы" },
          { value: "addon", label: "Дополнения" },
        ]}
      />
      <div className="admin-plan-grid">
        {visible.map((p) => (
          <Surface key={p.id} className="admin-plan-card">
            <div className="admin-card-top">
              <Badge>{kind === "addon" ? "Дополнение" : "Базовый тариф"}</Badge>
              <Badge value={p.isActive ? "active" : "closed"}>{p.isActive ? "Включён" : "Отключён"}</Badge>
            </div>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <dl className="admin-key-values">
              <div>
                <dt>Добавления фото</dt>
                <dd>{p.arItemLimit === null ? "Без лимита" : p.arItemLimit.toLocaleString("ru-RU")}</dd>
              </div>
              <div>
                <dt>Срок</dt>
                <dd>{p.durationDays === null ? "Без срока" : `${p.durationDays} дней`}</dd>
              </div>
            </dl>
            <strong className="admin-price">
              {new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 2 }).format(
                p.priceKopecks / 100,
              )}
            </strong>
            <Button variant="quiet" onClick={() => onEdit(p)}>
              Редактировать
            </Button>
          </Surface>
        ))}
      </div>
      {!visible.length ? (
        <Surface>
          <Empty>{kind === "addon" ? "Дополнительных пакетов пока нет." : "Тарифов пока нет."}</Empty>
        </Surface>
      ) : null}
      <Notice>
        Удаление работы не возвращает добавление. Изменение цены в каталоге не списывает деньги с аккаунтов.
      </Notice>
    </div>
  );
}

export function StorageSection({
  accounts,
  plans,
  totalBytes,
}: {
  accounts: AdminAccount[];
  plans: AdminPlan[];
  totalBytes: number;
}) {
  const [search, setSearch] = useState("");
  const visible = accounts.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="admin-page">
      <Heading
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
          <Notice>Мониторинг физических ресурсов сервера не подключён к административному API.</Notice>
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
        <div className="admin-table-wrap">
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
    <div className="admin-page">
      <Heading title="Контент платформы" description="Проекты, группы и AR-работы всех аккаунтов." />
      <form
        className="admin-toolbar"
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
        <div className="admin-table-wrap">
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
        {!visible.length ? (
          <Empty>
            {results.length
              ? "Работы по выбранным фильтрам не найдены."
              : "Введите минимум два символа для поиска по клиентским проектам."}
          </Empty>
        ) : null}
      </Surface>
      <Modal open={Boolean(selected)} title={selected?.arItemTitle ?? "AR-работа"} onClose={() => setSelected(null)}>
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
              Фото, видео и публичный QR не передаются поисковым API. Для приватных файлов нужен отдельный проверенный
              доступ; ссылки не создаются из идентификатора.
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
      </Modal>
    </div>
  );
}

export function ErrorsSection({
  errors,
  onRetry,
}: {
  errors: AdminSnapshot["errors"]["items"];
  onRetry: (e: AdminSnapshot["errors"]["items"][number]) => void;
}) {
  const [search, setSearch] = useState("");
  const visible = errors.filter((e) =>
    `${e.arItemTitle} ${e.accountName}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="admin-page">
      <Heading title="Обработка и ошибки" description="Неуспешные задачи и безопасный повтор обработки." />
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

export function AuditSection({ audit }: { audit: AdminSnapshot["audit"]["items"] }) {
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
    <div className="admin-page">
      <Heading title="История действий" description="Неизменяемый журнал административных действий." />
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
                <th>Описание</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>{date(a.createdAt)}</td>
                  <td>{a.actorName ?? "Администратор"}</td>
                  <td>
                    <span className="admin-action-code">{a.action}</span>
                  </td>
                  <td>{a.reason}</td>
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
              <strong>{a.action}</strong>
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
      <Modal open={Boolean(selected)} title="Детали действия" onClose={() => setSelected(null)}>
        {selected ? (
          <>
            <Badge>{selected.action}</Badge>
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
      </Modal>
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
      <Heading title="Настройки платформы" description="Регистрация, публикация, сервис и безопасность." />
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

export function AnalyticsSection({ snapshot, onActivity }: { snapshot: AdminSnapshot; onActivity: () => void }) {
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
    <div className="admin-page">
      <Heading title="Аналитика платформы" description="Доступные показатели по данным аккаунтов и общей сводки." />
      <div className="admin-toolbar">
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
      <Heading title="Входы и активность" description="Последние входы и состояние доступных источников данных." />
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
          <div className="admin-table-wrap">
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
          <Notice>Дата создания аккаунта не является датой регистрации пользователя в Auth.</Notice>
        </Surface>
      ) : (
        <Surface>
          {detail ? (
            <>
              <Heading title={`Последний вход · ${detail.account.name}`} />
              <div className="admin-table-wrap">
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
