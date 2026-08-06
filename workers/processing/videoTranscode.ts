import { WorkerFault } from "./jobContract.js";

export type VideoColorMetadata = {
  range?: string;
  space?: string;
  transfer?: string;
  primaries?: string;
};

const hdrTransfers = new Set(["smpte2084", "arib-std-b67"]);
const unknownValues = new Set(["unknown", "reserved", "unspecified"]);

export function parseVideoColorMetadata(raw: string): VideoColorMetadata {
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new WorkerFault("invalid_video_metadata");
  }
  if (!isRecord(payload) || !Array.isArray(payload.streams)) throw new WorkerFault("invalid_video_metadata");
  const stream = payload.streams.find((candidate) => isRecord(candidate));
  if (!isRecord(stream)) return {};
  return {
    range: normalized(stream.color_range),
    space: normalized(stream.color_space),
    transfer: normalized(stream.color_transfer),
    primaries: normalized(stream.color_primaries),
  };
}

export function buildVideoFilter(metadata: VideoColorMetadata, supportsZscale = true) {
  const scale = "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))':flags=lanczos";
  const hasColorProfile = Boolean(metadata.space && metadata.transfer && metadata.primaries);
  if (hasColorProfile && metadata.transfer && hdrTransfers.has(metadata.transfer) && supportsZscale) {
    return [
      scale,
      "zscale=t=linear:npl=100",
      "format=gbrpf32le",
      "zscale=p=bt709",
      "tonemap=tonemap=hable:desat=0",
      "zscale=t=bt709:m=bt709:r=tv",
      "format=yuv420p",
    ].join(",");
  }
  if (metadata.transfer && hdrTransfers.has(metadata.transfer)) return `${scale},format=yuv420p`;
  if (hasColorProfile) return `${scale},colorspace=all=bt709:format=yuv420p:fast=1`;
  return `${scale},format=yuv420p`;
}

function normalized(value: unknown) {
  if (typeof value !== "string") return undefined;
  const result = value.trim().toLowerCase();
  return result && !unknownValues.has(result) ? result : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
