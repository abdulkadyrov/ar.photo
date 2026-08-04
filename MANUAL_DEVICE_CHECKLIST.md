# AR Photo — manual device checklist

Этот документ заполняется на staging и затем для production canary. Browser emulation/CI не заменяют физическую отметку.

## Паспорт прогона

- Build commit:
- Release manifest SHA-256:
- Frontend URL:
- Supabase project/region:
- Worker image digest:
- Дата/время и timezone:
- Исполнитель:
- Reviewer:
- Marker set/version:
- Printed QR/marker size и printer:
- Network profile:

## Обязательная матрица устройств

| Устройство         | OS      | Browser         | Camera       | QR  | AR tracking  | Overlay      | Результат           |
| ------------------ | ------- | --------------- | ------------ | --- | ------------ | ------------ | ------------------- |
| Физический iPhone  | Версия: | Safari:         | [ ]          | [ ] | [ ]          | [ ]          | [ ] Pass / [ ] Fail |
| Физический Android | Версия: | Chrome:         | [ ]          | [ ] | [ ]          | [ ]          | [ ] Pass / [ ] Fail |
| macOS              | Версия: | Safari + Chrome | N/A/optional | [ ] | N/A/optional | N/A/optional | [ ] Pass / [ ] Fail |
| Windows            | Версия: | Chrome + Edge   | N/A/optional | [ ] | N/A/optional | N/A/optional | [ ] Pass / [ ] Fail |

Записать точные модели устройств. Минимально нужен один актуальный и один поддерживаемый не-флагманский телефон; желательно повторить на старшем поддерживаемом OS/browser.

## End-to-end owner flow

- [ ] Новый пользователь создан только invitation flow, пароль не виден администратору.
- [ ] Email/password login успешен; неправильный пароль даёт безопасную ошибку.
- [ ] Project создан; double tap не создаёт дубликат.
- [ ] Group создан и связан с правильным project.
- [ ] AR item wizard создаёт item.
- [ ] JPEG/PNG/WebP marker загружен resumable flow; progress/cancel/retry работают.
- [ ] MOV/HEVC или другой поддерживаемый исходник преобразован и загружен как MP4 H.264/AAC; недекодируемый файл получает понятный отказ.
- [ ] Processing проходит analysis, inspection, compilation и poster ровно для текущей revision.
- [ ] Test-before-publish использует правильные marker/video.
- [ ] Publish создаёт стабильный public slug; QR не содержит UUID/PII/signed URL.
- [ ] QR SVG/PNG/print доступны; rotate немедленно закрывает старый URL.

## Печатный QR

Для каждого телефона проверить минимум 20, 30 и 40 мм при нормальном indoor lighting:

- [ ] White background/quiet zone не обрезаны.
- [ ] Стандартный preset сканируется встроенной camera.
- [ ] Brand preset сканируется встроенной camera.
- [ ] Наклон около 30° не ломает сканирование.
- [ ] Расстояние 20–80 см имеет рабочий диапазон.
- [ ] QR открывает ожидаемый HTTPS origin и `/ar/<36-hex-slug>`.
- [ ] Unpublished/suspended/deleted item не раскрывает manifest/assets.

Записать минимальный надёжный размер для printer/paper, а не принимать software readability score за физическую проверку.

## Camera и privacy

- [ ] До «Начать AR» browser camera indicator отсутствует.
- [ ] Intro содержит ссылку «Подробнее о камере и приватности».
- [ ] Первый tap вызывает системный permission prompt.
- [ ] Deny показывает понятное сообщение и обычное видео без повторного запроса.
- [ ] После разрешения camera preview видим под прозрачным overlay.
- [ ] Выход со страницы/закрытие tab выключает camera indicator.
- [ ] Возврат на страницу не включает camera без нового user action, если session завершена.
- [ ] Privacy/network inspection не показывает upload camera frames.

## Physical marker set

Проверить не менее 10 репрезентативных фотографий: portrait/landscape, светлая/тёмная, высоко-/низкоконтрастная, лица, группы, помещение/улица, glossy/matte print.

Для каждого marker записать score, print size, свет, расстояние, time-to-detect, повторное обнаружение и результат:

| Marker | Score | Печать | Свет | iPhone detect | Android detect | Overlay | Итог |
| ------ | ----: | ------ | ---- | ------------- | -------------- | ------- | ---- |
| 1      |       |        |      |               |                |         |      |
| 2      |       |        |      |               |                |         |      |
| 3      |       |        |      |               |                |         |      |
| 4      |       |        |      |               |                |         |      |
| 5      |       |        |      |               |                |         |      |
| 6      |       |        |      |               |                |         |      |
| 7      |       |        |      |               |                |         |      |
| 8      |       |        |      |               |                |         |      |
| 9      |       |        |      |               |                |         |      |
| 10     |       |        |      |               |                |         |      |

- [ ] Вся фотография распознаётся без другого target в кадре.
- [ ] Видео совпадает с границами/пропорциями фото и не перевёрнуто.
- [ ] Autoplay стартует muted; sound control работает после tap.
- [ ] Loop соответствует настройке.
- [ ] `pause_hide` скрывает plane и ставит видео на паузу.
- [ ] `continue_audio_hide` скрывает plane и продолжает audio/video clock.
- [ ] `stop_reset` скрывает, останавливает и начинает с нуля после возврата.
- [ ] Повторное обнаружение не создаёт двойной audio/renderer.

## Interruptions и orientation

- [ ] Portrait → landscape → portrait сохраняет корректную геометрию.
- [ ] Background/foreground ставит playback на паузу и корректно возобновляет.
- [ ] Входящий звонок/Control Center/camera interruption не оставляет чёрный зависший экран без fallback.
- [ ] Screen lock/unlock позволяет безопасно повторить AR.
- [ ] Reload/back/forward освобождают camera/render resources.
- [ ] Fullscreen, mute/unmute и manual play/pause имеют доступные touch targets.

## Network и expiry

- [ ] Slow/unstable network показывает progress/retry без duplicate asset.
- [ ] Offline до manifest даёт понятную ошибку/fallback, не stale private data.
- [ ] Потеря сети после старта не ломает cleanup камеры.
- [ ] Signed URL refresh происходит до 300-second expiry.
- [ ] Истёкший URL напрямую недоступен; новый manifest выдаёт новый URL.
- [ ] Rate limit возвращает controlled state, не stack/internal details.

## Commercial/admin boundaries

- [ ] Project/group/item/storage/team limits отклоняются сервером на границе.
- [ ] Trial/active/grace/expired/suspended состояния соответствуют утверждённой политике.
- [ ] Member без permission не может upload/publish/delete/analytics/admin.
- [ ] Account A не читает/меняет account B даже через изменённые request ids.
- [ ] Analytics появляется в правильных account/project/group/item aggregates.
- [ ] Admin без TOTP aal2 не видит operational data.
- [ ] Support read требует account/reason; dangerous mutation — reason + typed confirmation.
- [ ] Audit содержит actor/action/time/reason, но не password/token/signed URL.

## PWA и update

- [ ] Install prompt/standalone launch работает на поддерживаемом устройстве.
- [ ] Новый service worker показывает controlled update prompt.
- [ ] Обновление не применяется посреди активной несохранённой операции.
- [ ] Offline восстанавливает только shell; Supabase/media requests отсутствуют в Cache Storage.
- [ ] Logout/clear cache не оставляет private content.

## Наблюдаемость

- [ ] Искусственная route error показывает reference id.
- [ ] То же событие видно во внешнем sink/alert с commit/environment.
- [ ] Email, JWT, keys, UUID, query secrets и signed URLs redacted.
- [ ] Worker queue depth/oldest age/failure ratio/restarts видимы.
- [ ] Edge 4xx/5xx/rate-limit и database saturation имеют dashboards/thresholds.
- [ ] On-call получает тестовое уведомление и подтверждает runbook.

## Итог

- [ ] Все обязательные строки physical iPhone и Android — Pass.
- [ ] Ни одного открытого P0/P1 defect.
- [ ] Failures имеют issue, owner, severity, target date и retest evidence.
- [ ] Rollback rehearsal пройден для этого release line.
- [ ] Backup restore rehearsal укладывается в RPO/RTO.
- [ ] Security, operations, product и legal дали launch approval.

Решение: [ ] GO / [ ] NO-GO

Подписи/дата:
