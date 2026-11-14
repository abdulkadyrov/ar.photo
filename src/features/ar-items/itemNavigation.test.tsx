import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  captureWorkspaceOrigin,
  readWorkspaceOrigin,
  rememberWorkspaceFocus,
  useWorkspaceBack,
} from "./itemNavigation";

function Page({ name, next, fallback = "/items" }: { name: string; next?: string; fallback?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const back = useWorkspaceBack("account-a", fallback);
  return (
    <main>
      <h1>{name}</h1>
      <output>{location.pathname + location.search + location.hash}</output>
      {next ? (
        <Link
          id={`next-${name}`}
          to={next}
          state={captureWorkspaceOrigin(location, "account-a")}
          onClick={() => rememberWorkspaceFocus(location.key, `next-${name}`)}
        >
          Далее
        </Link>
      ) : null}
      <button onClick={back}>Назад</button>
      <button onClick={() => navigate(-1)}>Системный назад</button>
    </main>
  );
}

describe("workspace back navigation", () => {
  it("restores filter URLs and nested item → QR history in LIFO order", () => {
    render(
      <MemoryRouter initialEntries={["/items?projectId=p1&groupId=g1&q=море&status=published#selected"]}>
        <Routes>
          <Route path="/items" element={<Page name="Работы" next="/items/photo-one" />} />
          <Route path="/items/photo-one" element={<Page name="Работа" next="/items/photo-one/qr" />} />
          <Route path="/items/photo-one/qr" element={<Page name="QR" />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Далее"));
    fireEvent.click(screen.getByText("Далее"));
    fireEvent.click(screen.getByText("Назад"));
    expect(screen.getByRole("heading")).toHaveTextContent("Работа");
    fireEvent.click(screen.getByText("Назад"));
    expect(screen.getByRole("heading")).toHaveTextContent("Работы");
    expect(screen.getByRole("status")).toHaveTextContent(
      "/items?projectId=p1&groupId=g1&q=море&status=published#selected",
    );
  });
  it("restores the same source URL and opener focus after system Back", async () => {
    render(
      <MemoryRouter initialEntries={["/items?q=море&status=published"]}>
        <Routes>
          <Route path="/items" element={<Page name="Работы" next="/items/photo-one" />} />
          <Route path="/items/photo-one" element={<Page name="Работа" />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Далее"));
    fireEvent.click(screen.getByText("Системный назад"));
    expect(screen.getByRole("status")).toHaveTextContent("/items?q=море&status=published");
    await waitFor(() => expect(screen.getByText("Далее")).toHaveFocus());
  });
  it("uses a safe fallback for direct entry instead of leaving the app", () => {
    render(
      <MemoryRouter initialEntries={["/items/photo-one/qr"]}>
        <Routes>
          <Route path="/items/photo-one/qr" element={<Page name="QR" fallback="/items/photo-one" />} />
          <Route path="/items/photo-one" element={<Page name="Работа" />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("Назад"));
    expect(screen.getByRole("heading")).toHaveTextContent("Работа");
  });
  it("rejects external, platform-admin, wrong-account and malformed origins", () => {
    for (const path of [
      "https://evil.test/items",
      "//evil.test/items",
      "/admin",
      "/login",
      "/items/../admin",
      "/items?next=1\\evil",
    ]) {
      expect(
        readWorkspaceOrigin({ workspaceOrigin: { accountId: "account-a", key: "key-a", path } }, "account-a"),
      ).toBeNull();
    }
    expect(
      readWorkspaceOrigin({ workspaceOrigin: { accountId: "account-b", key: "key-a", path: "/items" } }, "account-a"),
    ).toBeNull();
    expect(
      readWorkspaceOrigin({ workspaceOrigin: { accountId: "account-a", path: "/items" } }, "account-a"),
    ).toBeNull();
  });
});
