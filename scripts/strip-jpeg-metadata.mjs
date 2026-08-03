import { readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const STRIPPED_MARKERS = new Set([0xe1, 0xed, 0xfe]); // EXIF/XMP, Photoshop/IPTC and comments.

export function stripJpegMetadata(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) throw new Error("Not a JPEG file");

  const output = [buffer.subarray(0, 2)];
  let offset = 2;
  while (offset < buffer.length) {
    const segmentStart = offset;
    if (buffer[offset] !== 0xff) throw new Error(`Malformed JPEG marker at byte ${offset}`);
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    if (marker === 0xda) {
      output.push(buffer.subarray(segmentStart));
      return Buffer.concat(output);
    }
    if (marker === 0xd9) {
      output.push(buffer.subarray(segmentStart, offset + 1));
      return Buffer.concat(output);
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      output.push(buffer.subarray(segmentStart, offset + 1));
      offset += 1;
      continue;
    }

    const lengthOffset = offset + 1;
    if (lengthOffset + 2 > buffer.length) throw new Error("Truncated JPEG segment length");
    const length = buffer.readUInt16BE(lengthOffset);
    if (length < 2) throw new Error("Invalid JPEG segment length");
    const segmentEnd = lengthOffset + length;
    if (segmentEnd > buffer.length) throw new Error("Truncated JPEG segment");
    if (!STRIPPED_MARKERS.has(marker)) output.push(buffer.subarray(segmentStart, segmentEnd));
    offset = segmentEnd;
  }
  throw new Error("JPEG has no image data segment");
}

async function main(paths) {
  if (!paths.length) throw new Error("Pass one or more JPEG paths to sanitize");
  for (const input of paths) {
    const path = resolve(input);
    const clean = stripJpegMetadata(await readFile(path));
    const temporaryPath = `${path}.metadata-clean`;
    await writeFile(temporaryPath, clean);
    await rename(temporaryPath, path);
    console.log(`Stripped JPEG metadata: ${input}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
