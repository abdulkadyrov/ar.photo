import type { ArItem, ProcessingJob } from "../../entities/ar-item/model";

const rootJobTypes = new Set<ProcessingJob["type"]>(["marker_analysis", "video_inspection", "video_transcode"]);

const timestamp = (value: string | null | undefined) => {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
};

const revision = (job: ProcessingJob) => {
  if (typeof job.input_metadata !== "object" || !job.input_metadata || Array.isArray(job.input_metadata)) return 0;
  return Number(job.input_metadata.revision);
};

export type ProcessingTiming = {
  elapsedMs: number;
  finished: boolean;
  startedAt: number;
  finishedAt: number | null;
};

export function getProcessingTiming(item: ArItem, jobs: ProcessingJob[], now = Date.now()): ProcessingTiming | null {
  const relevantJobs = jobs.filter((job) => revision(job) === item.version);
  if (!relevantJobs.length) return null;

  const roots = relevantJobs.filter((job) => rootJobTypes.has(job.type));
  const startCandidates = (roots.length ? roots : relevantJobs)
    .map((job) => timestamp(job.started_at))
    .filter((value): value is number => value !== null)
    .sort((left, right) => left - right);

  let startedAt: number;
  if (startCandidates.length) {
    const newestRootStart = startCandidates[startCandidates.length - 1];
    const currentAttemptStarts = startCandidates.filter((value) => newestRootStart - value <= 60_000);
    startedAt = Math.min(...currentAttemptStarts);
  } else {
    const queueCandidates = (roots.length ? roots : relevantJobs)
      .flatMap((job) => [timestamp(job.updated_at), timestamp(job.created_at)])
      .filter((value): value is number => value !== null);
    if (!queueCandidates.length) return null;
    startedAt = Math.max(...queueCandidates);
  }

  const completedCandidates = relevantJobs
    .map((job) => timestamp(job.completed_at))
    .filter((value): value is number => value !== null);
  const publishedAt = timestamp(item.published_at);
  if (publishedAt !== null) completedCandidates.push(publishedAt);
  const finished = item.status === "ready" || item.status === "published" || item.status === "failed";
  const finishedAt = finished && completedCandidates.length ? Math.max(...completedCandidates) : null;

  return {
    elapsedMs: Math.max(0, (finishedAt ?? now) - startedAt),
    finished,
    startedAt,
    finishedAt,
  };
}

export function formatProcessingDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) return `${hours} ч ${String(minutes).padStart(2, "0")} мин`;
  if (minutes) return `${minutes} мин ${String(seconds).padStart(2, "0")} сек`;
  return `${seconds} сек`;
}

