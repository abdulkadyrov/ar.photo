# AR Photo — deployment и operations runbook

## Статус среды

GitHub Pages workflow в репозитории является только frontend preview: он явно использует `build:demo` и base path `/ar.photo/`, но GitHub Pages не применяет Netlify-style `public/_headers` и не разворачивает Supabase/worker. Обычный production build без Supabase variables fail-closed и не показывает demo data. Preview нельзя считать production SaaS deployment.

Production требует отдельно управляемые frontend host/CDN, Supabase project, processing worker, DNS/TLS, scheduler, secrets, monitoring и backup policy.

## Environments

| Среда      | Данные                                    | Назначение                      | Допустимые интеграции                              |
| ---------- | ----------------------------------------- | ------------------------------- | -------------------------------------------------- |
| Local      | synthetic seed                            | разработка, pgTAP, worker smoke | local Supabase/Docker                              |
| Preview    | synthetic/demo                            | UI/PR review                    | GitHub Pages без production secrets                |
| Staging    | synthetic/anonymized                      | полный hosted rehearsal         | отдельный Supabase project/worker/domain           |
| Production | реальные клиентские данные после approval | клиентский сервис               | отдельные project, secrets, domain, alerts/backups |

Нельзя использовать production Storage/Auth/database в preview deployment.

## Предварительные решения

До создания production environment письменно зафиксировать:

- data residency и Supabase region;
- data controller/operator и support/security contacts;
- публичный HTTPS domain и base path (текущий build закреплён на `/ar.photo/`);
- analytics/media/audit/backup retention;
- RPO/RTO и Storage backup strategy;
- container platform для worker и scheduler provider;
- incident severity/escalation owners;
- legal/privacy copy и customer terms.

Изменение на root/custom base path требует согласованно параметризовать Vite base, router basename, service worker paths, `_headers` paths, QR origin и тесты; одной смены DNS недостаточно.

## Secrets и configuration

Browser build получает только:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_PUBLIC_APP_URL
VITE_ENABLE_DEMO_MODE
```

`VITE_ENABLE_DEMO_MODE=true` допустим только для local/test/preview и взаимоисключающ с Supabase configuration. В staging/production он должен отсутствовать или быть `false`; отсутствие backend variables показывает controlled configuration error.

Edge Functions получают server-side:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TEAM_INVITE_REDIRECT_URL
ADMIN_PASSWORD_RESET_REDIRECT_URL
PUBLIC_MANIFEST_ALLOWED_ORIGINS
PUBLIC_MANIFEST_RATE_LIMIT_SALT
PUBLIC_ANALYTICS_ALLOWED_ORIGINS
PUBLIC_ANALYTICS_HASH_SALT
ANALYTICS_CLEANUP_SECRET
ANALYTICS_RETENTION_DAYS
UPLOAD_CLEANUP_SECRET
```

Worker получает:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
PROCESSING_WORKER_ID
PROCESSING_CONCURRENCY
PROCESSING_POLL_INTERVAL_MS
PROCESSING_RUN_ONCE
```

Каждый salt/cleanup secret независим, случаен и не короче 32 байт. Service role нельзя помещать в `VITE_*`, CI logs, image layer, source или support ticket. Использовать platform secret manager и отдельные credentials для staging/production.

## Pre-deploy gate

1. Ветка защищена, PR одобрен, HEAD checks полностью зелёные.
2. `npm ci && npm run check` воспроизводится на Node 22.22.2.
3. Clean database reset/lint/323 pgTAP зелёные.
4. Browser matrix и worker container зелёные.
5. Release manifest/SBOM сохранены для точного commit.
6. Migration/Edge/worker/frontend changes и rollback owner перечислены в change record.
7. Database backup/PITR status проверен до schema change.
8. Нет незакрытых P0/P1; исключения имеют owner/expiry.
9. Staging smoke и device checklist относятся к тому же commit/config.

## Supabase rollout

На staging сначала, затем теми же командами на production:

```sh
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push
supabase functions deploy admin-create-user
supabase functions deploy admin-reset-password
supabase functions deploy cleanup-stale-uploads
supabase functions deploy public-ar-manifest
supabase functions deploy public-ar-analytics
supabase functions deploy cleanup-analytics
supabase functions deploy team-invite
```

Secrets устанавливать через platform UI/secret manager или ignored env file, не inline shell history. После deploy:

- проверить migration history и hosted database/security advisors;
- проверить все buckets private, limits/MIME и Storage policies;
- проверить Auth site URL/redirect allowlist/email templates/rate limits;
- выполнить owner login, invite delivery, password recovery и superadmin TOTP `aal2`;
- вызвать cleanup functions с scheduler credential и убедиться, что неверный secret получает отказ;
- проверить public manifest CORS/no-store/rate-limit и analytics payload rejection.

## Worker rollout

```sh
docker build --file workers/processing/Dockerfile --tag <registry>/ar-photo-processing:<git-sha> .
docker push <registry>/ar-photo-processing:<git-sha>
```

Разворачивать immutable digest/tag, non-root container, concurrency 1 на первом canary. Worker должен иметь outbound HTTPS к Supabase, достаточные CPU/RAM/temp disk и graceful SIGTERM. Проверить:

- startup log без credential/path;
- один test item проходит analysis/inspection/compilation/thumbnail;
- lease heartbeat обновляется, retry не создаёт duplicate objects;
- очередь, failed ratio, oldest pending age, temp disk и restarts видимы в monitoring;
- scale-out увеличивается только после проверки advisory-lock/lease поведения.

## Frontend rollout

Production host должен:

- раздавать HTTPS и SPA fallback на `index.html`;
- применять эквивалент `public/_headers`, включая CSP, Permissions-Policy, HSTS, nosniff и frame deny;
- отдавать `sw.js` с `no-cache, no-store`, hashed `/assets/*` immutable;
- не кэшировать Edge API, signed media и manifest responses;
- собирать только с production publishable config и точным release commit;
- поддерживать тот же public origin, который encoded в `VITE_PUBLIC_APP_URL` и QR.

После deploy проверить response headers фактическим HTTP-клиентом, а не наличием `_headers` в репозитории. `unsafe-eval` остаётся ограниченным CSP исключением для MindAR runtime и не разрешает сторонние script origins.

## Post-deploy smoke

В staging и production canary выполнить по порядку:

1. Owner email/password login и logout; reset redirect.
2. Project → group → marker/video upload → processing → test → publish.
3. QR открыть на втором физическом устройстве.
4. Camera deny даёт fallback; camera allow распознаёт фото и накладывает видео.
5. Потеря/повторное появление marker соответствует item settings.
6. Analytics появляется только в правильном tenant scope.
7. Limit denial совпадает с usage meter; foreign account access получает отказ.
8. Admin требует TOTP aal2, reason/typed confirmation и создаёт audit.
9. Static-only PWA cache и update prompt; logout не оставляет private data.
10. Error event доходит во внешний sink в redacted виде и связывается reference id.

## Rollback

Frontend/worker rollback выполняется на предыдущий проверенный immutable artifact/digest. Не пересобирать старый commit с новым lockfile.

Database migrations считаются forward-only по умолчанию. Для каждой destructive/contract-breaking migration до deploy нужен отдельный reviewed forward repair или обратимый expand/contract plan:

1. expand schema совместимо со старым приложением;
2. deploy совместимый backend/frontend;
3. backfill bounded batches с наблюдением;
4. переключить reads;
5. contract только в следующем релизе после retention window.

При инциденте сначала остановить новый traffic/worker mutation, вернуть frontend/worker, затем применить reviewed database repair. Не выполнять `git reset`, ручное удаление таблиц или восстановление production поверх работающей базы.

Rollback считается подтверждённым только после rehearsal в staging: deploy N, создать smoke data, deploy N+1, вернуть N/repair и повторить smoke. Repository workflow сам по себе rehearsal не заменяет.

## Backup и restore

До launch:

- включить provider backups/PITR согласно утверждённым RPO/RTO;
- хранить зашифрованные backup artifacts в отдельной fault domain с ограниченным доступом;
- определить, как отдельно восстанавливаются Storage objects и сверяются с `media_assets` SHA/paths;
- документировать Auth identities и secrets, которые не восстанавливаются обычным SQL dump;
- ежеквартально восстанавливать backup в изолированный project, выполнять migrations/read-only consistency queries и основной smoke;
- фиксировать дату, backup id, restore duration, recovered point, reviewer и отклонения.

Repository CI выполняет отдельный local rehearsal после pgTAP: создаёт полный custom-format dump синтетического Supabase, восстанавливает его в новую временную БД, проверяет 14 migrations, fixtures, forced RLS и отсутствие `anon`/`private` privileges, затем уничтожает restore database и dump. В artifacts попадает только sanitized evidence с SHA-256/размером/результатами. Это подтверждает процедуру на локальном PostgreSQL, но не заменяет provider backup/PITR и Storage restore rehearsal в staging.

Restore никогда не репетируется поверх production. После восстановления ротировать временные credentials и уничтожить изолированную среду по approved procedure.

## Incident response

| Severity | Пример                                                             | Первое действие                                                                                        |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| SEV-1    | cross-tenant exposure, leaked service role, массовая потеря данных | остановить affected boundary, ротировать credential, сохранить evidence, уведомить security/data owner |
| SEV-2    | публикация/processing/Auth недоступны большинству клиентов         | freeze deploy, rollback canary, оценить очередь/Edge/DB                                                |
| SEV-3    | isolated item/device regression                                    | отключить affected capability/fallback, собрать redacted reference ids                                 |

Процедура:

1. Назначить incident commander, время начала и severity.
2. Сохранить immutable audit/platform logs; не копировать signed URLs, email, tokens или frames.
3. Ограничить ущерб: revoke slug/session/key, suspend item/account или scale worker to zero по области инцидента.
4. Восстановить сервис проверенным rollback/repair.
5. Проверить tenant isolation, data integrity и error rate.
6. Выполнить обязательные legal/customer notifications согласно юрисдикции.
7. Провести postmortem с root cause, timeline, affected data, corrective tests, owners и deadlines.

## Launch stop conditions

Production launch запрещён при любом из условий:

- не завершён physical iPhone Safari + Android Chrome AR/QR checklist;
- не выполнен staging rollback и backup restore rehearsal;
- external error sink/alerts/on-call не подтверждены;
- hosted Auth/TOTP/advisors/schedulers не проверены;
- фактические response headers отличаются от security contract;
- legal/privacy/data residency/retention не одобрены;
- есть P0/P1 security issue или unexplained release manifest mismatch.
