import { describe, expect, it } from "vitest";
import type { ArItem, ProcessingJob } from "../../entities/ar-item/model";
import { formatProcessingDuration, getProcessingTiming } from "./processingTiming";

const item = (overrides: Partial<ArItem> = {}) =>
  ({ version: 3, status: "published", published_at: "2026-08-09T12:01:18.000Z", ...overrides }) as ArItem;

const job = (overrides: Partial<ProcessingJob> = {}) =>
  ({
    type: "marker_analysis",
    input_metadata: { revision: 3 },
    created_at: "2026-08-09T12:00:00.000Z",
    updated_at: "2026-08-09T12:01:10.000Z",
    started_at: "2026-08-09T12:00:00.000Z",
    completed_at: "2026-08-09T12:01:10.000Z",
    ...overrides,
  }) as ProcessingJob;

describe("processing timing", () => {
  it("measures a normal run from concurrently started root jobs through publication", () => {
    const timing = getProcessingTiming(item(), [
      job(),
      job({ type: "video_inspection", started_at: "2026-08-09T12:00:10.000Z" }),
      job({ type: "marker_compilation", started_at: "2026-08-09T12:00:20.000Z" }),
    ]);
    expect(timing?.elapsedMs).toBe(78_000);
    expect(timing?.finished).toBe(true);
  });

  it("keeps measuring from the original click across a much later retry", () => {
    const timing = getProcessingTiming(
      item({ published_at: "2026-08-09T12:00:20.000Z" }),
      [
        job({
          type: "video_inspection",
          created_at: "2026-08-08T12:00:00.000Z",
          started_at: "2026-08-08T12:00:00.000Z",
          completed_at: "2026-08-08T12:00:10.000Z",
        }),
        job({
          type: "marker_analysis",
          created_at: "2026-08-08T12:00:00.000Z",
          started_at: "2026-08-09T12:00:00.000Z",
          completed_at: "2026-08-09T12:00:08.000Z",
        }),
        job({
          type: "marker_compilation",
          created_at: "2026-08-08T12:00:00.000Z",
          started_at: "2026-08-09T12:00:05.000Z",
          completed_at: "2026-08-09T12:00:15.000Z",
        }),
      ],
    );
    expect(timing?.elapsedMs).toBe(86_420_000);
  });

  it("starts while the job is still queued after the user click", () => {
    const timing = getProcessingTiming(
      item({ status: "processing", published_at: null }),
      [job({ started_at: null, completed_at: null })],
      Date.parse("2026-08-09T12:00:30.000Z"),
    );
    expect(timing?.elapsedMs).toBe(30_000);
    expect(timing?.finished).toBe(false);
  });

  it("formats compact Russian durations", () => {
    expect(formatProcessingDuration(18_900)).toBe("18 сек");
    expect(formatProcessingDuration(78_000)).toBe("1 мин 18 сек");
    expect(formatProcessingDuration(3_720_000)).toBe("1 ч 02 мин");
    expect(formatProcessingDuration(90_000_000)).toBe("1 д 01 ч");
  });
});
