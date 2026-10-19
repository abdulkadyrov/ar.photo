import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ALLOWED_RSC_ADVISORY = 1124282;
const ALLOWED_SPRINTF_ADVISORY = 1241202;
const ALLOWED_PACKAGES = new Set([
  "react-router",
  "react-router-dom",
  "sprintf-js",
  "argparse",
  "@tensorflow/tfjs",
  "mind-ar",
]);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));

if (lock.packages?.["node_modules/react-router"]?.version !== "7.18.2") {
  throw new Error("The reviewed React Router audit exception is valid only for exact version 7.18.2");
}

const reviewedMindArChain = {
  "mind-ar": "1.2.5",
  "@tensorflow/tfjs": "4.22.0",
  argparse: "1.0.10",
  "sprintf-js": "1.0.3",
};
for (const [name, version] of Object.entries(reviewedMindArChain)) {
  if (lock.packages?.[`node_modules/${name}`]?.version !== version) {
    throw new Error(`The reviewed mind-ar audit exception requires ${name}@${version}`);
  }
}

const audit = spawnSync("npm", ["audit", "--omit=dev", "--json"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
if (!audit.stdout) throw new Error(`npm audit produced no JSON: ${audit.stderr}`);
const report = JSON.parse(audit.stdout);
const vulnerabilities = Object.values(report.vulnerabilities ?? {});
const unexpected = vulnerabilities.filter((item) => {
  if (!ALLOWED_PACKAGES.has(item.name)) return true;
  if (item.name === "react-router-dom") return item.via.some((via) => via !== "react-router");
  if (item.name === "react-router") {
    return item.via.some((via) => typeof via !== "object" || via.source !== ALLOWED_RSC_ADVISORY);
  }
  if (item.name === "mind-ar") return item.via.some((via) => via !== "@tensorflow/tfjs");
  if (item.name === "@tensorflow/tfjs") return item.via.some((via) => via !== "argparse");
  if (item.name === "argparse") return item.via.some((via) => via !== "sprintf-js");
  return item.via.some((via) => typeof via !== "object" || via.source !== ALLOWED_SPRINTF_ADVISORY);
});

if (unexpected.length) {
  console.error(`Dependency audit failed:\n${unexpected.map((item) => `- ${item.name}: ${item.severity}`).join("\n")}`);
  process.exit(1);
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

const rscPattern = /react-router\/(?:dom|node)|RSCRouter|createCallServer|routeRSCServerRequest/;
const rscImports = sourceFiles("src").filter((path) => rscPattern.test(readFileSync(path, "utf8")));
if (rscImports.length) {
  console.error(`Reviewed RSC exception is reachable from application code:\n${rscImports.join("\n")}`);
  process.exit(1);
}

const vulnerableFormatImportPattern = /(?:from\s+["'](?:argparse|sprintf-js)["']|require\(["'](?:argparse|sprintf-js)["']\))/;
const vulnerableFormatImports = sourceFiles("src").filter((path) =>
  vulnerableFormatImportPattern.test(readFileSync(path, "utf8")),
);
if (vulnerableFormatImports.length) {
  console.error(`Reviewed sprintf-js exception is reachable from application code:\n${vulnerableFormatImports.join("\n")}`);
  process.exit(1);
}

const totals = report.metadata?.vulnerabilities ?? {};
console.log(
  `Dependency audit passed: ${totals.critical ?? 0} critical; only reviewed client-inapplicable advisories ${ALLOWED_RSC_ADVISORY} and ${ALLOWED_SPRINTF_ADVISORY} remain.`,
);
