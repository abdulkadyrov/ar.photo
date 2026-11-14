import { describe, expect, it, vi } from "vitest";
import { SupabaseCatalogRepository, workspaceEntitlementSchema } from "./catalogRepository";

describe("catalog workspace contract", () => {
  it("accepts Postgres timestamptz values with an explicit UTC offset", () => {
    const parsed = workspaceEntitlementSchema.parse({
      accountName: "AR Photo",
      accountStatus: "active",
      memberRole: "owner",
      canWrite: true,
      subscription: {
        status: "trial",
        expiresAt: "2026-08-17T13:54:53.21944+00:00",
      },
    });

    expect(parsed.subscription.expiresAt).toBe("2026-08-17T13:54:53.21944+00:00");
  });

  it("accepts the superadmin role returned for cross-account access", () => {
    const parsed = workspaceEntitlementSchema.parse({
      accountName: "AR Photo",
      accountStatus: "active",
      memberRole: "superadmin",
      canWrite: true,
      subscription: {
        status: "active",
        expiresAt: "2027-08-04T16:11:00+03:00",
      },
    });

    expect(parsed.memberRole).toBe("superadmin");
  });
});

describe("catalog all-account groups", () => {
  it("always scopes all groups to the requested account, even without a project", async () => {
    const rows = [
      { id: "own-a", account_id: "own", project_id: "project-a", deleted_at: null },
      { id: "own-b", account_id: "own", project_id: "project-b", deleted_at: null },
      { id: "deleted", account_id: "own", project_id: "project-b", deleted_at: "2026-11-14" },
      { id: "foreign", account_id: "other", project_id: "project-c", deleted_at: null },
    ];
    const filters: Array<[string, unknown]> = [];
    const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), is: vi.fn(), then: vi.fn() };
    query.select.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.eq.mockImplementation((key: string, value: unknown) => {
      filters.push([key, value]);
      return query;
    });
    query.is.mockImplementation((key: string, value: unknown) => {
      filters.push([key, value]);
      return query;
    });
    query.then.mockImplementation((resolve: (result: unknown) => unknown) =>
      resolve({
        data: rows.filter((row) => filters.every(([key, value]) => row[key as keyof typeof row] === value)),
        error: null,
      }),
    );
    const client = { from: vi.fn().mockReturnValue(query) };
    const repository = new SupabaseCatalogRepository(client as never);
    await expect(repository.listGroups("own")).resolves.toEqual(rows.slice(0, 2));
    expect(query.eq.mock.calls).toEqual([["account_id", "own"]]);
    await expect(repository.listGroups("")).rejects.toMatchObject({ code: "forbidden" });
    expect(client.from).toHaveBeenCalledTimes(1);
  });
});
