import { describe, expect, it } from "vitest";
import { createId, slugify } from "./id";

describe("id helpers", () => {
  it("creates prefixed unique ids", () => {
    const first = createId("project");
    const second = createId("project");

    expect(first).toMatch(/^project_[a-f0-9]{14}$/);
    expect(second).not.toBe(first);
  });

  it("creates stable filesystem-safe slugs", () => {
    expect(slugify(" Иванов Иван ")).toBe("иванов_иван");
    expect(slugify(" ")).toBe("student");
  });
});
