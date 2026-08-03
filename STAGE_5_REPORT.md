# AR Photo — отчёт этапа 5

Дата: 3 августа 2026 года.

## Результат

Этап 5 завершён на уровне репозитория: авторизованный пользователь проходит девять явных шагов от проекта и группы до test-before-publish, а отдельный service-only worker проверяет marker/video, создаёт MindAR tracking dataset и WebP thumbnail. Публикация и QR намеренно не имитируются: кнопка остаётся закрытой до public manifest/viewer этапа 6 и publication boundary этапа 7.

## Девятишаговый workflow

1. Выбор project/group.
2. Idempotent создание draft и редактирование title/description.
3. Выбор или загрузка marker asset.
4. Локальный advisory quality analysis с объяснениями.
5. Выбор или загрузка MP4/H.264 video asset.
6. Настройка autoplay, loop, audio, marker-lost и fallback behavior.
7. Запуск processing revision, четыре progress jobs, безопасные errors, retry и явный unsuitable-marker override.
8. Marker/video preview, обязательный checklist и технический AR test.
9. Готовность к публикации без генерации фиктивного QR или public URL.

Маршруты `/items`, `/items/new` и `/items/:itemId/edit` подключены к production/demo repository boundary. Project detail показывает актуальное число AR-работ и ведёт в мастер. Demo adapter сохраняет тот же lifecycle contract и завершает четыре job детерминированно для локальных/E2E проверок.

## Processing lifecycle

- `create_ar_item_draft` проверяет membership, subscription limit, project/group scope и request idempotency;
- `prepare_ar_item_processing` атомарно привязывает marker/video, увеличивает version только при замене media и создаёт ровно четыре deduplicated jobs;
- marker analysis и video inspection могут выполняться параллельно;
- marker compilation разблокируется после suitable score или зафиксированного override, thumbnail — после video inspection;
- claim использует `FOR UPDATE SKIP LOCKED`; worker heartbeat обновляет lease каждые 30 секунд;
- lease старше 20 минут возвращается в очередь до `max_attempts`, затем переводит job/item в безопасный terminal failure;
- progress монотонный, retry не создаёт duplicate job/assets;
- browser roles могут читать свои jobs, но не могут claim, heartbeat, complete или fail их.

Generated paths детерминированы по account/project/group/item/version и находятся в private bucket `generated-private`. Worker сверяет существующий immutable object по SHA-256 при повторе и никогда не использует пользовательское имя файла как Storage path.

## Worker и media verification

- отдельный Docker image на `node:22.22.2-bookworm-slim`;
- MindAR OfflineCompiler создаёт `target.mind` один раз во время processing, а не при viewer load;
- Canvas декодирует marker и использует тот же детерминированный quality analyzer, что и browser preview;
- ffprobe авторитетно допускает H.264 и AAC либо отсутствие audio;
- FFmpeg извлекает кадр, `cwebp` создаёт thumbnail с предсказуемым MIME;
- private inputs скачиваются по короткоживущим signed URLs во временную директорию;
- temporary files очищаются, service key не попадает во frontend, output/log contract содержит стабильные error codes без stack trace и Storage secrets.

## Marker quality

Score 0–100 учитывает brightness, contrast, sharpness, feature density и entropy. Порог suitability равен 60. Автоматические причины объясняют слишком тёмный/светлый marker, слабый contrast, detail и feature density. Неподходящий marker не компилируется без явного override с причиной 10–500 символов и audit actor/timestamp.

Unit matrix покрывает 10+ детерминированных marker patterns: тёмный, светлый, серый, gradient, low-contrast texture, checkerboard, bars, cross-hatch, color texture и mixed geometry. Дополнительно локальный runtime smoke реально скомпилировал JPEG в `target.mind`; field matrix пользовательских фотографий остаётся отдельным device/infrastructure gate.

## Автоматический gate

[GitHub Actions Quality run 30779232960](https://github.com/abdulkadyrov/ar.photo/actions/runs/30779232960) для коммита `04e4834` подтвердил:

- TypeScript frontend/worker, ESLint, 70 unit/component tests, production build, bundle budget и secret scan — успешно;
- Chromium E2E: 8 сценариев, включая полный девятишаговый workflow — успешно;
- clean PostgreSQL 17 start/reset/seed и function lint — успешно;
- 108 pgTAP checks: schema, RLS, catalog, uploads и 42 processing lifecycle/security assertions — успешно;
- database types сгенерированы из чистой схемы.

[Processing worker run 30779232980](https://github.com/abdulkadyrov/ar.photo/actions/runs/30779232980) подтвердил Docker build и наличие Node, ffmpeg, ffprobe и `cwebp` внутри production image.

Локально дополнительно подтверждены H.264/AAC fixture probe, реальная MindAR compilation и browser visual QA на desktop и 390 px без horizontal scroll или console errors.

## Security и consistency evidence

- service-role credential присутствует только в worker environment и запрещён для `VITE_*`;
- generated Storage object должен существовать, иметь ожидаемый MIME/size/path и учитывается атомарно;
- source asset обязан принадлежать тому же account/project/group/item scope;
- stale или прошлые revisions не могут перезаписать текущий item;
- concurrent workers не claim-ят одну job;
- unsuitable marker блокирует compilation до audit-friendly override;
- video codec/duration не доверяются browser metadata;
- пользователь видит allowlisted сообщения, а технические детали остаются в protected logs;
- publish/QR не симулируются до появления public security boundary.

## Известные ограничения

- development Supabase project и container platform не подключены, поэтому hosted signed-download/upload smoke, scheduler/worker credentials и production observability остаются infrastructure gate;
- 10+ synthetic marker patterns и один реальный compile smoke не заменяют field matrix из реальных школьных/свадебных/музейных фотографий на production-like worker;
- iPhone Safari/Android Chrome camera tracking относится к этапу 6 и physical-device lab;
- local Homebrew FFmpeg не содержит WebP encoder; production image явно использует отдельный `cwebp`;
- `npm audit` documented React Router RSC exception сохраняется: приложение client-only и не включает RSC actions.

## Ручная проверка

- [x] desktop wizard layout;
- [x] mobile 390 px без horizontal scroll;
- [x] полный 9-step demo flow и resume после draft creation;
- [x] marker quality explanations и override path;
- [x] processing progress/retry/ready states;
- [x] реальная MindAR compilation и H.264/AAC inspection smoke;
- [x] no browser console errors;
- [ ] hosted Supabase + deployed worker end-to-end;
- [ ] 10+ реальных markers на production-like worker;
- [ ] physical-device tracking matrix этапа 6.
