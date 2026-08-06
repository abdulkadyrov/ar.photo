import { describe, expect, it } from "vitest";
import { matchesPublicProjectQr, publicSlugFromQr } from "./qrProjectScanner";

describe("public project QR validation", () => {
  it("extracts a public slug from hosted and base-path AR URLs", () => {
    expect(publicSlugFromQr("https://example.test/ar/photo-123")).toBe("photo-123");
    expect(publicSlugFromQr("https://example.test/ar.photo/ar/photo-123?source=qr")).toBe("photo-123");
  });

  it("accepts only the QR for the currently open project", () => {
    expect(matchesPublicProjectQr("https://example.test/ar.photo/ar/current", "current")).toBe(true);
    expect(matchesPublicProjectQr("https://example.test/ar.photo/ar/another", "current")).toBe(false);
    expect(matchesPublicProjectQr("not a project QR", "current")).toBe(false);
  });
});
