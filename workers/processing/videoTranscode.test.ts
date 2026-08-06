import { describe, expect, it } from "vitest";
import { buildVideoFilter, parseVideoColorMetadata } from "./videoTranscode";

describe("video transcode color contract", () => {
  it("normalizes tagged SDR video to BT.709", () => {
    const metadata = parseVideoColorMetadata(
      JSON.stringify({
        streams: [
          {
            color_range: "tv",
            color_space: "smpte170m",
            color_transfer: "bt709",
            color_primaries: "smpte432",
          },
        ],
      }),
    );
    expect(buildVideoFilter(metadata)).toContain("colorspace=all=bt709");
    expect(buildVideoFilter(metadata)).toContain("flags=lanczos");
  });

  it("tone-maps HDR transfer functions before producing BT.709", () => {
    const filter = buildVideoFilter({
      range: "tv",
      space: "bt2020nc",
      transfer: "smpte2084",
      primaries: "bt2020",
    });
    expect(filter).toContain("zscale=t=linear");
    expect(filter).toContain("tonemap=tonemap=hable");
    expect(filter).toContain("zscale=t=bt709:m=bt709:r=tv");
  });

  it("keeps HDR processing available when the runtime lacks zscale", () => {
    const filter = buildVideoFilter(
      { range: "tv", space: "bt2020nc", transfer: "arib-std-b67", primaries: "bt2020" },
      false,
    );
    expect(filter).not.toContain("zscale");
    expect(filter).toMatch(/flags=lanczos,format=yuv420p$/);
  });

  it("keeps untagged legacy video compatible instead of failing conversion", () => {
    const metadata = parseVideoColorMetadata(JSON.stringify({ streams: [{}] }));
    expect(buildVideoFilter(metadata)).toMatch(/flags=lanczos,format=yuv420p$/);
  });
});
