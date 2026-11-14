import { useEffect } from "react";
import { useLocation, useNavigate, useNavigationType, type Location } from "react-router-dom";

type WorkspaceOrigin = { accountId: string; key: string; path: string };
const focusByEntry = new Map<string, string>();

function ownWorkspacePath(path: string) {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    Array.from(path).some((character) => character.charCodeAt(0) < 32)
  )
    return false;
  try {
    const parsed = new URL(path, "https://workspace.invalid");
    return /^\/(dashboard|analytics|projects|groups|items|qr-codes|create|media)(?:\/[a-zA-Z0-9-]+)*\/?$/.test(
      parsed.pathname,
    );
  } catch {
    return false;
  }
}

export function captureWorkspaceOrigin(
  location: Pick<Location, "pathname" | "search" | "hash" | "key">,
  accountId?: string,
) {
  const path = location.pathname + location.search + location.hash;
  return accountId && ownWorkspacePath(path)
    ? { workspaceOrigin: { accountId, key: location.key, path } satisfies WorkspaceOrigin }
    : {};
}

export function readWorkspaceOrigin(state: unknown, accountId?: string): WorkspaceOrigin | null {
  if (!accountId || typeof state !== "object" || state === null || !("workspaceOrigin" in state)) return null;
  const origin = state.workspaceOrigin;
  if (
    typeof origin !== "object" ||
    origin === null ||
    !("accountId" in origin) ||
    !("key" in origin) ||
    !("path" in origin)
  )
    return null;
  if (
    origin.accountId !== accountId ||
    typeof origin.key !== "string" ||
    !origin.key ||
    typeof origin.path !== "string" ||
    !ownWorkspacePath(origin.path)
  )
    return null;
  return { accountId, key: origin.key, path: origin.path };
}

export function rememberWorkspaceFocus(entryKey: string, elementId: string) {
  focusByEntry.set(entryKey, elementId);
  if (focusByEntry.size > 200) focusByEntry.delete(focusByEntry.keys().next().value!);
}

export function useWorkspaceBack(accountId: string | undefined, fallback: string) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  useEffect(() => {
    const focusId = navigationType === "POP" ? focusByEntry.get(location.key) : undefined;
    if (!focusId) return;
    let frame = 0;
    let attempts = 0;
    const restore = () => {
      const element = document.getElementById(focusId);
      if (element) element.focus({ preventScroll: true });
      else if (++attempts < 60) frame = window.requestAnimationFrame(restore);
    };
    frame = window.requestAnimationFrame(restore);
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, navigationType]);
  return () => {
    const origin = readWorkspaceOrigin(location.state, accountId);
    if (origin && origin.key !== location.key) navigate(-1);
    else navigate(ownWorkspacePath(fallback) ? fallback : "/items", { replace: true });
  };
}
