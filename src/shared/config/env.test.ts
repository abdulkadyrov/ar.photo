import { describe, expect, it } from "vitest";
import { parsePublicRuntimeConfig } from "./env";

describe("public runtime configuration", () => {
  it("uses an explicit demo mode when Supabase is not configured", () => {
    expect(parsePublicRuntimeConfig({})).toEqual({ authMode: "demo" });
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
  });
});
