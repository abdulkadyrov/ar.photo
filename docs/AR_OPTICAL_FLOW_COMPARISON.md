# Hybrid postcard tracking — 2026-11-28

## Implementation

Postcard viewing uses natural-feature recognition for identity/acquisition and periodic correction. The original camera image is downscaled to at most 360×640 (orientation preserved), converted to grayscale, and processed once per decoded frame. No rendered overlay enters the tracker; no camera frames go to the server.

Sparse 3-level pyramidal Lucas–Kanade tracks up to 90 corner features. It checks conditioning, patch appearance, forward/backward error (≤1 working-image pixel), and robust planar geometry/spatial coverage. The previous plane transports those features; an agreeing reference corrects accumulated drift gradually (0.35 Hz). Flow requires reference verification within 500 ms and continuity within 150 ms; failure returns to reference recognition. Existing vendor acquisition and 120 ms presentation expiry remain intact.

The corner smoother keeps its coefficients. A bounded change supported by flow may bypass its narrow raw-feature discontinuity gate; impossible quads and jumps ≥0.35 target diagonals remain guarded. This fixes a measured 2-frame freeze during valid perspective motion. The bridge requires ≥16 forward/backward matches for this flag; those are pre-RANSAC matches, not a claim of 16 final inliers. The estimator separately enforces inliers and spatial coverage.

`startPublicMindAr` options can explicitly set `opticalFlow: false` for controlled comparisons. Ordinary album tracking keeps its original default; postcards enable flow. The modules remain inside the existing lazy AR entry.

## Identical-input comparison

Private diagnostic camera recording: 26.09 seconds, 783 native frames, 720×1280 display dimensions. Both variants use the same raw frames, nearest saved MindAR reference observations (≤25 ms), partial-observation rules, and production corner filter. The hybrid additionally receives camera grayscale. This isolates pose/filter behavior; it does not simulate vendor acquisition hysteresis or mobile scheduling.

Independent SIFT/RANSAC registration against the printed template provided an approximate reference on 714 frames, requiring at least 30 inliers and broad spatial support. 642 frames had valid reference and visible output in both variants. Errors concern the video window in camera pixels, not arbitrary screen pixels.

| Metric | Reference tracking | Hybrid |
| --- | ---: | ---: |
| Mean video-window error | 6.75 px | 2.98 px |
| p95 video-window error | 18.62 px | 4.48 px |
| p95 frame-to-frame change of residual error | 16.46 px | 2.06 px |
| Maximum residual step on shared frames | 45.69 px | 12.45 px |

The p95 residual-step measure improves ~87.5%; mean alignment improves ~55.9%. All evaluated time windows improve. These are this recording's measurements, **not a promise of 87.5% better iPhone performance**. The camera/reference timestamp association and SIFT registration have uncertainty. Missing or unreliable SIFT frames are not scored; visibility is reported separately.

After excluding startup through 2.2 s, missing-output frames decrease from 26 to 12 (about 867 to 400 ms at 30 fps). Startup improvement must not be claimed: this replay's initial reference gap is a warmup artifact. Strong blur/occlusion still causes losses. A held pose during the existing short grace period can be displaced during rapid motion.

A real browser replay also exercised the actual MindAR controller and production bridge, not only the isolated comparison. Its run-to-run timing differs, so event counts cannot serve as a controlled quality measurement. Physical iPhone validation remains required.

## Reproduction and artifacts

Run the local raw-camera page with `?flow=1` to enable the hybrid; omit it for the original bridge:

`http://127.0.0.1:4193/ar.photo/tools/ar-replay/?flow=1`

The synthetic lab supports the same flag. Its camera canvas is separate from the rendered video overlay.

`node scripts/compare-planar-flow.mjs DATASET_DIRECTORY OUTPUT_JSON`

Dataset contract:
- `dataset.json`: `{width,height,rows:[{time,reference,partial}]}`. Time is seconds; reference is four normalized corners or null. All frames have identical dimensions.
- `frames.gray`: contiguous row-major uint8 camera grayscale, one image per dataset row.
- Output includes baseline/hybrid normalized corners, flow source/match count, and desktop processing time. It intentionally does not treat desktop timing as iPhone capacity.

Private source media, feature logs, dataset, independent reference, reports, and reconstructed side-by-side video stay in ignored `artifacts/hybrid-flow/`. The comparison video projects the user's chosen montage through each calculated plane. It is an offline reconstruction, not a screen recording of the deployed app. Square comparison outlines intentionally reveal corner alignment; the viewer retains its rounded video geometry.

References: OpenCV optical flow tutorial https://docs.opencv.org/4.x/d4/dee/tutorial_optical_flow.html ; WOFT research https://arxiv.org/abs/2301.10057 . No WOFT code or model is included.
