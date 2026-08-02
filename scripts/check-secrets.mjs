import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const patterns = [
  { name: "Supabase secret key", value: /sb_secret_[A-Za-z0-9_-]{24,}/g },
  { name: "Supabase service-role environment value", value: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S{12,}/g },
  { name: "credentialed database URL", value: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/g },
  { name: "JWT-like token", value: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g },
];

const trackedFiles = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean);
const findings = [];

for (const file of trackedFiles) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  if (content.includes("\0")) continue;
  for (const pattern of patterns) {
    pattern.value.lastIndex = 0;
    if (pattern.value.test(content)) findings.push(`${file}: ${pattern.name}`);
  }
}

if (findings.length) {
  console.error(`Potential secrets found:\n${findings.join("\n")}`);
  process.exit(1);
}

console.log(`Secret scan passed for ${trackedFiles.length} tracked files.`);
