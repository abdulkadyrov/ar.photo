// Compact, album-wide descriptor voting. Exact MindAR/RANSAC verification still
// decides identity; this index only schedules a bounded set of candidates.
export type FeaturePoint = { descriptors: number[] };
type Keyframe = { width: number; maximaPoints: FeaturePoint[]; minimaPoints: FeaturePoint[] };
const TABLES = 8,
  BUCKETS = 65536,
  WORDS = 2;

export function createAlbumCandidateSearch(data: Keyframe[][]) {
  if (data.length > 50) throw new Error("AR album exceeds 50 targets");
  const tables = Array.from({ length: TABLES }, () => new Uint32Array(BUCKETS * WORDS));
  const hash = (point: FeaturePoint, table: number) => {
    const descriptor = point.descriptors[(table * 2) % point.descriptors.length] ?? 0;
    return (descriptor >>> (table % 2 ? 16 : 0)) & 0xffff;
  };
  data.forEach((frames, target) => {
    const selected = new Set(
      [256, 512, 768].map((width) =>
        frames.reduce(
          (best, frame) => (Math.abs(frame.width - width) < Math.abs(best.width - width) ? frame : best),
          frames[0],
        ),
      ),
    );
    for (const frame of selected) {
      if (!frame) continue;
      for (const points of [frame.maximaPoints, frame.minimaPoints]) {
        const step = Math.max(1, Math.ceil(points.length / 128));
        for (let i = 0; i < points.length; i += step) {
          for (let table = 0; table < TABLES; table++) {
            tables[table][hash(points[i], table) * WORDS + (target >>> 5)] |= 1 << (target % 32);
          }
        }
      }
    }
  });
  let cursor = 0;
  return {
    select(points: FeaturePoint[], allowed: number[]) {
      if (allowed.length <= 4) return allowed;
      const scores = new Float32Array(data.length);
      const step = Math.max(1, Math.ceil(points.length / 400));
      for (let i = 0; i < points.length; i += step)
        for (let table = 0; table < TABLES; table++) {
          const offset = hash(points[i], table) * WORDS;
          const masks = [tables[table][offset], tables[table][offset + 1]];
          const population = masks.reduce((sum, mask) => {
            while (mask) {
              mask &= mask - 1;
              sum++;
            }
            return sum;
          }, 0);
          for (let word = 0; word < WORDS; word++) {
            let mask = masks[word];
            while (mask) {
              const bit = 31 - Math.clz32(mask & -mask);
              scores[word * 32 + bit] += 1 / population;
              mask = (mask & (mask - 1)) >>> 0;
            }
          }
        }
      const ranked = [...allowed].sort((a, b) => scores[b] - scores[a] || a - b);
      const selected = ranked.filter((index) => scores[index] > 0).slice(0, 2);
      // Always advance a full-coverage fallback, including low-texture or
      // perspective views whose descriptors do not vote reliably. No photo
      // becomes unreachable because the approximate index guessed wrong.
      let added = 0;
      for (let visited = 0; visited < allowed.length && added < 2; visited++) {
        const index = allowed[cursor++ % allowed.length];
        if (!selected.includes(index)) {
          selected.push(index);
          added++;
        }
      }
      return selected;
    },
  };
}

export function installAlbumCandidateSearch(
  controller: {
    markerDimensions?: [number, number][];
    dummyRun(input: HTMLVideoElement): unknown;
    _workerMatch?: (points: FeaturePoint[], indices: number[]) => Promise<unknown>;
  },
  result: unknown,
) {
  if ((controller.markerDimensions?.length ?? 0) <= 4) return;
  if (
    !result ||
    typeof result !== "object" ||
    !("matchingDataList" in result) ||
    !Array.isArray(result.matchingDataList) ||
    !controller._workerMatch
  )
    throw new Error("MindAR album search contract unavailable");
  const search = createAlbumCandidateSearch(result.matchingDataList as Keyframe[][]);
  const match = controller._workerMatch.bind(controller);
  controller._workerMatch = (points, allowed) => match(points, search.select(points, allowed));
  // Vendor warmup would run all 50 trackers before showing the camera. Shader
  // kernels warm naturally on the first acquired photograph instead.
  controller.dummyRun = () => undefined;
}
