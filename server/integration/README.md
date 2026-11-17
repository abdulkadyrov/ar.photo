# CRM → штатный AR pipeline, integration v1

Локальная реализация. Только этот новый каталог; существующие AR frontend, worker,
миграции, CRM, браузерные данные и серверы не изменялись. Никакого SSH/deploy/push.

## Контракт

POST `/ar.photo/api/v1/works`, Bearer shared token server-only (не Supabase key).
`Idempotency-Key`: 16–200 ASCII letters/digits/_/-, рекомендуется UUID.
Тело JSON до 64 KiB: `{version:1,workId,projectId,studentId,assets:{marker,video}}`.
Каждый asset: `{mediaId,sha256,mime,url}`. SHA-256 — исходных CRM bytes.
Поддержаны image/jpeg/png/webp и video/mp4/quicktime/webm.

Namespace из env + workId идентифицирует постоянную AR работу. projectId/studentId
для неё неизменны. Identity receipt включает эти IDs и mediaId/hash/mime; URL
**не входит** в identity и не сохраняется в SQLite. Повтор с новой подписью URL
безопасен. Другие IDs/hash/mime под прежним ключом → 409. Новый key обновляет ту
же работу, прежний slug/QR. Пока предыдущая ревизия обрабатывается → 409 с
`previous_revision_still_processing`, сначала опрашивать прежний ключ.

202: `{"status":"processing","arWorkId":"..."}` (при занятом OS lock arWorkId
может отсутствовать). Повторять **тот же POST и ключ** со свежими signed URLs.
200: `{"status":"ready","arWorkId":"...","viewerUrl":"https://khanzama.ru/ar.photo/ar/<36-hex-slug>"}`.
200 выдаётся после `publish_ar_item` и проверки фактического item.status=published,
public_slug и qr_codes.public_url. При повторе завершённой квитанции проверяется
публикация, но старый запрос не откатывает более новую работу.

400: неверный запрос/asset. 401: неверный integration Bearer. 409: identity/owner
conflict либо failed processing → ручная проверка качества/штатные retry инструменты.
503: временная ошибка user-bound Supabase/RPC/Storage. Ошибки не содержат upstream
response text, URL query или credentials. Автоматического обхода marker quality,
quota/RLS/processing guard нет.

## Штатный pipeline, без SQL bypass

Auth password grant **отдельного интеграционного пользователя** → обычный
`authenticated` JWT. API key anon/publishable, service_role/sb_secret отвергаются.
Нужно заранее назначить пользователю штатное membership/план для нужного account.
Никаких user/account insert и изменения RLS сервис не делает.

`create_project` → `create_group` → `create_ar_item_draft`; request UUIDv5
детерминированные. В v1 нет CRM classId в payload, поэтому одна группа "CRM imports"
на CRM project, не выдуманный класс. account+namespace+workId дают стабильный item.
`begin_media_upload` → `start_media_upload` → private Storage object upload →
`finalize_media_upload`. Upload request UUID зависит от namespace/work/kind/source
hash/MIME. Повтор finalized session сразу получает asset, не начинает её заново.
Standard object upload выбран для streaming server-to-server; исходники не
помещаются целиком в Python RAM. Полная потеря передачи повторяет object upload;
TUS resume в этом минимальном серверном адаптере нет.

`prepare_ar_item_processing` вызывается только если текущая пара source assets
ещё не прикреплена. После потерянного ответа проверяются item + current-revision
processing_jobs. Server transcode может заменить video_asset_id — source проверяется
по input_metadata задания. Опрос processing/ready/published не вызывает prepare
повторно и не сбрасывает item в processing. Failed job/marker quality не обходятся.
Для реальной замены published work используется штатный `unpublish_ar_item`, затем
prepare и штатный publish. Slug не вращается. Пока новая ревизия обрабатывается,
публичная работа может быть временно недоступна — это ограничение штатного RPC.

## Скачать и подготовить bytes безопасно

Точный virtual-host CRM private bucket задаётся `AR_CRM_S3_HOST`. Не общий shared
S3 endpoint и не wildcard! Дополнительно можно ограничить path prefix.
Только HTTPS:443, без userinfo/fragment/control characters. DNS резолвится один раз;
если **хотя бы один** адрес не global, запрос отклоняется. TLS подключается к
зафиксированному IP с SNI/проверкой сертификата исходного host. HTTP proxy env
не используется; redirects запрещены. Никаких произвольных URL и query logging.
Максимум 25 MiB marker / 500 MiB video, 120s download wall time, 15s socket timeout;
Content-Length, реальный счётчик, Content-Type и source SHA-256 проверяются.

Pillow декодирует marker с ограничением 12000 px стороны и 40M pixels, проверяет
формат, применяет EXIF orientation. Новый RGB PNG создаётся без EXIF/ICC/комментариев,
metadata.width/height соответствуют ориентированному изображению, exifStripped
выставляется после фактического преобразования. Upload SHA — нового PNG, source SHA
остаётся identity запроса. Не выдаём исходный hash за hash нормализованного файла.
Видео проверяется по container signature. Источник сохраняется byte-for-byte;
как в существующем frontend fallback маркируется video/mp4 с metadata
serverTranscodeRequired=true, videoCodec/audioCodec=source, dimensions/duration=null,
optimization.strategy=server-transcode. Настоящие codecs/duration/limits валидирует
штатный FFmpeg worker, не Python заголовки. MindAR и transcode не выполняет этот
WSGI процесс и не заменяет synthetic результатом.

## Durable state и аварийное восстановление

Private AR_INTEGRATION_DATA_DIR: SQLite receipts + work mapping/state, locks и
временные assets. Directory mode0700, не веб-каталог. Сохранять вместе с backup.
Per-work nonblocking OS flock сериализует pipeline (включая разные процессы),
SQLite хранит lease и checkpoints перед/после внешних действий. Живой OS lock
не крадётся по истечении SQL lease. При смерти процесса OS освобождает lock;
следующий запрос восстанавливается из remote RPC state и deterministic IDs.
Никакой фоновой отправки из закрытой PWA не обещается; CRM server worker повторяет
POST, а штатный AR worker выполняет transcode/MindAR. После аварии могут остаться
private asset-* temp folders: чистить их отдельно после проверки, не общий spool.

## Настройки (только владелец инфраструктуры; здесь не запускались)

- AR_CRM_BEARER_TOKEN: общий случайный ASCII secret ≥32 chars, из защищённого env.
- AR_CRM_NAMESPACE: стабильный source namespace, default crm; не менять после запуска.
- AR_CRM_S3_HOST: exact private bucket hostname, без протокола/path/wildcard.
- AR_CRM_S3_PATH_PREFIX: default `/`, например `/crm/v1/` если signed URLs это поддерживают.
- AR_INTEGRATION_DATA_DIR: private persistent directory.
- AR_SUPABASE_URL: HTTPS API gateway, или internal HTTP URL только с явным
  AR_SUPABASE_ALLOW_INTERNAL_HTTP=1 в изолированной серверной сети.
- AR_SUPABASE_ANON_KEY: anon/publishable, не service-role.
- AR_INTEGRATION_EMAIL, AR_INTEGRATION_PASSWORD: credentials интеграционного
  пользователя, не создавать/логировать их здесь; AR_INTEGRATION_ACCOUNT_ID UUID.

Пример команды для последующей staging установки (без секретов):
`gunicorn --chdir server 'integration.wsgi:create_app()' --bind 127.0.0.1:4186 --workers 2 --threads 1 --timeout 600`
Установить requirements.txt в отдельный venv. Gunicorn предоставляет инфраструктура.
Reverse proxy сохраняет полный путь `/ar.photo/api/v1/works`, запрещает публичный
доступ к env/SQLite, ограничивает body/rate и не логирует Authorization/body.
API gateway HTTP разрешение относится только к trusted server env; скачивание S3
всегда HTTPS и DNS-pinned. Session requests не следует делить между потоками;
использовать threads=1, worker processes допустимы.

## Проверки и границы приёмки

`python3 -m unittest discover -s server/integration/tests -v`
`python3 -m py_compile server/integration/*.py`
`git diff --check -- server/integration`

Tests synthetic/mock transport: SSRF/DNS-private/redirect/MIME/size/hash/signature,
EXIF orientation/stripping, same-key changed identity, refreshed signed URL, lost
prepare acknowledgement/restart, old receipt replay after newer update, published
verification, source-transcoded replacement, per-work lock/lease и RPC enum/session
contracts. Они не доказывают реальную provider/network/worker готовность.

До production нужны: E2E на staging с настоящим user JWT/RLS, Storage upload/upsert,
квотами/credit plan, marker analysis/quality/MindAR/FFmpeg jobs и existing publication
RPCs; private S3 DNS/certificate/max upload/timeouts; actual printed QR. Проверить
refresh/password session policy/MFA для integration user. Если upload session истекла,
адаптер не подменяет request UUID и не обходит guard — потребуется операционное
восстановление; квитанция/исходники не удаляются. Signed URLs, истёкшие во время
скачивания, повторяются новым POST с тем же key и свежими URLs. Транскодирование
не гарантирует успех любого повреждённого/неподдерживаемого видео.

Источники контракта: локальные src/features/ar-items/arItemRepository.ts,
media/mediaRepository.ts, catalog/catalogRepository.ts и миграции foundation,
trusted_mutations, media_uploads, ar_item_processing, ar_item_publication,
allow_server_transcode_source_uploads, allow_transcoded_video_assets и latest grouped
bundles/account lifecycle. Существующие файлы не редактировались.
Документация Supabase сверена: https://supabase.com/changelog.md и
https://supabase.com/docs/guides/storage/uploads/standard-uploads (2026-11-13).

### Плановые ограничения и диагностика без секретов

Trial может ограничивать проектами/AR items/photo credits. При PostgreSQL 23514
ответ `409 {error:quota_or_limit_reached}`; 42501 → 403 integration_account_forbidden,
55000 → 409 rpc_state_guard_requires_review. Квоты, credits, MFA и membership
адаптер не меняет. Владелец использует штатные admin/user-bound grant инструменты.
Не передаются raw upstream message/details/hint или тела ответов Auth/Storage.

### iPhone multi-picture JPEG (MPO)

Для заявленного image/jpeg допускаются только Pillow format JPEG либо MPO.
Явно выбирается frame0 (primary photograph), затем действуют прежние лимиты
размеров/декомпрессии, EXIF transpose и создание нового clean RGB PNG. Остальные
MIME по-прежнему требуют строго свой формат. Многокадровый контейнер не выдаётся
за нормализованный marker и не копируется в AR как есть.

Regression: маленький двухкадровый MPO с различающимися кадрами и orientation6;
real smoke public/test-assets/test.jpg (существующий iPhone MPO). Проверяются pixels
именно ориентированного frame0, размеры, отсутствие EXIF, отказ при ложных PNG/WebP
MIME и SHA-256 оригинала до/после. Все20 integration tests проходят локально.
Результат теста нормализации не означает успех MindAR tracking/quality: штатные
проверки не отключались. Originals не менялись.

CRM infrastructure подтвердил отдельно live S3 MIME override/roundtrip и anonymous403.
Если botocore не доверяет Selectel CA chain, владелец задаёт AWS_CA_BUNDLE к системному
CA-файлу; verification не отключать. Этот AR-патч TLS-код не меняет.

## CRM A4 frame

Optional `frame: "a4-portrait" | "a4-landscape"` is included in receipt identity and upload request keys. The CRM pins its rendered A4 photo bytes in the publication intent. The video asset metadata carries `crmFrame`; the worker applies centered cover cropping to 1260x1782 or 1782x1260, preserving source files and audio. Requests without `frame` retain their existing behavior. A pending task reuses its request key.
