# AR Photo — отчёт этапа 9

Дата: 3 августа 2026 года.

## Результат

Этап 9 завершён на уровне репозитория: публичный AR viewer отправляет неблокирующую privacy-minimized телеметрию, Edge boundary применяет строгий контракт, salted hashing и rate limits, PostgreSQL хранит идемпотентные milestones в закрытых таблицах и возвращает кабинету только permission-scoped агрегаты. `/analytics` поддерживает account/project/group/item scope, периоды 7/30/90 дней и произвольный диапазон, funnel, график и breakdown по coarse device/browser/OS/error.

Hosted Edge Function, scheduler и production retention policy не отмечены выполненными без привязанного Supabase project. В интерфейсе и документации явно указана минимизация данных; финальный retention/legal текст остаётся launch gate.

## Ingestion и privacy boundary

- viewer создаёт 32-byte base64url session token только в памяти;
- browser отправляет событие fire-and-forget и никогда не ждёт analytics для camera/tracking/playback;
- strict schema принимает только public slug, token, event, bounded numeric value, coarse device/browser/OS, hostname referrer и безопасный error code;
- raw IP, fingerprint, полный user-agent, camera frames, полный URL, Storage path и signed URL не входят в контракт;
- Edge Function применяет allowlisted origin, body-size limit, salted SHA-256 и бюджеты 120/IP/minute и 60/session/minute;
- service-only RPC повторно разрешает item по published/active/subscription predicates;
- page, camera, marker, playback, 25/50/75%, completed и error milestones дедуплицируются уникально на session.

## Хранение, агрегаты и retention

- `ar_view_sessions` и `ar_view_events` используют forced RLS без прямых browser grants;
- composite foreign key не позволяет смешать session/item/account;
- supporting indexes покрывают item/account/time и session scope;
- `get_analytics_summary` требует active membership и permission `analytics`;
- scope валидируется server-side для account/project/group/item, диапазон ограничен 366 днями;
- dashboard получает только totals, daily series и coarse breakdowns, а не raw rows;
- `cleanup-analytics` вызывает service-only batch purge с retention 30–730 дней и лимитом до 10 000 sessions;
- удаление session каскадно удаляет events, stale rate buckets очищаются отдельно.

## Интерфейс

- новый route `/analytics` доступен из desktop sidebar и mobile navigation;
- фильтры scope и периода работают независимо и сохраняют ясный loading/error/empty contract;
- метрики показывают просмотры, detection/playback/completion rates, среднее время и ошибки;
- native SVG graph имеет доступное текстовое имя и не добавляет charting dependency;
- funnel и breakdown panels адаптируются без horizontal overflow на 390 px;
- production repository строго валидирует RPC JSON через Zod, demo repository использует deterministic fixtures тех же форм;
- privacy notice объясняет, какие данные собираются и какие не собираются.

## Автоматический gate

[GitHub Actions Quality run 30785413966](https://github.com/abdulkadyrov/ar.photo/actions/runs/30785413966) для backend commits `7574890`/`7afa2e5` подтвердил:

- clean PostgreSQL 17 reset/seed и SQL function lint;
- 262 pgTAP assertions, включая 41 новую analytics/permission/rate-limit/idempotency/retention проверку;
- frontend quality и E2E regression — успешно.

[GitHub Actions Quality run 30785541420](https://github.com/abdulkadyrov/ar.photo/actions/runs/30785541420) подтвердил синхронизированный generated database contract. [Processing worker run 30785541458](https://github.com/abdulkadyrov/ar.photo/actions/runs/30785541458) подтвердил production container/runtime.

[GitHub Actions Quality run 30786229520](https://github.com/abdulkadyrov/ar.photo/actions/runs/30786229520) для UI/telemetry commit `1c32a0f` подтвердил:

- TypeScript, ESLint, 113 unit/component tests, production build, bundle budget и secret scan;
- Chromium E2E: 11 сценариев, включая все четыре scope, custom period, privacy notice и mobile layout;
- fresh database, 262 pgTAP и generated database types.

[Processing worker run 30786229536](https://github.com/abdulkadyrov/ar.photo/actions/runs/30786229536) подтвердил неизменённый Docker worker build/runtime. Локально дополнительно пройдены полный `npm run check`, E2E 11/11, Deno typecheck двух Edge Functions и визуальная production-preview QA desktop/mobile.

## Security evidence

- browser roles не могут читать raw analytics sessions/events или вызывать ingestion/retention RPC;
- session и network identifiers хешируются раздельной server-side солью до database call;
- unknown/sensitive payload fields отклоняются на runtime boundary;
- повторная доставка milestone не увеличивает aggregate;
- cross-tenant scope и отсутствие permission `analytics` завершаются server denial;
- cleanup не принимает cutoff моложе 30 дней или oversized batch;
- analytics transport errors полностью изолированы от AR user flow;
- frontend bundle проходит secret scan.

## Известные ограничения

- development/production Supabase project не привязан, поэтому deployed ingestion, origin allowlist и scheduler secret не проверены;
- production retention срок и legal/privacy copy требуют отдельного письменного решения;
- country derivation намеренно не реализован, чтобы не вводить лишнее геоданное;
- WAF/anomaly alerts и operational dashboard относятся к этапу 11;
- физическая iPhone Safari/Android Chrome AR matrix остаётся device gate этапа 11.

## Ручная проверка

- [x] desktop account analytics layout, metrics, graph, funnel и breakdowns;
- [x] project/group/item scope переключает authoritative fixture aggregates;
- [x] 7/30/90/custom period и validation states;
- [x] mobile 390 px navigation и отсутствие horizontal scroll;
- [x] privacy notice и keyboard-accessible filters;
- [x] AR playback продолжает работать при analytics network failure;
- [ ] hosted Edge ingestion и scheduled cleanup;
- [ ] production retention/legal approval;
- [ ] physical-device analytics delivery вместе с AR scenario.
