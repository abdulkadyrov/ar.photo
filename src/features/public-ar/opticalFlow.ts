import type { Point2 } from "./planarTracking";

/** Grayscale samples in the camera intensity range 0..255. */
export type GrayFrame = { width: number; height: number; data: Float32Array };
export type FlowMatch = { source: Point2; destination: Point2; error: number };

/** Small Gaussian pyramid. Level zero borrows the immutable source buffer. */
export function createPyramid(frame: GrayFrame, levels = 3): GrayFrame[] {
  if (frame.width < 2 || frame.height < 2 || frame.data.length !== frame.width * frame.height) return [];
  const pyramid = [frame];
  for (let level = 1; level < Math.min(5, levels); level++) {
    const previous = pyramid[level - 1];
    const { width: w, height: h, data: source } = previous;
    const width = Math.floor(w / 2),
      height = Math.floor(h / 2);
    if (Math.min(width, height) < 12) break;
    const horizontal = new Float32Array(width * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < width; x++) {
        const sx = x * 2,
          row = y * w;
        horizontal[y * width + x] =
          (source[row + Math.max(0, sx - 2)] +
            4 * source[row + Math.max(0, sx - 1)] +
            6 * source[row + sx] +
            4 * source[row + Math.min(w - 1, sx + 1)] +
            source[row + Math.min(w - 1, sx + 2)]) /
          16;
      }
    }
    const data = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      const sy = y * 2;
      for (let x = 0; x < width; x++) {
        data[y * width + x] =
          (horizontal[Math.max(0, sy - 2) * width + x] +
            4 * horizontal[Math.max(0, sy - 1) * width + x] +
            6 * horizontal[sy * width + x] +
            4 * horizontal[Math.min(h - 1, sy + 1) * width + x] +
            horizontal[Math.min(h - 1, sy + 2) * width + x]) /
          16;
      }
    }
    pyramid.push({ width, height, data });
  }
  return pyramid;
}

function pixel(frame: GrayFrame, x: number, y: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    dx = x - ix,
    dy = y - iy;
  const i = iy * frame.width + ix,
    data = frame.data;
  return (
    (data[i] * (1 - dx) + data[i + 1] * dx) * (1 - dy) +
    (data[i + frame.width] * (1 - dx) + data[i + frame.width + 1] * dx) * dy
  );
}

const RADIUS = 4;
const COUNT = (RADIUS * 2 + 1) ** 2;
function inside(frame: GrayFrame, x: number, y: number) {
  const margin = RADIUS + 2;
  return x >= margin && y >= margin && x < frame.width - margin && y < frame.height - margin;
}

function trackOne(previous: GrayFrame[], current: GrayFrame[], point: Point2): Point2 | null {
  let dx = 0,
    dy = 0;
  const values = new Float32Array(COUNT),
    gx = new Float32Array(COUNT),
    gy = new Float32Array(COUNT);
  for (let level = previous.length - 1; level >= 0; level--) {
    if (level < previous.length - 1) {
      dx *= 2;
      dy *= 2;
    }
    const a = previous[level],
      b = current[level],
      scale = 2 ** level;
    const x = point.x / scale,
      y = point.y / scale;
    if (!inside(a, x, y) || !inside(b, x + dx, y + dy)) {
      if (level === 0) return null;
      continue;
    }
    let xx = 0,
      xy = 0,
      yy = 0,
      sumX = 0,
      sumY = 0,
      index = 0;
    for (let v = -RADIUS; v <= RADIUS; v++)
      for (let u = -RADIUS; u <= RADIUS; u++) {
        const px = x + u,
          py = y + v;
        values[index] = pixel(a, px, py);
        gx[index] = (pixel(a, px + 1, py) - pixel(a, px - 1, py)) / 2;
        gy[index] = (pixel(a, px, py + 1) - pixel(a, px, py - 1)) / 2;
        xx += gx[index] ** 2;
        xy += gx[index] * gy[index];
        yy += gy[index] ** 2;
        sumX += gx[index];
        sumY += gy[index];
        index++;
      }
    // Remove brightness-offset direction from the normal equations as well as
    // the residual. A plain edge or a flat patch cannot constrain 2D motion.
    xx -= (sumX * sumX) / COUNT;
    xy -= (sumX * sumY) / COUNT;
    yy -= (sumY * sumY) / COUNT;
    const eigenvalue = (xx + yy - Math.hypot(xx - yy, 2 * xy)) / (2 * COUNT);
    const determinant = xx * yy - xy * xy;
    if (eigenvalue < 3 || determinant <= 0) {
      if (level === 0) return null;
      continue;
    }
    let residual = Infinity;
    for (let iteration = 0; iteration < 15; iteration++) {
      if (!inside(b, x + dx, y + dy)) return null;
      let bx = 0,
        by = 0,
        differenceSum = 0,
        squareSum = 0;
      index = 0;
      for (let v = -RADIUS; v <= RADIUS; v++)
        for (let u = -RADIUS; u <= RADIUS; u++) {
          const difference = values[index] - pixel(b, x + u + dx, y + v + dy);
          bx += gx[index] * difference;
          by += gy[index] * difference;
          differenceSum += difference;
          squareSum += difference * difference;
          index++;
        }
      bx -= (sumX * differenceSum) / COUNT;
      by -= (sumY * differenceSum) / COUNT;
      residual = Math.sqrt(Math.max(0, squareSum / COUNT - (differenceSum / COUNT) ** 2));
      const stepX = (yy * bx - xy * by) / determinant,
        stepY = (xx * by - xy * bx) / determinant;
      if (!Number.isFinite(stepX + stepY) || Math.hypot(stepX, stepY) > 5) return null;
      dx += stepX;
      dy += stepY;
      if (stepX * stepX + stepY * stepY < 0.0004) break;
    }
    if (level === 0 && residual > 25) return null;
  }
  const destination = { x: point.x + dx, y: point.y + dy };
  return inside(current[0], destination.x, destination.y) ? destination : null;
}

/**
 * Pyramidal Lucas–Kanade, source-gradient translation solve, 9x9 patches.
 * Bidirectional checking removes occlusions/ambiguous patches; it is not an
 * absolute confidence bound. Robust geometric fitting must follow this step.
 */
export function trackOpticalFlow(previous: GrayFrame[], current: GrayFrame[], points: Point2[]): FlowMatch[] {
  if (
    !previous.length ||
    previous.length !== current.length ||
    previous.some((a, i) => a.width !== current[i].width || a.height !== current[i].height)
  )
    return [];
  const matches: FlowMatch[] = [];
  for (const source of points) {
    if (!Number.isFinite(source.x + source.y)) continue;
    const destination = trackOne(previous, current, source);
    if (!destination) continue;
    const reverse = trackOne(current, previous, destination);
    if (!reverse) continue;
    const error = Math.hypot(reverse.x - source.x, reverse.y - source.y);
    if (error <= 1) matches.push({ source, destination, error });
  }
  return matches;
}
