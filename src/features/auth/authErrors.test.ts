import { describe, expect, it } from "vitest";
import { getSignUpErrorMessage } from "./authErrors";

describe("signup error messages", () => {
  it("explains password policy failures", () => {
    expect(getSignUpErrorMessage({ code: "weak_password" })).toContain("заглавная");
  });

  it("explains duplicate accounts and rate limits without exposing backend details", () => {
    expect(getSignUpErrorMessage({ code: "user_already_exists" })).toContain("уже существует");
    expect(getSignUpErrorMessage({ code: "over_request_rate_limit" })).toContain("несколько минут");
    expect(getSignUpErrorMessage(new Error("sensitive backend detail"))).not.toContain("sensitive");
  });
});
