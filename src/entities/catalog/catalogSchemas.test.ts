import { describe, expect, it } from "vitest";
import { groupFormSchema, projectFormSchema, projectListParamsSchema } from "./catalogSchemas";

describe("catalog schemas", () => {
  it("trims valid project input", () => {
    expect(
      projectFormSchema.parse({ name: "  Выпускной 2027  ", description: "  Школа №25  ", category: "graduation" }),
    ).toEqual({ name: "Выпускной 2027", description: "Школа №25", category: "graduation" });
  });

  it("rejects blank and oversized catalog names", () => {
    expect(projectFormSchema.safeParse({ name: " ", description: "", category: "other" }).success).toBe(false);
    expect(groupFormSchema.safeParse({ name: "x".repeat(161), description: "" }).success).toBe(false);
  });

  it("caps pagination input", () => {
    expect(
      projectListParamsSchema.safeParse({ search: "", filter: "all", sort: "name_asc", page: 1, pageSize: 101 })
        .success,
    ).toBe(false);
  });
});
