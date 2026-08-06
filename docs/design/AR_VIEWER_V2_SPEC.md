# AR Viewer v2 — product and implementation specification

Visual direction: [`ar-viewer-v2-concept.png`](./ar-viewer-v2-concept.png).

## Goal

Make the public AR link feel like a small installed viewer: the project is paired once through its QR code, its assets are cached on the device, image tracking stays aligned while the camera moves, and the composed camera + AR result can be recorded.

## First-open flow

1. The public QR opens `/ar/:publicSlug`.
2. The page loads the signed manifest but does not expose technical asset names.
3. A single camera permission action opens the rear camera and the viewer asks: **«Наведите камеру на QR-код»**.
4. The scanner accepts only a QR URL whose public slug matches the open viewer. A different QR produces a short non-blocking warning.
5. After a match, the viewer downloads and stores four logical parts with a circular `1/4`…`4/4` indicator:
   - project metadata;
   - poster/marker image;
   - playback video;
   - compiled tracking dataset.
6. The QR camera stream is released and MindAR starts. The ready state says **«Наведите камеру на фото»**.

## Returning flow

- Cached data is stored in IndexedDB under the public slug and an asset fingerprint.
- If the current manifest fingerprint matches, repeat QR pairing is skipped.
- If a project is republished with different asset paths or marker geometry, the stale cache is replaced and QR pairing is requested again.
- Object URLs are created only for the active session and revoked during teardown.

## AR presentation

- Full-screen rear camera; no four-button toolbar and no large dashed frame.
- One compact top status pill.
- One bottom record button. Red state and timer indicate active recording.
- Video is rendered on the exact marker aspect ratio, without a Z offset.
- Target visibility still controls autoplay and marker-loss behavior.

## Tracking stability

- Raise MindAR One Euro filter responsiveness so lateral movement is applied continuously instead of trailing behind the camera.
- Keep strong smoothing for tiny pose changes.
- Add a render-side adaptive pose stabilizer:
  - small translation/rotation changes are damped;
  - medium motion follows quickly;
  - large pose changes snap to the latest estimate;
  - the filter resets on reacquisition so an old pose is never blended into a newly found pose.

## Recording

- Compose the live camera frame and transparent WebGL renderer into a clean recording canvas on every render frame.
- Record with `MediaRecorder`, preferring MP4 when supported and WebM otherwise.
- The record button starts/stops capture; after stopping, the viewer offers the native share sheet when file sharing is supported and a download fallback otherwise.
- If the browser cannot record a canvas stream, show a compact explanation and keep AR usable.

## Creation progress

- Replace technical labels such as `target.mind`, transcode, and asset filenames with four user-facing phases only.
- The visible status is the ordinal `1/4`, `2/4`, `3/4`, or `4/4`; internal byte/job progress remains available to accessibility text and logic but is not displayed as technical copy.

## Acceptance criteria

- First device: QR pair → four cache steps → AR camera.
- Same device and unchanged project: no second QR pairing.
- Wrong QR cannot switch the active public project.
- Moving from one side of a photo to the other updates the overlay continuously.
- Approaching the photo suppresses small scale/depth jitter without freezing genuine movement.
- The AR viewer contains only the status pill and record control.
- A completed recording yields a shareable/downloadable media file.
- Existing guest creation, QR publication, fallback/error handling, and analytics continue to work.
