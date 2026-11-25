import { getPublicRuntimeConfig } from "../../../shared/config/env";
import { editTokenPattern, publicCardTokenPattern } from "./postcardBuyerApi";

const accessKey = (publicToken: string) => `khanzama-postcard-edit-v1:${publicToken}`;
export function storeEditToken(publicToken: string, editToken: string) {
  if (!publicCardTokenPattern.test(publicToken) || !editTokenPattern.test(editToken))
    throw new Error("Некорректная ссылка управления.");
  try {
    localStorage.setItem(accessKey(publicToken), editToken);
  } catch {
    throw new Error("Не удалось сохранить доступ на устройстве. Разрешите хранилище браузера и повторите.");
  }
  if (localStorage.getItem(accessKey(publicToken)) !== editToken)
    throw new Error("Не удалось сохранить доступ на устройстве. Разрешите хранилище браузера и повторите.");
}
export function readEditToken(publicToken: string): string | null {
  if (!publicCardTokenPattern.test(publicToken)) return null;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const shared = hash.get("edit");
  if (shared) {
    if (!editTokenPattern.test(shared))
      throw new Error("Ссылка управления повреждена. Откройте полную сохранённую ссылку.");
    storeEditToken(publicToken, shared);
    hash.delete("edit");
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search + (hash.size ? `#${hash}` : ""),
    );
    return shared;
  }
  try {
    const value = localStorage.getItem(accessKey(publicToken));
    return value && editTokenPattern.test(value) ? value : null;
  } catch {
    return null;
  }
}
export function createEditToken(publicToken: string) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  storeEditToken(publicToken, token);
  return token;
}
export function postcardEditLink(publicToken: string, editToken: string) {
  if (!publicCardTokenPattern.test(publicToken) || !editTokenPattern.test(editToken))
    throw new Error("Некорректная ссылка управления.");
  const base = getPublicRuntimeConfig().publicAppUrl ?? new URL(import.meta.env.BASE_URL, window.location.origin).href;
  const url = new URL(`card/${publicToken}`, base.endsWith("/") ? base : `${base}/`);
  url.hash = new URLSearchParams({ edit: editToken }).toString();
  return url.href;
}

const pendingKey = (publicToken: string) => `khanzama-postcard-upload-v1:${publicToken}`;
export function readPendingUploadId(publicToken: string, inputKey: string): string | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(pendingKey(publicToken)) ?? "null");
    return value?.inputKey === inputKey &&
      typeof value.requestId === "string" &&
      /^[a-f0-9-]{36}$/.test(value.requestId)
      ? value.requestId
      : null;
  } catch {
    return null;
  }
}
export function rememberPendingUploadId(publicToken: string, inputKey: string, requestId: string) {
  try {
    sessionStorage.setItem(pendingKey(publicToken), JSON.stringify({ inputKey, requestId }));
  } catch {
    /* Current-page retries still retain the request ID in memory. */
  }
}
export function clearPendingUploadId(publicToken: string) {
  try {
    sessionStorage.removeItem(pendingKey(publicToken));
  } catch {
    /* Optional recovery state only. */
  }
}
