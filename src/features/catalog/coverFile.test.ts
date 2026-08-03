import { describe, expect, it } from "vitest";
import { CoverFileError, coverFileMaxBytes, detectCoverFormat, validateCoverFile } from "./coverFile";

describe("cover file validation", () => {
  it("detects allowlisted image signatures", () => {
    expect(detectCoverFormat(new Uint8Array([0xff, 0xd8, 0xff]))?.mime).toBe("image/jpeg");
    expect(detectCoverFormat(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mime).toBe("image/png");
    expect(detectCoverFormat(new Uint8Array([82, 73, 70, 70, 1, 2, 3, 4, 87, 69, 66, 80]))?.mime).toBe("image/webp");
  });

  it("rejects spoofed MIME and oversized files", async () => {
    const spoofed = new File([new Uint8Array([0xff, 0xd8, 0xff])], "cover.png", { type: "image/png" });
    await expect(validateCoverFile(spoofed)).rejects.toThrow(CoverFileError);

    const oversized = new File([new Uint8Array(coverFileMaxBytes + 1)], "cover.jpg", { type: "image/jpeg" });
    await expect(validateCoverFile(oversized)).rejects.toThrow("не больше 10 МБ");
  });
});
