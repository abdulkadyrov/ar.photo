import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const repositoryRoot = process.cwd();
const distRoot = resolve(repositoryRoot, "dist");
const migrationsRoot = resolve(repositoryRoot, "supabase/migrations");
const outputPath = resolve(repositoryRoot, process.argv[2] ?? "artifacts/release-manifest.json");

async function collectFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    if (entry.isFile()) files.push(path);
  }
  return files;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function describeFiles(root) {
  const files = await collectFiles(root);
  return Promise.all(
    files.map(async (path) => {
      const contents = await readFile(path);
      const metadata = await stat(path);
      return {
        path: relative(root, path).split("\\").join("/"),
        bytes: metadata.size,
        sha256: sha256(contents),
      };
    }),
  );
}

function digestDescriptions(files) {
  return sha256(files.map((file) => `${file.path}\0${file.bytes}\0${file.sha256}\n`).join(""));
}

function gitOutput(args) {
  return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" }).trim();
}

const distFiles = await describeFiles(distRoot);
const migrationFiles = await describeFiles(migrationsRoot);
const packageLock = await readFile(resolve(repositoryRoot, "package-lock.json"));
const manifest = {
  schemaVersion: 1,
  product: "AR Photo",
  generatedAt: new Date().toISOString(),
  source: {
    commit: process.env.GITHUB_SHA ?? gitOutput(["rev-parse", "HEAD"]),
    dirty: gitOutput(["status", "--porcelain"]).length > 0,
  },
  runtime: {
    node: process.version,
    basePath: "/ar.photo/",
  },
  inputs: {
    packageLockSha256: sha256(packageLock),
    migrations: {
      count: migrationFiles.length,
      sha256: digestDescriptions(migrationFiles),
      files: migrationFiles,
    },
  },
  artifact: {
    fileCount: distFiles.length,
    bytes: distFiles.reduce((total, file) => total + file.bytes, 0),
    sha256: digestDescriptions(distFiles),
    files: distFiles,
  },
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Release manifest written to ${relative(repositoryRoot, outputPath)} (${distFiles.length} files).`);
