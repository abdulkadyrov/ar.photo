import { describe, expect, it } from "vitest";
import { getResumableUploadEndpoint } from "./mediaRepository";

describe("resumable upload endpoint", () => {
  it("uses the Supabase direct storage hostname", () => {
    expect(getResumableUploadEndpoint("https://example-ref.supabase.co")).toBe(
      "https://example-ref.storage.supabase.co/storage/v1/upload/resumable",
    );
  });

  it("keeps local gateways on the configured origin", () => {
    expect(getResumableUploadEndpoint("http://127.0.0.1:54321")).toBe(
      "http://127.0.0.1:54321/storage/v1/upload/resumable",
    );
  });
});
