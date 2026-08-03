# AR Photo — отчёт этапа 3

Дата: 3 августа 2026 года.

## Результат

Этап 3 завершён на уровне репозитория: проекты и группы работают через типизированный production repository, Supabase/RLS и private Storage. Demo adapter сохраняет тот же контракт для локальной проверки без фиктивных production-ответов.

## Реализовано

- список проектов с поиском, статусными фильтрами, сортировкой и пагинацией;
- создание и редактирование проектов через React Hook Form + Zod;
- idempotency key для защиты от повторной отправки и server-side quota RPC;
- архив, возврат из архива, soft delete и восстановление проектов;
- overview проекта с вкладками, loading/error/empty/read-only состояниями;
- создание, редактирование, архивирование, soft delete и восстановление групп;
- атомарная сортировка всех групп проекта с advisory lock и точной проверкой набора UUID;
- drag-and-drop сортировка и доступные кнопки «выше/ниже» для клавиатуры;
- атомарный перенос группы в другой активный проект с каскадным сохранением AR-item consistency;
- общий рабочий каталог `/groups` вместо foundation-заглушки;
- приватные обложки проектов и групп через `project-covers-private`;
- allowlist JPEG/PNG/WebP, лимит 10 МБ и проверка сигнатуры против spoofed MIME;
- случайные tenant-scoped Storage paths, compensating cleanup при ошибке DB update и удаление заменённой версии;
- показ обложек только через signed URL на 10 минут;
- audit events через существующие database triggers;
- актуализированный Supabase-generated TypeScript контракт для `move_group` и `reorder_groups`.

## Автоматический gate

GitHub Actions run `30774297382` для коммита `8c7500c` подтвердил:

- quality: форматирование, TypeScript, ESLint, 29 unit/component tests, production build, bundle budget и secret scan — успешно;
- Chromium E2E: 6 сценариев — успешно;
- E2E production catalog flow: приватная обложка в demo adapter, создание проекта и групп, изменение порядка, перенос и общий каталог групп — успешно;
- clean PostgreSQL 17 start/reset/seed — успешно;
- database function lint — успешно;
- schema/RLS/catalog pgTAP: 38 проверок — успешно;
- database types generation и artifact upload — успешно.

Локальный полный gate повторил 29 unit-тестов и 6 E2E. Bundle budget: initial 546 KiB, dashboard 690 KiB, CSS 24 KiB; MindAR/Three остаются lazy chunks и не входят в начальную загрузку dashboard.

## Security и consistency evidence

- запись проекта/группы ограничена tenant, ролью и активной подпиской на server side;
- клиент не содержит service-role key и не обходит RLS;
- сортировка отклоняет неполный, чужой, повторяющийся или `null` набор групп;
- viewer не может переносить группы; owner/editor path проверяется `private.can_write_account`;
- перенос блокирует исходную строку и оба порядка проектов в стабильной последовательности;
- composite FK каскадно синхронизирует `ar_items.project_id`, а связанные `media_assets` обновляются в той же транзакции;
- private Storage policy извлекает account UUID из object path и проверяет read/write access;
- spoofed MIME и oversized cover отбрасываются до upload;
- неудачный update удаляет новый Storage object, замена очищает предыдущую обложку.

## Известные ограничения

- development Supabase project пока не подключён, поэтому hosted Auth/Storage smoke и remote advisors остаются infrastructure gate;
- в demo mode Blob URL обложки живёт до перезагрузки страницы, production repository использует постоянный private Storage path;
- глубокая проверка декодирования, размеров, EXIF и качества marker image относится к этапу 4;
- `npm audit` показывает advisory `GHSA-qwww-vcr4-c8h2` для React Router RSC mode. AR Photo использует client-only `BrowserRouter`, не RSC/Data Router server actions; принудительный downgrade с 7.18.2 на 7.11.0 не выполнялся. Исключение пересматривается при выходе исправленной актуальной версии или переходе на RSC.
- GitHub предупреждает о Node 20 внутри pinned third-party actions, хотя runner принудительно исполняет их на Node 24; обновление action SHA выполняется после совместимого upstream release.

## Ручная проверка

- [x] desktop и mobile shell без horizontal scroll;
- [x] modal autofocus, Escape и видимые focus states;
- [x] project create/edit/archive/restore/delete flows;
- [x] group create/edit/archive/delete, keyboard reorder и move flow;
- [x] cover selection/render в demo E2E;
- [x] `/groups` отображает перенесённую группу в новом проекте;
- [x] публичный `/viewer/test` не сломан;
- [ ] повторить cover upload и signed URL на hosted development Supabase;
- [ ] повторить keyboard/drag smoke на physical iPhone/Android после появления device lab.
