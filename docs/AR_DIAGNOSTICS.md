# Real-device AR diagnostics

Entry: `/ar.photo/diagnostics` on the published site. Scan an existing published postcard QR or paste its URL. The read-only lookup routes to the existing viewer with `?diagnostics=1`; normal QR links and activation are unchanged.

Press **Начать диагностику**, reproduce the issue, then **Завершить запись**. The recording stops automatically at 45 seconds. Share or download `khanzama-ar-diagnostics.zip` and attach it to the support conversation. Keep Safari open until the file is ready.

Archive contains:
- `camera.mp4` or `camera.webm`: native camera video track without AR overlay or microphone;
- `target-N.mind`: the same downloaded recognition targets used by the viewer;
- `diagnostics.json`: raw normalized corners, observation/capture timestamps, rendered group and camera projection matrices, visible state, viewport/input size, camera frame timing, playback events and target viewport geometry.

All recording stays in memory on the device. No automatic upload or diagnostic storage endpoint exists. Export fields are allowlisted; signed asset URLs, tokens, card identifiers and device identifiers are not included. Physical items visible in the camera image (including a printed QR) are naturally part of the video. Refreshing or leaving the viewer discards the unsaved recording.

Limits: 45 seconds, 40 MiB raw video, 20 MiB recognition targets, 15 Hz/1000 sampled observations. Sharing falls back to a normal download link. Recorder stops safely on backgrounding or camera termination, without explicitly stopping the viewer's shared camera track.

Timestamps: sample elapsedMs is relative to recordingStart (performance.now); frameTime is the AR input timestamp on that same performance clock. Camera currentTime/mediaTime and initialCameraTime aid alignment. Native MediaRecorder encoding introduces an approximate offset; this is not frame-exact synchronization. Recording itself adds encoder load, so compare recording and non-recording behavior on device. This is diagnostic instrumentation, not a tracking algorithm change.

Verified locally: recorder produced a readable MP4/JSON/Mind ZIP in Chromium using a generated camera stream; camera track remained live after stop. Landing page tested at 319/390/1280 widths. Real iPhone capture/share remains a device validation step.
