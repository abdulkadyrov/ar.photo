# AR Photo — отчёт этапа 2

Дата: 3 августа 2026 года.

## Результат

Этап 2 завершён на уровне репозитория: создан безопасный multi-tenant Supabase backend foundation с воспроизводимыми миграциями, forced RLS, private Storage, синтетическим seed, доверенными quota-aware mutations и сгенерированным TypeScript-контрактом.

## Реализовано

- Supabase local config с PostgreSQL 17 и закрытой самостоятельной регистрацией;
- 13 application tables, enums, constraints, composite foreign keys и supporting indexes;
- Account → Project → Group → AR Item hierarchy, subscriptions, jobs, QR, view sessions и audit logs;
- explicit Data API grants и forced RLS на каждой application table;
- active membership, role, subscription и effective-limit helpers с пустым `search_path`;
- idempotent transaction-safe RPC для project/group/AR-item creation;
- защищённый `admin-create-user` Edge Function без service key во frontend;
- пять private Storage buckets с read/insert/update/delete policies;
- непредсказуемый `public_slug` с 144 битами CSPRNG entropy;
- synthetic fixtures для двух tenants, owner/editor/viewer/inactive и expired subscription;
- Supabase CLI-generated `Database` type для frontend client.

## Автоматический gate

GitHub Actions run `30772329718` для коммита `18e4c79` подтвердил:

- quality: успешно;
- Chromium E2E: успешно, 5 сценариев;
- clean PostgreSQL 17 start/reset/seed: успешно;
- database function lint уровня error: успешно;
- schema pgTAP: 13 проверок успешно;
- RLS/Storage/quota pgTAP: 17 проверок успешно;
- TypeScript type generation из поднятой схемы: успешно.

Дополнительно локально после установки generated types прошли formatting, typecheck, ESLint, 20 unit/component tests и production build.

## Security evidence

- account A не читает и не изменяет account B;
- viewer не создаёт и не изменяет content;
- inactive member не читает tenant data;
- expired subscription сохраняет read, но запрещает новые mutations;
- `anon` не имеет прямого доступа к internal project tables;
- private Storage metadata изолированы между tenants;
- все foreign keys имеют supporting indexes;
- все проверяемые security-definer functions фиксируют пустой `search_path`;
- repository secret scan не допускает service-role/database credentials во frontend.

## Оставшиеся infrastructure checks

На рабочей машине нет запущенного Docker runtime и не привязан development Supabase project. Поэтому hosted Auth email delivery, remote advisors и hosted Storage/Auth settings не заявляются как проверенные. Clean-database gate выполняется в GitHub Actions; remote проверки проводятся после появления development project credentials и не блокируют начало stage 3 repository work.

## Ручная проверка

- [x] миграции применяются к чистой базе в CI;
- [x] seed повторно разворачивается через database reset;
- [x] RLS/Storage/role/subscription matrix проходит pgTAP;
- [x] generated TypeScript schema используется Supabase client;
- [ ] подключить отдельный development Supabase project;
- [ ] запустить hosted security/performance advisors;
- [ ] проверить реальную admin invite/reset email delivery.
