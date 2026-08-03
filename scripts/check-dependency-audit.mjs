import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ALLOWED_ADVISORY = 1124282;
const ALLOWED_PACKAGES = new Set(["react-router", "react-router-dom"]);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));

if (lock.packages?.["node_modules/react-router"]?.version !== "7.18.2") {
  throw new Error("The reviewed React Router audit exception is valid only for exact version 7.18.2");
}

const audit = spawnSync("npm", ["audit", "--omit=dev", "--json"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
if (!audit.stdout) throw new Error(`npm audit produced no JSON: ${audit.stderr}`);
const report = JSON.parse(audit.stdout);
const vulnerabilities = Object.values(report.vulnerabilities ?? {});
const unexpected = vulnerabilities.filter((item) => {
  if (!ALLOWED_PACKAGES.has(item.name)) return true;
  if (item.name === "react-router-dom") return item.via.some((via) => via !== "react-router");
  return item.via.some((via) => typeof via !== "object" || via.source !== ALLOWED_ADVISORY);
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

const totals = report.metadata?.vulnerabilities ?? {};
console.log(
  `Dependency audit passed: ${totals.critical ?? 0} critical; only reviewed client-inapplicable RSC advisory ${ALLOWED_ADVISORY} remains.`,
);
