import { describe, expect, it } from "vitest";
import { adminAccessSchema, adminAccountDetailSchema, adminReasonSchema } from "./adminSchemas";

describe("admin schemas", () => {
  it("keeps access responses strict", () => {
    expect(adminAccessSchema.parse({ isSuperadmin: true, mfaVerified: true })).toEqual({
      isSuperadmin: true,
      mfaVerified: true,
    });
    expect(() => adminAccessSchema.parse({ isSuperadmin: true, mfaVerified: true, password: "forbidden" })).toThrow();
  });

  it("requires a meaningful administrative reason", () => {
    expect(() => adminReasonSchema.parse("short")).toThrow();
    expect(adminReasonSchema.parse("Обращение клиента SUPPORT-1042")).toBe("Обращение клиента SUPPORT-1042");
  });

  it("rejects password fields in account detail", () => {
    const fixture = {
      account: {
        id: "20000000-0000-4000-8000-000000000001",
        name: "Alpha Studio",
        slug: "alpha-studio",
        status: "active",
        timezone: "Europe/Moscow",
        storageUsedBytes: 0,
        createdAt: "2026-08-03T05:00:00.000Z",
      },
      subscription: {
        id: "40000000-0000-4000-8000-000000000001",
        planId: "00000000-0000-4000-8000-000000000002",
        planCode: "studio",
        planName: "Studio",
        status: "active",
        startsAt: "2026-08-03T05:00:00.000Z",
        expiresAt: null,
        gracePeriodEndsAt: null,
        customLimits: {},
      },
      users: [
        {
          id: "10000000-0000-4000-8000-000000000010",
          fullName: "Иван Иванов",
          emailDisplay: "owner@arphoto.example",
          role: "owner",
          isActive: true,
          acceptedAt: null,
          lastLoginAt: null,
          encryptedPassword: "must-never-pass",
        },
      ],
      usage: { projects: 0, groups: 0, arItems: 0, publishedItems: 0, storageBytes: 0, failedJobs: 0 },
    };
    expect(() => adminAccountDetailSchema.parse(fixture)).toThrow();
  });
});
