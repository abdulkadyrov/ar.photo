# Local AR laboratory

Run the repository's Node 22 `npm run dev`, then open
`http://localhost:5173/ar.photo/tools/ar-lab/`. This dev-only HTML is not included
in the production application build and has no authentication or external API.

The source camera is a Three.js-rendered postcard. The actual pinned MindAR 1.2.5
production controller extracts image features, matches and tracks this canvas.
The production `installPlanarObservations` / `createPlanarAnchor` bridge estimates
and filters the overlay. The ground-truth transform is used only for guides and
metrics, never as recognition input. Video is drawn in a separate canvas and is
never fed back to the recognizer. Full marker contours are diagnostic; the diagnostic video mirrors the production rounded geometry and cover fit,
using the actual Milka preview window from the template catalog.

`window.__arLab` exposes `start()`, `stop()`, `ready()`, `setScenario(name)`,
`setParameters({pitch,yaw,roll,distance,offset,occlusion,noise,duplicate,defocus})`, `reset()`, `summary()`
and `samples()`. `cameraFrame()` returns source-only PNG for pixel verification. `samples()` includes raw/filtered corner coordinates, actual
feature pairs and capture-time ground truth. Coordinates are normalized; errors
are camera pixels at 640×480. Frame truth is attached to the same input tensor
consumed by MindAR, not the later render pose after worker completion.

The default target is `public/postcards/milka-gift-v1.webp`. `milka.mind` was
compiled with the repository's pinned OfflineCompiler. To rebuild, convert that
image to PNG without changing dimensions, then run
`node tools/ar-lab/compile-marker.mjs /absolute/path/to/milka.png`.

Measurements are not physical iPhone proof. Synthetic frames lack lens blur,
autofocus, sensor/exposure noise, rolling shutter, paper deformation and glare.
The optional seeded camera pixel noise is added to the source shader before recognition,
not to the reported corners. Source frames advance at no more than 30 Hz. Optional source defocus samples texture
neighbours at camera-pixel offsets. Duplicate mode places the same image beside
the primary, in the same plane, without assigning it a second recognition target.
Ground truth remains the primary image: selection of its identical neighbour is
intentionally measured as ambiguity, not silently re-labelled as success.
Software WebGL/headless runs can have substantially different cadence. Stabilizer
comparisons should replay the same captured raw sequence, not two independent
camera runs. Keep source files unchanged while benchmarking: Vite HMR resets the
laboratory. Use Stop when finished to suspend rendering and recognition.

## Repeatable handheld and faster-motion tests

`setScenario('hand')` applies deterministic multi-axis source movement: a slow
0.15–0.23 Hz drift plus small 7.4–11.1 Hz components (about tenths of a degree at
strength1), around a30° view. This is a plausible synthetic hand model, not a fit
to one user's hand. `setScenario('fast')` repeats a3.2s sequence of holds, quick
sweeps, reversals and return. Scene poses stay bounded; stress conditions can still
cause partial framing/loss and must not be called successful merely because the
filter refuses to update.

`motionStrength` ranges0–3 and `motionSpeed`0.25–4; defaults1. These apply to
hand/fast/pan/tilt/zoom. UI adjustments keep the selected scenario running. The
fast hand tremor is capped at12Hz even when speed is raised, below the30Hz
camera Nyquist limit. A separate source motion clock integrates speed changes so raising speed does not teleport
the postcard to a different phase. `reset()` does not restart this clock. Higher
speed is an explicitly labelled stress test, not60fps iPhone hardware emulation.
The same capture-time ground truth is exported for these trajectories.
