# AR Photo — отчёт этапа 7

Дата: 3 августа 2026 года.

## Результат

Этап 7 завершён на уровне репозитория: публикация AR-работы проходит через trusted PostgreSQL boundary, создаёт стабильный capability URL и durable QR metadata, а кабинет позволяет скачать SVG/PNG, скопировать/поделиться/открыть ссылку, выбрать безопасный стиль и размер печати. Unpublish мгновенно закрывает public manifest, rotate отзывает старую ссылку и требует явного подтверждения.

Hosted Supabase deploy и физическое сканирование распечатанных QR на iPhone/Android не отмечены выполненными без привязанного project/device lab.

## Publication lifecycle

- publish требует active write membership/subscription, `ready` item, связанные private marker/video assets, generated tracking/poster и четыре успешные job текущей revision;
- status/visibility/publication timestamps меняются атомарно вместе с upsert одного QR;
- unpublish разрешён owner/manager/editor даже после expiry subscription как обязательное safety/revoke действие;
- rotate доступен только опубликованной работе, создаёт новый 144-bit slug, очищает устаревшие generated QR paths и увеличивает version;
- style update принимает только строгий allowlist и также увеличивает QR version;
- прямой browser update authoritative publication fields запрещён grants/trusted function contract;
- publish, unpublish, rotate и QR changes audit logged без slug, URL, PII или Storage credentials.

## QR workspace

- отдельные `/qr-codes` и `/items/:itemId/qr` lazy routes;
- один durable public URL для QR и viewer, configured через `VITE_PUBLIC_APP_URL`;
- production требует HTTPS без credentials/query/hash; HTTP разрешён только localhost/127.0.0.1 в demo;
- SVG и 1024 px PNG, ECC H, quiet zone 4–8 модулей;
- white, transparent и AR Photo brand presets с контрастом не ниже 4.5:1 и logo scale не выше 20%;
- размеры печати 30/40/50 мм и print-only layout;
- безопасные deterministic filenames с QR version;
- copy/share/open/print и typed confirmation `ОБНОВИТЬ` для rotate;
- software gate проверяет отсутствие UUID, PII, query/hash, Storage path и signed media credential.

## Автоматический gate

[GitHub Actions Quality run 30781431649](https://github.com/abdulkadyrov/ar.photo/actions/runs/30781431649) для backend commit `c9d503b` подтвердил:

- чистый PostgreSQL 17 reset/seed и SQL function lint;
- 171 pgTAP-проверка, включая 42 publication/QR lifecycle, grant, readiness, revoke и audit assertion;
- typecheck, lint, unit, build, bundle, secret scan и E2E — успешно.

[GitHub Actions Quality run 30782428561](https://github.com/abdulkadyrov/ar.photo/actions/runs/30782428561) для UI commit `298c1d5` подтвердил:

- TypeScript, ESLint, 88 unit/component tests, production build, bundle budget и secret scan — успешно;
- Chromium E2E: 9 сценариев, включая publish, style change, SVG download, rotate, unpublish и republish — успешно;
- fresh database, 171 pgTAP и generated database types — успешно.

[Processing worker run 30782428525](https://github.com/abdulkadyrov/ar.photo/actions/runs/30782428525) подтвердил неизменённый production Docker build и runtime.

Локально дополнительно пройдены полный E2E 9/9, production preview и визуальная desktop/mobile QA через реальный UI flow от проекта до брендового QR.

## Security evidence

- URL строится server-side из validated public origin и random slug;
- QR не содержит account/item UUID, email, user filename, private path или signed URL;
- старый URL после rotate и manifest после unpublish перестают проходить authoritative predicate;
- неподготовленная/устаревшая processing revision не публикуется;
- QR style не принимает произвольные поля/цветовой формат/unsafe quiet zone/logo scale;
- destructive rotate требует typed confirmation и явно предупреждает о перепечатке;
- public media остаются private и подписываются только manifest endpoint на короткий срок.

## Известные ограничения

- development/production Supabase project не привязан, поэтому hosted RPC/Edge/Storage integration и custom domain TLS не проверены;
- physical iPhone/Android scan matrix для 30/40/50 мм, glare/low-light и реальной печати остаётся обязательным этапом 11;
- SVG/PNG сейчас генерируются локально в browser; server-generated stored assets остаются optional optimization, metadata paths намеренно очищаются при rotate;
- documented React Router RSC advisory exception и GitHub Actions Node 20 runtime warnings отслеживаются до безопасного upstream/action update.

## Ручная проверка

- [x] полный UI flow project → group → marker → video → processing → publish;
- [x] desktop publication/QR layout;
- [x] mobile 390 px без horizontal scroll;
- [x] brand QR: ECC H, quiet zone 4, contrast 7.7:1, excavated logo 12%;
- [x] copy/share/open/download/print controls доступны с keyboard semantics;
- [x] rotate/unpublish/republish покрыты E2E;
- [ ] hosted Supabase + production custom domain;
- [ ] physical iPhone Safari scan/print matrix;
- [ ] physical Android Chrome scan/print matrix.
