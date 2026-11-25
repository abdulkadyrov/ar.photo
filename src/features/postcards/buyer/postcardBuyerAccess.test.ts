import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createEditToken,
  postcardEditLink,
  readEditToken,
  storeEditToken,
  readPendingUploadId,
  rememberPendingUploadId,
  clearPendingUploadId,
} from "./postcardBuyerAccess";

vi.mock("../../../shared/config/env", () => ({
  getPublicRuntimeConfig: () => ({ publicAppUrl: "https://khanzama.ru/ar.photo/" }),
}));
const publicToken = "1".repeat(32);
const editToken = "a".repeat(64);
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  history.replaceState({}, "", "/ar.photo/card/" + publicToken);
});
afterEach(() => vi.restoreAllMocks());
describe("per-card editing capability", () => {
  it("recovers only the matching card/file upload and clears completed recovery state", () => {
    const requestId = "10000000-0000-4000-8000-000000000001";
    rememberPendingUploadId(publicToken, "actual-file-hash-and-metadata", requestId);
    expect(readPendingUploadId(publicToken, "actual-file-hash-and-metadata")).toBe(requestId);
    expect(readPendingUploadId(publicToken, "another-file")).toBeNull();
    expect(readPendingUploadId("2".repeat(32), "actual-file-hash-and-metadata")).toBeNull();
    clearPendingUploadId(publicToken);
    expect(readPendingUploadId(publicToken, "actual-file-hash-and-metadata")).toBeNull();
  });
  it("restores a private fragment, removes it from the address, and keeps other history state", () => {
    history.replaceState(
      { key: "original-history" },
      "",
      `/ar.photo/card/${publicToken}?from=gift#edit=${editToken}&other=kept`,
    );
    expect(readEditToken(publicToken)).toBe(editToken);
    expect(location.hash).toBe("#other=kept");
    expect(location.search).toBe("?from=gift");
    expect(history.state).toEqual({ key: "original-history" });
    expect(readEditToken(publicToken)).toBe(editToken);
    expect(readEditToken("2".repeat(32))).toBeNull();
  });
  it("rejects malformed private links and never saves them", () => {
    history.replaceState({}, "", `/ar.photo/card/${publicToken}#edit=too-short`);
    expect(() => readEditToken(publicToken)).toThrow("повреждена");
    expect(localStorage.length).toBe(0);
  });
  it("requires saving the editing key before a claim can be sent", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(() => createEditToken(publicToken)).toThrow("сохранить доступ");
  });
  it("generates independent 256-bit format editing keys and keeps them card-scoped", () => {
    const first = createEditToken(publicToken);
    const second = createEditToken("2".repeat(32));
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).not.toBe(first);
    expect(readEditToken(publicToken)).toBe(first);
  });
  it("puts editing access only in the fragment of the same canonical card URL", () => {
    storeEditToken(publicToken, editToken);
    const url = new URL(postcardEditLink(publicToken, editToken));
    expect(url.origin + url.pathname).toBe(`https://khanzama.ru/ar.photo/card/${publicToken}`);
    expect(url.search).toBe("");
    expect(url.hash).toBe(`#edit=${editToken}`);
  });
});
