# AR Photo — отчёт этапа 10

Дата: 3 августа 2026 года.

## Результат

Этап 10 завершён на уровне репозитория: `/admin` предоставляет отдельную lazy-loaded operations console для суперадминистратора, а PostgreSQL остаётся единственной authorization boundary. Чтение operational data и все изменения требуют активный `superadmin` profile и JWT assurance level `aal2`; support access требует account и причину; опасные действия требуют причины и typed confirmation. Пароли, хэши и recovery credentials отсутствуют в SQL, Edge и frontend контрактах.

Hosted delivery приглашений/recovery email и production TOTP enrollment не отмечены выполненными без привязанного Supabase project. Эти проверки остаются infrastructure gate этапа 11.

## Backend и security boundary

- private таблицы `admin_audit_logs`, `admin_ar_item_suspensions` и `system_settings` используют forced RLS и не имеют browser grants;
- `private.require_admin_mfa` повторно проверяет server-controlled role/status и `aal2` внутри каждого privileged RPC;
- admin overview, accounts, account detail, plans, errors, content search, audit и settings возвращаются только через allowlisted JSON contracts;
- открытие account detail требует причину от 10 символов и создаёт отдельную support-access запись в append-only audit;
- account/subscription/plan/content/settings/retry/reset/account-create mutations атомарно создают admin audit entry;
- прямой browser execute старых password-bearing/admin mutation boundaries отозван;
- content suspension немедленно закрывает public visibility; restore возвращает ранее опубликованный item в private ready и требует осознанной повторной публикации;
- settings имеют закрытый key/value contract; analytics retention ограничен диапазоном 30–730 дней.

## Auth Edge Functions

- `admin-create-user` отправляет Supabase Auth invitation и не принимает временный пароль;
- account creation выполняется только после MFA RPC check, требует reason и компенсирующе удаляет созданного Auth user при ошибке account transaction;
- `admin-reset-password` получает email server-side по user id только после account-scoped authorization/audit и инициирует recovery delivery;
- ни один response не возвращает password, hash, reset token или recovery link;
- redirect URL задаётся server-only переменной `ADMIN_PASSWORD_RESET_REDIRECT_URL`.

## Интерфейс

- 10 разделов: Overview, Users, Accounts, Subscriptions, Plans, Storage, AR Items, Errors, Audit и Settings;
- production adapter выполняет Supabase TOTP challenge/verify, demo adapter воспроизводит тот же contract детерминированно;
- account support modal требует причину, а suspend/restore/reset/retry/settings/subscription actions требуют reason и точную фразу подтверждения;
- account creation объясняет invitation-only flow без передачи пароля администратору;
- runtime Zod schemas используют strict objects и отклоняют неизвестные, в том числе password-like, поля;
- desktop 1440 px и mobile 390 px проверены production preview: вкладки прокручиваются локально, document overflow отсутствует, fixed mobile navigation сохранена.

## Автоматический gate

[GitHub Actions Quality run 30787483274](https://github.com/abdulkadyrov/ar.photo/actions/runs/30787483274) для backend commit `098bdc0` подтвердил:

- clean PostgreSQL 17 migration/reset/seed и SQL function lint;
- 323 pgTAP assertions, включая 61 новую admin authorization/MFA/audit/suspension/settings/password-reset проверку;
- frontend regression и 11 E2E — успешно.

[Processing worker run 30787483271](https://github.com/abdulkadyrov/ar.photo/actions/runs/30787483271) подтвердил production container/runtime. [Quality run 30787661409](https://github.com/abdulkadyrov/ar.photo/actions/runs/30787661409) и [worker run 30787661412](https://github.com/abdulkadyrov/ar.photo/actions/runs/30787661412) подтвердили синхронизированный generated database contract.

[GitHub Actions Quality run 30788827070](https://github.com/abdulkadyrov/ar.photo/actions/runs/30788827070) для UI commit `6e7a243` подтвердил:

- TypeScript, ESLint, 124 unit/component tests, production build, bundle budget и secret scan;
- fresh database, 323 pgTAP assertions и generated database types;
- Chromium E2E 12/12, включая полный MFA-gated admin support/dangerous-action scenario и mobile overflow check.

[Processing worker run 30788827073](https://github.com/abdulkadyrov/ar.photo/actions/runs/30788827073) повторно подтвердил Docker worker build/runtime. Локально дополнительно пройдены `npm run check`, E2E 12/12, Deno typecheck обеих admin Edge Functions и визуальная production-preview QA desktop/mobile.

## Security evidence

- `aal1`, обычный account user, inactive superadmin и anonymous не получают operational data или mutation access;
- support read и каждая новая mutation создают actor/account/reason/time audit без password/email secrets;
- browser не передаёт email в reset boundary и не получает recovery credential;
- content suspension закрывает manifest независимо от UI состояния;
- dangerous actions не выполняются без server authorization, причины и UI typed confirmation;
- Edge inputs и RPC outputs проходят строгую runtime validation;
- frontend bundle проходит secret scan.

## Известные ограничения

- development/production Supabase project не привязан, поэтому deployed invitation/recovery email delivery и redirect allowlist не проверены;
- production TOTP enrollment/recovery policy и break-glass procedure требуют operational rehearsal;
- global Auth session revocation после account/member suspension зависит от hosted Auth configuration и остаётся gate этапа 11;
- platform alerting и production audit retention относятся к stabilization;
- admin actions не заменяют отдельный human approval для production deployment/rollback.

## Ручная проверка

- [x] desktop и mobile overview/navigation;
- [x] reason-captured account support access;
- [x] reset initiation без password visibility;
- [x] account/item suspend/restore и processing retry с typed confirmation;
- [x] audit viewer показывает новые операции;
- [x] settings и plan controls используют protected contracts;
- [ ] hosted Auth invitation/recovery delivery;
- [ ] production TOTP enrollment/recovery rehearsal;
- [ ] production audit alerting/retention approval.
