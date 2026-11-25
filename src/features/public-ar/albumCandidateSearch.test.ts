import { describe, expect, it, vi } from "vitest";
import { createAlbumCandidateSearch, installAlbumCandidateSearch } from "./albumCandidateSearch";
function point(seed: number) {
  return { descriptors: Array.from({ length: 21 }, (_, i) => Math.imul(seed + i + 1, 2654435761) >>> 0) };
}
const data = Array.from({ length: 50 }, (_, i) => [
  { width: 512, maximaPoints: Array.from({ length: 64 }, (_, j) => point(i * 64 + j)), minimaPoints: [] },
]);
describe("album candidate scheduling", () => {
  it("puts a matching photograph ahead of other targets while bounding each exact search", () => {
    const search = createAlbumCandidateSearch(data);
    const result = search.select(
      data[49][0].maximaPoints,
      data.map((_, i) => i),
    );
    expect(result[0]).toBe(49);
    expect(result.length).toBeLessThanOrEqual(4);
  });
  it("covers all 50 photographs even when no descriptors vote", () => {
    const search = createAlbumCandidateSearch(data),
      seen = new Set<number>();
    for (let i = 0; i < 25; i++)
      search
        .select(
          [],
          data.map((_, index) => index),
        )
        .forEach((index) => seen.add(index));
    expect(seen.size).toBe(50);
  });
  it("never returns disallowed targets and preserves small legacy bundles", () => {
    const search = createAlbumCandidateSearch(data);
    expect(search.select([], [49])).toEqual([49]);
    for (const target of search.select(data[0][0].maximaPoints, [10, 11, 12, 13, 14, 15]))
      expect(target).toBeGreaterThanOrEqual(10);
  });
  it("bounds the pinned vendor worker and avoids warming 50 trackers", async () => {
    const match = vi.fn(async (...args: unknown[]) => {
        void args;
        return { targetIndex: -1 };
      }),
      warm = vi.fn((...args: unknown[]) => {
        void args;
      });
    const controller = {
      markerDimensions: data.map(() => [512, 512] as [number, number]),
      dummyRun: warm,
      _workerMatch: match,
    };
    installAlbumCandidateSearch(controller, { matchingDataList: data });
    await controller._workerMatch(
      data[49][0].maximaPoints,
      data.map((_, i) => i),
    );
    expect((match.mock.calls[0][1] as number[]).length).toBeLessThanOrEqual(4);
    controller.dummyRun(document.createElement("video"));
    expect(warm).not.toHaveBeenCalled();
  });
});
