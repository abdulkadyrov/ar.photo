import { describe, expect, it } from "vitest";
import { getRouterBasename } from "./routerBase";

describe("getRouterBasename", () => {
  it("keeps root deployments unscoped", () => {
    expect(getRouterBasename("/")).toBeUndefined();
  });

  it("normalizes a Vite sub-path", () => {
    expect(getRouterBasename("/ar.photo/")).toBe("/ar.photo");
  });
});
