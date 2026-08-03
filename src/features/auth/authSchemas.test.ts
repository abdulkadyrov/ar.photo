import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, updatePasswordSchema } from "./authSchemas";

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

  it("validates self-service registration details and consent", () => {
    const valid = {
      email: "owner@example.com",
      password: "Strong-password1",
      confirmPassword: "Strong-password1",
      termsAccepted: true,
    };
    expect(registerSchema.parse(valid).email).toBe("owner@example.com");
    expect(registerSchema.safeParse({ ...valid, termsAccepted: false }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, confirmPassword: "different-password" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: "strong-password1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: "Strong-password" }).success).toBe(false);
  });
});
