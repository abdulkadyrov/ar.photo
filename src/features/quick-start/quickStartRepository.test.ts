import { describe, expect, it } from "vitest";
import { parseQuickStartWorkspace } from "./quickStartRepository";

describe("quick-start workspace contract", () => {
  it("accepts only the hidden workspace identifiers needed by the upload pipeline", () => {
    const payload = {
      accountId: "00000000-0000-4000-8000-000000000001",
      projectId: "00000000-0000-4000-8000-000000000002",
      groupId: "00000000-0000-4000-8000-000000000003",
    };
    expect(parseQuickStartWorkspace(payload)).toEqual(payload);
    expect(() => parseQuickStartWorkspace({ ...payload, groupId: "not-a-uuid" })).toThrow();
  });
});
