import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { getPublicRuntimeConfig } from "../../shared/config/env";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export type MfaStatus = {
  configured: boolean;
  verifiedFactorId?: string;
};

export type MfaEnrollment = {
  factorId: string;
  secret: string;
  uri: string;
};

export class MfaSettingsError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MfaSettingsError";
  }
}

export interface MfaSettingsRepository {
  getStatus(): Promise<MfaStatus>;
  beginEnrollment(): Promise<MfaEnrollment>;
  verifyEnrollment(factorId: string, code: string): Promise<void>;
  cancelEnrollment(factorId: string): Promise<void>;
}

export class SupabaseMfaSettingsRepository implements MfaSettingsRepository {
  constructor(private readonly client: SupabaseBrowserClient) {}

  async getStatus(): Promise<MfaStatus> {
    const factors = await this.client.auth.mfa.listFactors();
    if (factors.error) throw mapMfaError(factors.error);
    const verified = factors.data.totp.find((factor) => factor.status === "verified");
    return { configured: Boolean(verified), verifiedFactorId: verified?.id };
  }

  async beginEnrollment(): Promise<MfaEnrollment> {
    const factors = await this.client.auth.mfa.listFactors();
    if (factors.error) throw mapMfaError(factors.error);
    if (factors.data.totp.some((factor) => factor.status === "verified")) {
      throw new MfaSettingsError("TOTP уже подключён к этому аккаунту");
    }

    // An unverified factor cannot reveal its secret again. Remove abandoned
    // enrollments before issuing a fresh, one-time QR code.
    for (const factor of factors.data.all.filter(
      (candidate) => candidate.factor_type === "totp" && candidate.status === "unverified",
    )) {
      const removal = await this.client.auth.mfa.unenroll({ factorId: factor.id });
      if (removal.error) throw mapMfaError(removal.error);
    }

    const enrollment = await this.client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "AR Photo",
      issuer: "AR Photo",
    });
    if (enrollment.error) throw mapMfaError(enrollment.error);
    if (!enrollment.data?.totp?.uri || !enrollment.data.totp.secret) {
      throw new MfaSettingsError("Сервис не вернул данные для подключения TOTP");
    }
    return {
      factorId: enrollment.data.id,
      secret: enrollment.data.totp.secret,
      uri: enrollment.data.totp.uri,
    };
  }

  async verifyEnrollment(factorId: string, rawCode: string): Promise<void> {
    const code = rawCode.replace(/\s/g, "");
    if (!/^\d{6,8}$/.test(code)) throw new MfaSettingsError("Введите код из 6–8 цифр");
    const verification = await this.client.auth.mfa.challengeAndVerify({ factorId, code });
    if (verification.error)
      throw new MfaSettingsError("Код не принят. Проверьте время на телефоне и повторите.", verification.error);
  }

  async cancelEnrollment(factorId: string): Promise<void> {
    const removal = await this.client.auth.mfa.unenroll({ factorId });
    if (removal.error) throw mapMfaError(removal.error);
  }
}

class DemoMfaSettingsRepository implements MfaSettingsRepository {
  async getStatus() {
    return { configured: true, verifiedFactorId: "demo-totp" };
  }

  async beginEnrollment(): Promise<MfaEnrollment> {
    throw new MfaSettingsError("В демо-режиме MFA уже подтверждена");
  }

  async verifyEnrollment(): Promise<void> {}
  async cancelEnrollment(): Promise<void> {}
}

let repository: MfaSettingsRepository | undefined;

export function getMfaSettingsRepository(): MfaSettingsRepository {
  if (repository) return repository;
  const client = getSupabaseBrowserClient();
  if (client) repository = new SupabaseMfaSettingsRepository(client);
  else if (getPublicRuntimeConfig().authMode === "demo") repository = new DemoMfaSettingsRepository();
  else throw new MfaSettingsError("Сервис авторизации не настроен");
  return repository;
}

function mapMfaError(error: { message?: string }) {
  return new MfaSettingsError(error.message ?? "Не удалось настроить второй фактор", error);
}
