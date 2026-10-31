// Executed in the built worker image by CI: exercises real FFmpeg, not mocks.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { buildEditedVideoArgs } from "./videoEditing.js";

const temp = mkdtempSync(join(tmpdir(), "ar-edit-check-"));
const run = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, { maxBuffer: 16 * 1024 * 1024, timeout: 120000, stdio: ["ignore", "pipe", "pipe"] });
try {
  const source = join(temp, "source.mp4");
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=size=320x240:rate=30:duration=8",
    "-f",
    "lavfi",
    "-i",
    "aevalsrc=0.2*sin(2*PI*if(lt(t\\,4)\\,440\\,880)*t):s=48000:d=8",
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-shortest",
    source,
  ]);
  const crop = { x: 0.125, y: 0, width: 0.75, height: 1 };
  for (const hasAudio of [true, false]) {
    const output = join(temp, `edited-${hasAudio}.mp4`);
    run("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-i",
      source,
      ...buildEditedVideoArgs(
        {
          version: 1,
          crop,
          segments: [
            { start: 1, end: 3 },
            { start: 5, end: 7 },
          ],
        },
        8,
        hasAudio,
        "format=yuv420p",
      ),
      "-c:v",
      "libx264",
      "-crf",
      "18",
      "-c:a",
      "aac",
      output,
    ]);
    const probe = JSON.parse(
      run("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "stream=codec_type,width,height,duration",
        "-of",
        "json",
        output,
      ]).toString(),
    ) as { streams: { codec_type: string; width?: number; height?: number; duration: string }[] };
    const video = probe.streams.find((s) => s.codec_type === "video")!;
    assert.equal(video.width, 240);
    assert.equal(video.height, 240);
    assert.ok(Math.abs(Number(video.duration) - 4) < 0.06);
    assert.equal(
      probe.streams.some((s) => s.codec_type === "audio"),
      hasAudio,
    );
    for (const [outputTime, sourceTime, tone] of [
      [0.5, 1.5, 440],
      [2.5, 5.5, 880],
    ]) {
      const frame = (file: string, time: number, filter: string) =>
        run("ffmpeg", [
          "-v",
          "error",
          "-ss",
          String(time),
          "-i",
          file,
          "-frames:v",
          "1",
          "-vf",
          filter,
          "-f",
          "rawvideo",
          "-pix_fmt",
          "rgb24",
          "pipe:1",
        ]);
      const expected = frame(source, sourceTime, "crop=240:240:40:0");
      const actual = frame(output, outputTime, "null");
      assert.equal(actual.length, expected.length);
      const mae = actual.reduce((sum, n, i) => sum + Math.abs(n - expected[i]), 0) / actual.length;
      assert.ok(mae < 6, `Wrong source frame/crop at ${outputTime} vs ${sourceTime} (audio=${hasAudio}): MAE ${mae}`);
      if (hasAudio) {
        const pcm = run("ffmpeg", [
          "-v",
          "error",
          "-ss",
          String(outputTime),
          "-i",
          output,
          "-t",
          "0.1",
          "-vn",
          "-ac",
          "1",
          "-ar",
          "48000",
          "-f",
          "f32le",
          "pipe:1",
        ]);
        const power = (hz: number) => {
          let real = 0,
            imaginary = 0;
          for (let i = 0; i < pcm.length / 4; i++) {
            const sample = pcm.readFloatLE(i * 4);
            real += sample * Math.cos((2 * Math.PI * hz * i) / 48000);
            imaginary += sample * Math.sin((2 * Math.PI * hz * i) / 48000);
          }
          return Math.hypot(real, imaginary);
        };
        assert.ok(power(tone) > power(tone === 440 ? 880 : 440) * 5, "Audio did not follow the same edit as video");
      }
    }
  }
  // Crop-only uses the one-segment branch, including silent uploads.
  run("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    source,
    ...buildEditedVideoArgs({ version: 1, crop }, 8, false, "format=yuv420p"),
    "-c:v",
    "libx264",
    join(temp, "crop-only.mp4"),
  ]);
  console.log(
    "Video edit runtime passed: crop, exact cut frames, 4s output, synchronized audio tones, silent and crop-only sources.",
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
