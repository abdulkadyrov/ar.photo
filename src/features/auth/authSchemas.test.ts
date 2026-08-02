import { describe, expect, it } from "vitest";
import { loginSchema, updatePasswordSchema } from "./authSchemas";

describe("auth schemas", () => {
  it("normalizes a valid login", () => {
    expect(loginSchema.parse({ email: " user@example.com ", password: "password123" }).email).toBe("user@example.com");
  });

  it("rejects weak and mismatched passwords", () => {
    expect(loginSchema.safeParse({ email: "invalid", password: "short" }).success).toBe(false);
    expect(
      updatePasswordSchema.safeParse({ password: "new-password", confirmPassword: "different-password" }).success,
    ).toBe(false);
  });
});
