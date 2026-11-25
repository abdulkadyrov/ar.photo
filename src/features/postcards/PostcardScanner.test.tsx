import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostcardScanner } from "./PostcardScanner";
import { startPostcardScanner } from "./postcardScannerCamera";

const mocks = vi.hoisted(() => ({ decode: vi.fn() }));
vi.mock("jsqr", () => ({ default: mocks.decode }));
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let media: ReturnType<typeof vi.fn>;
let stop: ReturnType<typeof vi.fn>;
let stream: MediaStream;
const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, "mediaDevices");

beforeEach(() => {
  frames = new Map();
  nextFrame = 0;
  media = vi.fn();
  stop = vi.fn();
  stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: media } });
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    frames.delete(id);
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
    getImageData: () => ({ data: new Uint8ClampedArray(16), width: 2, height: 2 }),
  } as unknown as CanvasRenderingContext2D);
  mocks.decode.mockReset();
});
afterEach(() => {
  vi.restoreAllMocks();
  if (originalMediaDevices) Object.defineProperty(navigator, "mediaDevices", originalMediaDevices);
  else Reflect.deleteProperty(navigator, "mediaDevices");
});
function video() {
  const target = document.createElement("video");
  Object.defineProperties(target, {
    readyState: { value: HTMLMediaElement.HAVE_CURRENT_DATA },
    videoWidth: { value: 1280 },
    videoHeight: { value: 720 },
  });
  return target;
}
function frame(time: number) {
  const current = [...frames.values()];
  frames.clear();
  for (const callback of current) callback(time);
}

describe("manager postcard camera", () => {
  it("requests permission once under StrictMode's setup/cleanup probe", async () => {
    media.mockResolvedValue(stream);
    const view = render(
      <StrictMode>
        <PostcardScanner onDetected={vi.fn()} onClose={vi.fn()} />
      </StrictMode>,
    );
    await screen.findByText("Держите QR полностью в кадре и дождитесь считывания.");
    expect(media).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(stop).toHaveBeenCalledTimes(1);
  });
  it("requests only the environment camera and stops tracks/frame work on abort", async () => {
    media.mockResolvedValue(stream);
    const abort = new AbortController();
    const target = video();
    await startPostcardScanner(target, { signal: abort.signal, onDetected: vi.fn() });
    expect(media).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: false,
        video: expect.objectContaining({ facingMode: { ideal: "environment" } }),
      }),
    );
    expect(target.srcObject).toBe(stream);
    expect(frames.size).toBe(1);
    abort.abort();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(target.srcObject).toBeNull();
    expect(frames.size).toBe(0);
  });
  it("stops a capture that resolves after the scanner has already closed", async () => {
    let resolveCapture: ((stream: MediaStream) => void) | undefined;
    media.mockImplementation(
      () =>
        new Promise<MediaStream>((resolve) => {
          resolveCapture = resolve;
        }),
    );
    const abort = new AbortController();
    const target = video();
    const pending = startPostcardScanner(target, { signal: abort.signal, onDetected: vi.fn() });
    await waitFor(() => expect(media).toHaveBeenCalledTimes(1));
    abort.abort();
    resolveCapture!(stream);
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });
  it("returns the full decoded URL without navigating or repeating a held QR", async () => {
    media.mockResolvedValue(stream);
    const abort = new AbortController();
    const detected = vi.fn();
    const target = video();
    const full = "https://khanzama.ru/ar.photo/card/1234567890abcdef1234567890abcdef?source=print";
    mocks.decode.mockReturnValue({ data: full });
    await startPostcardScanner(target, { signal: abort.signal, onDetected: detected });
    const before = location.href;
    frame(160);
    frame(320);
    frame(480);
    expect(detected).toHaveBeenCalledTimes(1);
    expect(detected).toHaveBeenCalledWith(full);
    expect(location.href).toBe(before);
    mocks.decode.mockReturnValue(null);
    frame(640);
    frame(1000);
    frame(1400);
    mocks.decode.mockReturnValue({ data: full });
    frame(1600);
    expect(detected).toHaveBeenCalledTimes(2);
    mocks.decode.mockReturnValue({ data: "PC-another-code" });
    frame(1800);
    expect(detected).toHaveBeenLastCalledWith("PC-another-code");
    abort.abort();
  });
  it("stops all tracks if video playback fails", async () => {
    media.mockResolvedValue(stream);
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    await expect(
      startPostcardScanner(video(), { signal: new AbortController().signal, onDetected: vi.fn() }),
    ).rejects.toMatchObject({ name: "NotAllowedError" });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });
  it("shows denied permission with a manual fallback and closes without leaking a camera", async () => {
    media.mockRejectedValue(new DOMException("denied", "NotAllowedError"));
    const onClose = vi.fn();
    render(<PostcardScanner onDetected={vi.fn()} onClose={onClose} />);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Доступ к камере не разрешён"));
    expect(screen.getByRole("alert")).toHaveTextContent("введите номер открытки вручную");
    fireEvent.click(screen.getByRole("button", { name: "Закрыть камеру" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });
  it("cleans up when unmounted and restores the opener focus", async () => {
    media.mockResolvedValue(stream);
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const view = render(<PostcardScanner onDetected={vi.fn()} onClose={vi.fn()} />);
    await screen.findByText("Держите QR полностью в кадре и дождитесь считывания.");
    await act(async () => view.unmount());
    expect(stop).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
    expect(opener).toHaveFocus();
    opener.remove();
  });
  it("handles Escape as close and stops an active stream before unmount", async () => {
    media.mockResolvedValue(stream);
    const onClose = vi.fn();
    render(<PostcardScanner onDetected={vi.fn()} onClose={onClose} />);
    await screen.findByText("Держите QR полностью в кадре и дождитесь считывания.");
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { bubbles: true, cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0);
  });
  it("shows rejected validation inside the modal and counts only accepted cards", async () => {
    media.mockResolvedValue(stream);
    const onDetected = vi.fn((code: string) =>
      code === "wrong"
        ? { accepted: false, message: "Открытка не найдена в выбранном тираже." }
        : { accepted: true, message: "Открытка № 3 добавлена." },
    );
    const view = render(<PostcardScanner onDetected={onDetected} onClose={vi.fn()} />);
    await screen.findByText("Держите QR полностью в кадре и дождитесь считывания.");
    const camera = screen.getByLabelText("Камера для сканирования QR");
    Object.defineProperties(camera, {
      readyState: { value: HTMLMediaElement.HAVE_CURRENT_DATA },
      videoWidth: { value: 1280 },
      videoHeight: { value: 720 },
    });
    mocks.decode.mockReturnValue({ data: "wrong" });
    await act(async () => frame(160));
    expect(screen.getByRole("alert")).toHaveTextContent("Открытка не найдена в выбранном тираже.");
    expect(screen.queryByText(/Добавлено открыток:/)).not.toBeInTheDocument();
    mocks.decode.mockReturnValue({ data: "correct" });
    await act(async () => frame(320));
    expect(screen.getByText("Открытка № 3 добавлена.")).toBeVisible();
    expect(screen.getByText(/Добавлено открыток: 1/)).toBeVisible();
    await act(async () => frame(480));
    expect(onDetected).toHaveBeenCalledTimes(2);
    view.unmount();
  });
  it("ignores validation that resolves after closing the camera", async () => {
    media.mockResolvedValue(stream);
    let accept: ((result: { accepted: boolean; message: string }) => void) | undefined;
    const onDetected = vi.fn(
      () =>
        new Promise<{ accepted: boolean; message: string }>((resolve) => {
          accept = resolve;
        }),
    );
    render(<PostcardScanner onDetected={onDetected} onClose={vi.fn()} />);
    await screen.findByText("Держите QR полностью в кадре и дождитесь считывания.");
    Object.defineProperties(screen.getByLabelText("Камера для сканирования QR"), {
      readyState: { value: HTMLMediaElement.HAVE_CURRENT_DATA },
      videoWidth: { value: 1280 },
      videoHeight: { value: 720 },
    });
    mocks.decode.mockReturnValue({ data: "correct" });
    await act(async () => frame(160));
    fireEvent.click(screen.getByRole("button", { name: "Закрыть камеру" }));
    await act(async () => accept!({ accepted: true, message: "Поздний ответ" }));
    expect(screen.queryByText("Поздний ответ")).not.toBeInTheDocument();
    expect(screen.queryByText(/Добавлено открыток:/)).not.toBeInTheDocument();
  });
});
