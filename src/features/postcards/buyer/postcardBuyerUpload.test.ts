import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadSignedBlob } from "./postcardBuyerApi";

class FakeUploadRequest {
  static last: FakeUploadRequest;
  status = 200;
  timeout = 0;
  headers: Record<string, string> = {};
  upload = {
    onprogress: null as ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onabort: (() => void) | null = null;
  open = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => this.onabort?.());
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  constructor() {
    FakeUploadRequest.last = this;
  }
}
afterEach(() => vi.unstubAllGlobals());
describe("bounded video PUT", () => {
  it("sends exact video bytes with scoped headers and reports measured progress", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeUploadRequest);
    const progress = vi.fn();
    const abort = new AbortController();
    const blob = new Blob(["test"], { type: "video/mp4" });
    const done = uploadSignedBlob(
      "https://khanzama.ru/functions/v1/postcard-buyer/upload/card/upload",
      blob,
      progress,
      abort.signal,
      { apikey: "public", "x-postcard-edit-token": "private-edit" },
    );
    const request = FakeUploadRequest.last;
    expect(request.open).toHaveBeenCalledWith(
      "PUT",
      "https://khanzama.ru/functions/v1/postcard-buyer/upload/card/upload",
    );
    expect(request.headers).toEqual({
      "content-type": "video/mp4",
      apikey: "public",
      "x-postcard-edit-token": "private-edit",
    });
    expect(request.send).toHaveBeenCalledWith(blob);
    request.upload.onprogress?.({ lengthComputable: true, loaded: 2, total: 4 });
    expect(progress).toHaveBeenLastCalledWith(50);
    request.onload?.();
    await done;
    expect(progress).toHaveBeenLastCalledWith(100);
  });
  it("fails a partial/server-rejected upload and aborts when its page unmounts", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeUploadRequest);
    const abort = new AbortController();
    const rejected = uploadSignedBlob("https://khanzama.ru/upload", new Blob(["test"]), vi.fn(), abort.signal);
    FakeUploadRequest.last.status = 413;
    FakeUploadRequest.last.onload?.();
    await expect(rejected).rejects.toMatchObject({ code: "upload_failed" });
    const cancelled = uploadSignedBlob("https://khanzama.ru/upload", new Blob(["test"]), vi.fn(), abort.signal);
    abort.abort();
    await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
    expect(FakeUploadRequest.last.abort).toHaveBeenCalled();
  });
});
