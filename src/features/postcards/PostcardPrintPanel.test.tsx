import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PrintPanel from "./PostcardPrintPanel";
import { MemoryRouter } from "react-router-dom";
function PostcardPrintPanel(props: React.ComponentProps<typeof PrintPanel>) {
  return (
    <MemoryRouter>
      <PrintPanel {...props} />
    </MemoryRouter>
  );
}
import type { PostcardBatch, PostcardCard } from "./postcardModel";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), asset: vi.fn(), zip: vi.fn(), signed: vi.fn() }));
vi.mock("../../shared/api/supabase", () => ({
  getSupabaseBrowserClient: () => ({
    rpc: mocks.rpc,
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ is: () => ({ single: mocks.asset }) }) }) }) }),
  }),
}));
vi.mock("../media/mediaRepository", () => ({ getMediaRepository: () => ({ getAssetUrl: mocks.signed }) }));
vi.mock("./postcardPrint", () => ({ createPostcardZip: mocks.zip }));
const batch: PostcardBatch = {
  id: "batch",
  account_id: "account",
  name: "Тираж",
  template_code: "new-year",
  quantity: 2,
  request_id: "request",
  created_at: "2026-11-27",
};
const cards: PostcardCard[] = [1, 2].map((ordinal) => ({
  id: `card-${ordinal}`,
  account_id: "account",
  batch_id: batch.id,
  ordinal,
  public_token: String(ordinal).repeat(32),
  print_marker_asset_id: `asset-${ordinal}`,
  shop_id: null,
  sold_at: null,
  activated_at: null,
  ar_item_id: null,
  created_at: "2026-11-27",
}));
const onUpdated = vi.fn().mockResolvedValue(undefined);
const props = { accountId: "account", batch, cards, canManage: true, demo: false, onUpdated };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.rpc.mockResolvedValue({ data: { project_id: "project", group_id: "group" }, error: null });
  mocks.asset.mockResolvedValue({ data: { id: "asset" }, error: null });
  mocks.signed.mockResolvedValue("https://media.test/signed-marker");
  mocks.zip.mockResolvedValue(new Blob(["zip-content"], { type: "application/zip" }));
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["canonical-png"]) }));
  URL.createObjectURL = vi.fn(() => "blob:ready-archive");
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("postcard download recovery", () => {
  it("keeps a genuine download link after async preparation and repeats it without rebuilding or re-fetching", async () => {
    const { rerender, unmount } = render(<PostcardPrintPanel {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Скачать PNG в ZIP" }));
    const link = await screen.findByRole("link", { name: "Скачать готовый ZIP" });
    expect(link).toHaveAttribute("href", "blob:ready-archive");
    expect(link).toHaveAttribute("download", "postcards-batch-1.zip");
    expect(screen.getByRole("status")).toHaveTextContent("Если скачивание не началось");
    rerender(<PostcardPrintPanel {...props} cards={cards.map((card) => ({ ...card }))} />);
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(60_001);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    fireEvent.click(link);
    fireEvent.click(link);
    expect(mocks.zip).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:ready-archive");
  });
  it("removes the old download when its range changes rather than saving the wrong cards", async () => {
    render(<PostcardPrintPanel {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Скачать PNG в ZIP" }));
    await screen.findByRole("link", { name: "Скачать готовый ZIP" });
    fireEvent.change(screen.getByLabelText("Количество для печати (1–20)"), { target: { value: "1" } });
    expect(screen.queryByRole("link", { name: "Скачать готовый ZIP" })).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:ready-archive"));
    fireEvent.click(screen.getByRole("button", { name: "Скачать PNG в ZIP" }));
    await screen.findByRole("link", { name: "Скачать готовый ZIP" });
    expect(mocks.zip.mock.calls[1][1]).toHaveLength(1);
  });
  it("shows a recoverable error without a ready link when fetching the canonical image fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
    render(<PostcardPrintPanel {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Скачать PNG в ZIP" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не удалось скачать сохранённую открытку.");
    expect(screen.queryByRole("link", { name: "Скачать готовый ZIP" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Скачать PNG в ZIP" })).toBeEnabled();
  });
});
