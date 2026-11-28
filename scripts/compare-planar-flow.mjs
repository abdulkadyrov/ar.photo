// Offline, identical-input comparison. Input frames are raw camera grayscale,
// never a recording of the rendered AR overlay. Private datasets stay ignored.
import ts from "typescript";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const folder = process.argv[2];
if (!folder) throw new Error("Usage: node scripts/compare-planar-flow.mjs DATASET_DIRECTORY [OUTPUT_JSON]");
const temporary = await mkdtemp(join(tmpdir(), "ar-flow-"));
try {
  for (const name of ["planarTracking", "opticalFlow", "hybridPlanarTracking"]) {
    const source = await readFile(`src/features/public-ar/${name}.ts`, "utf8");
    const js = ts
      .transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } })
      .outputText.replace(/from "\.\/(\w+)"/g, 'from "./$1.mjs"');
    await writeFile(join(temporary, `${name}.mjs`), js);
  }
  const { createHybridPlanarTracker } = await import(pathToFileURL(join(temporary, "hybridPlanarTracking.mjs")));
  const { createCornerFilter, PLANAR_HOLD_MS, stabilizePartialPose, partialPoseFollows } = await import(
    pathToFileURL(join(temporary, "planarTracking.mjs"))
  );
  const dataset = JSON.parse(await readFile(join(folder, "dataset.json"), "utf8"));
  const bytes = await readFile(join(folder, "frames.gray"));
  const width = dataset.width ?? 360,
    height = dataset.height ?? 640,
    size = width * height;
  const hybrid = createHybridPlanarTracker();
  const filter = { baseline: createCornerFilter(), hybrid: createCornerFilter() };
  const current = { baseline: null, hybrid: null },
    observed = { baseline: null, hybrid: null },
    accepted = { baseline: -Infinity, hybrid: -Infinity };
  const rows = [];
  for (const [index, frame] of (dataset.frames ?? dataset.rows).entries()) {
    const time = frame.time,
      stamp = time * 1000;
    const data = Float32Array.from(bytes.subarray(index * size, (index + 1) * size));
    if (data.length !== size) throw new Error("Missing grayscale frame");
    const reference = frame.reference;
    const start = performance.now();
    const flow = hybrid.sample({ width, height, data }, stamp, reference);
    const processingMs = performance.now() - start;
    for (const name of ["baseline", "hybrid"]) {
      let quad = name === "baseline" ? reference : flow?.corners;
      if (frame.partial && quad) {
        if (
          !observed[name] ||
          stamp - accepted[name] > PLANAR_HOLD_MS ||
          !filter[name].fresh(stamp) ||
          !partialPoseFollows(observed[name], quad)
        )
          quad = null;
        else quad = stabilizePartialPose(observed[name], quad, { width: 720, height: 1280 });
      }
      const value = quad
        ? filter[name].sample(quad, stamp, name === "hybrid" && flow?.source === "flow" && flow.flowPoints >= 16)
        : null;
      if (value) {
        current[name] = value;
        observed[name] = quad;
        accepted[name] = stamp;
      }
      if (stamp - accepted[name] > PLANAR_HOLD_MS) current[name] = null;
    }
    rows.push({
      time,
      baseline: current.baseline,
      hybrid: current.hybrid,
      rawHybrid: flow?.corners ?? null,
      source: flow?.source ?? null,
      flowPoints: flow?.flowPoints ?? 0,
      processingMs,
    });
  }
  const output = process.argv[3] ?? join(folder, "comparison.json");
  await mkdir(resolve(output, ".."), { recursive: true });
  await writeFile(
    output,
    JSON.stringify({
      note: "Identical frames/references, same production corner filter. Desktop compute time is not iPhone timing. Acquisition hysteresis is not simulated.",
      width,
      height,
      rows,
    }),
  );
  const timings = rows.map((r) => r.processingMs).sort((a, b) => a - b);
  console.log(
    JSON.stringify({
      frames: rows.length,
      baselineVisible: rows.filter((r) => r.baseline).length,
      hybridVisible: rows.filter((r) => r.hybrid).length,
      flowFrames: rows.filter((r) => r.source === "flow").length,
      processingMs: {
        median: timings[Math.floor(timings.length * 0.5)],
        p95: timings[Math.floor(timings.length * 0.95)],
      },
      output,
    }),
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
