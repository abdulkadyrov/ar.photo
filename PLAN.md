# AR Photo — аудит и план реализации

Дата аудита: 3 августа 2026 года.

## 1. Ограничение текущего этапа

Этот документ завершает этап 0. Продуктовый код, схема базы данных и зависимости на этом этапе не меняются. К этапу 1 можно переходить только после команды: «План принимаю. Начинай этап 1».

## 2. Краткий вывод

Репозиторий содержит рабочий локальный прототип, но не SaaS-продукт. Его полезно сохранить как технический proof of concept для QR, IndexedDB/ZIP и MindAR, однако текущая модель данных, маршрутизация и единый компонент `App.tsx` не рассчитаны на аутентификацию, многопользовательский доступ, серверную обработку или публичные AR-ссылки.

Главный разрыв: обычный `/viewer/:id` не выполняет image tracking. Он открывает камеру и показывает видео вручную по кнопке. Настоящий MindAR tracking реализован только в `/viewer/test` для заранее размещённых `test.jpg`, `test.mp4` и `test.mind`.

## 3. Текущий стек

| Область | Сейчас | Оценка |
| --- | --- | --- |
| UI | React 19, TypeScript, Vite 6, Tailwind CSS 3, Lucide | Совместим с целевой архитектурой |
| Навигация | Самописный parser поверх History API | Заменить на React Router |
| Состояние | Локальный `useState`, весь snapshot загружается целиком | Недостаточно для SaaS |
| Данные | IndexedDB, 6 object stores | Сохранить только как optional offline/cache слой |
| Backend | Отсутствует | Нужен Supabase |
| Auth | Отсутствует | Нужен Supabase Auth |
| AR | MindAR + Three.js, один тестовый target | Полезный spike, не production workflow |
| QR | `qrcode.react` и `qrcode`, PNG и ZIP | Реальная генерация, URL пока непереносим |
| PWA | Manifest и самописный service worker | Минимальная оболочка, требует пересмотра |
| Tests/lint | Скриптов нет | Блокер для этапа 1 |
| Deploy | GitHub Pages, base `/ar.photo/` | Подходит прототипу, не SaaS/backend |

## 4. Что найдено в репозитории

### Работает

- production build и строгий TypeScript;
- создание проекта, класса/группы и участника в браузере;
- загрузка изображения и видео в память, затем сохранение Blob в IndexedDB;
- сохранение данных после перезагрузки страницы;
- генерация настоящего QR-кода и PNG;
- ZIP-экспорт проекта/класса и ZIP-импорт проекта;
- получение камеры через `getUserMedia`;
- MindAR image tracking на фиксированном тестовом target;
- запуск видео при обнаружении target и пауза при его потере в тестовом viewer;
- manifest, service worker и SPA-fallback для GitHub Pages.

### Работает частично

- `/viewer/:id`: камера и видео работают, но распознавания маркера нет;
- публичная ссылка: QR корректно кодирует URL, но media хранится в IndexedDB исходного браузера и на другом устройстве недоступна;
- загрузка: выбирает файлы, но не проверяет MIME, сигнатуру, размер, длительность, разрешение или качество;
- AR compilation: есть Node-скрипт для одного тестового изображения, но нет пользовательского processing pipeline;
- PWA: кэширует shell, но нет install/update UX, безопасной стратегии кэша или offline metadata contract;
- responsive UI: базовая адаптивность есть, но нет desktop sidebar/mobile bottom navigation из референса;
- удаление: cascade работает, но оно мгновенное, без подтверждения и восстановления;
- идентификаторы: используют `crypto.randomUUID`, но публичный id обрезан до 56 бит и совпадает с внутренним id.

### Отсутствует

- Supabase client/config, `.env.example`, Auth, Postgres, миграции, RLS и Storage policies;
- account/member/role/permission model;
- подписки, тарифы и серверная проверка лимитов;
- коммерческая иерархия Account → Project → Group → AR Item;
- production marker analysis/compilation и обработка видео;
- публичный `/ar/:publicSlug` с минимальным manifest и signed URLs;
- SVG QR, стили QR, печатная проверка и share flow;
- аналитика, audit log и админ-панель;
- soft delete и lifecycle удаления Storage;
- единая обработка ошибок, retry и observability;
- unit, integration и E2E tests;
- lint, format и CI quality gates;
- полноценная дизайн-система и интерфейс из приложенного референса.

## 5. Результаты baseline-проверок

| Проверка | Результат |
| --- | --- |
| `git status` до изменений | Чистый `main`, совпадает с `origin/main` |
| `npm ci` на локальном Node 26.5.1 | Ошибка сборки `canvas@2.11.2`; нет binary для Node 26 и локальных native libs |
| `npm ci --ignore-scripts` | Успешно, используется только для аудита frontend build |
| `tsc -b --pretty false` | Успешно |
| `npm run build` | Успешно |
| Bundle | MindAR ~2.10 MB и Three.js ~667 KB до gzip; Vite предупреждает о больших chunks |
| lint | Скрипт и конфигурация отсутствуют |
| unit tests | Скрипт и тесты отсутствуют |
| `npm audit` | 1 critical и 4 high; direct `postcss`, остальные главным образом через `mind-ar`/`canvas` |
| Browser smoke-test | Проект → группа → участник → фото → видео → QR → reload прошёл, console errors не обнаружены |
| Реальный camera/image tracking | Не выполнялся в автоматическом аудите; требуется ручной device test и разрешение камеры |

CI использует Node 22, а локально проект не закрепляет версию Node. В этапе 1 необходимо добавить `.nvmrc` или `.node-version` и поле `engines`, затем добиться обычного `npm ci` без `--ignore-scripts`.

## 6. Важные риски, найденные аудитом

1. QR не работает на другом устройстве, поскольку указывает на origin текущего запуска, а Blob остаются в IndexedDB.
2. Production viewer не является AR: видео включается вручную и не связано с пользовательским marker.
3. Нет Auth/RLS/membership, поэтому нет границы доступа между клиентами.
4. Публичный тестовый JPEG содержит EXIF, включая признак GPS-данных, и сейчас попадает в публичный deployment.
5. В dependency tree есть critical/high vulnerabilities и несовместимый с Node 26 native `canvas`.
6. ZIP-импорт доверяет JSON и объёму архива без Zod/schema validation, лимитов и защиты от resource exhaustion.
7. `accept="image/*"` и `accept="video/*"` — только подсказки picker; серверной или клиентской валидации нет.
8. Удаление проекта и очистка базы происходят без подтверждения и являются необратимыми.
9. Service worker кэширует почти любой GET-ответ без allowlist. После появления signed URLs это может оставить приватный media в Cache Storage.
10. Камера запрашивается сразу при загрузке viewer, а не после явной кнопки «Начать».

Полный threat model и меры находятся в [SECURITY.md](./SECURITY.md).

## 7. Принципы миграции

- Не удалять тестовый MindAR spike до появления эквивалентного regression test.
- Не переносить IndexedDB-модель напрямую в Postgres; сначала ввести доменные типы и repository boundaries.
- Сохранить текущие QR/ZIP функции как reference implementation, но обернуть в валидируемые сервисы.
- Тяжёлую AR-библиотеку загружать только в публичном viewer или на шаге тестирования.
- Разделить внутреннее приложение и публичный viewer на отдельные route bundles.
- Все tenant-bound данные защищать сервером и RLS; frontend checks использовать только для UX.
- Для quota-sensitive операций использовать доверенный server boundary и транзакционную проверку.
- Не выполнять тяжёлую компиляцию/транскодирование в Edge Function без отдельного spike по CPU, памяти и времени выполнения.

## 8. Точный план этапа 1 — «Основа»

Оценка: 5–8 рабочих дней. Этап не включает production SQL schema или перенос media в Supabase Storage.

### 1.1. Tooling и quality gates

- закрепить Node 22;
- нормализовать `dependencies`/`devDependencies` и безопасно обновить уязвимые пакеты;
- добавить ESLint, Prettier, Vitest, React Testing Library и Playwright config;
- добавить отдельные `typecheck`, `lint`, `test`, `test:e2e`, `build` scripts;
- обновить CI: install → typecheck → lint → unit → build;
- сохранить отдельный manual script для MindAR compiler.

Критерий: чистый `npm ci` и все quality gates зелёные на локальной машине и CI.

### 1.2. Модульный каркас

- установить React Router, TanStack Query, Zustand, React Hook Form и Zod;
- создать `app`, `features`, `entities`, `shared`, `pages` и `ar` boundaries;
- вынести routing из `lib/routes.ts`;
- разделить internal app и public AR viewer;
- добавить route-level error boundaries и lazy loading.

Критерий: текущие Home/Dashboard/Project/Test Viewer доступны через новый router без потери рабочего MindAR spike.

### 1.3. Design foundation

- перенести визуальный язык к приложенному dark SaaS reference;
- добавить tokens для цветов, spacing, radius, shadow, typography и motion;
- реализовать минимальные Button, Input, Select, Modal, Toast, Skeleton, ErrorState и FileDropzone;
- реализовать desktop sidebar и mobile bottom navigation;
- проверить keyboard focus, reduced motion и touch targets.

Критерий: `/login`, `/dashboard` и пустые состояния desktop/mobile визуально согласованы и доступны с клавиатуры.

### 1.4. Supabase client и Auth boundary

- создать `.env.example` только с URL и publishable key;
- добавить typed Supabase client без `service_role`;
- реализовать login, logout, reset-password и update-password routes;
- добавить session provider и protected routes;
- временно использовать typed adapter/mock для account/subscription context до этапа 2.

Критерий: Auth flow работает на отдельном development Supabase project; секретные ключи отсутствуют в bundle и Git.

### 1.5. Завершение этапа

- unit tests для routing, Zod forms, auth states и UI primitives;
- smoke E2E login shell/dashboard/public test viewer без camera grant;
- build budget и анализ chunks;
- список известных ограничений и ручной чек-лист.

## 9. Решения, которые нужно подтвердить до этапа 2

- регион и юридически допустимое размещение Supabase для реальных персональных данных;
- домен публичных ссылок, например `https://ar.example.ru/ar/{slug}`;
- можно ли хранить оптимизированное публичное видео за signed URL, либо требуется другой CDN;
- где выполняются MindAR compilation и video transcode: выделенный worker, container service или ограниченный client-side fallback;
- срок soft-delete и retention аналитики;
- какие роли сотрудников входят в MVP;
- нужен ли импорт данных из текущего локального ZIP в коммерческий аккаунт.

## 10. Definition of Done каждого последующего этапа

- typecheck, lint, unit tests и build успешны;
- затронутые integration/E2E tests успешны;
- миграции применяются с нуля и повторяемы;
- RLS/advisors проверены, если менялась база;
- приложение запущено и основной сценарий проверен;
- документация и `.env.example` актуальны;
- перечислены изменённые файлы и шаги ручной проверки;
- push не выполняется без прямого указания.

