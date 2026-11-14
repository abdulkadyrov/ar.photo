import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdatePasswordRoute } from "./AuthPages";

const doubles = vi.hoisted(() => ({ updatePassword: vi.fn(), verify: vi.fn(), getStatus: vi.fn() }));
vi.mock("./authContext", () => ({
  useAuth: () => ({ mode: "demo", session: { user: { id: "current-user" } }, updatePassword: doubles.updatePassword }),
}));
vi.mock("../settings/mfaRepository", () => ({
  getMfaSettingsRepository: () => ({ getStatus: doubles.getStatus, verifyEnrollment: doubles.verify }),
}));

describe("password recovery through the dedicated MFA screen", () => {
  beforeEach(() => {
    doubles.updatePassword.mockReset().mockRejectedValueOnce({ code: "insufficient_aal" }).mockResolvedValue(undefined);
    doubles.getStatus.mockReset().mockResolvedValue({ configured: true, verifiedFactorId: "existing-factor" });
    doubles.verify.mockReset().mockResolvedValue(undefined);
  });
  it("keeps the entered password in memory while confirming the real second factor", async () => {
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}
      >
        <MemoryRouter initialEntries={["/update-password"]}>
          <Routes>
            <Route path="/update-password" element={<UpdatePasswordRoute />} />
            <Route path="/dashboard" element={<h1>Кабинет</h1>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("Новый пароль", { exact: true }), { target: { value: "Example123" } });
    fireEvent.change(screen.getByLabelText("Повторите пароль", { exact: true }), { target: { value: "Example123" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить пароль" }));
    fireEvent.click(await screen.findByRole("button", { name: "Подтвердить MFA" }));
    expect(screen.getByRole("button", { name: "Подтвердить" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Код MFA"), { target: { value: "123456" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Подтвердить" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    await waitFor(() => expect(doubles.verify).toHaveBeenCalledWith("existing-factor", "123456"));
    expect(await screen.findByLabelText("Новый пароль", { exact: true })).toHaveValue("Example123");
    expect(screen.getByLabelText("Повторите пароль", { exact: true })).toHaveValue("Example123");
    fireEvent.click(screen.getByRole("button", { name: "Сохранить пароль" }));
    expect(await screen.findByRole("heading", { name: "Кабинет" })).toBeVisible();
    expect(doubles.updatePassword).toHaveBeenNthCalledWith(2, "Example123");
  });
});
