import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const SCAN_ROOTS = ["public", "test-assets"];
const FORBIDDEN_MARKERS = new Map([
  [0xe1, "EXIF/XMP"],
  [0xed, "Photoshop/IPTC"],
  [0xfe, "JPEG comment"],
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

function inspectJpeg(buffer) {
  const findings = [];
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return ["invalid JPEG signature"];
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return [...findings, `malformed marker at byte ${offset}`];
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 1;
      continue;
    }
    const lengthOffset = offset + 1;
    if (lengthOffset + 2 > buffer.length) return [...findings, "truncated segment length"];
    const length = buffer.readUInt16BE(lengthOffset);
    const segmentEnd = lengthOffset + length;
    if (length < 2 || segmentEnd > buffer.length) return [...findings, "invalid segment length"];
    if (FORBIDDEN_MARKERS.has(marker)) findings.push(FORBIDDEN_MARKERS.get(marker));
    offset = segmentEnd;
  }
  return findings;
}

const jpegFiles = (await Promise.all(SCAN_ROOTS.map((directory) => walk(resolve(ROOT, directory)))))
  .flat()
  .filter((path) => [".jpg", ".jpeg"].includes(extname(path).toLowerCase()));
const failures = [];
for (const path of jpegFiles) {
  const findings = inspectJpeg(await readFile(path));
  if (findings.length) failures.push(`${relative(ROOT, path)}: ${[...new Set(findings)].join(", ")}`);
}

if (failures.length) {
  console.error(`Public metadata check failed:\n${failures.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}
console.log(`Public metadata check passed for ${jpegFiles.length} JPEG fixtures.`);
