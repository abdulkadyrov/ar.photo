import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createCanvas, loadImage } from "canvas";
import { OfflineCompiler } from "mind-ar/src/image-target/offline-compiler.js";
import { analyzeMarkerPixels } from "../../src/features/ar-items/markerQuality.js";
import type { Database, Json } from "../../src/shared/api/database.types.js";
import {
  WorkerFault,
  assertSupportedJob,
  buildGeneratedObjectPath,
  fitTrackingImageDimensions,
  parseFfprobeOutput,
  parseProcessingInput,
  safeWorkerErrorCode,
  type ProcessingInput,
  type ProcessingJob,
} from "./jobContract.js";

type WorkerClient = SupabaseClient<Database>;

const command = (executable: string, args: string[], timeout: number) =>
  new Promise<string>((resolve, reject) => {
    execFile(executable, args, { encoding: "utf8", maxBuffer: 1024 * 1024, timeout }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });

const sha256 = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");

async function reportProgress(client: WorkerClient, job: ProcessingJob, workerId: string, progress: number) {
  const { error } = await client.rpc("report_processing_progress", {
    p_job_id: job.id,
    p_worker_id: workerId,
    p_progress: progress,
  });
  return error === null;
}

async function downloadSource(client: WorkerClient, input: ProcessingInput, destination: string) {
  const { data, error } = await client.storage.from(input.bucket).createSignedUrl(input.path, 120, {
    download: basename(input.path),
  });
  if (error || !data) throw new WorkerFault("source_download_unavailable");

  let response: Response;
  try {
    response = await fetch(data.signedUrl, { signal: AbortSignal.timeout(5 * 60 * 1000) });
  } catch {
    throw new WorkerFault("source_download_timeout");
  }
  if (!response.ok || !response.body) throw new WorkerFault("source_download_failed");

  await pipeline(Readable.fromWeb(response.body as never), createWriteStream(destination, { flags: "wx" }));
}

async function inspectMarker(sourcePath: string) {
  const image = await loadImage(sourcePath);
  const scale = Math.min(1, 512 / Math.max(image.width, image.height));
  const width = Math.max(2, Math.round(image.width * scale));
  const height = Math.max(2, Math.round(image.height * scale));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  return analyzeMarkerPixels(context.getImageData(0, 0, width, height).data, width, height);
}

async function inspectVideo(sourcePath: string) {
  let output: string;
  try {
    output = await command(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration:stream=codec_type,codec_name,width,height",
        "-of",
        "json",
        sourcePath,
      ],
      2 * 60 * 1000,
    );
  } catch {
    throw new WorkerFault("ffprobe_failed");
  }
  return parseFfprobeOutput(output);
}

async function compileMarker(sourcePath: string, outputPath: string) {
  const image = await loadImage(sourcePath);
  const dimensions = fitTrackingImageDimensions(image.width, image.height);
  const normalized = createCanvas(dimensions.width, dimensions.height);
  const context = normalized.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.patternQuality = "best";
  context.quality = "best";
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  const compiler = new OfflineCompiler();
  try {
    await compiler.compileImageTargets([normalized], () => undefined);
    const bytes = Buffer.from(compiler.exportData());
    const verifier = new OfflineCompiler();
    const [compiled] = verifier.importData(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (
      !compiled ||
      compiled.targetImage?.width !== dimensions.width ||
      compiled.targetImage?.height !== dimensions.height ||
      !Array.isArray(compiled.matchingData) ||
      compiled.matchingData.length === 0 ||
      !Array.isArray(compiled.trackingData) ||
      compiled.trackingData.length === 0
    ) {
      throw new Error("Invalid compiled target");
    }
    const matchingFeatureCount = compiled.matchingData.reduce(
      (total: number, level: { maximaPoints?: unknown[]; minimaPoints?: unknown[] }) =>
        total + (level.maximaPoints?.length ?? 0) + (level.minimaPoints?.length ?? 0),
      0,
    );
    const trackingFeatureCount = compiled.trackingData.reduce(
      (total: number, level: { points?: unknown[] }) => total + (level.points?.length ?? 0),
      0,
    );
    if (matchingFeatureCount < 100 || trackingFeatureCount < 8) throw new Error("Insufficient target features");
    await writeFile(outputPath, bytes, { flag: "wx" });
    return {
      width: dimensions.width,
      height: dimensions.height,
      byteSize: bytes.byteLength,
      matchingFeatureCount,
      trackingFeatureCount,
    };
  } catch {
    throw new WorkerFault("marker_compilation_failed");
  }
}

async function generateThumbnail(sourcePath: string, outputPath: string) {
  const framePath = `${outputPath}.png`;
  try {
    await command(
      "ffmpeg",
      [
        "-v",
        "error",
        "-y",
        "-i",
        sourcePath,
        "-vf",
        "thumbnail,scale='min(720,iw)':-2",
        "-frames:v",
        "1",
        "-c:v",
        "png",
        framePath,
      ],
      10 * 60 * 1000,
    );
    await command("cwebp", ["-quiet", "-q", "82", framePath, "-o", outputPath], 2 * 60 * 1000);
  } catch {
    throw new WorkerFault("thumbnail_generation_failed");
  }
}

async function transcodeVideo(sourcePath: string, outputPath: string) {
  try {
    await command(
      "ffmpeg",
      [
        "-v",
        "error",
        "-y",
        "-i",
        sourcePath,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-vf",
        "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "22",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        "-max_muxing_queue_size",
        "2048",
        outputPath,
      ],
      20 * 60 * 1000,
    );
  } catch {
    throw new WorkerFault("video_transcode_failed");
  }
}

async function uploadGeneratedObject(
  client: WorkerClient,
  path: string,
  localPath: string,
  contentType: "application/octet-stream" | "image/webp" | "video/mp4",
) {
  const bytes = await readFile(localPath);
  const digest = sha256(bytes);
  const bucket = client.storage.from("generated-private");
  const { error } = await bucket.upload(path, bytes, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });

  if (!error) return digest;

  const existing = await bucket.download(path);
  if (existing.error || !existing.data) throw new WorkerFault("generated_upload_failed");
  const existingDigest = sha256(new Uint8Array(await existing.data.arrayBuffer()));
  if (existingDigest !== digest) throw new WorkerFault("generated_object_conflict");
  return digest;
}

async function executeJob(
  client: WorkerClient,
  job: ProcessingJob,
  input: ProcessingInput,
  sourcePath: string,
  tempDirectory: string,
  workerId: string,
): Promise<Json> {
  assertSupportedJob(job.type);
  await reportProgress(client, job, workerId, 20);

  if (job.type === "marker_analysis") {
    const analysis = await inspectMarker(sourcePath);
    return { ...analysis, metrics: analysis.metrics, reasons: analysis.reasons };
  }
  if (job.type === "video_inspection") {
    return inspectVideo(sourcePath);
  }

  const storagePath = buildGeneratedObjectPath(job, input);
  if (job.type === "video_transcode") {
    const outputPath = join(tempDirectory, "video.mp4");
    await transcodeVideo(sourcePath, outputPath);
    await reportProgress(client, job, workerId, 75);
    const metadata = await inspectVideo(outputPath);
    const digest = await uploadGeneratedObject(client, storagePath, outputPath, "video/mp4");
    return { storageBucket: "generated-private", storagePath, sha256: digest, ...metadata };
  }
  if (job.type === "marker_compilation") {
    const outputPath = join(tempDirectory, "target.mind");
    const target = await compileMarker(sourcePath, outputPath);
    await reportProgress(client, job, workerId, 75);
    const digest = await uploadGeneratedObject(client, storagePath, outputPath, "application/octet-stream");
    return { storageBucket: "generated-private", storagePath, sha256: digest, target };
  }

  const outputPath = join(tempDirectory, "video.webp");
  await generateThumbnail(sourcePath, outputPath);
  await reportProgress(client, job, workerId, 75);
  const digest = await uploadGeneratedObject(client, storagePath, outputPath, "image/webp");
  return { storageBucket: "generated-private", storagePath, sha256: digest };
}

export async function processClaimedJob(client: WorkerClient, job: ProcessingJob, workerId: string) {
  const tempDirectory = await mkdtemp(join(tmpdir(), "ar-photo-processing-"));
  const sourcePath = join(tempDirectory, "source");
  const heartbeat = setInterval(() => {
    void reportProgress(client, job, workerId, Math.min(job.progress, 99));
  }, 30_000);
  heartbeat.unref();

  try {
    const input = parseProcessingInput(job.input_metadata);
    assertSupportedJob(job.type);
    await downloadSource(client, input, sourcePath);
    const output = await executeJob(client, job, input, sourcePath, tempDirectory, workerId);
    const { error } =
      job.type === "video_transcode"
        ? await client.rpc("complete_video_transcode_job", {
            p_job_id: job.id,
            p_worker_id: workerId,
            p_output_metadata: output,
          })
        : await client.rpc("complete_processing_job", {
            p_job_id: job.id,
            p_worker_id: workerId,
            p_output_metadata: output,
          });
    if (error) throw new WorkerFault("job_completion_failed");
    return { status: "succeeded" as const, code: "ok" };
  } catch (error) {
    const code = safeWorkerErrorCode(error);
    const result = await client.rpc("fail_processing_job", {
      p_job_id: job.id,
      p_worker_id: workerId,
      p_error_code: code,
    });
    return { status: "failed" as const, code, reported: result.error === null };
  } finally {
    clearInterval(heartbeat);
    await rm(tempDirectory, { recursive: true, force: true });
  }
}
