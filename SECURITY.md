# AR Photo — security posture и plan

## 1. Текущий security posture

Репозиторий содержит browser prototype как изолированный regression path и production-oriented Supabase foundation. Этапы 2–4 добавили Auth identity boundary, membership, forced RLS, explicit grants, subscription enforcement, private Storage policies, audit logs, quota-aware mutations и resumable upload lifecycle.

Это ещё не разрешение на работу с реальными клиентами: upload inspection, public manifest/signed URLs, rate limiting, MFA администратора, hosted advisors и production environment verification закрываются последующими этапами.

## 2. Findings

### P0 — блокируют коммерческий запуск

#### SEC-001: отсутствуют Auth, tenant isolation и RLS

Все данные доступны любому, кто использует тот же browser profile. Нельзя доказать владельца, роль или account membership.

Мера: Supabase Auth, `account_members`, RLS на каждой exposed table, явные grants, server-only admin operations и negative cross-tenant tests.

Статус этапа 2: закрыто на уровне репозитория. Forced RLS включён на 13 application tables, `anon` не имеет table grants, cross-tenant/inactive/expired/storage сценарии покрыты pgTAP.

#### SEC-002: media и QR не имеют безопасной публичной модели

Blob остаются в IndexedDB, а QR содержит внутренний viewer id и origin текущего запуска. Попытка сделать Storage public без новой модели создаст утечку.

Мера: unpredictable `public_slug`, public manifest endpoint, private originals, short-lived signed URLs и отдельный optimized asset.

Статус этапа 2: частично закрыто. 144-bit slug и private buckets реализованы; public manifest и short-lived signed URLs относятся к этапу 6.

#### SEC-003: файлы не валидируются

Picker accepts не являются защитой. Нет magic-byte inspection, size/duration limits, codec validation, decode test, SVG sanitization или malware/quarantine boundary.

Мера: client preflight + bucket constraints + trusted post-upload inspection; publication запрещена до успешной проверки.

Статус этапа 4: browser preflight проверяет magic bytes, decode, image dimensions/EXIF strip и MP4 H.264/AAC metadata; server независимо проверяет private object MIME/size, quota и metadata contract. Browser metadata остаются недоверенными, поэтому authoritative worker inspection и запрет публикации до успешного processing job обязательны в этапе 5.

#### SEC-004: публичный test asset содержит metadata

`public/test-assets/test.jpg` содержит EXIF, включая указание на GPS-данные, модель устройства и дату. Файл копируется в public build. Аналогичный metadata найден в локальном `test-assets/test2.jpg`.

Мера: удалить/заменить production-public fixture на синтетический asset, strip metadata, добавить CI check. До решения не публиковать текущий build как продуктовый.

#### SEC-005: dependency vulnerabilities

`npm audit` обнаружил 1 critical и 4 high. Critical `tar` и часть high-находок приходят через `mind-ar → canvas → @mapbox/node-pre-gyp`; direct high найден в `postcss`. Обычный `npm ci` также ломается на Node 26 из-за native `canvas@2.11.2`.

Мера: в этапе 1 провести controlled update/override audit, отделить offline compiler dependencies от browser runtime, закрепить Node 22, повторить build/AR regression и добиться приемлемого audit baseline. Не выполнять слепой `npm audit fix`.

Статус этапа 1: critical `tar`, vulnerable `form-data` и direct `postcss` устранены pin/override. `npm audit` всё ещё сообщает один high advisory через `react-router-dom@7.18.2`; он затрагивает RSC action execution, тогда как AR Photo использует только client-side Vite routing и не включает React Server Components/Data RSC mode. Это временное documented exception: версия закреплена, dependency bot должен поднять PR сразу после выхода исправленного стабильного релиза.

### P1 — должны быть закрыты до MVP

#### SEC-006: необратимое удаление без подтверждения

На этапе аудита `deleteProjectCascade` и `clearAll` удаляли данные сразу без подтверждения.

Мера: typed confirmation, soft delete, retention, restore, background Storage cleanup и audit entry.

Статус этапа 1: оба локальных destructive action требуют явного подтверждения. Soft delete, restore, retention и audit остаются обязательными для production CRUD этапа 3.

#### SEC-007: ZIP import доверяет содержимому

JSON приводится к TypeScript type без runtime validation. Нет ограничений размера/количества entries, checksum, path policy и version contract.

Мера: Zod schema, manifest version, compressed/uncompressed limits, allowlisted paths, entry count limit, checksum и transactional import preview. Для server import — sandbox worker.

#### SEC-008: public id недостаточно отделён от internal id

`createId` оставляет 14 hex characters (56 bits) и этот id используется в QR. Публичная ссылка раскрывает внутреннюю структуру `viewer/livephoto_*`.

Мера: отдельный 128+ bit random slug, уникальный index, rate limit и возможность rotate/revoke.

#### SEC-009: service worker имеет слишком широкую cache policy

Текущий worker кэширует любой GET, который видит в scope, без allowlist и без проверки типа ответа. После добавления API/signed media это может сохранить приватные ответы в Cache Storage.

Мера: Workbox/vite-plugin-pwa strategy с precache hashed assets; network-only для Auth/API/signed media; cache version/update UI; тест logout/cache cleanup.

#### SEC-010: камера запрашивается до user gesture

`ViewerPage` и test viewer вызывают `getUserMedia` при mount. Это не соответствует privacy UX из ТЗ и усложняет browser autoplay/permission behavior.

Мера: intro screen, explicit «Начать», privacy link, capability checks и управляемый permission state.

#### SEC-011: нет backend quota enforcement

Frontend отсутствует, а будущие скрытые кнопки не дают защиты от прямого API вызова.

Мера: quota-sensitive mutations только через trusted transaction; RLS/constraints остаются второй линией защиты.

Статус этапа 2: project/group/AR-item creation защищены transaction-scoped advisory locks, subscription checks, effective limits и idempotency keys. Upload/team/storage quotas дополняются в этапах 4 и 8.

#### SEC-012: отсутствует rate limiting и abuse control

Public viewer/analytics endpoints пока нет, но без ограничения slug enumeration и event spam будут дешёвыми.

Мера: per-IP coarse rate limit без долгого хранения raw IP, per-slug/session budgets, WAF/platform controls, idempotency и anomaly alerts.

### P2 — hardening

- нет CSP, frame-ancestors, Permissions-Policy и формализованных security headers;
- нет central error redaction и observability integration;
- audit logs добавлены для основных tenant mutations; coverage расширяется вместе с новыми mutation flows;
- нет automatic secret scan/dependency review в CI;
- unused `public/vendor` copies попадают в build и увеличивают supply-chain surface;
- произвольные user strings пока безопасно экранируются React, но будущие rich text/SVG требуют отдельной sanitization policy;
- аналитика не имеет retention/privacy specification;
- нет session revocation plan для suspended users.

## 3. Trust boundaries

- Browser считается недоверенным: account id, role, plan, MIME и file name не являются доказательством.
- Publishable Supabase key допустим во frontend; secret/service role key запрещён.
- Auth JWT подтверждает identity, но authorization определяется active membership и server-controlled data.
- `raw_user_meta_data` никогда не используется для RLS/ролей.
- Signed URL — временный bearer credential; не сохраняется в таблице, QR, logs или analytics.
- Worker считается привилегированным и получает минимальные credentials/bucket access.
- Public viewer получает только manifest, нужный для одной опубликованной AR-работы.

## 4. RLS checklist

Для каждой exposed table:

- включить RLS до выдачи grants;
- явно указать `TO authenticated`/`TO anon`;
- добавить tenant predicate, а не только роль;
- для UPDATE использовать SELECT policy, `USING` и `WITH CHECK`;
- индексировать membership/account columns;
- запретить смену `account_id` обычным update;
- проверить owner, editor, viewer, inactive member и foreign account;
- public `anon` не получает прямых grants к internal tables;
- views использовать с `security_invoker = true` или держать private;
- `SECURITY DEFINER` держать в private schema, фиксировать `search_path`, revoke `PUBLIC EXECUTE` и проверять user identity.

Data API GRANT и RLS тестируются отдельно: отсутствие одного не компенсирует ошибку другого.

## 5. Storage checklist

- originals private;
- resumable upload использует immutable path и не включает пользовательское имя;
- upload reservation имеет server-side TTL/quota и idempotency key;
- path начинается с account/project/group/item UUID, но policy перепроверяет membership;
- bucket size/MIME restrictions включены, где поддерживаются;
- magic bytes и decode проверяются worker'ом;
- имя пользователя игнорируется при формировании object path;
- replace создаёт versioned object;
- upsert требует INSERT + SELECT + UPDATE policies;
- signed URL lifetime минимален и обновляется manifest endpoint;
- service worker не кэширует signed response;
- deletion lifecycle идемпотентен и оставляет безопасный audit log;
- stale cleanup вызывается только scheduler secret, а service role остаётся в Edge runtime;
- SVG обрабатывается как потенциально активный content; inline rendering запрещён без sanitization.

## 6. Auth и admin

- Email/password обрабатывает Supabase Auth; приложение не хранит пароль/хэш.
- Hosted email confirmation/reset flow использует allowlisted redirect URLs.
- Суперадмин создаёт пользователя через server-only Admin API.
- Temporary password не логируется и должен быть заменён.
- Suspended account/member проверяется на каждом privileged request, не только при login.
- JWT claims могут устаревать; critical operations перепроверяют database state.
- Перед блокировкой пользователя активные sessions отзываются, насколько позволяет выбранная конфигурация.
- MFA для суперадминов — обязательная pre-production задача.

## 7. Public viewer privacy

По умолчанию не собирать:

- raw IP;
- точную геолокацию;
- fingerprint;
- полный user-agent;
- camera frames;
- содержимое marker;
- signed URLs.

Допустимы coarse device/browser/os, allowlisted referrer domain, timestamps, playback milestones и технический error code. Retention и legal notice утверждаются до production analytics.

## 8. Security verification gates

### Этап 1

- secrets scan;
- `npm audit` review;
- Node/runtime pin;
- Auth route tests;
- no service role in built assets;
- CSP/header plan.

### Этап 2

- RLS matrix tests с двумя accounts;
- Storage policy tests;
- Supabase database/security advisors;
- explicit Data API grants review;
- quota race tests;
- admin function authorization tests.

### Перед MVP

- dependency review и SBOM;
- cross-tenant penetration tests;
- upload abuse/zip bomb tests;
- slug enumeration/rate limit tests;
- signed URL leakage review;
- logout/cache cleanup test;
- soft-delete/restore/destruction test;
- camera permission/privacy device checklist;
- incident response и backup/restore rehearsal.

## 9. Secrets и environment

Допустимые frontend variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_PUBLIC_APP_URL
```

Запрещены в `VITE_*`, Git и browser bundle:

- service role/secret keys;
- database password/connection string;
- SMTP credentials;
- worker signing secrets;
- admin API tokens.

`.env`, `.env.local` и platform exports добавляются в `.gitignore`; `.env.example` содержит только имена и безопасные placeholders.
