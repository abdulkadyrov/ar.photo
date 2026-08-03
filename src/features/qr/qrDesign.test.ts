import { describe, expect, it } from "vitest";
import {
  buildPublicArUrl,
  normalizePublicBaseUrl,
  parseQrStyle,
  qrDownloadName,
  qrStylePresets,
  validatePublicQrUrl,
  validateQrDesign,
} from "./qrDesign";

describe("QR design contract", () => {
  it("builds a stable public route without internal identifiers", () => {
    const slug = "a".repeat(36);
    const publicUrl = buildPublicArUrl("https://albums.example/customer/", slug);

    expect(publicUrl).toBe(`https://albums.example/customer/ar/${slug}`);
    expect(validatePublicQrUrl(publicUrl, "88000000-0000-4000-8000-000000000001")).toEqual({
      valid: true,
      issues: [],
    });
  });

  it("allows local HTTP only for explicit demo hosts", () => {
    expect(normalizePublicBaseUrl("http://localhost:4173/ar.photo/", true)).toBe(
      "http://localhost:4173/ar.photo",
    );
    expect(() => normalizePublicBaseUrl("http://example.com", true)).toThrow(/HTTPS/);
    expect(() => normalizePublicBaseUrl("https://user@example.com/path")).toThrow(/HTTPS/);
  });

  it("enforces quiet zone, high-contrast presets and logo safety", () => {
    for (const style of Object.values(qrStylePresets)) {
      const result = validateQrDesign(style);
      expect(result.valid).toBe(true);
      expect(result.contrastRatio).toBeGreaterThanOrEqual(4.5);
      expect(style.quietZone).toBeGreaterThanOrEqual(4);
      expect(style.logoScale).toBeLessThanOrEqual(0.2);
    }
  });

  it("falls back from unknown durable style data", () => {
    expect(parseQrStyle({ preset: "unsafe", quietZone: 0 })).toEqual(qrStylePresets.white);
  });

  it("rejects UUID, signed-media and malformed QR URLs", () => {
    const itemId = "88000000-0000-4000-8000-000000000001";
    expect(validatePublicQrUrl(`https://ar.example/ar/${itemId}`, itemId).valid).toBe(false);
    expect(validatePublicQrUrl(`https://ar.example/storage/video?token=secret`, itemId).valid).toBe(false);
  });

  it("creates filesystem-safe deterministic download names", () => {
    expect(qrDownloadName("Портрет / Алексея", 3, "svg")).toBe("Портрет-Алексея-qr-v3.svg");
  });
});
