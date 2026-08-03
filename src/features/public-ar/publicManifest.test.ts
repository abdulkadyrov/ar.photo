import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPublicManifest, manifestRefreshDelay, PublicManifestError } from "./publicManifest";

describe("public AR manifest client", () => {
  afterEach(() => vi.restoreAllMocks());

  it("provides the local demo manifest without a network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const manifest = await loadPublicManifest("demo");

    expect(manifest.title).toBe("Демо AR Photo");
    expect(manifest.assets.trackingAssetUrl).toContain("test.mind");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does not invent public content for an unknown demo slug", async () => {
    await expect(loadPublicManifest("missing")).rejects.toMatchObject({
      code: "not_found",
    } satisfies Partial<PublicManifestError>);
  });

  it("refreshes signed URLs 45 seconds before expiry", () => {
    expect(manifestRefreshDelay("2026-08-03T00:05:00.000Z", Date.parse("2026-08-03T00:00:00.000Z"))).toBe(
      255_000,
    );
    expect(manifestRefreshDelay("2026-08-03T00:00:30.000Z", Date.parse("2026-08-03T00:00:00.000Z"))).toBe(0);
  });
});
