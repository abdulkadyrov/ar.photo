# AR Photo

Коммерческая SaaS-платформа «живых фотографий»: Account → Project → Group → AR Item, private media, публичная QR-ссылка и image-tracked WebAR viewer. Репозиторий развивается по проверяемым этапам из `ROADMAP.md`.

## Stack

- React 19, TypeScript, Vite 8 и React Router;
- TanStack Query, React Hook Form и Zod;
- Supabase Auth, PostgreSQL 17, forced RLS и private Storage;
- адаптивная browser-нормализация фото и видео разных форматов в JPEG/WebP и MP4/H.264, восстановимая IndexedDB-очередь и resumable TUS uploads;
- Node 22 processing worker с MindAR OfflineCompiler, FFmpeg/ffprobe и WebP thumbnails;
- Vitest, Testing Library, Playwright и pgTAP;
- MindAR + Three.js как lazy-loaded WebAR provider;
- GitHub Actions для quality, E2E, clean-database, supply-chain и worker gates.

## Commands

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run check
npm run test:e2e
npm run test:e2e:cross-browser
```

Для локальной базы нужен Docker-compatible runtime и Supabase CLI 2.109.1:

```sh
supabase start
supabase db reset
supabase db lint --local --schema public,private --level error --fail-on error
supabase test db --local supabase/tests
```

## Environment

Скопируйте `.env.example` в `.env.local` и задайте только browser-safe значения `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` и `VITE_PUBLIC_APP_URL`. Demo разрешается только явным `VITE_ENABLE_DEMO_MODE=true` без Supabase variables; обычный production build без backend-конфигурации fail-closed. Service-role key и database credentials во frontend запрещены.

Self-service `/register` принимает email и пароль, а после первой сессии транзакционно создаёт один tenant-isolated trial workspace. Репозиторий фиксирует email signup с autoconfirm в `supabase/config.toml`; hosted-проект должен зеркалировать эти настройки (`Confirm email` выключен), SMS/phone provider приложению не нужен. Если подтверждение ошибочно оставлено включённым, UI безопасно покажет fallback с ожиданием письма. Redirect URLs для login/reset должны входить в Auth allowlist.

Кабинет больше не создаёт anonymous session автоматически: `/`, `/dashboard`, `/projects`, `/create`, `/support` и `/admin` требуют явного входа. После входа пользователь попадает на светлую Главную с быстрым сценарием «название + фото + видео → обработка → QR»; рабочая навигация содержит Главную, Мои проекты, Добавить фото, AR-камеру и Поддержку. Полное продуктовое ТЗ и сгенерированные макеты лежат в `docs/design/AR_PHOTO_PRODUCT_V3_SPEC.md` и `docs/design/ar-photo-*-v3.png`.

## Текущий статус

Этапы 0–11 завершены на уровне репозитория. Production CRUD проектов/групп, защищённый media upload и AR-item processing используют Supabase/RLS, private Storage, TUS, immutable versions, atomic quota accounting и service-only worker. До сети фото ограничивается 2560 px, очищается от EXIF и адаптивно перекодируется; большие MP4/H.264 при наличии WebCodecs локально уменьшаются до trial-лимита. Подготовленная очередь хранится по owner/account/project/group в отдельной IndexedDB и удаляется после успешной финализации. Supabase Storage остаётся единственным multi-device источником истины. Публичный `/ar/:publicSlug` получает минимальный manifest через rate-limited Edge Function, обновляет короткоживущие signed URLs и запускает камеру/MindAR только после явного действия; обычное видео остаётся fallback без камеры. Публикация выполняется trusted RPC только после успешной текущей processing revision, создаёт стабильный capability URL и печатный QR с SVG/PNG, безопасными стилями, rotate/revoke и software readability gate. Effective entitlements управляют write-доступом и usage meters, а `/settings/subscription` и `/settings/team` поддерживают тарифы, роли, точечные разрешения, приглашения и отключение сотрудников. Privacy-safe телеметрия не блокирует AR playback, принимает только coarse allowlisted dimensions, хранит salted session hash и отдаёт `/analytics` только permission-scoped агрегаты. `/admin` требует active superadmin и MFA `aal2`, ведёт private audit для support/mutations, управляет тарифами/периодами, блокирует пользователей и выполняет допустимое удаление Auth user только через server-side Edge Function; пароли супер-администратору недоступны. PWA кэширует только статические assets; CI проверяет WCAG, browser/mobile matrix, secrets, public metadata, dependency contract, SBOM и reproducible release manifest. Старый общий IndexedDB flow сохранён как regression prototype отдельно от production upload queue.

Repository readiness зелёный, но production launch остаётся **NO-GO**, пока не выполнены физические iPhone/Android AR-тесты, hosted infrastructure, rollback/restore, monitoring и legal gates. Точный статус 21 критериев: `LAUNCH_READINESS.md`.

Основные документы: `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `AR_TRACKING.md`, `STORAGE.md`, `TESTING.md`, `DEPLOYMENT.md`, `MANUAL_DEVICE_CHECKLIST.md`, `ROADMAP.md` и отчёты `STAGE_1_REPORT.md`–`STAGE_11_REPORT.md`.
