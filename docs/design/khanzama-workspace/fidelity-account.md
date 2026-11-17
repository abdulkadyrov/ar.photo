# Проверка соответствия кабинета: 13 листов

Дата: 14 ноября 2026. Источник: утверждённые `pages/account/*.png`,
`ROLES.md`, `PAGE_REVIEW.md`, `SPEC.md`. Все 13 исходных листов открыты и
просмотрены вручную. Листы являются концепциями: макетные числа, контакты и
несуществующие функции не переносятся в рабочий продукт.

## Метод и границы

Снимки реального приложения делает `audit/account.capture.pw.ts` через один
Vite `http://127.0.0.1:4179/ar.photo/`; конфигурация не запускает webServer.
Измерены именно внутренние ПК/телефонные панели исходных листов, а не весь
генеративный лист с заголовком. CSS viewport = размер панели в пикселях, DPR=1.
Разные листы имеют разные размеры панелей. Прямой pixel-diff между целым листом
и viewport приложения не используется и не называется доказательством совпадения.

Локальные данные проверки изолированы от рабочего сервера: три проекта, три
группы, три AR-работы; обложки — существующий `public/test-assets/test.jpg`,
не стоковые фотографии из PNG. Состояния AR-работ заданы локальным fixture,
это доказательство представления данных, а не обработки файлов. Аналитика
использует существующий demo repository и помечена в оболочке как демо.
Полный пакет — изменение состояния demo entitlements, а не новая роль.

До: `/tmp/khanzama-fidelity/account/before/<sheet>-<desktop|mobile>.png`.
После: `/tmp/khanzama-fidelity/account/after/<sheet>-<desktop|mobile>.png`.
Рядом `capture.json`: URL, viewport, размеры страницы и фактический h1.

## Маршрутная матрица

| Лист                   | Реальный маршрут / состояние                       | ПК viewport | Телефон viewport | Главное отличие до исправлений                                                            |
| ---------------------- | -------------------------------------------------- | ----------: | ---------------: | ----------------------------------------------------------------------------------------- |
| account-dashboard      | `/dashboard`, обычный пакет                        |    1131×879 |          410×879 | действия проектов, плотность и положение основного CTA                                    |
| account-projects       | `/projects`, заполненный список                    |    1285×797 |          400×797 | отсутствуют колонки/заголовок таблицы и количество; мобильная обложка слишком высокая     |
| account-project-detail | `/projects/:projectId`, вкладка групп              |    1278×808 |          418×808 | нет заголовка/итога блока групп, последних работ; действия перегружают заголовок          |
| account-project-edit   | до: Edit Modal; после: `/projects/:projectId/edit` |    1057×869 |          404×869 | модальное окно вместо экранного редактора, отсутствует существующая обложка               |
| account-groups         | `/groups?projectId=…`                              |    1116×854 |          393×854 | нет табличной шапки и inline-редактирования названия                                      |
| account-analytics      | `/analytics`, реальные demo scopes                 |    1146×893 |          351×893 | funnel уменьшает основной график, работы уходят ниже первого экрана                       |
| account-subscription   | `/settings/subscription`                           |    1105×890 |          403×890 | две подробные панели вместо краткого блока пакет/остаток/хранилище                        |
| account-team           | `/settings/team`, roster + приглашение             |    1053×873 |          444×873 | большой блок лимита вместо компактной сводки, отсутствует табличная шапка                 |
| account-profile        | `/profile`, owner role read-only                   |    1066×886 |          406×886 | на телефоне нет строки личности; второстепенные поля и действия занимают лишнее место     |
| account-settings       | `/settings`                                        |    1040×921 |          385×921 | общая навигация дублем, слишком высокая форма; нет API обложки студии/default publication |
| account-security       | `/settings/security`, MFA configured               |    1076×908 |          384×889 | один код вместо шести визуальных ячеек; нет достоверного списка устройств/remote sessions |
| account-support        | `/support`, контакты не настроены                  |    1172×861 |          365×861 | отсутствует реальный ticket/thread backend; экран FAQ и честное отсутствие контактов      |
| crm-unlimited          | `/dashboard`, unlimited additions/no expiry        |    1153×902 |          344×883 | состояние полного пакета не имеет компактной сводки и быстрых действий макета             |

## Общие отклонения оболочки — переданы lead

Сайдбар и общий верхний/нижний бар находятся вне account scope. В исходных PNG
есть разный вариант верхнего контекста студии и bell/avatar. Мобильная
основная кнопка перенесена в отдельную полноширинную строку; уточнены размеры
wordmark, заголовков и нижней панели. Эти свойства исправлены lead в общей
оболочке, а не локальными глобальными переопределениями account CSS.

## Результаты проверки после исправлений

Покрытие: **13 из 13 листов, ПК и телефон — 26 основных снимков после**.
Дополнительно: 24 снимка при ширине 319/390 px, пять снимков состояний и
машинный результат переходов/сохранения. После каждого содержательного прохода
снимки были открыты и просмотрены; итоговые ссылки ниже относятся к последнему
проходу на зафиксированной общей оболочке.

Ни успешная сборка, ни полнота снимков не означают «100% совпадения».
Pixel-diff/процент совпадения не вычислялся. Образы внутри генеративных листов,
тексты, числа и размеры не образуют единую исходную дизайн-систему; ниже явно
указаны оставшиеся отличия и ограничения существующих API.

| Лист                   | Что исправлено                                                                                                                                                         | Осталось / почему                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| account-dashboard      | Сводка в одной разделённой панели, три последних работы, два недавних проекта, Open/Edit; мобильные строки                                                             | На снимках используются действительные локальные fixture-фото и остатки, а не природные картинки/числа из PNG.                                                                                                                 |
| account-projects       | Счётчик, таблица с колонками, единая строка поиска/фильтров ПК; компактная мобильная обложка и две кнопки                                                              | Состояния фильтра соответствуют реальной модели «черновик/активный/архив». Возвращается одно превью проекта; тройная фотополоса и вымышленный публичный URL проекта не подставляются.                                          |
| account-project-detail | Хлебные крошки, итог блока групп, реальные превью работ группы, последние работы, отдельная ссылка редактора                                                           | Число строк/превью зависит от данных; в fixture у выбранного проекта одна группа. Сохранена дополнительная вкладка «О проекте».                                                                                                |
| account-project-edit   | Вместо основного Modal — отдельная страница, существующая/новая обложка, Save/Cancel и точный возврат                                                                  | «Тип проекта» использует реальные категории; загружаемая фотография на снимке отличается от концепции. Совместимый Modal доступен из дополнительного меню списка.                                                              |
| account-groups         | Табличная шапка, поиск/выбор проекта, пять рабочих вкладок выбранного проекта, меню и inline-переименование                                                            | Вкладки появляются только для существующего выбранного проекта; на узком экране прокручиваются внутри панели. Дополнительные поля группы открываются отдельно.                                                                 |
| account-analytics      | Три компактных показателя, широкий график с осью, Apply/Reset; на телефоне панель графика 150 px, три работы над нижней навигацией, без дублирующих действий заголовка | Открытия подписаны как открытия страниц, потому что API не разделяет QR и другие переходы. График/числа строятся существующим demo repository, не по цифрам PNG. Нет фиктивной сортировки всех работ по статистике.            |
| account-subscription   | Краткая панель пакет/остаток/хранилище, расходуемые добавления, карточки дополнений, три реальных недавних проекта; остальные лимиты свёрнуты                          | Нет вымышленных предложений «100 фото/30 дней», цен и оплаты. Карточки ведут к существующему разделу поддержки. Недавние проекты используют существующий каталог и подписанные обложки; их названия и число зависят от данных. |
| account-team           | Краткая сводка, одна таблица участников и приглашений; мобильные строки; меню действий и компактный invite                                                             | Проектная ACL на уровне каждого приглашения не реализована серверным контрактом, поэтому селектор доступа к отдельным проектам не имитируется. Отключение доступа сохраняет материалы, подтверждение остаётся.                 |
| account-profile        | ПК-форма/инициалы, мобильная строка личности, четыре быстрых перехода, Save/Cancel, роль только для чтения                                                             | Нет загрузки аватара; её кнопка не изображается работающей. Email/название аккаунта в профиле read-only; название меняется в настройках.                                                                                       |
| account-settings       | Поля/подписи ПК выровнены; компактные панели, переключатели справа, Save/Cancel; optimistic conflict UX сохранён                                                       | Нет upload API обложки студии/default-publication и других языков. Notification flags сохраняются, доставка пока явно не подключена. В нижней части некоторых viewport нужен небольшой вертикальный скролл.                    |
| account-security       | Одна настоящая MFA input с шестью визуальными ячейками и поддержкой вставки, компактная смена пароля, текущий браузер                                                  | Нет API истории устройств/удалённых сеансов и согласованного отключения настроенного фактора. Не показываются вымышленные геопозиции, устройства и даты. Фактор не отключался.                                                 |
| account-support        | Колонки обращений/помощи, компактная диагностика, отсутствие неподтверждённого email                                                                                   | **Существенное отличие:** ticket/thread backend и настроенный контакт отсутствуют. Вместо вымышленных запросов/ответов — честное состояние «Контакты поддержки пока не настроены», FAQ и копирование диагностики.              |
| crm-unlimited          | Сводка полного пакета, четыре быстрых действия, две колонки недавних проектов/работ; мобильная вертикальная версия                                                     | Это состояние того же кабинета. Текст «Возможности по вашей роли» не обещает прав, которых нет. Роль администратора не появляется.                                                                                             |

## Снимки каждого листа

Размеры обрезки оригинала: [account.bounds.json](audit/account.bounds.json).
Они имеют погрешность примерно 2 px и исключают заголовок всего листа.

| Лист                   | До: ПК / телефон                                                                                                                                                    | После: ПК / телефон                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| account-dashboard      | [ПК](/tmp/khanzama-fidelity/account/before/account-dashboard-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-dashboard-mobile.png)           | [ПК](/tmp/khanzama-fidelity/account/after/account-dashboard-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-dashboard-mobile.png)           |
| account-projects       | [ПК](/tmp/khanzama-fidelity/account/before/account-projects-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-projects-mobile.png)             | [ПК](/tmp/khanzama-fidelity/account/after/account-projects-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-projects-mobile.png)             |
| account-project-detail | [ПК](/tmp/khanzama-fidelity/account/before/account-project-detail-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-project-detail-mobile.png) | [ПК](/tmp/khanzama-fidelity/account/after/account-project-detail-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-project-detail-mobile.png) |
| account-project-edit   | [ПК](/tmp/khanzama-fidelity/account/before/account-project-edit-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-project-edit-mobile.png)     | [ПК](/tmp/khanzama-fidelity/account/after/account-project-edit-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-project-edit-mobile.png)     |
| account-groups         | [ПК](/tmp/khanzama-fidelity/account/before/account-groups-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-groups-mobile.png)                 | [ПК](/tmp/khanzama-fidelity/account/after/account-groups-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-groups-mobile.png)                 |
| account-analytics      | [ПК](/tmp/khanzama-fidelity/account/before/account-analytics-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-analytics-mobile.png)           | [ПК](/tmp/khanzama-fidelity/account/after/account-analytics-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-analytics-mobile.png)           |
| account-subscription   | [ПК](/tmp/khanzama-fidelity/account/before/account-subscription-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-subscription-mobile.png)     | [ПК](/tmp/khanzama-fidelity/account/after/account-subscription-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-subscription-mobile.png)     |
| account-team           | [ПК](/tmp/khanzama-fidelity/account/before/account-team-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-team-mobile.png)                     | [ПК](/tmp/khanzama-fidelity/account/after/account-team-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-team-mobile.png)                     |
| account-profile        | [ПК](/tmp/khanzama-fidelity/account/before/account-profile-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-profile-mobile.png)               | [ПК](/tmp/khanzama-fidelity/account/after/account-profile-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-profile-mobile.png)               |
| account-settings       | [ПК](/tmp/khanzama-fidelity/account/before/account-settings-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-settings-mobile.png)             | [ПК](/tmp/khanzama-fidelity/account/after/account-settings-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-settings-mobile.png)             |
| account-security       | [ПК](/tmp/khanzama-fidelity/account/before/account-security-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-security-mobile.png)             | [ПК](/tmp/khanzama-fidelity/account/after/account-security-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-security-mobile.png)             |
| account-support        | [ПК](/tmp/khanzama-fidelity/account/before/account-support-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/account-support-mobile.png)               | [ПК](/tmp/khanzama-fidelity/account/after/account-support-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/account-support-mobile.png)               |
| crm-unlimited          | [ПК](/tmp/khanzama-fidelity/account/before/crm-unlimited-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/before/crm-unlimited-mobile.png)                   | [ПК](/tmp/khanzama-fidelity/account/after/crm-unlimited-desktop.png) / [телефон](/tmp/khanzama-fidelity/account/after/crm-unlimited-mobile.png)                   |

## Проверенные действия и доказательства

- Отмена редактора возвращает ровно в `/projects?search=Натюрморты`, название не меняется.
- Сохранение описания существующего проекта возвращает в тот же фильтр; число проектов не увеличивается.
- Inline-переименование сохраняет ту же группу, количество групп остаётся 3.
- Отмена приглашения не добавляет запись: осталось одно исходное приглашение.
- Отмена правки профиля возвращает исходное имя; собственного переключателя роли нет.
- Настройки студии действительно сохраняются в существующем demo repository.
- Три недавних проекта пакета соответствуют каталогу; переход в проект и «Назад» возвращают на страницу пакета.
- Пять вкладок выбранного проекта ведут по настоящим маршрутам; при ширине 319 px прокрутка остаётся внутри панели (413/295 px).
- На телефоне аналитики 351×893 нет кнопок Refresh/Create в заголовке, панель графика имеет высоту 150 px; третья строка заканчивается на y=833,89 перед нижней навигацией y=835,22.

Машинные результаты: [flow-results.json](/tmp/khanzama-fidelity/account/after/states/flow-results.json),
[refinement-results.json](/tmp/khanzama-fidelity/account/after/states/refinement-results.json).
Снимки состояний:
[inline ПК](/tmp/khanzama-fidelity/account/after/states/groups-inline-rename-desktop.png),
[inline телефон](/tmp/khanzama-fidelity/account/after/states/groups-inline-rename-mobile.png),
[приглашение ПК](/tmp/khanzama-fidelity/account/after/states/team-invite-desktop.png),
[приглашение телефон](/tmp/khanzama-fidelity/account/after/states/team-invite-mobile.png),
[возврат после Save](/tmp/khanzama-fidelity/account/after/states/project-save-return.png).

Метрики основных снимков: [capture.json](/tmp/khanzama-fidelity/account/after/capture.json).
Узкие размеры: [measurements.json](/tmp/khanzama-fidelity/account/after/narrow/measurements.json).
Все 24 проверки 319/390 px имеют `scrollWidth <= innerWidth`.

Итоговый полный account audit: **4/4 passed**, 14.11.2026 21:58 МСК.
Обновлены все 26 native, 24 narrow, пять снимков состояний и оба результата
функциональных переходов на текущей общей оболочке. Все 50 основных/узких
снимков имеют `scrollWidth <= viewport width`. Последние изменения аналитики,
вкладок групп и недавних проектов пакета проверены отдельным четвёртым сценарием.

Focused unit до последних трёх UI-уточнений: **8 файлов, 26 тестов passed**.
Scoped ESLint текущих изменённых TSX/audit чистый; `git diff --check` чистый.
Сборка, полный test suite, CI, commit/push и публикация этим агентом не запускались;
их проверяет lead на общей интеграции. Снимки в `/tmp` — локальные артефакты,
не доказательство опубликованного интерфейса или проверки live Supabase.


### Дополнительная проверка низкого экрана главной

После общего Chromium-прогона поджаты только мобильные интервалы главной:
между списками 16→14 px; при ширине до 359 px промежуток 6 px и верхний
отступ 8 px. Размеры интерактивных элементов не уменьшены. Отдельная проверка
**1/1 passed**: default demo при 319×628 имеет нижнюю границу заголовка
«Недавние проекты» 568,06 px при начале навигации 570,22 px, без допуска.
Два native dashboard-снимка пересняты с прежними заполненными fixture;
остальные native source не менялся. Дополнительное доказательство:
[319×628](/tmp/khanzama-fidelity/account/after/states/dashboard-319x628.png),
[измерения](/tmp/khanzama-fidelity/account/after/states/dashboard-319x628.json).
