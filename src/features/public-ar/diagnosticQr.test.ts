import { describe, expect, it } from "vitest";
import { parseDiagnosticQr } from "./diagnosticQr";
const origin = "https://khanzama.ru";
const base = "/ar.photo/";
describe("diagnostic QR links", () => {
  it("accepts only public viewer and card identifiers and discards query tokens", () => {
    expect(parseDiagnosticQr(`${origin}${base}card/${"a".repeat(32)}?edit=private`, origin, base)).toEqual({
      kind: "card",
      id: "a".repeat(32),
    });
    expect(parseDiagnosticQr(`${origin}${base}ar/${"b".repeat(36)}`, origin, base)).toEqual({
      kind: "ar",
      id: "b".repeat(36),
    });
  });
  it("rejects other origins, credentials, malformed identifiers and arbitrary routes", () => {
    for (const value of [
      `https://example.com${base}ar/${"b".repeat(36)}`,
      `https://user:pass@khanzama.ru${base}ar/${"b".repeat(36)}`,
      `${origin}/wrong/ar/${"b".repeat(36)}`,
      `${origin}${base}ar/no`,
      `${origin}${base}card/${"b".repeat(36)}`,
      `${origin}${base}ar/${"b".repeat(36)}/extra`,
      "javascript:alert(1)",
    ])
      expect(parseDiagnosticQr(value, origin, base)).toBeNull();
  });
  it("supports a deployment at root without accepting prefixed routes", () => {
    expect(parseDiagnosticQr(`${origin}/ar/${"b".repeat(36)}`, origin, "/")?.kind).toBe("ar");
    expect(parseDiagnosticQr(`${origin}/other/ar/${"b".repeat(36)}`, origin, "/")).toBeNull();
  });
});
