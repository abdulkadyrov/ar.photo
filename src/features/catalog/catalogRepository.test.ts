import { describe, expect, it } from "vitest";
import { workspaceEntitlementSchema } from "./catalogRepository";

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
