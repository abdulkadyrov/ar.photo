# Raw-camera replay laboratory

Dev-only page: `http://127.0.0.1:4193/ar.photo/tools/ar-replay/` while the existing Vite dev server is running. No production router or bundle entry is changed. Load the user-selected diagnostic ZIP; media stays local in browser memory.

Native recorded video (for this archive 720×1280 after MP4 rotation metadata) feeds the pinned MindAR Controller directly. The page uses production `installPlanarObservations` and `createPlanarAnchor`; the canvas draws contours only and never enters recognition. Green is the newly computed full-target contour; purple is the original phone's filtered matrix, converted out of the original viewer's CSS cover crop. Neither contour is ground truth.

Playback start/pause/restart are explicit. Pause stops the processing loop and destroys controller/anchor state after its current input finishes. Resume reacquires the target from the selected video time with a fresh performance clock. Original log alignment is approximate: the offset control sets `original elapsedMs = (video.currentTime + offset) * 1000`. Default +0.05 seconds is the parent analysis's best alignment for this recording; it is not universal. Playback speed other than1 changes effective filter cadence and is for inspection, not direct device performance comparison.

Automation API `window.__arReplay`:

- `ready()` / `loadArchive(File)`
- `start()` / `pause()` / `restart()`
- `summary()`
- `samples()`: up to10,000 rendered observations, sampled at most30Hz, includes videoTime, raw/filtered/recorded quads and observationVideoTime.
- `features()`: every actual tracker.track call, up to4000, including camera-video captureTime, performance/frame/observation times, capturePerformanceTime sampled immediately before loadInput, targetIndex, vendorTracking/anchorVisible, production estimate accepted/partial, raw corners, feature counts/spans, up to200 world/screen correspondences, and inputpose.

JSON export contains both series. Repeated decoded source frames may still be processed more than once by MindAR. The production bridge now assigns the same frameTime to them using requestVideoFrameCallback presentedFrames; filtering consumes a decoded frame once. Fallback sources without this API use currentTime. Preserve duplicate records when comparing timelines. Computer replay throughput is not iPhone throughput. Starting at0 also differs from the recorded phone, which had already acquired its target before recording began.

Checks: `npx tsc -p tools/ar-replay/tsconfig.json`; `npx eslint tools/ar-replay/main.ts --max-warnings=0`. Live camera ZIP smoke tested using actual MindAR on a local Chromium page. Private archive/media and result samples are not committed.
