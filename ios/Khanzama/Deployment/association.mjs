import process from "node:process";
import { log } from "node:console";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function association(teamId, bundleId) {
  if (!/^[A-Z0-9]{10}$/.test(teamId ?? "")) throw new Error("A real 10-character Apple Team ID is required");
  if (!/^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z][A-Za-z0-9-]*){2,}$/.test(bundleId ?? "")) {
    throw new Error("Use the registered parent app bundle identifier");
  }
  return {
    appclips: { apps: [`${teamId}.${bundleId}.Clip`] },
    applinks: {
      details: [
        {
          appIDs: [`${teamId}.${bundleId}`],
          components: [{ "/": "/ar.photo/ar/*" }, { "/": "/ar.photo/camera" }, { "/": "/ar.photo/camera/" }],
        },
      ],
    },
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [teamId, bundleId, output] = process.argv.slice(2);
  if (!output) throw new Error("Usage: node association.mjs TEAM_ID BUNDLE_ID OUTPUT_FILE");
  await writeFile(output, JSON.stringify(association(teamId, bundleId), null, 2) + "\n", { flag: "wx" });
  log(`Created ${output}. Verify identifiers in Apple Developer before publishing.`);
}
