# AR Photo — AR tracking

## Назначение

AR Photo использует image tracking: заранее обработанная фотография становится маркером, а видео отображается плоскостью поверх найденного изображения. Runtime-провайдер — MindAR Image + Three.js. Тяжёлая компиляция `.mind` выполняется один раз processing worker'ом, а не в публичном браузере.

## Поток данных

1. Пользователь загружает фотографию и видео в формате, декодируемом его браузером.
2. Браузер определяет содержимое независимо от расширения, нормализует фотографию в JPEG/WebP, а видео — в MP4 H.264/AAC, и удаляет metadata изображения повторным кодированием.
3. `begin_ar_item_processing` создаёт новую immutable processing revision и четыре job: `marker_analysis`, `video_inspection`, `marker_compilation`, `thumbnail_generation`.
4. Worker claim-ит job с lease, получает source по подписанному URL на 120 секунд и работает во временной директории.
5. MindAR OfflineCompiler создаёт `.mind`; FFmpeg/ffprobe проверяют нормализованное видео; `cwebp` создаёт poster.
6. Generated-объекты сохраняются в `generated-private` по детерминированным versioned paths с SHA-256 и `upsert: false`.
7. Публикация разрешена только когда все job текущей revision успешны и authoritative marker/video/tracking/poster связаны с item.
8. Публичная Edge Function возвращает минимальный manifest с signed URLs на 300 секунд; viewer обновляет его за 45 секунд до истечения.

## Качество маркера

Worker вычисляет brightness, contrast, sharpness, feature density и entropy на уменьшенной до 512 px копии. Итоговый score ограничен 0–100; автоматический порог пригодности — 60. Для слабого маркера требуется явный quality override с причиной, который фиксируется сервером.

Хороший маркер:

- имеет много локальных деталей и контрастных границ;
- не является однотонным, пересвеченным или слишком тёмным;
- не содержит больших повторяющихся паттернов;
- снят/напечатан без бликов и сильного изгиба;
- целиком помещается в кадр при проверке.

Автоматический score — ранняя диагностика, а не замена физическому тесту на целевой печати и устройствах.

## Runtime state machine

| Состояние                | Условие                                             | Поведение                                                              |
| ------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------- |
| `intro`                  | manifest загружен                                   | Камера ещё не запрошена; доступны «Начать AR», fallback и privacy link |
| `starting`               | пользователь нажал «Начать AR»                      | Проверяются HTTPS, camera API и WebGL; lazy-load MindAR/Three          |
| `searching`              | камера запущена, target не найден                   | Показана рамка и инструкция держать фото целиком                       |
| `tracking`               | `onTargetFound`                                     | Plane становится видимым; autoplay запускает muted video               |
| `searching` после потери | `onTargetLost`                                      | Применяется выбранное `markerLost` behavior                            |
| `fallback`               | пользователь выбрал обычное видео или AR недоступен | `<video controls playsInline>` работает без камеры/tracking            |
| `error`                  | permission/device/WebGL/tracking failure            | Безопасное сообщение, retry и fallback                                 |

`markerLost` поддерживает:

- `pause_hide` — скрыть overlay и поставить видео на паузу;
- `continue_audio_hide` — скрыть plane, не останавливая playback;
- `stop_reset` — скрыть, остановить и вернуть `currentTime` к нулю.

## Геометрия и playback

- Один target на сессию: `maxTrack: 1`.
- Plane имеет ширину 1 и высоту `marker.height / marker.width`, центр совпадает с anchor target, а `z = 0` исключает угловой параллакс. После загрузки `.mind` его target dimensions имеют приоритет над manifest metadata, поэтому случайный drift размеров не искажает overlay.
- Видео не растягивается: UV координаты выполняют симметричный `cover` crop к пропорциям маркера; при одинаковом aspect UV остаётся 1:1.
- MindAR OneEuroFilter использует профиль `filterMinCF=0.001`, `filterBeta=100`, warmup/miss по 5 кадров: дрожание ниже default beta=1000, а краткая потеря не оставляет overlay надолго в устаревшей позе.
- Scan guide использует реальные пропорции маркера и исчезает после `targetFound`, поэтому неподвижная рамка не конкурирует с tracked plane.
- WebGL pixel ratio ограничен 2 для стабильного frame pacing на high-DPI телефонах; teardown освобождает controller worker, renderer и WebGL context.
- Камера остаётся под прозрачным WebGL canvas.
- Видео начинается muted; включение звука требует user gesture.
- `playsInline` предотвращает принудительный fullscreen на iOS.
- Resize/orientation вызывают `mindar.resize()`.
- При уходе страницы в background видео ставится на паузу; при возврате autoplay возобновляется только для видимого target.
- `stop()` снимает listeners, останавливает MindAR/camera/render loop, очищает video source и освобождает texture/geometry/material.

## Privacy и telemetry

Camera frames обрабатываются локально библиотекой tracking и не загружаются. Камера стартует только по кнопке. Viewer отправляет неблокирующие allowlisted события: open, camera start, marker detected, playback milestones, completion и техническую ошибку. Raw IP, полный User-Agent, frame, marker content и signed URL в analytics не сохраняются.

## Автоматизированное покрытие

- Unit: manifest schema/refresh, capability/error mapping, marker metrics, milestones и privacy-safe telemetry.
- Worker: job contract, deterministic generated paths, codec/ffprobe parsing, retry/idempotency и безопасные error codes.
- pgTAP: revision/job lifecycle, service-only claim/complete/fail, publication prerequisites и public manifest isolation.
- Playwright: camera не запрашивается до user gesture, fallback не запрашивает camera, resource-safe shell, accessibility и responsive/cross-browser smoke.
- `/viewer/test` сохраняет зафиксированный MindAR regression asset.

Автоматизированная эмуляция не подтверждает оптическое распознавание физической печати. Обязательная field matrix находится в `MANUAL_DEVICE_CHECKLIST.md`.

## Диагностика

1. Manifest не загружается: проверить publication state, 36-hex slug, CORS allowlist, rate limit и Edge logs.
2. Signed asset даёт 403: повторно получить manifest; проверить время устройства и private object path.
3. Camera не стартует: проверить HTTPS, permission, занятость камеры и WebGL.
4. Target не находится: проверить, что `.mind` относится к текущей marker revision, качество/свет/блики и всю фотографию в кадре.
5. Overlay смещён: сравнить authoritative marker width/height и aspect ratio manifest с фактически напечатанным crop.
6. Видео не играет: проверить H.264/AAC, muted autoplay, signed URL и browser console без записи самого URL.

## Известные границы

- Production field evidence на физическом iPhone и Android нельзя получить в CI.
- Матрица минимум из 10 реальных маркеров остаётся обязательной перед launch approval.
- Runtime зависит от `unsafe-eval` в CSP из-за текущего MindAR bundle; исключение ограничено `script-src 'self'` и должно пересматриваться при обновлении провайдера.
- Долгосрочная замена MindAR должна реализовать тот же `MarkerTrackingProvider` contract и пройти ту же device matrix.
