/* global window */
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const url = process.env.AR_LAB_URL ?? "http://127.0.0.1:4193/ar.photo/tools/ar-lab/";
const output = process.env.AR_LAB_OUTPUT ?? "artifacts/ar-lab";
const scenarios = (process.env.AR_LAB_SCENARIOS ?? "front,tilt30,tilt50,pan,tilt,zoom,hand,fast").split(",");
const duration = Number(process.env.AR_LAB_DURATION_MS ?? 6000);
const baselineRef = process.env.AR_LAB_BASELINE ?? "0846a3a";
const sourcePaths = [
  "tools/ar-lab/main.ts",
  "tools/ar-lab/motion.ts",
  "src/features/public-ar/planarTracking.ts",
  "src/features/public-ar/planarTrackingBridge.ts",
];
const sourceHashes = async () =>
  Object.fromEntries(
    await Promise.all(
      sourcePaths.map(async (path) => [
        path,
        createHash("sha256")
          .update(await readFile(path))
          .digest("hex"),
      ]),
    ),
  );
const startSourceHashes = await sourceHashes();
if (!/^[a-f0-9]{7,40}$/.test(baselineRef)) throw new Error("Baseline must be a commit SHA");
await mkdir(output, { recursive: true });
await mkdir("tmp", { recursive: true });
await writeFile(
  "tmp/ar-lab-baseline.ts",
  execFileSync("git", ["show", `${baselineRef}:src/features/public-ar/planarTracking.ts`]),
);
const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(url);
  await page.waitForFunction(() => Boolean(window.__arLab), undefined, { timeout: 30000 });
  await Promise.race([
    page.evaluate(() => window.__arLab.start()),
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error("Simulator startup timed out")), 120000);
      timer.unref();
    }),
  ]);
  await page.waitForFunction(() => window.__arLab.ready(), undefined, { timeout: 120000 });
  await page.waitForFunction(() => window.__arLab.summary().foundEvents > 0, undefined, { timeout: 60000 });
  await page.evaluate((parameters) => window.__arLab.setParameters(parameters), {
    noise: Number(process.env.AR_LAB_NOISE ?? 0),
    defocus: Number(process.env.AR_LAB_DEFOCUS ?? 0),
    motionStrength: Number(process.env.AR_LAB_MOTION_STRENGTH ?? 1),
    motionSpeed: Number(process.env.AR_LAB_MOTION_SPEED ?? 1),
  });
  const results = [];
  for (const scenario of scenarios) {
    await page.evaluate((name) => window.__arLab.setScenario(name), scenario);
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.__arLab.reset());
    await page.waitForTimeout(duration);
    const result = await page.evaluate(() => ({
      summary: window.__arLab.summary(),
      samples: window.__arLab.samples(),
    }));
    result.replay = await page.evaluate(
      async ({ samples, size }) => {
        const current = await import("/ar.photo/src/features/public-ar/planarTracking.ts");
        const baseline = await import("/ar.photo/tmp/ar-lab-baseline.ts");
        function replay(module) {
          const filter = module.createCornerFilter();
          let previous = null;
          let previousResidual = null;
          let lastFiltered = null;
          let heldFrames = 0;
          const errors = [];
          const visibleErrors = [];
          const steps = [];
          const errorFor = (quad, truth) =>
            Math.sqrt(
              quad.reduce(
                (sum, p, i) => sum + ((p.x - truth[i].x) * size.width) ** 2 + ((p.y - truth[i].y) * size.height) ** 2,
                0,
              ) / 4,
            );
          for (const sample of samples) {
            let measured = sample.raw;
            if (sample.partial) {
              if (!previous || !filter.fresh(sample.frameTime) || !module.partialPoseFollows(previous, measured))
                measured = null;
              else measured = module.stabilizePartialPose(previous, measured, size);
            }
            const filtered = measured ? filter.sample(measured, sample.frameTime) : null;
            if (!filtered) {
              if (lastFiltered && filter.fresh(sample.frameTime)) {
                heldFrames++;
                visibleErrors.push(errorFor(lastFiltered, sample.truth));
              }
              continue;
            }
            previous = measured;
            lastFiltered = filtered;
            visibleErrors.push(errorFor(filtered, sample.truth));
            const residual = filtered.map((p, i) => ({
              x: (p.x - sample.truth[i].x) * size.width,
              y: (p.y - sample.truth[i].y) * size.height,
            }));
            if (previousResidual)
              steps.push(
                Math.max(
                  ...residual.map((p, i) => Math.hypot(p.x - previousResidual[i].x, p.y - previousResidual[i].y)),
                ),
              );
            previousResidual = residual;
            errors.push(
              Math.sqrt(
                filtered.reduce(
                  (sum, p, i) =>
                    sum +
                    ((p.x - sample.truth[i].x) * size.width) ** 2 +
                    ((p.y - sample.truth[i].y) * size.height) ** 2,
                  0,
                ) / 4,
              ),
            );
          }
          return {
            accepted: errors.length,
            heldFrames,
            visibleSamples: visibleErrors.length,
            visibleRmsPx: visibleErrors.length
              ? Math.sqrt(visibleErrors.reduce((a, b) => a + b * b, 0) / visibleErrors.length)
              : null,
            maxVisibleErrorPx: visibleErrors.length ? Math.max(...visibleErrors) : null,
            rmsPx: errors.length ? Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / errors.length) : null,
            residualStepP95Px: steps.length
              ? [...steps].sort((a, b) => a - b)[Math.floor((steps.length - 1) * 0.95)]
              : null,
            residualStepMaxPx: steps.length ? Math.max(...steps) : null,
          };
        }
        return {
          baseline: replay(baseline),
          current: replay(current),
          scope: "Same observed quads replayed through filters, not a second camera run",
        };
      },
      { samples: result.samples, size: result.summary.input },
    );
    result.summary.replay = result.replay;
    results.push(result.summary);
    await writeFile(`${output}/${scenario}.json`, JSON.stringify(result, null, 2));
    await page.screenshot({ path: `${output}/${scenario}.png` });
    console.log(JSON.stringify(result.summary));
  }
  await writeFile(
    `${output}/summary.json`,
    JSON.stringify(
      {
        commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
        dirty: Boolean(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()),
        recordedAt: new Date().toISOString(),
        durationMs: duration,
        baselineRef,
        sourceHashes: startSourceHashes,
        results,
        errors,
        limitation: "Synthetic WebGL camera on this computer; not physical iPhone performance or optical validation.",
      },
      null,
      2,
    ),
  );
  if (JSON.stringify(startSourceHashes) !== JSON.stringify(await sourceHashes())) {
    console.error("Source changed during benchmark; discard this run.");
    process.exitCode = 1;
  }
  if (errors.length || results.some((r) => r.samples === 0)) process.exitCode = 1;
} finally {
  await browser.close();
}
