import { createPyramid, trackOpticalFlow, type GrayFrame } from "./opticalFlow";
import { estimatePlanarObservation, fitHomography, projectPoint, type Point2, type Quad } from "./planarTracking";

const UNIT: Quad = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

// Sparse corners are spread over the entire printed target, never the video
// overlay. A cell contributes at most one well-conditioned image feature.
function detect(frame: GrayFrame, quad: Quad): Point2[] {
  const { width: w, height: h, data } = frame;
  const inverse = fitHomography(quad, UNIT);
  if (!inverse) return [];
  const candidates: { point: Point2; score: number }[] = [];
  for (let cy = 8; cy < h - 8; cy += 24)
    for (let cx = 8; cx < w - 8; cx += 24) {
      let best = 120,
        point: Point2 | null = null;
      for (let y = cy; y < Math.min(cy + 24, h - 8); y += 3)
        for (let x = cx; x < Math.min(cx + 24, w - 8); x += 3) {
          const p = projectPoint(inverse, { x: x / w, y: y / h });
          if (p.x < 0.035 || p.x > 0.965 || p.y < 0.035 || p.y > 0.965) continue;
          let xx = 0,
            yy = 0,
            xy = 0;
          for (let j = -2; j <= 2; j++)
            for (let i = -2; i <= 2; i++) {
              const k = (y + j) * w + x + i;
              const dx = (data[k + 1] - data[k - 1]) / 2,
                dy = (data[k + w] - data[k - w]) / 2;
              xx += dx * dx;
              yy += dy * dy;
              xy += dx * dy;
            }
          const score = (xx + yy - Math.sqrt((xx - yy) ** 2 + 4 * xy * xy)) / 50;
          if (score > best) {
            best = score;
            point = { x, y };
          }
        }
      if (point) candidates.push({ point, score: best });
    }
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 90)
    .map((c) => c.point);
}

/** Image-space flow with periodic natural-feature correction. Does not invent
 * a pose through long occlusion. The caller retains acquisition hysteresis. */
export function createHybridPlanarTracker(options: { correctionHz?: number; maxUnverifiedMs?: number } = {}) {
  let previous: ReturnType<typeof createPyramid> | null = null;
  let points: Point2[] = [],
    quad: Quad | null = null;
  let lastTime = -Infinity,
    verifiedAt = -Infinity;
  let lastResult: { corners: Quad; flowPoints: number; source: "reference" | "flow" } | null = null;
  return {
    reset() {
      previous = null;
      points = [];
      quad = null;
      lastTime = verifiedAt = -Infinity;
      lastResult = null;
    },
    sample(frame: GrayFrame, time: number, reference: Quad | null) {
      if (time <= lastTime) return lastResult;
      const dt = time - lastTime;
      const current = createPyramid(frame);
      let predicted: Quad | null = null,
        count = 0;
      if (previous && quad && dt <= 150 && points.length >= 8) {
        const inverse = fitHomography(quad, UNIT);
        if (inverse) {
          const tracks = trackOpticalFlow(previous, current, points);
          count = tracks.length;
          const source = tracks.map((t) =>
            projectPoint(inverse, { x: t.source.x / frame.width, y: t.source.y / frame.height }),
          );
          const dest = tracks.map((t) => t.destination);
          predicted = estimatePlanarObservation(source, dest, { width: 1, height: 1 }, frame, true)?.corners ?? null;
          points = dest;
        }
      }
      let source: "reference" | "flow" = "reference";
      if (predicted) {
        quad = predicted;
        source = "flow";
        if (reference) {
          const distance = Math.sqrt(
            reference.reduce(
              (s, p, i) =>
                s + ((p.x - predicted![i].x) * frame.width) ** 2 + ((p.y - predicted![i].y) * frame.height) ** 2,
              0,
            ) / 4,
          );
          // A disagreeing reference is not confirmation of the same plane.
          if (distance < 12) {
            const alpha = 1 - Math.exp((-2 * Math.PI * (options.correctionHz ?? 0.35) * Math.min(dt, 100)) / 1000);
            quad = predicted.map((p, i) => ({
              x: p.x + alpha * (reference[i].x - p.x),
              y: p.y + alpha * (reference[i].y - p.y),
            })) as Quad;
            verifiedAt = time;
          }
        }
        if (time - verifiedAt > (options.maxUnverifiedMs ?? 500)) {
          quad = reference;
          source = "reference";
          predicted = null;
        }
      } else quad = reference;
      if (quad && source === "reference") verifiedAt = time;
      if (quad) {
        // Refresh support in the newly located plane. Coordinates get rebased
        // through that plane on the next frame, preserving reference correction.
        if (!predicted || points.length < 45) points = detect(frame, quad);
      } else points = [];
      previous = current;
      lastTime = time;
      lastResult = quad ? { corners: quad, flowPoints: count, source } : null;
      return lastResult;
    },
  };
}
