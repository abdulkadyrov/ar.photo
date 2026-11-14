import { describe, expect, it, vi } from "vitest";
import { SettingsError, SupabaseSettingsRepository } from "./settingsRepository";

const accountId = "20000000-0000-4000-8000-000000000001";
const input = {
  name: "  Моя студия  ",
  description: "  Живые фотографии  ",
  notifications: { projects: true, team: false, news: false },
};

function createClient(responses: unknown[]) {
  const terminal = vi.fn();
  const query = { select: vi.fn(), eq: vi.fn(), update: vi.fn(), single: terminal, maybeSingle: terminal };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.update.mockReturnValue(query);
  for (const response of responses) query.single.mockResolvedValueOnce(response);
  return { from: vi.fn().mockReturnValue(query), query };
}

describe("account settings repository", () => {
  it("saves only permitted account fields while preserving unrelated settings", async () => {
    const client = createClient([
      {
        data: {
          updated_at: "2026-11-14T10:00:00.000Z",
          settings: { tracking: { mode: "preserve" }, workspace_profile: { futureSetting: true } },
        },
        error: null,
      },
      {
        data: {
          name: "Моя студия",
          settings: { workspace_profile: { description: "Живые фотографии", notifications: input.notifications } },
        },
        error: null,
      },
    ]);
    const repository = new SupabaseSettingsRepository(client as never);
    await expect(repository.updateAccountSettings(accountId, input)).resolves.toEqual({
      name: "Моя студия",
      description: "Живые фотографии",
      notifications: input.notifications,
    });
    expect(client.query.update).toHaveBeenCalledWith({
      name: "Моя студия",
      settings: {
        tracking: { mode: "preserve" },
        workspace_profile: { futureSetting: true, description: "Живые фотографии", notifications: input.notifications },
      },
    });
    expect(client.query.eq.mock.calls).toEqual([
      ["id", accountId],
      ["id", accountId],
      ["updated_at", "2026-11-14T10:00:00.000Z"],
    ]);
  });

  it("reports a concurrent account update instead of overwriting it or retrying blindly", async () => {
    const client = createClient([
      { data: { settings: { external: "before" }, updated_at: "2026-11-14T10:00:00.000Z" }, error: null },
      { data: null, error: null },
    ]);
    const repository = new SupabaseSettingsRepository(client as never);
    await expect(repository.updateAccountSettings(accountId, input)).rejects.toMatchObject({ code: "conflict" });
    expect(client.query.eq).toHaveBeenCalledWith("updated_at", "2026-11-14T10:00:00.000Z");
    expect(client.query.update).toHaveBeenCalledTimes(1);
  });

  it("does not attempt an update when the account is forbidden", async () => {
    const client = createClient([{ data: null, error: { code: "42501", message: "forbidden" } }]);
    const repository = new SupabaseSettingsRepository(client as never);
    await expect(repository.updateAccountSettings(accountId, input)).rejects.toBeInstanceOf(SettingsError);
    expect(client.query.update).not.toHaveBeenCalled();
  });

  it("rejects invalid input before accessing account data", async () => {
    const client = createClient([]);
    const repository = new SupabaseSettingsRepository(client as never);
    await expect(repository.updateAccountSettings(accountId, { ...input, name: "   " })).rejects.toThrow();
    expect(client.from).not.toHaveBeenCalled();
  });
});
