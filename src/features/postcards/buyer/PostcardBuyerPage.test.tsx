import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostcardBuyerPage } from "./PostcardBuyerPage";
import type { BuyerSnapshot } from "./postcardBuyerApi";

const mocks = vi.hoisted(() => ({
  clearPreviewCache: vi.fn(),
  lookup: vi.fn(),
  claim: vi.fn(),
  state: vi.fn(),
  upload: vi.fn(),
  completeUpload: vi.fn(),
  publish: vi.fn(),
  put: vi.fn(),
  inspect: vi.fn(),
}));
vi.mock("./postcardBuyerApi", async (original) => ({
  ...(await original<typeof import("./postcardBuyerApi")>()),
  PostcardBuyerApi: class {
    clearPreviewCache = mocks.clearPreviewCache;
    lookup = mocks.lookup;
    claim = mocks.claim;
    state = mocks.state;
    upload = mocks.upload;
    completeUpload = mocks.completeUpload;
    publish = mocks.publish;
  },
  uploadSignedBlob: mocks.put,
}));
vi.mock("./postcardBuyerMedia", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./postcardBuyerMedia")>()),
  inspectBuyerVideo: mocks.inspect,
  compressBuyerVideo: async (file: File) => file,
}));
const publicToken = "1234567890abcdef1234567890abcdef";
const editToken = "a".repeat(64);
const available: BuyerSnapshot = {
  card: {
    publicToken,
    templateCode: "eid",
    title: "Ид мубарак!",
    state: "available",
    mode: "frame",
    frame: { x: 0.1, y: 0.3, width: 0.8, height: 0.4 },
    publicSlug: null,
  },
  limits: { maxVideoBytes: 100 * 1024 * 1024, maxVideoSeconds: 120 },
  owned: false,
};
const withState = (state: BuyerSnapshot["card"]["state"], owned = true): BuyerSnapshot => ({
  ...available,
  card: { ...available.card, state, publicSlug: state === "published" ? "c".repeat(36) : null },
  owned,
  videoPreviewUrl:
    state === "ready" || state === "published"
      ? "https://khanzama.ru/storage/v1/object/sign/videos-private/preview.mp4?token=test"
      : null,
});
function open(token = publicToken) {
  return render(
    <MemoryRouter initialEntries={[`/card/${token}`]}>
      <Routes>
        <Route path="/card/:token" element={<PostcardBuyerPage publicToken={token} />} />
        <Route path="/ar/:slug" element={<h1>Просмотр подарка</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  history.replaceState({}, "", "/");
  mocks.lookup.mockResolvedValue(available);
  mocks.state.mockResolvedValue(withState("claimed"));
  mocks.inspect.mockResolvedValue({
    name: "gift.mp4",
    mimeType: "video/mp4",
    sizeBytes: 4,
    width: 1920,
    height: 1080,
    durationSeconds: 10,
    sha256: "d".repeat(64),
  });
  mocks.put.mockResolvedValue(undefined);
  mocks.upload.mockResolvedValue({
    uploadId: "10000000-0000-4000-8000-000000000001",
    video: { signedUrl: "https://khanzama.ru/storage/v1/object/upload/sign/videos-private/test?token=example" },
  });
  mocks.completeUpload.mockResolvedValue({
    ...withState("processing"),
    jobs: [{ stage: "video_transcode", status: "queued", progress: 0 }],
  });
  URL.createObjectURL = vi.fn(() => "blob:postcard-preview");
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => vi.restoreAllMocks());
describe("public postcard buyer journey", () => {
  it("requires four numeric digits and keeps leading zeros", async () => {
    open();
    const input = await screen.findByLabelText("Код с вкладыша");
    expect(input).toHaveAttribute("inputmode", "numeric");
    fireEvent.change(input, { target: { value: "004" } });
    expect(screen.getByRole("button", { name: "Активировать открытку" })).toBeDisabled();
    expect(mocks.claim).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "0042" } });
    expect(input).toHaveValue("0042");
    expect(screen.getByRole("button", { name: "Активировать открытку" })).toBeEnabled();
    expect(screen.queryByText(available.card.title, { exact: true })).not.toBeInTheDocument();
  });
  it("still accepts a legacy printed code", async () => {
    open();
    fireEvent.change(await screen.findByLabelText("Код с вкладыша"), { target: { value: "ABCDEF123456" } });
    expect(screen.getByRole("button", { name: "Активировать открытку" })).toBeEnabled();
  });
  it("shows an activation form without studio sign-in or navigation", async () => {
    open();
    expect(await screen.findByRole("heading", { name: "Активируйте открытку" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Войти" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
  it("saves editing access before claiming, then clears the shop code", async () => {
    mocks.claim.mockImplementation(async (_card, _code, token) => {
      expect(localStorage.getItem(`khanzama-postcard-edit-v1:${publicToken}`)).toBe(token);
      return withState("claimed");
    });
    open();
    fireEvent.change(await screen.findByLabelText("Код с вкладыша"), { target: { value: "0042" } });
    fireEvent.click(screen.getByRole("button", { name: "Активировать открытку" }));
    await screen.findByRole("heading", { name: "Выберите видео" });
    expect(mocks.claim).toHaveBeenCalledWith(
      publicToken,
      "0042",
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(AbortSignal),
    );
    expect(Object.values(localStorage)).not.toContain("0042");
    fireEvent.click(screen.getByText("Сохранить доступ к видео", { exact: true }));
    expect(screen.getByRole("button", { name: "Скопировать личную ссылку" })).toBeVisible();
  });
  it("opens the viewer directly for a published gift without editing access", async () => {
    mocks.lookup.mockResolvedValue(withState("published", false));
    open();
    expect(await screen.findByRole("heading", { name: "Просмотр подарка" })).toBeVisible();
    expect(mocks.claim).not.toHaveBeenCalled();
  });
  it("never asks another person to overwrite a claimed card using a shop code", async () => {
    mocks.lookup.mockResolvedValue(withState("claimed", false));
    open();
    expect(await screen.findByRole("heading", { name: "Открытка уже закреплена" })).toBeVisible();
    expect(screen.queryByLabelText("Код с вкладыша")).not.toBeInTheDocument();
  });
  it("publishes only after the owner explicitly confirms the ready preview", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("ready"));
    mocks.publish.mockResolvedValue(withState("published"));
    open();
    await screen.findByRole("heading", { name: "Готово к сохранению" });
    expect(mocks.publish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Сохранить открытку" }));
    expect(await screen.findByRole("heading", { name: "Ваш подарок готов" })).toBeVisible();
    expect(mocks.publish).toHaveBeenCalledWith(publicToken, editToken, expect.any(AbortSignal));
  });
  it("does not publish a different frame selection before uploading that version", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("ready"));
    open();
    await screen.findByRole("heading", { name: "Готово к сохранению" });
    fireEvent.click(screen.getByText("Изменить видео", { exact: true }));
    fireEvent.click(screen.getByRole("radio", { name: /На всю открытку/ }));
    expect(screen.getByRole("button", { name: "Сохранить открытку" })).toBeDisabled();
    expect(mocks.publish).not.toHaveBeenCalled();
  });
  it("requires an available video preview before publishing a ready gift", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue({ ...withState("ready"), videoPreviewUrl: null });
    open();
    await screen.findByRole("heading", { name: "Готово к сохранению" });
    expect(screen.getByRole("button", { name: "Сохранить открытку" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Предпросмотр видео временно недоступен");
    expect(mocks.publish).not.toHaveBeenCalled();
  });
  it("blocks publication when a signed preview expires or cannot be loaded", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("ready"));
    open();
    await screen.findByRole("heading", { name: "Готово к сохранению" });
    fireEvent.error(screen.getByLabelText("Предпросмотр вашего видео"));
    expect(screen.getByRole("button", { name: "Сохранить открытку" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Предпросмотр видео временно недоступен");
    expect(screen.getByRole("button", { name: "Обновить состояние" })).toBeEnabled();
  });
  it("handles a damaged physical-card URL without sending API requests", async () => {
    open("wrong-token");
    expect(await screen.findByRole("alert")).toHaveTextContent("повреждена");
    expect(mocks.lookup).not.toHaveBeenCalled();
  });
  it("keeps claim input after a network failure for a safe retry", async () => {
    mocks.claim.mockRejectedValue(new Error("Соединение прервано"));
    open();
    fireEvent.change(await screen.findByLabelText("Код с вкладыша"), { target: { value: "0042" } });
    fireEvent.click(screen.getByRole("button", { name: "Активировать открытку" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Соединение прервано"));
    expect(screen.getByLabelText("Код с вкладыша")).toHaveValue("0042");
    expect(screen.getByRole("button", { name: "Активировать открытку" })).toBeEnabled();
  });
  it("uploads only video, polls processing and waits for explicit publication", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("claimed"));
    mocks.state.mockResolvedValue(withState("ready"));
    mocks.publish.mockResolvedValue(withState("published"));
    open();
    const input = await screen.findByLabelText("Выбрать видео для открытки");
    fireEvent.change(input, { target: { files: [new File(["test"], "gift.mp4", { type: "video/mp4" })] } });
    await screen.findByText("gift.mp4");
    fireEvent.click(screen.getByRole("button", { name: "Загрузить видео" }));
    await screen.findByRole("heading", { name: "Подготавливаем подарок" });
    expect(mocks.upload).toHaveBeenCalledWith(
      publicToken,
      editToken,
      expect.any(String),
      "frame",
      expect.objectContaining({ sha256: "d".repeat(64) }),
      expect.any(AbortSignal),
    );
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(mocks.completeUpload).toHaveBeenCalledWith(
      publicToken,
      editToken,
      "10000000-0000-4000-8000-000000000001",
      expect.any(AbortSignal),
    );
    expect(mocks.publish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Обновить состояние" }));
    await screen.findByRole("heading", { name: "Готово к сохранению" });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить открытку" }));
    await screen.findByRole("heading", { name: "Ваш подарок готов" });
    expect(screen.getByRole("link", { name: "Посмотреть подарок" })).toHaveAttribute("href", `/ar/${"c".repeat(36)}`);
  });
  it("reuses the request ID on interrupted upload and does not create a second registration", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("claimed"));
    mocks.put.mockRejectedValueOnce(new Error("Загрузка прервана")).mockResolvedValueOnce(undefined);
    open();
    fireEvent.change(await screen.findByLabelText("Выбрать видео для открытки"), {
      target: { files: [new File(["test"], "gift.mp4", { type: "video/mp4" })] },
    });
    await screen.findByText("gift.mp4");
    fireEvent.click(screen.getByRole("button", { name: "Загрузить видео" }));
    await screen.findByText("Загрузка прервана");
    fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
    await screen.findByRole("heading", { name: "Подготавливаем подарок" });
    expect(mocks.upload).toHaveBeenCalledTimes(2);
    expect(mocks.upload.mock.calls[0][2]).toBe(mocks.upload.mock.calls[1][2]);
  });
  it("retries completion without re-uploading a file whose PUT already succeeded", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("claimed"));
    mocks.completeUpload
      .mockRejectedValueOnce(new Error("Ответ не получен"))
      .mockResolvedValueOnce(withState("processing"));
    open();
    fireEvent.change(await screen.findByLabelText("Выбрать видео для открытки"), {
      target: { files: [new File(["test"], "gift.mp4", { type: "video/mp4" })] },
    });
    await screen.findByText("gift.mp4");
    fireEvent.click(screen.getByRole("button", { name: "Загрузить видео" }));
    await screen.findByText("Ответ не получен");
    fireEvent.click(screen.getByRole("button", { name: "Повторить загрузку" }));
    await screen.findByRole("heading", { name: "Подготавливаем подарок" });
    expect(mocks.put).toHaveBeenCalledTimes(1);
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(mocks.completeUpload).toHaveBeenCalledTimes(2);
  });
  it("requires confirmation before replacing a published gift", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("published"));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    open();
    fireEvent.change(await screen.findByLabelText("Выбрать видео для открытки"), {
      target: { files: [new File(["test"], "gift.mp4", { type: "video/mp4" })] },
    });
    await screen.findByText("gift.mp4");
    fireEvent.click(screen.getByRole("button", { name: "Заменить видео" }));
    expect(confirm).toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
    confirm.mockRestore();
  });
  it("cancels browser Back without losing the selected File, frame choice or history entry", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("claimed"));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    openInBrowserHistory();
    const file = new File(["test"], "gift.mp4", { type: "video/mp4" });
    fireEvent.change(await screen.findByLabelText("Выбрать видео для открытки"), { target: { files: [file] } });
    await screen.findByText("gift.mp4");
    fireEvent.click(screen.getByRole("radio", { name: /На всю открытку/ }));
    await act(async () => history.back());
    await waitFor(() => {
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(location.pathname).toBe(`/card/${publicToken}`);
    });
    expect(history.state).toMatchObject({ idx: 1, key: "buyer-entry" });
    expect(screen.getByRole("radio", { name: /На всю открытку/ })).toBeChecked();
    expect(screen.getByText("gift.mp4")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Загрузить видео" }));
    await screen.findByRole("heading", { name: "Подготавливаем подарок" });
    expect(mocks.upload.mock.calls[0][3]).toBe("full");
    expect(mocks.inspect).toHaveBeenCalledTimes(1);
    expect(mocks.inspect.mock.calls[0][0]).toBe(file);
  });
  it("keeps an in-flight upload on cancelled Back and aborts only after confirmed departure", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("claimed"));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    mocks.put.mockImplementation(
      (_url, _file, _progress, signal: AbortSignal) =>
        new Promise<void>((_resolve, reject) =>
          signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }),
        ),
    );
    openInBrowserHistory();
    fireEvent.change(await screen.findByLabelText("Выбрать видео для открытки"), {
      target: { files: [new File(["test"], "gift.mp4", { type: "video/mp4" })] },
    });
    await screen.findByText("gift.mp4");
    fireEvent.click(screen.getByRole("button", { name: "Загрузить видео" }));
    await waitFor(() => expect(mocks.put).toHaveBeenCalledTimes(1));
    const signal = mocks.put.mock.calls[0][3] as AbortSignal;
    await act(async () => history.back());
    await waitFor(() => {
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(location.pathname).toBe(`/card/${publicToken}`);
    });
    expect(signal.aborted).toBe(false);
    expect(screen.getByText("gift.mp4")).toBeVisible();
    confirm.mockReturnValue(true);
    await act(async () => history.back());
    await screen.findByRole("heading", { name: "Предыдущая страница" });
    expect(signal.aborted).toBe(true);
    expect(mocks.completeUpload).not.toHaveBeenCalled();
  });
  it("applies the same File-preserving confirmation to browser Forward", async () => {
    localStorage.setItem(`khanzama-postcard-edit-v1:${publicToken}`, editToken);
    mocks.lookup.mockResolvedValue(withState("claimed"));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    history.replaceState({ idx: 0, key: "origin-entry" }, "", "/origin");
    history.pushState({ idx: 1, key: "buyer-entry" }, "", `/card/${publicToken}`);
    history.pushState({ idx: 2, key: "next-entry" }, "", "/next");
    await act(async () => history.back());
    await waitFor(() => expect(location.pathname).toBe(`/card/${publicToken}`));
    renderBrowserHistory();
    fireEvent.change(await screen.findByLabelText("Выбрать видео для открытки"), {
      target: { files: [new File(["test"], "gift.mp4", { type: "video/mp4" })] },
    });
    await screen.findByText("gift.mp4");
    await act(async () => history.forward());
    await waitFor(() => {
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(location.pathname).toBe(`/card/${publicToken}`);
    });
    expect(screen.getByText("gift.mp4")).toBeVisible();
    expect(history.state).toMatchObject({ idx: 1, key: "buyer-entry" });
    confirm.mockReturnValue(true);
    await act(async () => history.forward());
    await screen.findByRole("heading", { name: "Следующая страница" });
  });
});

function openInBrowserHistory() {
  history.replaceState({ idx: 0, key: "origin-entry" }, "", "/origin");
  history.pushState({ idx: 1, key: "buyer-entry" }, "", `/card/${publicToken}`);
  return renderBrowserHistory();
}
function renderBrowserHistory() {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/card/:token" element={<PostcardBuyerPage publicToken={publicToken} />} />
        <Route path="/origin" element={<h1>Предыдущая страница</h1>} />
        <Route path="/next" element={<h1>Следующая страница</h1>} />
      </Routes>
    </BrowserRouter>,
  );
}
