# AR Photo — отчёт этапа 11

Дата: 3 августа 2026 года.

## Результат

Stabilization завершена на уровне репозитория. Приложение получило fail-closed security/supply-chain gates, безопасный PWA cache/update flow, строгий legacy ZIP import, privacy-safe operational error envelope, WCAG и cross-browser/mobile-emulation проверки, reproducible release evidence и полный набор технических/операционных документов.

Production launch намеренно не отмечен выполненным: physical iPhone/Android AR, hosted Supabase/Auth/TOTP, external monitoring, production headers/schedulers, rollback/restore rehearsal и legal approval требуют внешней среды и людей. Текущий launch verdict находится в `LAUNCH_READINESS.md`.

## Security и supply chain

- Service worker кэширует только same-origin hashed static assets; API/media/signed URLs исключены.
- Навигация network-first; activation/update контролируется пользователем; stale caches versioned и удаляются.
- CSP, Permissions-Policy, HSTS, nosniff, frame deny и immutable/no-cache contracts находятся в `public/_headers` и проверяются CI.
- Public fixtures очищены от EXIF/GPS/APP13/comments; metadata scanner fail-ит build при регрессии.
- Legacy ZIP import имеет strict schema v1, allowlisted paths, count/compressed/uncompressed limits, CRC/SHA-256/relation checks, preview confirmation и одну atomic IndexedDB transaction.
- Secret scanner проверяет tracked files; production audit fail-ит при новом advisory/critical finding.
- Единственное исключение — advisory 1124282 для React Router 7.18.2, относящееся к отсутствующему RSC runtime; версия и source contract закреплены до исправленного релиза.
- CI создаёт CycloneDX SBOM и release manifest с commit/lockfile/migrations/dist SHA-256.
- GitHub actions в quality, worker и Pages preview закреплены полным commit SHA.

## UX, accessibility и browser matrix

- Camera не запрашивается до явного «Начать AR»; fallback работает без camera grant.
- Public intro содержит privacy link; route объясняет local-only camera frame processing.
- Axe scan выбранных WCAG 2 A/AA/2.1 AA/2.2 AA tags не выявил serious/critical violations на landing, login, dashboard, admin и public AR intro.
- Responsive smoke покрывает desktop Firefox/WebKit, Pixel 7 Chromium и iPhone 14 WebKit без horizontal overflow.
- E2E подтверждает static-only PWA cache и offline shell.
- Initial JS 553 KiB, dashboard graph 713 KiB, CSS 33 KiB; MindAR/Three остаются lazy route/runtime chunks.

## Observability

- Route boundary и global `error`/`unhandledrejection` создают stable reference id.
- Envelope ограничивает code/name/message/context и удаляет email, JWT, Supabase keys, internal UUID, URL query и sensitive context keys.
- Reporting никогда не заменяет исходную ошибку и не блокирует UI.
- По умолчанию внешний sink не настроен, чтобы случайно не отправлять данные. Production sink/alerts/on-call — обязательный внешний gate.
- Worker использует bounded structured events и стабильные error codes без credentials/signed paths.

## Release evidence

Коммит `5779d9a` подтверждён:

- [Quality run 30791580423](https://github.com/abdulkadyrov/ar.photo/actions/runs/30791580423): quality, clean database и E2E jobs зелёные;
- [Processing worker run 30791580420](https://github.com/abdulkadyrov/ar.photo/actions/runs/30791580420): production Docker build/runtime зелёный.

Состав gate:

- 35 Vitest files, 132 tests;
- 17 Chromium E2E;
- 12 cross-browser/mobile-emulation E2E;
- 323 pgTAP assertions после clean reset;
- TypeScript, ESLint, production build, bundle budget;
- secret/metadata/dependency/security checks;
- release manifest и CycloneDX SBOM artifacts;
- Node/FFmpeg/ffprobe/cwebp worker runtime.

Documentation-only commit после `5779d9a` должен пройти тот же branch protection gate; его run фиксирует итоговый HEAD.

## Документация

Финальный набор:

- `README.md` — быстрый старт и статус;
- `PLAN.md` — исходный аудит и реализация этапов;
- `ARCHITECTURE.md` — system/trust boundaries;
- `DATABASE.md` — schema/RLS/migrations;
- `SECURITY.md` — findings и current posture;
- `AR_TRACKING.md` — compiler/runtime/state machine;
- `STORAGE.md` — buckets/upload/version/cleanup/cache;
- `TESTING.md` — локальные/CI/ручные gates;
- `DEPLOYMENT.md` — environments, rollout, rollback, backup и incident response;
- `ROADMAP.md` — status этапов;
- `MANUAL_DEVICE_CHECKLIST.md` — physical field evidence;
- `LAUNCH_READINESS.md` — 21 критерий и GO/NO-GO.

## Открытые внешние gates

- physical iPhone Safari и Android Chrome: QR, 10+ markers, overlay и target lost/reacquire;
- hosted email/password/reset/invitation и TOTP aal2/break-glass;
- hosted advisors, WAF/rate alerts, scheduler delivery и private bucket verification;
- production response headers/cache behavior;
- external redacted error sink, operational dashboards и on-call alert;
- staging rollback и isolated backup restore rehearsal;
- legal/privacy/data residency/retention approval.

Пока они не закрыты, корректная формулировка состояния продукта: **кодовая база и automated repository gate готовы к staging acceptance; production launch — NO-GO**.
