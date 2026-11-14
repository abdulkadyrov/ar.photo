import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrollPositionManager } from "./ScrollPositionManager";

function SearchControls() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <p>
        {location.pathname}
        {location.search}
      </p>
      <button onClick={() => navigate("/qr-codes?selected=work-1", { replace: true })}>Select QR</button>
      <button onClick={() => navigate("/items/work-1")}>Open work</button>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("workspace scroll restoration", () => {
  it("keeps list position when selecting QR through URL state and restores it after a detail visit", async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
    vi.spyOn(window, "scrollTo").mockImplementation((x: number | ScrollToOptions, y?: number) => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        writable: true,
        value: typeof x === "object" ? (x.top ?? 0) : (y ?? 0),
      });
    });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id));
    render(
      <MemoryRouter initialEntries={["/qr-codes"]}>
        <ScrollPositionManager />
        <SearchControls />
      </MemoryRouter>,
    );
    await act(() => vi.runAllTimersAsync());
    act(() => window.scrollTo(0, 240));
    fireEvent.click(screen.getByRole("button", { name: "Select QR" }));
    await act(() => vi.runAllTimersAsync());
    expect(screen.getByText("/qr-codes?selected=work-1")).toBeVisible();
    expect(window.scrollY).toBe(240);
    fireEvent.click(screen.getByRole("button", { name: "Open work" }));
    await act(() => vi.runAllTimersAsync());
    expect(window.scrollY).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await act(() => vi.runAllTimersAsync());
    expect(screen.getByText("/qr-codes?selected=work-1")).toBeVisible();
    expect(window.scrollY).toBe(240);
  });
});
