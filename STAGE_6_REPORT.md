# AR Photo — отчёт этапа 6

Дата: 3 августа 2026 года.

## Результат

Этап 6 завершён на уровне репозитория: публичный `/ar/:publicSlug` получает минимальный manifest через service-only Edge boundary, обновляет пятиминутные signed media URLs и запускает MindAR/Three camera tracking только после явного действия пользователя. При отказе камеры, неподдерживаемом WebGL, media/tracking error или осознанном выборе доступен обычный H.264 video fallback без камеры.

Publication mutation и QR generation намеренно не имитируются: они относятся к этапу 7. Hosted Supabase deploy и физическая iPhone Safari/Android Chrome tracking matrix не отмечены выполненными без привязанного project/device lab.

## Public manifest

- `get_public_ar_manifest_source` доступен только `service_role` и фильтрует `published`, `public`, `ready`, expiry/deletion, active account и trial/active/grace subscription;
- browser roles не могут вызвать source или rate-limit RPC напрямую;
- Edge Function принимает только `GET/OPTIONS`, проверяет 36-символьный hex slug и allowlisted CORS origins;
- tracking dataset, optimized video и poster остаются private и получают signed URL на 300 секунд;
- ответ содержит только title, marker dimensions/aspect ratio, behavior, fallback flag, signed assets и expiry; UUID, account, email и постоянные Storage paths исключены;
- `private, no-store`, CSP `default-src 'none'`, `frame-ancestors 'none'` и `nosniff` запрещают нежелательное кэширование/встраивание ответа;
- viewer обновляет manifest до истечения signed URL и повторяет безопасное получение при старте после expiry.

## Rate limiting и privacy

- 60 запросов на network identifier и 240 на slug за 60 секунд;
- raw IP и raw slug salted SHA-256 до PostgreSQL;
- durable bucket update атомарен и не доступен `anon/authenticated`;
- endpoint не пишет raw network identifier, slug, signed URL или Storage path в logs;
- rate-limit/service/signing failures возвращают allowlisted public codes без внутренних деталей.

## Viewer lifecycle

- intro объясняет использование камеры и даёт отдельный normal-video path;
- camera API не вызывается при mount или выборе fallback;
- HTTPS, mediaDevices и WebGL проверяются до lazy import AR runtime;
- MindAR/Three загружаются отдельными chunks только после «Начать AR»;
- video texture plane калибруется по marker aspect ratio;
- `targetFound/targetLost` поддерживают `pause_hide`, `continue_audio_hide` и `stop_reset`;
- autoplay всегда начинает muted; звук включается отдельным user gesture;
- orientation/resize, page visibility, fullscreen и возврат в AR обрабатываются явно;
- cleanup останавливает MindAR/camera, video и освобождает texture, geometry, material, renderer и DOM;
- partial startup failure проходит тот же teardown.

## Автоматический gate

[GitHub Actions Quality run 30780761487](https://github.com/abdulkadyrov/ar.photo/actions/runs/30780761487) для коммита `d7283aa` подтвердил:

- TypeScript, ESLint, 80 unit/component/function tests, production build, bundle budget и secret scan — успешно;
- Chromium E2E: 9 сценариев, включая camera-explicit viewer и fallback без camera call — успешно;
- clean PostgreSQL 17 start/reset/seed и function lint — успешно;
- 129 pgTAP checks, включая 21 public-manifest lifecycle/grant/rate-limit assertion — успешно;
- database types сгенерированы из чистой схемы.

[Processing worker run 30780761476](https://github.com/abdulkadyrov/ar.photo/actions/runs/30780761476) подтвердил production Docker build и worker runtime.

Локально дополнительно пройдены Deno typecheck Edge Function, полный `npm run check`, 9 E2E, desktop/390 px visual QA и normal-video interaction без camera request.

## Security evidence

- public response не содержит internal ids, account data, email, private path или service credential;
- private originals/generated assets не становятся public buckets;
- suspended/expired/deleted/unpublished/not-ready item indistinguishable возвращает `404`;
- hashed rate buckets имеют строгий key constraint и service-only grants;
- камера запрашивается только после явного user gesture;
- signed manifest и browser fetch используют `no-store`;
- ошибки не раскрывают PostgreSQL/Storage details;
- camera/WebGL/video resources освобождаются на mode switch, visibility change и unmount.

## Известные ограничения

- development/production Supabase project не привязан, поэтому Edge Function, secrets, CORS allowlist и private signed downloads не проверены в hosted runtime;
- нет доступного physical-device lab, поэтому iPhone Safari/Android Chrome permission, orientation, real camera tracking и thermal behavior остаются обязательным этапом 11;
- demo использует repository fixture; real-world marker/video field matrix остаётся infrastructure/device gate;
- WAF/platform throttling, anomaly alerts и analytics session limits относятся к этапам 9/11;
- documented client-only React Router RSC advisory exception сохраняется до безопасного upstream release.

## Ручная проверка

- [x] desktop intro/fallback layout;
- [x] mobile 390 px без horizontal scroll;
- [x] камера не запрашивается до «Начать AR»;
- [x] normal-video fallback не вызывает camera API;
- [x] permission/capability/media/tracking errors имеют безопасные состояния;
- [x] no initial dashboard MindAR/Three dependency;
- [x] signed URL refresh и complete teardown покрыты unit/component logic;
- [ ] hosted Supabase Edge Function + private signed assets;
- [ ] physical iPhone Safari camera/tracking/orientation;
- [ ] physical Android Chrome camera/tracking/orientation.
