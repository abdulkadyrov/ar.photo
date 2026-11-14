import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AdminRoute } from "./AdminPage";
import { AccountProfileEditor } from "./AdminProfileEditors";
import { getAdminRepository } from "./adminRepository";

vi.mock("../../app/layout/AppShell", () => ({
  AppShell: ({ children, title }: { children: ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}));
vi.mock("./adminRepository", async () => {
  const { createDemoAdminRepository } = await import("./demoAdminRepository");
  const repository = createDemoAdminRepository();
  return { getAdminRepository: () => repository };
});

function BrowserControls() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <button onClick={() => navigate(-1)}>Browser back</button>
      <output data-testid="location">
        {location.pathname}
        {location.search}
      </output>
    </>
  );
}
function mount(initial = "/admin?section=accounts") {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[initial]}>
        <BrowserControls />
        <Routes>
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
function desktop() {
  return within(document.querySelector(".admin-desktop-list") as HTMLElement);
}
function location() {
  return screen.getByTestId("location").textContent ?? "";
}
beforeEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    return (this.hasAttribute("data-admin-focus") ? [new DOMRect(0, 0, 44, 44)] : []) as unknown as DOMRectList;
  });
});

describe("exact administration back navigation", () => {
  it.each(["visible", "browser"])("restores account search and status with %s Back", async (mode) => {
    mount();
    await screen.findByRole("heading", { name: "Управление аккаунтами" });
    fireEvent.click(screen.getByRole("button", { name: /^Приост\./ }));
    fireEvent.change(screen.getByLabelText("Поиск аккаунтов"), { target: { value: "Beta" } });
    fireEvent.click(screen.getByRole("button", { name: "Найти" }));
    await waitFor(() => expect(desktop().queryByText("Alpha Studio")).toBeNull());
    const source = location();
    expect(source).toContain("accountStatus=suspended");
    expect(source).toContain("accountQuery=Beta");
    const openingButton = desktop().getByRole("button", { name: "Открыть аккаунт" });
    openingButton.focus();
    Object.defineProperty(window, "scrollY", { value: 280, writable: true, configurable: true });
    fireEvent.click(openingButton);
    await screen.findByRole("heading", { name: /Beta Studio/ });
    fireEvent.click(screen.getByRole("button", { name: "История" }));
    expect(location()).toContain("accountTab=history");
    fireEvent.click(screen.getByRole("button", { name: mode === "browser" ? "Browser back" : /^Аккаунты$/ }));
    await screen.findByRole("heading", { name: "Управление аккаунтами" });
    expect(location()).toBe(source);
    expect(screen.getByLabelText("Поиск аккаунтов")).toHaveValue("Beta");
    expect(screen.getByRole("button", { name: /^Приост\./ })).toHaveAttribute("aria-pressed", "true");
    expect(desktop().getByText("Beta Studio")).toBeVisible();
    expect(desktop().queryByText("Alpha Studio")).toBeNull();
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({ top: 280, behavior: "instant" }));
    expect(desktop().getByRole("button", { name: "Открыть аккаунт" })).toHaveFocus();
  });
  it.each(["visible", "browser"])("restores selected account and user filters with %s dialog Back", async (mode) => {
    mount(
      "/admin?section=users&account=20000000-0000-4000-8000-000000000001&userRole=editor&userStatus=active&userSearch=Алина",
    );
    await waitFor(() => expect(desktop().getByText("Алина Магомедова")).toBeVisible());
    const source = location();
    fireEvent.click(desktop().getByRole("button", { name: "Открыть" }));
    await screen.findByRole("dialog", { name: "Карточка пользователя" });
    expect(location()).toContain("user=10000000-0000-4000-8000-000000000011");
    fireEvent.click(screen.getByRole("button", { name: mode === "browser" ? "Browser back" : "Отмена" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(location()).toBe(source);
    expect(screen.getByLabelText("Поиск пользователей")).toHaveValue("Алина");
    expect(screen.getByLabelText(/^Роль в аккаунте/)).toHaveValue("editor");
    expect(screen.getByLabelText(/^Статус/)).toHaveValue("active");
    expect(desktop().getByText("Алина Магомедова")).toBeVisible();
  });
  it("restores nested user editor to its detail, then to the exact filtered list", async () => {
    mount("/admin?section=users&account=20000000-0000-4000-8000-000000000001&userRole=editor&userSearch=Алина");
    await waitFor(() => expect(desktop().getByText("Алина Магомедова")).toBeVisible());
    const source = location();
    fireEvent.click(desktop().getByRole("button", { name: "Открыть" }));
    const detail = await screen.findByRole("dialog", { name: "Карточка пользователя" });
    const detailLocation = location();
    fireEvent.click(within(detail).getByRole("button", { name: "Изменить данные" }));
    const editor = await screen.findByRole("dialog", { name: "Редактирование пользователя" });
    expect(location()).toContain("userEdit=");
    fireEvent.click(within(editor).getByRole("button", { name: "Отмена" }));
    await screen.findByRole("dialog", { name: "Карточка пользователя" });
    expect(location()).toBe(detailLocation);
    fireEvent.click(screen.getByRole("button", { name: "Browser back" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(location()).toBe(source);
    expect(screen.getByLabelText("Поиск пользователей")).toHaveValue("Алина");
  });
  it("does not reopen a detail when its late request resolves after browser Back", async () => {
    const repository = getAdminRepository();
    const detail = await repository.getAccountDetail(
      "20000000-0000-4000-8000-000000000001",
      "Подготовка карточки для навигационной проверки",
    );
    let finish!: (value: typeof detail) => void;
    vi.spyOn(repository, "getAccountDetail").mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    mount();
    await screen.findByRole("heading", { name: "Управление аккаунтами" });
    const source = location();
    fireEvent.click(within(desktop().getAllByRole("row")[1]).getByRole("button", { name: "Открыть аккаунт" }));
    await screen.findByText("Открываем аккаунт…");
    fireEvent.click(screen.getByRole("button", { name: "Browser back" }));
    await screen.findByRole("heading", { name: "Управление аккаунтами" });
    await act(async () => finish(detail));
    await waitFor(() => expect(location()).toBe(source));
    expect(screen.queryByRole("heading", { name: /Alpha Studio/ })).toBeNull();
  });
  it("loads a shareable account tab and uses a safe direct-entry list fallback", async () => {
    mount(
      "/admin?section=accounts&accountStatus=suspended&accountSearch=Beta&accountQuery=Beta&account=20000000-0000-4000-8000-000000000002&accountView=detail&accountTab=history",
    );
    await screen.findByRole("heading", { name: /Beta Studio/ });
    expect(screen.getByRole("button", { name: "История" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /^Аккаунты$/ }));
    await screen.findByRole("heading", { name: "Управление аккаунтами" });
    expect(location()).toBe("/admin?section=accounts&accountStatus=suspended&accountSearch=Beta&accountQuery=Beta");
  });
});

describe("account editor cancellation", () => {
  it("does not save dirty fields when cancelling and discarding", async () => {
    const repository = getAdminRepository();
    const detail = await repository.getAccountDetail(
      "20000000-0000-4000-8000-000000000001",
      "Подготовка проверки отмены редактирования",
    );
    const update = vi.spyOn(repository, "updateAccount").mockResolvedValue(undefined);
    const onSaved = vi.fn(async () => {});
    const onCancel = vi.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AccountProfileEditor detail={detail} onCancel={onCancel} onSaved={onSaved} />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("Название аккаунта *"), { target: { value: "Несохранённое название" } });
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    const discard = await screen.findByRole("dialog", { name: "Отменить изменения?" });
    await act(async () => {});
    expect(update).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    fireEvent.click(within(discard).getByRole("button", { name: "Не сохранять" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
