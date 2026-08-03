# AR Photo

Коммерческая SaaS-платформа «живых фотографий»: Account → Project → Group → AR Item, private media, публичная QR-ссылка и image-tracked WebAR viewer. Репозиторий развивается по проверяемым этапам из `ROADMAP.md`.

## Stack

- React 19, TypeScript, Vite 8 и React Router;
- TanStack Query, React Hook Form и Zod;
- Supabase Auth, PostgreSQL 17, forced RLS и private Storage;
- resumable TUS uploads с browser preflight и server-side finalization;
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

## Текущий статус

Этапы 0–11 завершены на уровне репозитория. Production CRUD проектов/групп, защищённый media upload и AR-item processing используют Supabase/RLS, private Storage, TUS, immutable versions, atomic quota accounting и service-only worker. Публичный `/ar/:publicSlug` получает минимальный manifest через rate-limited Edge Function, обновляет короткоживущие signed URLs и запускает камеру/MindAR только после явного действия; обычное видео остаётся fallback без камеры. Публикация выполняется trusted RPC только после успешной текущей processing revision, создаёт стабильный capability URL и печатный QR с SVG/PNG, безопасными стилями, rotate/revoke и software readability gate. Effective entitlements управляют write-доступом и usage meters, а `/settings/subscription` и `/settings/team` поддерживают тарифы, роли, точечные разрешения, приглашения и отключение сотрудников. Privacy-safe телеметрия не блокирует AR playback, принимает только coarse allowlisted dimensions, хранит salted session hash и отдаёт `/analytics` только permission-scoped агрегаты. `/admin` требует active superadmin и MFA `aal2`, ведёт private audit для support/mutations и инициирует только invitation/recovery Auth flows без доступа к паролям. PWA кэширует только статические assets; CI проверяет WCAG, browser/mobile matrix, secrets, public metadata, dependency contract, SBOM и reproducible release manifest. Старый IndexedDB flow сохранён как regression prototype и не считается multi-device production storage.

Repository readiness зелёный, но production launch остаётся **NO-GO**, пока не выполнены физические iPhone/Android AR-тесты, hosted infrastructure, rollback/restore, monitoring и legal gates. Точный статус 21 критериев: `LAUNCH_READINESS.md`.

Основные документы: `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `AR_TRACKING.md`, `STORAGE.md`, `TESTING.md`, `DEPLOYMENT.md`, `MANUAL_DEVICE_CHECKLIST.md`, `ROADMAP.md` и отчёты `STAGE_1_REPORT.md`–`STAGE_11_REPORT.md`.
