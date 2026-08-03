# AR Photo — стратегия тестирования

## Обязательный локальный gate

```sh
npm ci
npm run check
npm run test:e2e
npm run test:e2e:cross-browser
```

`npm run check` последовательно выполняет TypeScript для frontend/worker, ESLint, Vitest, production build, bundle budget, secret scan, public metadata scan, production dependency audit, security/PWA contract и release manifest.

Для clean-database gate нужен Docker-compatible runtime и Supabase CLI 2.109.1:

```sh
supabase db start
supabase db reset
supabase db lint --local --schema public,private --level error --fail-on error
supabase test db --local supabase/tests
supabase gen types typescript --local --schema public > /tmp/ar-photo-database.types.ts
supabase stop --no-backup
```

## Слои тестов

| Слой                  | Что подтверждает                                                                                     | Команда/место                           |
| --------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Unit/component        | schemas, repositories, validation, QR, marker quality, telemetry, error redaction, PWA/ZIP contracts | `npm run test`                          |
| Browser E2E           | auth shell, CRUD, upload, publish/QR, subscriptions/team, analytics, admin, PWA, WCAG                | `npm run test:e2e`                      |
| Cross-browser         | responsive protected shell, public AR fallback, admin on Chromium/Firefox/WebKit + mobile profiles   | `npm run test:e2e:cross-browser`        |
| PostgreSQL pgTAP      | grants, forced RLS, tenant isolation, trusted mutations, quotas, jobs, public/admin boundaries       | `supabase test db`                      |
| SQL lint              | function/schema errors for `public` и `private`                                                      | `supabase db lint`                      |
| Worker                | processing contract and executable container dependencies                                            | Vitest + `.github/workflows/worker.yml` |
| Security/supply chain | secrets, metadata, headers/cache, audit exception, SBOM                                              | `npm run check:*`, `npm run sbom`       |
| Manual field          | real camera, physical marker/QR, optical overlay, interrupts/network                                 | `MANUAL_DEVICE_CHECKLIST.md`            |

## Зафиксированный baseline этапа 11

- 35 Vitest files, 132 tests.
- 17 Chromium E2E, включая accessibility и PWA.
- 12 cross-browser/mobile-emulation E2E: desktop Firefox/WebKit, Pixel 7 Chromium, iPhone 14 WebKit.
- 323 pgTAP assertions после clean reset PostgreSQL 17.
- Initial JS graph 553 KiB, dashboard graph 713 KiB, CSS 33 KiB; MindAR/Three остаются lazy.
- Axe не находит serious/critical violations на landing, login, dashboard, admin и public AR intro для выбранных WCAG tags.

Актуальные CI evidence links находятся в `STAGE_11_REPORT.md`.

## CI jobs

`Quality` содержит три независимые ветви:

- `quality`: install, typecheck, lint, unit, build, budgets/scans, release manifest и CycloneDX SBOM artifacts;
- `database`: clean Supabase start/reset, SQL lint, pgTAP, generated types;
- `e2e`: запускается после quality и выполняет Chromium smoke, axe и отдельную browser/mobile matrix.

`Processing worker` строит production Dockerfile и проверяет Node entrypoint, FFmpeg, ffprobe и cwebp. Все сторонние GitHub actions закреплены полным commit SHA.

## Fixtures

- Public marker fixtures синтетические/очищенные и проверяются metadata scanner.
- MP4 fixture имеет H.264/AAC tokens и малый размер для deterministic CI.
- `/viewer/test` — regression path для заранее скомпилированного MindAR target.
- Demo repositories воспроизводят UX/contract без Supabase, но не доказывают hosted Auth/RLS/Storage.
- Database fixtures всегда должны создавать не менее двух accounts для negative tenant tests.

Не добавлять реальные клиентские фото, email, production exports или credentials в fixtures/snapshots/artifacts.

## Dependency gate

`npm audit --omit=dev --json` проверяется скриптом. Разрешено только точное documented исключение advisory `1124282` для React Router 7.18.2: оно относится к React Server Components action execution, отсутствующему в client-only Vite приложении; source scan дополнительно запрещает RSC server APIs. Любой новый production advisory или critical finding ломает CI. Исключение нужно удалить сразу после доступного совместимого исправления.

## Release evidence

После build `npm run release:manifest` создаёт `artifacts/release-manifest.json`:

- source commit и dirty flag;
- Node/base path;
- SHA-256 `package-lock.json`;
- список и aggregate SHA-256 всех migration files;
- размер и SHA-256 каждого файла `dist` и aggregate artifact digest.

CI хранит release manifest и CycloneDX SBOM отдельными artifacts. Production deployment должен быть привязан к прошедшему commit, а не к локальной непроверенной сборке.

## Что CI не подтверждает

- реальную доставку Auth email, TOTP enrollment/recovery и hosted advisors;
- работу production headers/CDN/WAF/cron/alerts/backups;
- сканирование печатного QR вторым устройством;
- оптическое распознавание и геометрию video overlay на физическом iPhone/Android;
- data residency/legal/privacy approval;
- фактический rollback/restore rehearsal.

Эти проверки нельзя отмечать выполненными по browser emulation. Они находятся в `DEPLOYMENT.md`, `MANUAL_DEVICE_CHECKLIST.md` и `LAUNCH_READINESS.md`.

## Правило регрессии

Исправление дефекта должно получить тест на самом низком надёжном слое. Изменение schema/RPC требует pgTAP; публичного viewer — unit плюс browser smoke; worker — unit/container; release/security contract — fail-closed script. Следующий инкремент не начинается при красном обязательном gate.
