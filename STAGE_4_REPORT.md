# AR Photo — отчёт этапа 4

Дата: 3 августа 2026 года.

## Результат

Этап 4 завершён на уровне репозитория: AR Photo принимает marker JPEG/PNG/WebP и MP4/H.264 через проверяемую очередь, загружает большие файлы возобновляемыми TUS-чанками в private Storage и создаёт immutable `media_assets` только после серверной финализации объекта.

## Реализовано

- рабочий защищённый маршрут `/media` с выбором проекта и группы;
- multiple FileDropzone, очередь, preview, прогресс, отмена, повтор, удаление и последовательная загрузка готовых файлов;
- проверка magic bytes и совпадения MIME для JPEG/PNG/WebP/MP4;
- реальное декодирование изображения, размеры до 12 000 px и пересборка Canvas для удаления EXIF;
- MP4 preflight: `ftyp`, H.264 (`avc1`/`avc3`), AAC или видео без аудио, duration и resolution через browser decoder;
- SHA-256 подготовленного файла;
- `tus-js-client` 4.3.1 с direct Storage hostname, фиксированным чанком 6 МБ, resume fingerprint, retry delays и termination при явной отмене;
- server-side upload reservations с idempotency, tenant/group validation, subscription role checks, storage reservation и plan limits;
- private tenant-scoped path `accounts/{account}/projects/{project}/groups/{group}/uploads/{session}/v{version}/{kind}.{ext}` без пользовательских имён;
- `upload_sessions` lifecycle: pending/uploading/failed/finalized/aborted/expired;
- server-side проверка существования Storage object, точного MIME/размера, metadata contract, duration limit и atomic storage accounting;
- immutable `media_assets` versions и signed URL boundary для authenticated reads;
- Edge Function `cleanup-stale-uploads` с отдельным scheduler secret, service role только в Edge runtime, lease/ack protocol и повтором неуспешной очистки;
- demo repository с тем же контрактом, отменой, progress, idempotency и версиями для локального smoke без ложных production-ответов.

## Автоматический gate

GitHub Actions run `30776026210` для коммита `5bf4b26` подтвердил:

- quality: TypeScript, ESLint, 39 unit/component tests, production build, bundle budget и secret scan — успешно;
- Chromium E2E: 7 сценариев — успешно;
- clean PostgreSQL 17 start/reset/seed — успешно;
- database function lint — успешно;
- schema/RLS/catalog/media pgTAP: 66 проверок — успешно;
- database types generation и artifact upload — успешно.

Расширенный локальный E2E дополнительно пропускает через browser decoder синтетические PNG/JPEG/WebP и H.264/AAC MP4 fixtures, загружает поддерживаемые форматы и отклоняет существующий HEVC MP4. Mobile 390×844 проверен без horizontal scroll.

## Security и consistency evidence

- browser не получает service-role key и не может вызывать cleanup acknowledgement RPC;
- `authenticated` видит upload session/media asset только своего account, а Storage policy повторно проверяет tenant membership;
- произвольный picker `accept` не считается защитой: содержимое проверяется по сигнатуре и decoder;
- begin/finalize повторяемы без duplicate asset и повторного storage accounting;
- advisory lock защищает storage quota от конкурентной финализации;
- пользовательское имя не формирует Storage path, upsert не используется;
- просроченная reservation перестаёт занимать quota, а cleanup worker получает ограниченный lease с повтором после ошибки/аварии;
- Blob preview URLs освобождаются при удалении элемента и unmount страницы;
- MP4 вне allowlist, spoofed MIME, пустые, слишком большие и повреждённые файлы отклоняются до финализации.

## Доверенная граница видео

Browser preflight улучшает UX, но browser остаётся недоверенным. На этапе 4 сервер независимо ограничивает bucket/path, MIME, размер, quota и структуру переданных metadata; публикации ещё нет. Авторитетная повторная проверка codec/duration и marker quality выбранным processing worker, создание tracking dataset и запрет публикации до успешного job относятся к этапу 5. Клиентские metadata сами по себе не станут основанием для публикации.

## Эксплуатация cleanup

После привязки development Supabase project необходимо:

1. Создать случайный `UPLOAD_CLEANUP_SECRET` длиной не менее 32 байт в Edge Function secrets.
2. Deploy `cleanup-stale-uploads` с `verify_jwt = false`; endpoint защищён собственным `x-cleanup-secret` и не принимает browser JWT.
3. Настроить scheduler на периодический `POST /functions/v1/cleanup-stale-uploads` с secret header.
4. Алертить non-2xx ответы; `502` означает, что Storage cleanup оставлен в retryable состоянии.
5. Не помещать scheduler secret или service role в `VITE_*`, GitHub Pages либо browser environment.

## Известные ограничения

- development Supabase project не подключён, поэтому hosted TUS/Storage smoke, Edge deploy/scheduler и remote advisors остаются infrastructure gate;
- реальные weak-network/24-hour resume и Safari/Android decoder checks требуют hosted project и physical-device lab;
- authoritative media inspection/marker compilation выполняется processing worker этапа 5;
- public manifest, short-lived viewer URLs и безопасная PWA cache policy относятся к этапу 6;
- `npm audit` сообщает две high-находки React Router RSC advisory; приложение использует client-only `BrowserRouter`, documented exception сохраняется до совместимого исправления upstream.

## Ручная проверка

- [x] PNG/JPEG/WebP decode, EXIF strip и preview;
- [x] H.264/AAC MP4 decode, metadata и загрузка;
- [x] HEVC MP4 отклонён как unsupported codec;
- [x] multiple queue, progress, cancel/retry и finalized list;
- [x] desktop и mobile без horizontal scroll;
- [x] public `/viewer/test` regression route не сломан;
- [ ] hosted Supabase TUS resume под network throttling;
- [ ] Edge Function deploy, secret и scheduled cleanup smoke;
- [ ] physical iPhone Safari/Android Chrome media fixture matrix.
