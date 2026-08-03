import type { Json, Tables } from "../../src/shared/api/database.types.js";

export type ProcessingJob = Tables<"processing_jobs">;
export type SupportedProcessingJob =
  "marker_analysis" | "video_inspection" | "marker_compilation" | "thumbnail_generation";

export type ProcessingInput = {
  revision: number;
  assetId: string;
  bucket: string;
  path: string;
};

export type VideoInspection = {
  width: number;
  height: number;
  durationSeconds: number;
  videoCodec: "h264";
  audioCodec: "aac" | "none";
};

export class WorkerFault extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "WorkerFault";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireString = (value: unknown, code: string) => {
  if (typeof value !== "string" || value.length === 0) throw new WorkerFault(code);
  return value;
};

export function parseProcessingInput(value: Json): ProcessingInput {
  if (!isRecord(value)) throw new WorkerFault("invalid_job_input");

  const revision = Number(value.revision);
  if (!Number.isInteger(revision) || revision < 1) throw new WorkerFault("invalid_job_revision");

  return {
    revision,
    assetId: requireString(value.assetId, "invalid_job_asset"),
    bucket: requireString(value.bucket, "invalid_job_bucket"),
    path: requireString(value.path, "invalid_job_path"),
  };
}

export function assertSupportedJob(type: ProcessingJob["type"]): asserts type is SupportedProcessingJob {
  if (
    type !== "marker_analysis" &&
    type !== "video_inspection" &&
    type !== "marker_compilation" &&
    type !== "thumbnail_generation"
  ) {
    throw new WorkerFault("unsupported_job_type");
  }
}

export function buildGeneratedObjectPath(job: ProcessingJob, input: ProcessingInput) {
  assertSupportedJob(job.type);
  if (job.type !== "marker_compilation" && job.type !== "thumbnail_generation") {
    throw new WorkerFault("job_has_no_generated_object");
  }

  const escapedAccountId = job.account_id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const scope = new RegExp(`^accounts/${escapedAccountId}/projects/([^/]+)/groups/([^/]+)/(?:items/[^/]+/)?`).exec(
    input.path,
  );
  if (!scope) throw new WorkerFault("invalid_source_scope");

  const suffix = job.type === "marker_compilation" ? "tracking/target.mind" : "thumbnail/video.webp";
  return `accounts/${job.account_id}/projects/${scope[1]}/groups/${scope[2]}/items/${job.ar_item_id}/v${input.revision}/${suffix}`;
}

export function parseFfprobeOutput(raw: string): VideoInspection {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new WorkerFault("invalid_video_metadata");
  }
  if (!isRecord(payload) || !Array.isArray(payload.streams) || !isRecord(payload.format)) {
    throw new WorkerFault("invalid_video_metadata");
  }

  const streams = payload.streams.filter(isRecord);
  const video = streams.find((stream) => stream.codec_type === "video");
  const audio = streams.find((stream) => stream.codec_type === "audio");
  if (!video) throw new WorkerFault("video_stream_missing");
  if (video.codec_name !== "h264") throw new WorkerFault("unsupported_video_codec");
  if (audio && audio.codec_name !== "aac") throw new WorkerFault("unsupported_audio_codec");

  const width = Number(video.width);
  const height = Number(video.height);
  const durationSeconds = Number(payload.format.duration);
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    throw new WorkerFault("invalid_video_metadata");
  }

  return {
    width,
    height,
    durationSeconds: Math.round(durationSeconds * 1000) / 1000,
    videoCodec: "h264",
    audioCodec: audio ? "aac" : "none",
  };
}

export function safeWorkerErrorCode(error: unknown) {
  return error instanceof WorkerFault ? error.code : "processing_failed";
}
