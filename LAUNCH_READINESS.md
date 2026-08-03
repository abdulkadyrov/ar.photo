# AR Photo — MVP launch readiness

Дата repository evidence: 3 августа 2026 года. Проверяемый commit: `5779d9a` и последующий documentation-only commit этого отчёта.

## Решение

**Repository readiness: PASS. Production launch: NO-GO до закрытия внешних gates.**

Автоматизированные contracts, security hardening и browser emulation зелёные. Физическое image tracking/overlay на iPhone и Android, hosted Supabase/Auth/TOTP, фактические headers/alerts/schedulers, rollback/backup restore и legal approval из локального репозитория не выполнялись и не могут считаться закрытыми.

Обозначения:

- ✅ — подтверждено автоматизированным repository evidence;
- 🟨 — реализация/evidence в репозитории есть, но обязательна hosted или физическая проверка;
- ⛔ — обязательный launch blocker без физического/операционного evidence.

## 21 критерий MVP

|   № | Критерий                                       | Статус | Evidence / остающийся gate                                                                                                                           |
| --: | ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Администратор создаёт owner                    | 🟨     | MFA-gated admin UI, Edge invitation и audited `admin_create_account` покрыты E2E/pgTAP; hosted invite delivery ещё не проверена                      |
|   2 | Owner входит по email/password                 | 🟨     | Supabase Auth adapter, protected routes и auth tests зелёные; требуется staging/production Auth/email redirect smoke                                 |
|   3 | Owner создаёт проект                           | ✅     | Production repository/RPC, quota/idempotency pgTAP и Playwright project flow                                                                         |
|   4 | Owner создаёт группу                           | ✅     | Production repository/RPC, tenant/quota tests и Playwright group flow                                                                                |
|   5 | Owner создаёт AR item                          | ✅     | 9-step wizard, trusted creation/processing revision и E2E workflow                                                                                   |
|   6 | Owner загружает фото                           | ✅     | Signature/decode/metadata strip, TUS reservation/finalization, E2E upload и Storage pgTAP                                                            |
|   7 | Owner загружает видео                          | ✅     | MP4/H.264 validation, TUS lifecycle, worker inspection и E2E upload                                                                                  |
|   8 | Marker processed                               | ✅     | Service-only lease worker, MindAR OfflineCompiler, idempotent immutable output, worker container + pgTAP                                             |
|   9 | AR item опубликован                            | ✅     | Trusted publish RPC перепроверяет revision/assets/subscription; E2E publish                                                                          |
|  10 | QR создан                                      | ✅     | SVG/PNG/print layout, 36-hex capability URL, rotate/revoke и software readability tests                                                              |
|  11 | QR открывает публичную страницу                | ✅     | E2E проверяет public URL/viewer и отсутствие internal UUID/PII; физическое сканирование входит в criterion 21 checklist                              |
|  12 | Browser запрашивает разрешение камеры          | ✅     | Viewer запрашивает camera только после «Начать AR»; Playwright счётчик доказывает отсутствие запроса до user gesture/fallback                        |
|  13 | Фотография распознаётся                        | ⛔     | Compiler/provider/regression assets реализованы, но нужен physical marker set на iPhone Safari и Android Chrome                                      |
|  14 | Видео накладывается поверх фотографии          | ⛔     | Three.js plane использует marker aspect ratio и target anchor; оптическую геометрию нужно подтвердить физически                                      |
|  15 | Потеря marker обрабатывается правильно         | 🟨     | `pause_hide`, `continue_audio_hide`, `stop_reset`, visibility/orientation cleanup реализованы; нужен physical lost/reacquire test для каждого режима |
|  16 | Есть fallback без AR                           | ✅     | Camera-free normal video покрыт Chromium и cross-browser/mobile-emulation E2E                                                                        |
|  17 | Analytics видна владельцу                      | ✅     | Privacy-minimized ingestion, scoped aggregates, retention и dashboard filter E2E/pgTAP                                                               |
|  18 | Subscription limits работают                   | ✅     | Effective entitlements, concurrent quota locks, team/storage/catalog limits и usage UI покрыты pgTAP/E2E                                             |
|  19 | RLS изолирует tenants                          | ✅     | Forced RLS, explicit grants и negative two-account matrix входят в 323 pgTAP assertions                                                              |
|  20 | Build/lint/tests проходят                      | ✅     | GitHub Quality run: 132 unit/component, build/budgets/security/SBOM; 323 pgTAP; 17 Chromium + 12 browser/mobile tests; worker container green        |
|  21 | Основной сценарий проходит на iPhone и Android | ⛔     | Emulated Pixel/iPhone smoke зелёный, но обязательны два физических устройства и заполненный `MANUAL_DEVICE_CHECKLIST.md`                             |

Итого: 15 ✅, 3 🟨, 3 ⛔. Любой 🟨/⛔ в таблице должен быть закрыт подписанным staging/production evidence до GO.

## Repository gates

- [x] TypeScript frontend + worker.
- [x] ESLint без warnings.
- [x] 132 unit/component tests.
- [x] Production build и bundle budgets.
- [x] Secrets/public metadata/security contract/dependency audit.
- [x] Release manifest + CycloneDX SBOM artifacts.
- [x] Clean PostgreSQL 17 reset/lint + 323 pgTAP.
- [x] 17 Chromium E2E, включая WCAG/PWA.
- [x] 12 Firefox/WebKit/mobile-emulation E2E.
- [x] Production worker Docker build/runtime.
- [x] No known open repository P0/P1; один reviewed non-applicable RSC dependency advisory остаётся tracked exception.

## Обязательные внешние gates

- [ ] Отдельные staging/production Supabase projects и region/data residency approved.
- [ ] Hosted database/security advisors без critical findings.
- [ ] Invitation, password reset и TOTP enrollment/recovery/break-glass rehearsal.
- [ ] Physical QR/AR matrix на iPhone Safari и Android Chrome, минимум 10 markers.
- [ ] Production host применяет фактические CSP/Permissions/HSTS/cache headers.
- [ ] Scheduler secrets, stale-upload и analytics cleanup подтверждены.
- [ ] External redacted error sink, dashboards, alert thresholds и on-call test.
- [ ] Worker queue/failed/restart monitoring.
- [ ] Staging deploy/rollback rehearsal на immutable artifacts.
- [ ] Backup/PITR и изолированный restore rehearsal в RPO/RTO.
- [ ] Retention, privacy/legal copy, data processing terms и support/security contacts approved.
- [ ] Human launch approval от product, security, operations и legal.

## GO protocol

1. Заполнить все поля `MANUAL_DEVICE_CHECKLIST.md` для release commit.
2. Приложить hosted smoke, headers, advisors, scheduler, alert, rollback и restore evidence.
3. Обновить эту таблицу ссылками/датами/исполнителями, не только отметками.
4. Повторно прогнать CI на точном release commit и сверить release manifest.
5. Подписать GO; иначе решение остаётся NO-GO.
