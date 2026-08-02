# AR Photo

Коммерческая SaaS-платформа «живых фотографий»: Account → Project → Group → AR Item, private media, публичная QR-ссылка и image-tracked WebAR viewer. Репозиторий развивается по проверяемым этапам из `ROADMAP.md`.

## Stack

- React 19, TypeScript, Vite 8 и React Router;
- TanStack Query, React Hook Form и Zod;
- Supabase Auth, PostgreSQL 17, forced RLS и private Storage;
- Vitest, Testing Library, Playwright и pgTAP;
- MindAR + Three.js как lazy-loaded WebAR provider;
- GitHub Actions для quality, E2E и clean-database gates.

## Commands

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Для локальной базы нужен Docker-compatible runtime и Supabase CLI 2.109.1:

```sh
supabase start
supabase db reset
supabase db lint --local --schema public,private --level error --fail-on error
supabase test db --local supabase/tests
```

## Environment

Скопируйте `.env.example` в `.env.local` и задайте только browser-safe значения `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` и `VITE_PUBLIC_APP_URL`. Service-role key и database credentials во frontend запрещены.

## Текущий статус

Этапы 0–2 завершены на уровне репозитория. Production CRUD, media pipeline, AR-item wizard, public viewer, QR publication, subscriptions/team, analytics и admin реализуются в этапах 3–10. Старый IndexedDB flow сохранён как regression prototype и не считается multi-device production storage.

См. `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `STAGE_1_REPORT.md` и `STAGE_2_REPORT.md`.
