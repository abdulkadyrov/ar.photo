import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArDiagnosticEntryRoute } from "./ArDiagnosticEntryPage";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), start: vi.fn(), scan: vi.fn(), stop: vi.fn() }));
vi.mock("../postcards/buyer/postcardBuyerApi", async (original) => ({
  ...(await original<typeof import("../postcards/buyer/postcardBuyerApi")>()),
  PostcardBuyerApi: class {
    lookup = mocks.lookup;
  },
}));
vi.mock("./qrProjectScanner", () => ({
  startQrCamera: mocks.start,
  waitForQr: mocks.scan,
  stopMediaStream: mocks.stop,
}));
function Destination() {
  return (
    <p data-testid="destination">
      {useLocation().pathname}
      {useLocation().search}
    </p>
  );
}
function mount() {
  return render(
    <MemoryRouter initialEntries={["/diagnostics"]}>
      <Routes>
        <Route path="/diagnostics" element={<ArDiagnosticEntryRoute />} />
        <Route path="/ar/:slug" element={<Destination />} />
      </Routes>
    </MemoryRouter>,
  );
}
const card = "a".repeat(32);
const slug = "b".repeat(36);
function submit() {
  fireEvent.change(screen.getByLabelText("Ссылка на открытку"), {
    target: { value: `${window.location.origin}${import.meta.env.BASE_URL}card/${card}?edit=private` },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Открыть диагностику" }).closest("form")!);
}
beforeEach(() => vi.clearAllMocks());
describe("diagnostic entry", () => {
  it("does not request camera until the explicit scan button is pressed", () => {
    mount();
    expect(mocks.start).not.toHaveBeenCalled();
  });
  it("resolves a published card read-only and drops edit credentials", async () => {
    mocks.lookup.mockResolvedValue({ card: { state: "published", publicSlug: slug } });
    mount();
    submit();
    await waitFor(() => expect(screen.getByTestId("destination")).toHaveTextContent(`/ar/${slug}?diagnostics=1`));
    expect(mocks.lookup).toHaveBeenCalledWith(card, null, expect.any(AbortSignal));
    expect(mocks.start).not.toHaveBeenCalled();
  });
  it("stays on the entry page when a card is not published", async () => {
    mocks.lookup.mockResolvedValue({ card: { state: "processing", publicSlug: null } });
    mount();
    submit();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("уже сохранённым и опубликованным"));
    expect(screen.queryByTestId("destination")).not.toBeInTheDocument();
  });
  it("aborts a pending lookup on cancel", async () => {
    mocks.lookup.mockReturnValue(new Promise(() => undefined));
    mount();
    submit();
    await waitFor(() => expect(mocks.lookup).toHaveBeenCalled());
    const signal = mocks.lookup.mock.calls[0][2] as AbortSignal;
    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(signal.aborted).toBe(true);
    expect(screen.getByRole("button", { name: "Сканировать QR" })).toBeInTheDocument();
  });
});
