import { describe, expect, it } from "vitest";
import { parseRoute } from "./routes";

describe("legacy route parser", () => {
  it.each([
    ["/", { name: "home" }],
    ["/dashboard", { name: "dashboard" }],
    ["/project/project_123", { name: "project", id: "project_123" }],
    ["/viewer/test", { name: "viewer", id: "test" }],
  ])("parses %s", (pathname, expected) => {
    expect(parseRoute(pathname)).toEqual(expected);
  });
});
