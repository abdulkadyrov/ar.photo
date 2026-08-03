import { describe, expect, it } from "vitest";
import type { ProcessingJob } from "./jobContract.js";
import {
  WorkerFault,
  buildGeneratedObjectPath,
  parseFfprobeOutput,
  parseProcessingInput,
  safeWorkerErrorCode,
} from "./jobContract.js";

const job = (type: ProcessingJob["type"]): ProcessingJob => ({
  id: 17,
  account_id: "20000000-0000-4000-8000-000000000001",
  ar_item_id: "70000000-0000-4000-8000-000000000001",
  attempt_count: 1,
  completed_at: null,
  created_at: "2026-08-03T00:00:00Z",
  dedupe_key: "item:v3:job",
  error_code: null,
  error_message: null,
  input_metadata: {},
  locked_at: "2026-08-03T00:00:00Z",
  locked_by: "worker-1",
  max_attempts: 3,
  output_metadata: {},
  progress: 0,
  started_at: "2026-08-03T00:00:00Z",
  status: "running",
  type,
  updated_at: "2026-08-03T00:00:00Z",
});

const input = parseProcessingInput({
  revision: 3,
  assetId: "83000000-0000-4000-8000-000000000001",
  bucket: "media-private",
  path: "accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/assets/source.jpg",
});

describe("processing worker contracts", () => {
  it("builds the only accepted tracking object path", () => {
    expect(buildGeneratedObjectPath(job("marker_compilation"), input)).toBe(
      "accounts/20000000-0000-4000-8000-000000000001/projects/50000000-0000-4000-8000-000000000001/groups/60000000-0000-4000-8000-000000000001/items/70000000-0000-4000-8000-000000000001/v3/tracking/target.mind",
    );
  });

  it("builds the only accepted thumbnail object path", () => {
    expect(buildGeneratedObjectPath(job("thumbnail_generation"), input)).toMatch(/\/v3\/thumbnail\/video\.webp$/);
  });

  it("rejects source paths outside the job account", () => {
    const forged = { ...input, path: input.path.replace("20000000", "90000000") };
    expect(() => buildGeneratedObjectPath(job("marker_compilation"), forged)).toThrow("invalid_source_scope");
  });

  it("rejects generated paths for jobs without output objects", () => {
    expect(() => buildGeneratedObjectPath(job("marker_analysis"), input)).toThrow("job_has_no_generated_object");
  });

  it("validates claimed job metadata", () => {
    expect(() => parseProcessingInput({ revision: 0, assetId: "x", bucket: "x", path: "x" })).toThrow(
      "invalid_job_revision",
    );
    expect(() => parseProcessingInput([])).toThrow("invalid_job_input");
  });

  it("parses authoritative H.264 and AAC probe output", () => {
    expect(
      parseFfprobeOutput(
        JSON.stringify({
          streams: [
            { codec_type: "video", codec_name: "h264", width: 1920, height: 1080 },
            { codec_type: "audio", codec_name: "aac" },
          ],
          format: { duration: "9.8764" },
        }),
      ),
    ).toEqual({
      width: 1920,
      height: 1080,
      durationSeconds: 9.876,
      videoCodec: "h264",
      audioCodec: "aac",
    });
  });

  it("accepts silent H.264 video", () => {
    expect(
      parseFfprobeOutput(
        JSON.stringify({
          streams: [{ codec_type: "video", codec_name: "h264", width: 720, height: 1280 }],
          format: { duration: 2 },
        }),
      ).audioCodec,
    ).toBe("none");
  });

  it.each([
    ["hevc", "unsupported_video_codec"],
    ["vp9", "unsupported_video_codec"],
  ])("rejects the %s video codec", (codec, expectedCode) => {
    expect(() =>
      parseFfprobeOutput(
        JSON.stringify({
          streams: [{ codec_type: "video", codec_name: codec, width: 1280, height: 720 }],
          format: { duration: 4 },
        }),
      ),
    ).toThrow(expectedCode);
  });

  it("redacts unknown failures to a stable code", () => {
    expect(safeWorkerErrorCode(new Error("private path and stack"))).toBe("processing_failed");
    expect(safeWorkerErrorCode(new WorkerFault("ffmpeg_timeout"))).toBe("ffmpeg_timeout");
  });
});
