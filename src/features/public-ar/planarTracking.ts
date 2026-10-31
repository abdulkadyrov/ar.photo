import type * as Three from "three";

export type Point2 = { x: number; y: number };
export type Quad = [Point2, Point2, Point2, Point2];
type Size = { width: number; height: number };
export const PLANAR_HOLD_MS = 120;
const UNIT_CORNERS: Quad = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];

// Normalized least squares with pivoting. Coordinates stay close to one, so
// portrait targets and high-resolution camera frames have the same conditioning.
export function fitHomography(source: Point2[], destination: Point2[]) {
  if (source.length < 4 || source.length !== destination.length) return null;
  const normal = Array.from({ length: 8 }, () => Array<number>(9).fill(0));
  source.forEach(({ x, y }, i) => {
    const { x: u, y: v } = destination[i];
    const rows = [
      [x, y, 1, 0, 0, 0, -u * x, -u * y, u],
      [0, 0, 0, x, y, 1, -v * x, -v * y, v],
    ];
    for (const row of rows) for (let a = 0; a < 8; a++) for (let b = 0; b < 9; b++) normal[a][b] += row[a] * row[b];
  });
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let row = col + 1; row < 8; row++) if (Math.abs(normal[row][col]) > Math.abs(normal[pivot][col])) pivot = row;
    if (Math.abs(normal[pivot][col]) < 1e-10) return null;
    [normal[col], normal[pivot]] = [normal[pivot], normal[col]];
    const divisor = normal[col][col];
    for (let j = col; j <= 8; j++) normal[col][j] /= divisor;
    for (let row = 0; row < 8; row++) {
      if (row === col) continue;
      const factor = normal[row][col];
      for (let j = col; j <= 8; j++) normal[row][j] -= factor * normal[col][j];
    }
  }
  const h = [...normal.map((row) => row[8]), 1];
  return h.every(Number.isFinite) ? h : null;
}

export function projectPoint(h: number[], { x, y }: Point2): Point2 {
  const w = h[6] * x + h[7] * y + 1;
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w };
}

function validQuad(quad: Quad) {
  if (quad.some((p) => !Number.isFinite(p.x + p.y) || Math.abs(p.x) > 5 || Math.abs(p.y) > 5)) return false;
  // The target cannot fold over itself or reverse its winding in a real camera.
  for (let i = 0; i < 4; i++) {
    const a = quad[i],
      b = quad[(i + 1) % 4],
      c = quad[(i + 2) % 4];
    if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) < 0.00005) return false;
  }
  return true;
}

export function estimatePlanarQuad(world: Point2[], screen: Point2[], marker: Size, input: Size): Quad | null {
  if (world.length < 8 || world.length !== screen.length) return null;
  const source = world.map((p) => ({ x: p.x / marker.width, y: p.y / marker.height }));
  const destination = screen.map((p) => ({ x: p.x / input.width, y: p.y / input.height }));
  if ([...source, ...destination].some((p) => !Number.isFinite(p.x + p.y))) return null;
  const threshold = 3; // camera pixels; no dependence on viewport or devicePixelRatio
  let best: number[] = [],
    bestError = Infinity;
  let seed = 0x12345678;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let trial = 0; trial < 64; trial++) {
    const indices = new Set<number>();
    while (indices.size < 4) indices.add(Math.floor(random() * source.length));
    const samples = [...indices];
    const h = fitHomography(
      samples.map((i) => source[i]),
      samples.map((i) => destination[i]),
    );
    if (!h) continue;
    const inliers: number[] = [];
    let error = 0;
    for (let i = 0; i < source.length; i++) {
      const p = projectPoint(h, source[i]);
      const distance = Math.hypot((p.x - destination[i].x) * input.width, (p.y - destination[i].y) * input.height);
      if (distance <= threshold) {
        inliers.push(i);
        error += distance ** 2;
      }
    }
    if (inliers.length > best.length || (inliers.length === best.length && error < bestError)) {
      best = inliers;
      bestError = error;
    }
    if (best.length === source.length) break;
  }
  if (best.length < 8 || best.length < source.length * 0.6) return null;
  const points = best.map((i) => source[i]);
  // A cluster on a face alone cannot reliably locate all four image corners.
  const spanX = Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
  const spanY = Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y));
  if (spanX < 0.45 || spanY < 0.45) return null;
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const xx = points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0) / points.length;
  const yy = points.reduce((sum, p) => sum + (p.y - meanY) ** 2, 0) / points.length;
  const xy = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0) / points.length;
  if (xx * yy - xy * xy < 0.00025) return null;
  const h = fitHomography(
    points,
    best.map((i) => destination[i]),
  );
  if (!h || UNIT_CORNERS.some((p) => h[6] * p.x + h[7] * p.y + 1 <= 0.05)) return null;
  const quad = UNIT_CORNERS.map((p) => projectPoint(h, p)) as Quad;
  return validQuad(quad) ? quad : null;
}

export function createCornerFilter() {
  let corners: Quad | null = null,
    acceptedAt = -Infinity;
  let candidate: Quad | null = null;
  const distance = (a: Quad, b: Quad) => Math.max(...a.map((p, i) => Math.hypot(p.x - b[i].x, p.y - b[i].y)));
  return {
    reset() {
      corners = null;
      candidate = null;
      acceptedAt = -Infinity;
    },
    fresh(now: number) {
      return now - acceptedAt <= PLANAR_HOLD_MS;
    },
    sample(next: Quad, now: number): Quad | null {
      if (!validQuad(next) || !Number.isFinite(now) || now <= acceptedAt) return null;
      if (!corners || now - acceptedAt > PLANAR_HOLD_MS) {
        corners = next.map((p) => ({ ...p })) as Quad;
      } else {
        const size = Math.max(0.02, Math.hypot(corners[0].x - corners[2].x, corners[0].y - corners[2].y));
        const delta = distance(corners, next) / size;
        const displacements = corners
          .map((p, i) => Math.hypot(p.x - next[i].x, p.y - next[i].y) / size)
          .sort((a, b) => a - b);
        const oneCornerSlipped = displacements[3] > 0.04 && displacements[3] > 3 * Math.max(displacements[1], 0.005);
        if ((delta > 0.18 || oneCornerSlipped) && (!candidate || distance(candidate, next) / size > 0.03)) {
          candidate = next;
          return null;
        }
        // One shared coefficient preserves the measured shape. Normal camera
        // motion follows immediately; only subpixel noise is damped strongly.
        const cutoff = delta > 0.008 ? 35 : 3;
        const alpha = 1 - Math.exp((-2 * Math.PI * cutoff * (now - acceptedAt)) / 1000);
        corners = corners.map((p, i) => ({
          x: p.x + alpha * (next[i].x - p.x),
          y: p.y + alpha * (next[i].y - p.y),
        })) as Quad;
      }
      candidate = null;
      acceptedAt = now;
      return corners;
    },
  };
}

// A projective matrix, not a decomposed 3D pose. Clip-space W carries the
// perspective, so UVs interpolate correctly across the entire photograph.
export function cornerProjectionMatrix(
  three: typeof Three,
  quad: Quad,
  markerAspect: number,
  input: Size,
  viewport: Size,
) {
  const h = fitHomography(UNIT_CORNERS, quad);
  if (!h) return null;
  const cover = Math.max(viewport.width / input.width, viewport.height / input.height);
  const sx = (input.width * cover) / viewport.width,
    sy = (input.height * cover) / viewport.height;
  const rowX = [2 * sx * h[0] - sx * h[6], 2 * sx * h[1] - sx * h[7], 2 * sx * h[2] - sx];
  const rowY = [sy * h[6] - 2 * sy * h[3], sy * h[7] - 2 * sy * h[4], sy - 2 * sy * h[5]];
  // Local x,y -> image u=x+.5,v=.5-y*aspect, then homogeneous camera pixels.
  const row = (r: number[]) => [r[0], -r[1] * markerAspect, 0, 0.5 * (r[0] + r[1]) + r[2]];
  return new three.Matrix4().set(
    ...([...row(rowX), ...row(rowY), 0, 0, 0, 0, ...row([h[6], h[7], 1])] as Parameters<Three.Matrix4["set"]>),
  );
}
