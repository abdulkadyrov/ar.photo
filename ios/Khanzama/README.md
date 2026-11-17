# «Хан Зама»: iOS-приложение и App Clip

Подготовка настоящего запуска через системную карточку iPhone после QR, как
в предоставленных записях Stories AR. Это отдельное iOS-приложение с App Clip,
не имитация системной карточки внутри сайта.

## Статус

Исходники и Xcode-проект подготовлены. Apple Developer у владельца пока нет.
Идентификаторы `ru.khanzama.arphoto` / `.Clip` — предлагаемые, ещё не зарегистрированы.
Системная карточка не опубликована. На рабочем сервере ничего не изменено.
Локально отсутствует полный Xcode/iOS SDK; синтаксический разбор установленным
Command Line Tools также не выполняется из-за ошибки SwiftBridging в toolchain.
Сборка проверяется отдельным macOS CI; аппаратные проверки ещё предстоят.

## Что реализовано

- Общий просмотр в полном приложении и App Clip, название «Хан Зама», существующая
  фирменная иконка. Нативная загрузка и ошибка с повтором, Dynamic Type и safe area.
- Приём исходного URL фотографии через `NSUserActivity` и Universal Links.
  Сохраняются текущие публичные маршруты `/ar.photo/ar/<slug>` и `/ar.photo/camera`.
- Просмотр работает в WKWebView с существующим опубликованным AR-движком:
  подписанные медиа, QR-проверка, распознавание, кнопки звука/видео остаются у сайта.
  В Swift нет копий алгоритмов трекинга или административных API.
- Только свой HTTPS-домен и публичные маршруты. Камера запрашивается штатно;
  микрофон и сторонние фреймы не получают разрешений от оболочки.
- При уходе в фон захват камеры останавливается. При возврате открывается последняя
  публичная страница. Перезапуск AR/кеш в WKWebView необходимо проверить на iPhone.
- Генератор AASA с явными идентификаторами; конфигурация сервера не активирована.

## Открытие проекта

Открыть `Khanzama.xcodeproj` в полном Xcode с установленным iOS SDK.
Для воспроизводимой генерации: `xcodegen generate --spec ios/Khanzama/project.yml`
из корня репозитория, XcodeGen 2.46+. Оба target используют iOS 16+ и iPhone.
Значения Team и `KHANZAMA_BUNDLE_ID` задаются в Build Settings; без реальных
профилей подписанная сборка и запуск App Clip у посетителя не готовы.

Команды CI:

```sh
xcodebuild -project ios/Khanzama/Khanzama.xcodeproj -scheme Khanzama \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  CODE_SIGNING_ALLOWED=NO build
node --test ios/Khanzama/Deployment/association.test.mjs
```

## Что нужно после регистрации Apple Developer

1. Зарегистрировать идентификаторы полного приложения и App Clip, назначить Team,
   включить App Clips и Associated Domains. Нужны настоящие профили, не значения
   из примеров. Полное приложение содержит ту же функцию, что и App Clip.
2. Собрать и проверить на физическом iPhone: разрешение/отказ, QR-ссылка, холодный
   и повторный запуск, распознавание, звук, фон/возврат, поворот, плохая сеть,
   недоступный проект, запись/сохранение. Web Share и скачивание из WKWebView могут
   потребовать отдельного нативного обработчика; их готовность не заявлена.
3. Сгенерировать AASA:
   `node ios/Khanzama/Deployment/association.mjs REALTEAMID ru.khanzama.arphoto /tmp/apple-app-site-association`
   Здесь REALTEAMID нужно заменить проверенным 10-символьным Team ID. Генератор
   не регистрирует и не подтверждает идентификаторы и не перезаписывает файл.
   У существующих аккаунтов проверить соответствие App Identifier Prefix Team ID.
4. Проверить существующий AASA домена и объединить записи, если он уже есть.
   Подготовить серверный файл по `Deployment/Caddyfile.snippet`, проверить Caddy
   и только затем активировать. AASA должен возвращаться без редиректа по
   `https://khanzama.ru/.well-known/apple-app-site-association` как JSON.
5. Создать приложение в App Store Connect, загрузить архив с App Clip. Подготовить
   карточку: название «Хан Зама», подзаголовок «Оживите вашу фотографию», действие
   «Смотреть». Изображение 1800×1200 PNG/JPEG без прозрачности ещё требуется;
   `Deployment/card.ru.json` — черновик метаданных, не файл импорта Apple.
6. Настроить Advanced App Clip Experience для `https://khanzama.ru/ar.photo/`,
   проверить конкретные существующие QR без перепечатки. Совместимость старых
   кодов после настройки Apple нужно подтвердить физическим сканированием.
7. Заполнить данные приложения/конфиденциальности по фактической аналитике сайта,
   предоставить проверяемый публичный AR-проект ревьюеру, пройти App Review.
   Упаковка сайта в WebKit не гарантирует одобрение; опубликованной готовой
   системой считается только проверенный на устройстве и одобренный App Clip.

Официальные основания:
- https://developer.apple.com/documentation/appclip/creating-an-app-clip-with-xcode
- https://developer.apple.com/documentation/appclip/associating-your-app-clip-with-your-website
- https://developer.apple.com/documentation/appclip/testing-the-launch-experience-of-your-app-clip
- https://developer.apple.com/design/human-interface-guidelines/app-clips/
- https://developer.apple.com/programs/ (публикация требует членства; $99/год)

Анимацию системной карточки, её подъём из нижней части экрана и системную
подпись приложения рисует iOS. Веб-страница не может показать такую карточку
поверх приложения «Камера» самостоятельно.
