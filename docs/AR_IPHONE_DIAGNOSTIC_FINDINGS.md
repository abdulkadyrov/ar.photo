# iPhone camera diagnostic findings (2026-11-28)

A submitted 26.09-second native camera archive was successfully read: 720×1280 display dimensions after MP4 orientation, raw H.264 video, recognition target and telemetry. Private recordings, target and sample arrays stay in ignored local artifacts, not Git.

## What the phone recorded

- Camera presented-frame counter advanced at approximately 30 fps. The diagnostic callback sampling rate is lower by design and must not be called camera FPS.
- Observation processing time median 11 ms, p95 14 ms, maximum 16 ms in sampled telemetry.
- No pause/waiting/stalled playback events. One seek back to 0 is consistent with looping, not proof of a network stall. These events alone cannot rule out every video decoder/render issue.
- Two sampled tracking-visibility losses around 6.8–7.1 s and 7.4–7.9 s. The raw recording includes glare, oblique views and some clipping of the postcard.
- Independent SIFT registration to the template is an approximate visual reference, not calibrated ground truth. Correcting an approximately 50 ms recording/log offset is essential before comparing geometry during motion.

## Concrete correction

MindAR can process more than one iteration of a decoded camera frame. `HTMLVideoElement.currentTime` advances on a playback clock and is insufficient for frame identity. The previous bridge consequently stamped repeated image iterations as new observations, allowing a filter to update multiple times per decoded frame.

`videoFrameClock` uses `requestVideoFrameCallback` + `presentedFrames` to stamp actual frames once. It deliberately does not use callback `mediaTime`: the live Safari capture reported 0 throughout, while `presentedFrames` advanced normally. Unsupported/canvas sources keep currentTime fallback. Callback registration is cancelled with the tracking lifetime.

Reference: https://wicg.github.io/video-rvfc/ . This change does not reduce vendor tracking work itself; it prevents duplicate measurements from advancing output filtering.

## Limits and rejected experiment

The local raw-camera replay uses the actual pinned MindAR Controller and production bridge, without feeding overlay pixels back into recognition. The computer has different throughput from iPhone. Two complete runs identify hundreds of duplicate-image iterations with the new clock; aggregate independent-reference alignment was modestly better, but some windows and visibility counts were worse. This is not proof that all physical-device jitter is fixed.

A smoother perspective-filter gain transition improved synthetic noise tests but had negligible benefit on this real capture. It was not shipped. Glare-related feature shortages and reacquisition remain unresolved.

The repeatable tool lives at `tools/ar-replay/`; load a diagnostic ZIP locally. No private media is uploaded by the tool. Replayed and recorded contours are explicitly labelled as tracker outputs, not ground truth. Record/log alignment remains adjustable.
