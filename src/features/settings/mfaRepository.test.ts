import { describe, expect, it, vi } from "vitest";
import { MfaSettingsError, SupabaseMfaSettingsRepository } from "./mfaRepository";

describe("SupabaseMfaSettingsRepository", () => {
  it("reports a verified TOTP factor without exposing factor material", async () => {
    const client = createClient({
      all: [factor("verified", "verified-factor")],
      totp: [factor("verified", "verified-factor")],
    });
    const repository = new SupabaseMfaSettingsRepository(client as never);

    await expect(repository.getStatus()).resolves.toEqual({
      configured: true,
      verifiedFactorId: "verified-factor",
    });
  });

  it("removes abandoned enrollment before creating a new one", async () => {
    const client = createClient({ all: [factor("unverified", "stale-factor")], totp: [] });
    const repository = new SupabaseMfaSettingsRepository(client as never);

    await expect(repository.beginEnrollment()).resolves.toEqual({
      factorId: "new-factor",
      secret: "TESTSECRET",
      uri: "otpauth://totp/AR%20Photo:test",
    });
    expect(client.auth.mfa.unenroll).toHaveBeenCalledWith({ factorId: "stale-factor" });
    expect(client.auth.mfa.enroll).toHaveBeenCalledWith({
      factorType: "totp",
      friendlyName: "AR Photo",
      issuer: "AR Photo",
    });
  });

  it("rejects malformed codes before requesting a challenge", async () => {
    const client = createClient({ all: [], totp: [] });
    const repository = new SupabaseMfaSettingsRepository(client as never);

    await expect(repository.verifyEnrollment("factor", "12-ab")).rejects.toBeInstanceOf(MfaSettingsError);
    expect(client.auth.mfa.challengeAndVerify).not.toHaveBeenCalled();
  });
});

function factor(status: "verified" | "unverified", id: string) {
  return {
    id,
    factor_type: "totp",
    status,
    created_at: "2026-08-06T00:00:00.000Z",
    updated_at: "2026-08-06T00:00:00.000Z",
  };
}

function createClient(factors: { all: ReturnType<typeof factor>[]; totp: ReturnType<typeof factor>[] }) {
  return {
    auth: {
      mfa: {
        listFactors: vi.fn().mockResolvedValue({ data: { ...factors, phone: [], webauthn: [] }, error: null }),
        unenroll: vi.fn().mockResolvedValue({ data: {}, error: null }),
        enroll: vi.fn().mockResolvedValue({
          data: {
            id: "new-factor",
            type: "totp",
            totp: {
              secret: "TESTSECRET",
              uri: "otpauth://totp/AR%20Photo:test",
              qr_code: "data:image/svg+xml;utf-8,<svg />",
            },
          },
          error: null,
        }),
        challengeAndVerify: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    },
  };
}
