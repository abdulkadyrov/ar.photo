import { describe, expect, it } from "vitest";
import { parsePublicRuntimeConfig } from "./env";

describe("public runtime configuration", () => {
  it("fails closed when neither Supabase nor demo mode is configured", () => {
    expect(parsePublicRuntimeConfig({})).toEqual({ authMode: "unconfigured" });
  });

  it("enables demo repositories only through an explicit flag", () => {
    expect(parsePublicRuntimeConfig({ VITE_ENABLE_DEMO_MODE: "true" })).toEqual({ authMode: "demo" });
  });

  it("accepts browser-safe Supabase settings", () => {
    expect(
      parsePublicRuntimeConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_1234567890",
      }),
    ).toMatchObject({ authMode: "supabase", supabaseUrl: "https://example.supabase.co" });
  });

  it("rejects incomplete or secret configuration", () => {
    expect(() => parsePublicRuntimeConfig({ VITE_SUPABASE_URL: "https://example.supabase.co" })).toThrow();
    expect(() =>
      parsePublicRuntimeConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_123456789012345",
      }),
    ).toThrow(/secret key/i);
    expect(() =>
      parsePublicRuntimeConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_1234567890",
        VITE_ENABLE_DEMO_MODE: "true",
      }),
    ).toThrow(/mutually exclusive/i);
  });
});
