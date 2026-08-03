# AR Photo — roadmap коммерческого MVP

## Правила выполнения

- Один этап — один проверяемый набор изменений.
- Следующий этап не начинается при красном quality/security gate.
- После каждого этапа: typecheck, lint, unit tests, build, затронутые integration/E2E, запуск приложения и ручной smoke-test.
- Database changes всегда через reviewable migrations.
- Push/production deploy только по прямому указанию.

## Этап 0 — аудит и планирование

Статус: выполнен.

Результаты:

- полный аудит репозитория;
- baseline build/smoke-test;
- `PLAN.md`;
- `ARCHITECTURE.md`;
- `DATABASE.md`;
- `SECURITY.md`;
- `ROADMAP.md`.

Gate: пользователь принимает план.

## Этап 1 — foundation, Auth и design shell

Статус: repository gate выполнен; hosted Supabase и physical-device checks явно перенесены в соответствующие infrastructure/device gates. Подробности: `STAGE_1_REPORT.md`.

Цель: превратить монолитный prototype в тестируемую основу, не ломая MindAR spike.

Deliverables:

- Node 22 pin и чистый install;
- lint/test/build CI;
- React Router, Query, Zustand, RHF, Zod;
- modular boundaries и lazy routes;
- dark SaaS tokens/components по референсу;
- responsive sidebar/bottom navigation;
- Supabase publishable client и `.env.example`;
- login/logout/reset/update password;
- protected routes и typed session states;
- сохранённый `/viewer/test` regression path.

Gate:

- все quality checks зелёные;
- no critical dependency findings без documented exception;
- auth happy/error/expired session tests;
- desktop 1440px и mobile 390px без horizontal scroll;
- AR library не входит в dashboard initial chunk.

## Этап 2 — Postgres, RLS, Storage и seeds

Статус: repository gate выполнен. Чистое развёртывание PostgreSQL 17, SQL lint и 30 pgTAP-проверок подтверждены GitHub Actions; hosted-project advisors ожидают подключения отдельного Supabase project. Подробности: `STAGE_2_REPORT.md`.

Цель: создать безопасный multi-tenant backend.

Deliverables:

- Supabase local config и clean migrations;
- accounts/profiles/members/plans/subscriptions/projects/groups/items/jobs/QR/analytics/audit schema;
- constraints, indexes и explicit grants;
- RLS policies;
- private Storage buckets и policies;
- trusted account bootstrap/admin create flow;
- subscription/permission helpers;
- synthetic seeds;
- generated database types.

Gate:

- fresh migration apply успешен;
- advisors без critical findings;
- account A не читает/изменяет account B;
- inactive member/expired subscription tests проходят;
- Storage cross-tenant tests проходят;
- service role отсутствует во frontend.

## Этап 3 — проекты и группы

Статус: repository gate выполнен. Production repository, CRUD, atomic reorder/move, private covers, 29 unit-тестов, 6 E2E и 38 pgTAP-проверок подтверждены GitHub Actions. Hosted Storage smoke ожидает development Supabase project. Подробности: `STAGE_3_REPORT.md`.

Цель: production CRUD для первых двух уровней каталога.

Deliverables:

- projects list/create/edit/archive/restore;
- project overview/tabs;
- groups create/edit/sort/move/archive;
- cover upload;
- search/filter/sort/pagination;
- idempotent create и quota checks;
- empty/error/loading states;
- audit events.

Gate:

- CRUD integration tests;
- double-submit не создаёт дубликат;
- project/group limits защищены server-side;
- soft delete/restore работает;
- mobile/keyboard smoke-test.

## Этап 4 — безопасная загрузка media

Статус: repository gate выполнен. Private immutable uploads, browser validation/inspection, resumable TUS queue, atomic accounting, retryable cleanup Edge Function, 39 unit-тестов, 7 E2E и 66 pgTAP-проверок подтверждены. Hosted TUS/cron и physical-device checks ожидают development Supabase project/device lab. Подробности: `STAGE_4_REPORT.md`.

Цель: private marker/video upload с реальными ограничениями.

Deliverables:

- FileDropzone и upload queue;
- marker JPEG/PNG/WebP validation;
- video MP4 allowlist для MVP, MOV/WebM только после codec tests;
- resumable upload, cancel/retry/progress;
- private Storage paths и immutable versions;
- image dimensions/EXIF strip/preview;
- video inspect/duration/resolution/audio/codec;
- storage accounting;
- cleanup незавершённых uploads.

Gate:

- spoofed MIME, oversized, corrupt and unsupported files rejected;
- cross-tenant object access denied;
- weak network retry/cancel проверены;
- Object URLs освобождаются;
- заявленные форматы подтверждены fixture tests.

## Этап 5 — AR Item wizard и processing

Статус: repository gate выполнен. Девятишаговый workflow, authoritative marker/video worker, lease/retry/idempotency, quality override, immutable generated assets, 70 unit-тестов, 8 E2E и 108 pgTAP-проверок подтверждены GitHub Actions. Hosted worker/Supabase и field matrix из реальных маркеров ожидают infrastructure/device gate. Подробности: `STAGE_5_REPORT.md`.

Цель: пройти от выбора проекта до готового tracking dataset.

Deliverables:

- 9-step wizard;
- marker quality scoring с объяснениями;
- `MarkerTrackingProvider` + MindAR adapter;
- выбранный processing worker;
- processing jobs, progress, retry и idempotency;
- thumbnail generation;
- behavior settings;
- test-before-publish screen;
- repeat compilation при замене marker.

Gate:

- dataset создаётся один раз, не при viewer load;
- 10+ representative markers проверены;
- unsuitable marker требует явного override;
- job retry не создаёт duplicate assets;
- failure messages безопасны и понятны.

## Этап 6 — публичный AR viewer

Статус: repository gate выполнен. Service-only manifest с пятиминутными signed URLs, hashed rate-limit buckets, camera-explicit MindAR/Three viewer, normal-video fallback, 80 unit-тестов, 9 E2E и 129 pgTAP-проверок подтверждены GitHub Actions. Hosted Edge Function и physical iPhone/Android tracking matrix ожидают infrastructure/device gate. Подробности: `STAGE_6_REPORT.md`.

Цель: camera-first image tracking на iPhone/Android с fallback.

Deliverables:

- `/ar/:publicSlug` intro;
- explicit camera permission;
- public manifest + signed URLs;
- capability checks;
- MindAR/Three overlay и aspect calibration;
- target found/lost behavior;
- audio user gesture;
- orientation/page visibility handling;
- normal video fallback;
- public error states и rate limits.

Gate:

- iPhone Safari и Android Chrome manual checklist;
- camera deny/unsupported/WebGL/video/tracking errors имеют fallback;
- published чужие internal fields не раскрываются;
- signed URLs истекают и обновляются;
- camera/renderer resources освобождаются.

## Этап 7 — QR и publication

Цель: стабильная публичная ссылка и печатаемый QR.

Deliverables:

- publish/unpublish/rotate slug;
- SVG/PNG QR;
- transparent/white/brand styles;
- quiet zone и logo safety;
- copy/share/open/download/print test;
- QR readability validation;
- custom public domain config.

Gate:

- QR открывается на втором устройстве;
- QR не содержит PII/internal UUID/path/signed URL;
- print-size matrix читается реальными iOS/Android scanners;
- unpublished/suspended/deleted items закрыты.

## Этап 8 — subscriptions, limits и team

Цель: обеспечить бизнес-ограничения MVP.

Deliverables:

- plan/subscription screens;
- effective limits/usage meters;
- trial/active/grace/expired/suspended behavior;
- team invite/accept/deactivate;
- permission editor;
- admin extend/suspend/custom limits;
- подготовленный payment provider boundary без оплаты.

Gate:

- все лимиты тестируются одновременно и при гонках;
- grace rules соответствуют конфигурации;
- frontend message совпадает с server denial;
- member permissions проверяются API/RLS.

## Этап 9 — analytics

Цель: privacy-conscious статистика от account до item.

Deliverables:

- event ingestion;
- session deduplication/hash;
- 7/30/90/custom filters;
- account/project/group/item aggregates;
- device/browser/error breakdown;
- retention cleanup;
- data minimization notice.

Gate:

- event spam rate-limited;
- milestones idempotent;
- нет raw IP/full UA/signed URL;
- агрегаты совпадают с controlled fixtures;
- analytics не блокирует AR playback.

## Этап 10 — admin

Цель: безопасное управление клиентами и operations.

Deliverables:

- accounts/users/subscriptions/plans;
- storage and processing overview;
- content suspension;
- processing retry;
- audit log viewer;
- protected system settings;
- secure password reset initiation.

Gate:

- MFA/admin authorization;
- no password visibility;
- каждая mutation audit logged;
- account-scoped support access и reason capture;
- dangerous actions подтверждаются.

## Этап 11 — stabilization и launch readiness

Цель: подтвердить критерии MVP на реальных устройствах и production-like environment.

Deliverables:

- full E2E happy/negative suite;
- security/performance/accessibility audits;
- PWA safe caching/update flow;
- device/browser checklist;
- backup/restore and incident runbooks;
- deployment docs;
- legal/privacy copy review;
- operational dashboards/alerts;
- final documentation set из ТЗ.

Gate:

- все 21 MVP criteria подтверждены evidence;
- iPhone Safari и Android Chrome проходят AR scenario;
- no open P0/P1 security findings;
- production rollback проверен;
- ручной launch approval.

## Ориентировочная последовательность релизов

| Milestone       | Этапы | Пользовательская ценность              |
| --------------- | ----- | -------------------------------------- |
| Internal alpha  | 1–3   | Auth, проекты и группы                 |
| Media alpha     | 4–5   | Загрузка и готовый tracking asset      |
| AR beta         | 6–7   | Публичный AR и QR на втором устройстве |
| Commercial beta | 8–10  | Лимиты, команда, статистика, admin     |
| MVP launch      | 11    | Проверенный коммерческий продукт       |

Сроки уточняются после решений по data residency, hosting и объёму team/admin MVP. Runtime processing worker уже выбран и зафиксирован этапом 5.
