# AR Photo — Storage и media lifecycle

## Модель хранения

Все продуктовые bucket приватные. Browser получает доступ через authenticated Storage policies или короткоживущие signed URLs; публичных объектов нет.

| Bucket                   | Лимит объекта | MIME allowlist               | Назначение                         |
| ------------------------ | ------------: | ---------------------------- | ---------------------------------- |
| `markers-private`        |        25 MiB | JPEG, PNG, WebP              | Исходные маркеры                   |
| `videos-private`         |       500 MiB | MP4                          | Исходное/authoritative видео       |
| `generated-private`      |        50 MiB | octet-stream, PNG, SVG, WebP | `.mind`, poster и generated assets |
| `project-covers-private` |        10 MiB | JPEG, PNG, WebP              | Обложки проектов                   |
| `avatars-private`        |         5 MiB | JPEG, PNG, WebP              | Аватары                            |

Storage policy извлекает account id из object path и перепроверяет active membership, subscription и permission. `anon` не имеет прямого доступа к internal objects.

## Object paths и версии

Имена файлов пользователя не становятся object path. Source upload резервируется как account/project/group UUID hierarchy с server-generated session UUID. Marker/video и generated outputs immutable: замена создаёт новую версию; старый object не перезаписывается. `media_assets` хранит bucket, path, kind, bytes, MIME, version, SHA-256, metadata и lifecycle timestamps.

Generated path детерминирован относительно account/item/revision/job. Worker загружает с `upsert: false`; если объект уже существует после retry, SHA-256 должен совпасть, иначе job завершается `generated_object_conflict`.

## Upload lifecycle

1. Browser определяет фото/видео по содержимому, проверяет decode и нормализует результат в JPEG/WebP или MP4 H.264/AAC.
2. Marker повторно кодируется через canvas, удаляя EXIF/GPS/comments; SHA-256 считается уже по нормализованному файлу.
3. `begin_media_upload` под advisory lock перепроверяет account/project/group, permission, subscription, лимиты и idempotency key.
4. Сервер создаёт `upload_sessions` с уникальными storage path и expiry.
5. TUS загружает chunks по 6 MiB с retry delays 0/3/5/10/20 секунд и поддержкой resume fingerprint.
6. `finalize_media_upload` проверяет реальный Storage object, размер/MIME/path, создаёт `media_assets` и атомарно учитывает storage usage.
7. Cancel удаляет незавершённый object и переводит session в aborted; повторная финализация идемпотентна.

Browser validation улучшает UX, но authoritative quota/path/finalization остаются серверными.

## Processing access

Только processing worker получает `SUPABASE_SERVICE_ROLE_KEY`. Он:

- создаёт signed download URL source на 120 секунд;
- скачивает во временную директорию вне репозитория;
- не пишет signed URLs или credentials в structured logs;
- создаёт immutable output и SHA-256;
- всегда удаляет temp directory в `finally`;
- сообщает клиенту только стабильные bounded error codes.

Публичная manifest function подписывает только опубликованные tracking/video/poster assets текущей revision на 300 секунд. Ответ имеет `private, no-store`; service worker не кэширует API, media, signed URLs или произвольные GET.

## Cleanup и retention

- Незавершённые pending/uploading/failed sessions имеют expiry и выбираются `expire_stale_uploads` bounded batches.
- `cleanup-stale-uploads` вызывается scheduler'ом с отдельным `UPLOAD_CLEANUP_SECRET`, удаляет objects и подтверждает результат через service-only RPC.
- Projects/groups используют archive/restore и `deleted_at`; media records поддерживают soft delete.
- Физическая очистка Storage должна быть идемпотентной и идти после retention/restore window, а не до неё.
- Analytics cleanup отделён от media cleanup и использует другой secret.

Конкретные production retention windows и backup policy утверждаются владельцем данных до загрузки реальных клиентов.

## Cache contract

PWA cache allowlist ограничен same-origin hashed assets под `/ar.photo/assets/` с destinations script/style/font/image. Навигация network-first и может восстановить только app shell. Любой Supabase response, signed URL, video и marker остаются вне Cache Storage. При logout приложение может отправить `CLEAR_STATIC_CACHES`; приватных данных в этих caches быть не должно.

## Проверки

- pgTAP проверяет cross-tenant read/write/delete, path spoofing, inactive membership, permission/plan limits, quota races, TUS session lifecycle и service-only cleanup.
- Unit/component tests проверяют MIME spoof, corrupt image, oversize, unsupported codec, resume/cancel/retry и Object URL cleanup.
- CI сканирует public JPEG fixtures и запрещает EXIF APP1, APP13 и JPEG comments.
- PWA E2E доказывает, что media candidate не попадает в Cache Storage, а hashed static asset попадает.

## Операционный чек-лист

- [ ] Buckets в hosted Supabase приватны и совпадают с migration contract.
- [ ] Object limits/MIME allowlists проверены после `db push`.
- [ ] Scheduler stale-upload cleanup использует только свой secret.
- [ ] Test object после expiry удаляется, usage возвращается корректно, audit не содержит path/secret.
- [ ] Signed URL истекает и обновляется manifest endpoint.
- [ ] Backup содержит Postgres metadata; отдельная Storage backup/restore стратегия задокументирована у выбранного провайдера.
- [ ] Retention и окончательное удаление согласованы владельцем данных.
