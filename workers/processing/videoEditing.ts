import { parseVideoEdits, type VideoEdits } from "../../src/features/media/mediaEdits.js";

export function buildEditedVideoArgs(value: unknown, duration: number, hasAudio: boolean, videoFilter: string) {
  const edits: VideoEdits = parseVideoEdits(value, duration);
  const segments = edits.segments ?? [{ start: 0, end: duration }];
  const n = segments.length;
  const crop = edits.crop;
  const spatial = crop
    ? `crop=w='max(2,trunc(iw*${crop.width}/2)*2)':h='max(2,trunc(ih*${crop.height}/2)*2)':x='iw*${crop.x}':y='ih*${crop.y}',`
    : "";
  const graph = [
    `[0:v:0]setpts=PTS-STARTPTS,${spatial}${videoFilter},setsar=1,split=${n}${segments.map((_, i) => `[vs${i}]`).join("")}`,
  ];
  if (hasAudio) graph.push(`[0:a:0]asetpts=PTS-STARTPTS,asplit=${n}${segments.map((_, i) => `[as${i}]`).join("")}`);
  segments.forEach((s, i) => {
    graph.push(`[vs${i}]trim=start=${s.start}:end=${s.end},setpts=PTS-STARTPTS[v${i}]`);
    if (hasAudio)
      graph.push(
        `[as${i}]atrim=start=${s.start}:end=${s.end},asetpts=PTS-STARTPTS,apad,atrim=duration=${s.end - s.start}[a${i}]`,
      );
  });
  graph.push(
    `${segments.map((_, i) => `[v${i}]${hasAudio ? `[a${i}]` : ""}`).join("")}concat=n=${n}:v=1:a=${hasAudio ? 1 : 0}[video]${hasAudio ? "[audio]" : ""}`,
  );
  return ["-filter_complex", graph.join(";"), "-map", "[video]", ...(hasAudio ? ["-map", "[audio]"] : [])];
}
