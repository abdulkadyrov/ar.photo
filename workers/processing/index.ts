import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/shared/api/database.types.js";
import type { ProcessingJob } from "./jobContract.js";
import { processClaimedJob } from "./processor.js";

type WorkerConfig = {
  supabaseUrl: string;
  serviceRoleKey: string;
  workerId: string;
  concurrency: number;
  pollIntervalMs: number;
  runOnce: boolean;
};

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required worker setting: ${name}`);
  return value;
};

const boundedInteger = (name: string, fallback: number, minimum: number, maximum: number) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`Invalid worker setting: ${name}`);
  }
  return value;
};

export function getWorkerConfig(): WorkerConfig {
  const supabaseUrl = required("SUPABASE_URL");
  const parsedUrl = new URL(supabaseUrl);
  if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "127.0.0.1" && parsedUrl.hostname !== "localhost") {
    throw new Error("SUPABASE_URL must use HTTPS outside local development");
  }

  return {
    supabaseUrl,
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    workerId: required("PROCESSING_WORKER_ID"),
    concurrency: boundedInteger("PROCESSING_CONCURRENCY", 1, 1, 4),
    pollIntervalMs: boundedInteger("PROCESSING_POLL_INTERVAL_MS", 2000, 250, 60_000),
    runOnce: process.env.PROCESSING_RUN_ONCE === "1",
  };
}

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const logEvent = (event: string, details: Record<string, string | number | boolean> = {}) => {
  process.stdout.write(`${JSON.stringify({ event, ...details })}\n`);
};

export async function runProcessingWorker(config = getWorkerConfig()) {
  const client = createClient<Database>(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  let stopping = false;
  const stop = () => {
    stopping = true;
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  logEvent("worker_started", { concurrency: config.concurrency });

  while (!stopping) {
    const claim = await client.rpc("claim_processing_jobs", {
      p_worker_id: config.workerId,
      p_limit: config.concurrency,
    });

    if (claim.error) {
      logEvent("claim_failed");
      if (config.runOnce) break;
      await delay(config.pollIntervalMs);
      continue;
    }

    const jobs = (claim.data ?? []) as ProcessingJob[];
    if (jobs.length === 0) {
      if (config.runOnce) break;
      await delay(config.pollIntervalMs);
      continue;
    }

    const results = await Promise.all(jobs.map((job) => processClaimedJob(client, job, config.workerId)));
    results.forEach((result, index) => {
      logEvent("job_finished", {
        jobId: jobs[index].id,
        jobType: jobs[index].type,
        succeeded: result.status === "succeeded",
        code: result.code,
      });
    });
    if (config.runOnce) break;
  }

  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
  logEvent("worker_stopped");
}

const isEntrypoint = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isEntrypoint) {
  runProcessingWorker().catch(() => {
    logEvent("worker_fatal");
    process.exitCode = 1;
  });
}
