// Applied only to explicit CRM A4 publications; source video is retained.
export function crmFrameFilter(frame: unknown): string {
  if (frame === undefined) return "";
  if (frame !== "a4-portrait" && frame !== "a4-landscape") throw new Error("invalid_crm_frame");
  const [width, height] = frame === "a4-landscape" ? [1782, 1260] : [1260, 1782];
  return `,scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${width}:${height},setsar=1`;
}
