import { describe, expect, it } from "vitest";
import { batchLimit, retentionDays, secureEqual } from "./cleanup";

describe("analytics retention cleanup", () => {
  it("compares scheduler secrets without an early length exit", () => {
    expect(secureEqual("same-secret", "same-secret")).toBe(true);
    expect(secureEqual("short", "different-secret")).toBe(false);
  });

  it("bounds retention to the supported privacy window", () => {
    expect(retentionDays(undefined)).toBe(365);
    expect(retentionDays("7")).toBe(30);
    expect(retentionDays("900")).toBe(730);
    expect(retentionDays("invalid")).toBe(365);
  });

  it("bounds each deletion batch", () => {
    expect(batchLimit(null)).toBe(5000);
    expect(batchLimit("0")).toBe(1);
    expect(batchLimit("50000")).toBe(10000);
  });
});
