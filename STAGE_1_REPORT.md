# AR Photo — отчёт этапа 1

Дата: 3 августа 2026 года.

## Результат

Этап 1 завершён на уровне репозитория: приложение получило тестируемый modular foundation, тёмный адаптивный shell, безопасную Auth boundary и автоматические quality/security/bundle gates. Существующий IndexedDB/MindAR prototype сохранён как временный adapter и regression path.

## Реализовано

- Node.js 22.22.2 закреплён в engines, `.nvmrc` и `.node-version`;
- dependency pins/overrides убрали critical audit findings;
- ESLint, Prettier, Vitest, Testing Library, Playwright и GitHub Actions;
- React Router, TanStack Query, React Hook Form и Zod boundaries;
- lazy internal/auth/AR routes и route-level error boundary;
- dark tokens, Button, Input, Select, Modal, Toast, Skeleton, ErrorState, FileDropzone и status primitives;
- desktop sidebar и mobile bottom navigation;
- login/logout/reset/update-password, typed session states и protected routes;
- browser-safe Supabase client только с URL + publishable key;
- явно маркированный demo auth adapter при отсутствии Supabase environment;
- secret scan и bundle graph budget;
- сохранён `/viewer/test`, MindAR и Three.js остаются lazy chunks.

## Автоматический gate

На момент завершения:

- typecheck: успешно;
- ESLint без warnings: успешно;
- unit/component tests: 20 успешно;
- Chromium E2E: 5 успешно;
- production build: успешно;
- secret scan: успешно;
- initial JS graph: 535 KiB при budget 600 KiB;
- dashboard JS graph: 679 KiB при budget 800 KiB;
- initial CSS: 22 KiB при budget 40 KiB;
- MindAR/Three в static dashboard graph: отсутствуют;
- desktop 1440 px / mobile 390 px horizontal overflow: отсутствует по E2E.

Каждый инкремент этапа был отдельно закоммичен, отправлен в draft PR и дождался зелёных `quality` и `e2e` GitHub Actions.

## Auth environment

Реальный Supabase adapter реализован и включается, когда одновременно заданы:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

`service_role`, secret keys, database URLs и другие server credentials запрещены во frontend и проверяются secret scan. В текущей машине Supabase CLI установлен, но подключённый remote project не обнаружен; Docker runtime также недоступен. Поэтому remote email delivery и hosted recovery redirect не заявляются как проверенные. Эти проверки выполняются после подготовки stage/local Supabase environment на этапе 2.

## Известные ограничения

- production данные пока остаются в IndexedDB и не доступны на втором устройстве;
- `/viewer/:id` остаётся manual overlay; реальный tracking есть только в `/viewer/test`;
- test viewer запрашивает камеру при mount — privacy intro переносится в этап 6;
- soft delete/restore ещё не реализованы; в локальном prototype добавлено подтверждение необратимых действий;
- один high advisory React Router RSC документирован как неприменимый к client-only Vite mode до выхода исправленной версии;
- device AR checklist на физических iPhone/Android остаётся этапом 6/11.

## Ручной checklist

- [x] desktop dashboard и login визуально проверены при 1440 px;
- [x] mobile dashboard и login визуально проверены при 390 px;
- [x] keyboard focus/reduced-motion/touch target foundation добавлен;
- [x] login → dashboard → logout пройден в E2E;
- [x] camera-denied public test route не ломает shell;
- [ ] hosted Supabase email/password flow на отдельном development project;
- [ ] password recovery email и redirect allowlist;
- [ ] физический iPhone Safari / Android Chrome tracking test.
