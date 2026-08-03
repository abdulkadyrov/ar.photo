# AR Photo — отчёт этапа 8

Дата: 3 августа 2026 года.

## Результат

Этап 8 завершён на уровне репозитория: тариф, subscription state, effective limits, usage и точечные разрешения формируются одним trusted contract; project/group/item/upload/publish операции повторно защищены сервером; команда поддерживает invite/accept/revoke, изменение роли и permissions, deactivate/reactivate с concurrency-safe quota. В кабинете работают `/settings`, `/settings/subscription` и `/settings/team` с read-only состояниями, usage meters и адаптивным permission editor.

Hosted Supabase email delivery и admin UI не отмечены выполненными без привязанного project. Защищённый `admin_update_subscription` RPC готов для этапа 10; платёжный provider boundary намеренно возвращает `not_configured`, потому что оплата не входит в MVP этого этапа.

## Entitlements и ограничения

- `get_account_entitlements` возвращает account/role/permissions, plan/subscription, effective limits и usage;
- catalog больше не выводит write-доступ из coarse role и использует authoritative `canWrite`;
- custom limits принимают только семь известных non-negative integer keys;
- статусы `trial`, `active`, `grace_period`, `expired`, `suspended`, `cancelled` имеют явные write/read-only сообщения;
- storage, project, group, AR item и team usage отображаются с текущим значением, лимитом и процентом;
- max video bytes и duration показаны как серверные ограничения;
- данные не удаляются при окончании подписки.

## Permissions и team lifecycle

- allowlist: `upload`, `edit`, `publish`, `delete`, `analytics`, `manage_groups`, `manage_team`;
- manager имеет настраиваемые permissions, editor не может получить `manage_team`, viewer — write/group/team permissions;
- trusted mutation triggers проверяют нужное разрешение независимо от UI;
- pending invitation хранится в отдельной forced-RLS таблице без прямых browser grants;
- invite/reactivate используют advisory lock и считают active members плюс pending invitations;
- accept проверяет authenticated email, срок приглашения, profile ownership и quota атомарно;
- owner, текущий пользователь и manager hierarchy защищены от недопустимого изменения;
- invitation audit не сохраняет email/PII;
- Edge Function компенсирует неуспешную отправку отзывом invitation и поддерживает in-app delivery для существующего пользователя.

## UI и provider boundaries

- account settings показывает effective permissions и состояние аккаунта;
- subscription screen показывает plan, dates, usage, file/duration limits и понятный read-only banner;
- team screen показывает occupied seats, roster, pending invitations и безопасные confirmation dialogs;
- роль автоматически ограничивает доступные checkbox permissions;
- длинные модальные окна прокручиваются внутри mobile viewport;
- mobile bottom navigation содержит dashboard, projects, AR items и settings;
- `BillingProvider` отделён интерфейсом; фиктивной кнопки оплаты или сбора карточных данных нет;
- production repository валидирует JSON RPC responses строгими Zod schemas, demo repository повторяет те же permission/quota rules.

## Автоматический gate

[GitHub Actions Quality run 30783382406](https://github.com/abdulkadyrov/ar.photo/actions/runs/30783382406) для backend commit `a516cb6` подтвердил:

- clean PostgreSQL 17 reset/seed и SQL function lint;
- 221 pgTAP assertion, включая 50 новых subscription/team/permission/quota/audit проверок;
- frontend quality, 9 E2E и generated database types — успешно.

[GitHub Actions Quality run 30783616689](https://github.com/abdulkadyrov/ar.photo/actions/runs/30783616689) для types/lock commit `dbae764` подтвердил повторяемую базу, сгенерированный контракт и Edge dependency lock. [Processing worker run 30783616694](https://github.com/abdulkadyrov/ar.photo/actions/runs/30783616694) подтвердил production container/runtime.

[GitHub Actions Quality run 30784479815](https://github.com/abdulkadyrov/ar.photo/actions/runs/30784479815) для UI commit `5230332` подтвердил:

- TypeScript, ESLint, 93 unit/component tests, production build, bundle budget и secret scan;
- Chromium E2E: 10 сценариев, включая subscription usage, invite, permission update и deactivation;
- fresh database, 221 pgTAP и generated database types.

[Processing worker run 30784479808](https://github.com/abdulkadyrov/ar.photo/actions/runs/30784479808) подтвердил неизменённый Docker worker build/runtime. Локально дополнительно пройдены полный `npm run check`, E2E 10/10, Deno typecheck Edge Function и визуальная production-preview QA через реальный UI.

## Security evidence

- browser не может расширить permission role ceiling или обойти subscription state;
- table grants/RLS и trusted function grants проверяются отдельно;
- quota race сериализуется account-scoped advisory lock;
- invitation email используется только для доставки/сопоставления и исключён из audit metadata;
- service-role остаётся только внутри Edge runtime;
- frontend bundle проходит secret scan;
- payment boundary не принимает финансовые данные до выбора и security review провайдера.

## Известные ограничения

- development/production Supabase project не привязан, поэтому hosted Auth email, redirect allowlist и deployed Edge Function не проверены;
- admin subscription RPC готов, но MFA-protected admin UI реализуется на этапе 10;
- payment provider не выбран и не подключён;
- уведомление о деактивации активной browser session зависит от hosted Auth/session policy и проверяется на этапе 11;
- GitHub Actions показывает upstream warning о Node 20 actions runtime; jobs фактически выполняются на принудительном Node 24 runner и остаются зелёными.

## Ручная проверка

- [x] desktop subscription layout и usage meters;
- [x] desktop team roster, invite modal и permission states;
- [x] mobile 390 px без horizontal scroll;
- [x] invite → permission update → deactivate E2E;
- [x] read-only/grace/expired copy покрыт доменным контрактом;
- [x] keyboard semantics, Escape modal close и confirmation dialogs;
- [ ] hosted email delivery и invitation redirect;
- [ ] hosted session revocation после deactivation;
- [ ] MFA-protected admin subscription UI (этап 10).
