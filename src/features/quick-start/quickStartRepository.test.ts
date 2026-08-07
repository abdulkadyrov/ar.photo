import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPendingQuickStart,
  getPendingQuickStart,
  parseQuickStartWorkspace,
  savePendingQuickStart,
} from "./quickStartRepository";

const pending = {
  userId: "00000000-0000-4000-8000-000000000010",
  accountId: "00000000-0000-4000-8000-000000000001",
  projectId: "00000000-0000-4000-8000-000000000002",
  groupId: "00000000-0000-4000-8000-000000000003",
  itemId: "00000000-0000-4000-8000-000000000004",
  title: "Тестовое AR-фото",
  startedAt: 1_786_000_000_000,
};

describe("quick-start workspace contract", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        key: (index: number) => [...values.keys()][index] ?? null,
        get length() {
          return values.size;
        },
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      } satisfies Storage,
    });
  });

  it("accepts only the hidden workspace identifiers needed by the upload pipeline", () => {
    const payload = {
      accountId: "00000000-0000-4000-8000-000000000001",
      projectId: "00000000-0000-4000-8000-000000000002",
      groupId: "00000000-0000-4000-8000-000000000003",
    };
    expect(parseQuickStartWorkspace(payload)).toEqual(payload);
    expect(() => parseQuickStartWorkspace({ ...payload, groupId: "not-a-uuid" })).toThrow();
  });

  it("restores a processing attempt after a PWA reload or a new login", () => {
    savePendingQuickStart(pending);
    expect(getPendingQuickStart(pending.userId)).toEqual(pending);

    clearPendingQuickStart(pending.userId);
    expect(getPendingQuickStart(pending.userId)).toBeNull();
  });

  it("isolates pending attempts by user and removes corrupt state", () => {
    savePendingQuickStart(pending);
    expect(getPendingQuickStart("another-user")).toBeNull();

    window.localStorage.setItem(`ar-photo-quick-start-pending-v1:${pending.userId}`, "not-json");
    expect(getPendingQuickStart(pending.userId)).toBeNull();
    expect(window.localStorage.length).toBe(0);
  });
});
