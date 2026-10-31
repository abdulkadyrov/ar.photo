import { describe, expect, it } from "vitest";
import { buildEditedVideoArgs } from "./videoEditing";

describe("server video editing", () => {
  it("cuts audio and video at the same source timestamps then resets timestamps and concatenates", () => {
    const args = buildEditedVideoArgs(
      {
        version: 1,
        crop: { x: 0.1, y: 0, width: 0.8, height: 1 },
        segments: [
          { start: 1, end: 4 },
          { start: 6, end: 9 },
        ],
      },
      10,
      true,
      "format=yuv420p",
    );
    const graph = args[1];
    expect(graph).toContain("trim=start=1:end=4");
    expect(graph).toContain("atrim=start=6:end=9");
    expect(graph).toContain("[v0][a0][v1][a1]concat=n=2:v=1:a=1[video][audio]");
    expect(graph).toContain("crop=w=");
    expect(args.slice(-4)).toEqual(["-map", "[video]", "-map", "[audio]"]);
  });
  it("supports a silent source and crop-only edits", () => {
    const args = buildEditedVideoArgs({ version: 1 }, 12, false, "format=yuv420p");
    expect(args[1]).not.toContain("[0:a:0]");
    expect(args[1]).toContain("trim=start=0:end=12");
    expect(args[1]).toContain("concat=n=1:v=1:a=0");
  });
});
