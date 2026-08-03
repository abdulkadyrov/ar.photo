export type BillingAvailability =
  { status: "not_configured"; message: string } | { status: "available"; portalUrl: string };

export interface BillingProvider {
  getAvailability(accountId: string): Promise<BillingAvailability>;
}

class UnconfiguredBillingProvider implements BillingProvider {
  async getAvailability(accountId: string): Promise<BillingAvailability> {
    void accountId;
    return {
      status: "not_configured",
      message: "Продление пока выполняет администратор AR Photo. Данные карты в приложении не запрашиваются.",
    };
  }
}

let provider: BillingProvider = new UnconfiguredBillingProvider();

export function getBillingProvider() {
  return provider;
}

export function setBillingProviderForTests(nextProvider?: BillingProvider) {
  provider = nextProvider ?? new UnconfiguredBillingProvider();
}
