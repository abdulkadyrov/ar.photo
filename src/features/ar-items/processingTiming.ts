import type { ArItem, ProcessingJob } from "../../entities/ar-item/model";

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

  // prepare_ar_item_processing creates these jobs in the same transaction that
  // handles the user's "Оживить" click. Keep this original timestamp across
  // queueing, failures, and retries so the displayed duration is the complete
  // user wait until the QR is published.
  const startCandidates = relevantJobs
    .map((job) => timestamp(job.created_at))
    .filter((value): value is number => value !== null);
  if (!startCandidates.length) return null;
  const startedAt = Math.min(...startCandidates);

  const completedCandidates = relevantJobs
    .map((job) => timestamp(job.completed_at))
    .filter((value): value is number => value !== null);
  const publishedAt = timestamp(item.published_at);
  const finished = item.status === "ready" || item.status === "published" || item.status === "failed";
  const finishedAt =
    item.status === "published" && publishedAt !== null
      ? publishedAt
      : finished && completedCandidates.length
        ? Math.max(...completedCandidates)
        : null;

  return {
    elapsedMs: Math.max(0, (finishedAt ?? now) - startedAt),
    finished,
    startedAt,
    finishedAt,
  };
}

export function formatProcessingDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days) return `${days} д ${String(hours % 24).padStart(2, "0")} ч`;
  if (hours) return `${hours} ч ${String(minutes).padStart(2, "0")} мин`;
  if (minutes) return `${minutes} мин ${String(seconds).padStart(2, "0")} сек`;
  return `${seconds} сек`;
}
