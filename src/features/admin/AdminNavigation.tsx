import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

import { AdminNavigationContext, type AdminNavigationPatch, type AdminNavigationOrigin } from "./useAdminNavigation";

export function AdminNavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const origins = useRef(new Map<string, AdminNavigationOrigin>());
  const snapshots = useRef(new Map<string, AdminNavigationOrigin>());
  const params = new URLSearchParams(location.search);
  // BrowserRouter publishes location in a transition. Rapid form events must
  // compose the latest requested URL rather than a previous render's params.
  const latestSearch = useRef(location.search);
  const backInFlight = useRef(false);
  const ownSearches = useRef(new Set<string>());
  useLayoutEffect(() => {
    backInFlight.current = false;
    if (ownSearches.current.has(location.search)) {
      if (latestSearch.current === location.search) ownSearches.current.clear();
    } else {
      latestSearch.current = location.search;
      ownSearches.current.clear();
    }
  }, [location.key, location.search]);
  const read = (key: string) => new URLSearchParams(latestSearch.current).get(key);
  const destination = (patch: AdminNavigationPatch) => {
    const next = new URLSearchParams(latestSearch.current);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    return { pathname: location.pathname, search: next.size ? `?${next.toString()}` : "", hash: location.hash };
  };
  const update = (patch: AdminNavigationPatch) => {
    const next = destination(patch);
    latestSearch.current = next.search;
    ownSearches.current.add(next.search);
    navigate(next, { replace: true, state: location.state });
  };
  const open = (patch: AdminNavigationPatch) => {
    const next = destination(patch);
    if (next.search === latestSearch.current) return;
    const active = document.activeElement;
    const focus = active instanceof HTMLElement ? active.getAttribute("data-admin-focus") : null;
    const origin: AdminNavigationOrigin = {
      key:
        window.location.search === latestSearch.current && typeof window.history.state?.key === "string"
          ? window.history.state.key
          : location.key,
      pathname: location.pathname,
      search: latestSearch.current,
      hash: location.hash,
      scroll: window.scrollY,
      focus,
    };
    const token = crypto.randomUUID();
    origins.current.set(token, origin);
    snapshots.current.set(origin.key, origin);
    latestSearch.current = next.search;
    ownSearches.current.add(next.search);
    navigate(next, { state: { adminOrigin: token } });
  };
  const back = (fallback: AdminNavigationPatch) => {
    if (backInFlight.current) return;
    backInFlight.current = true;
    const token =
      location.state && typeof location.state === "object"
        ? (location.state as { adminOrigin?: unknown }).adminOrigin
        : null;
    const origin = typeof token === "string" ? origins.current.get(token) : undefined;
    // Only entries created by this mounted, role-scoped workspace are trusted.
    // A copied URL or refresh has no provenance and uses a safe local fallback.
    if (origin && origin.pathname === location.pathname) navigate(-1);
    else {
      const next = destination(fallback);
      latestSearch.current = next.search;
      ownSearches.current.add(next.search);
      navigate(next, { replace: true, state: null });
    }
  };
  useLayoutEffect(() => {
    if (navigationType !== "POP") return;
    const snapshot = snapshots.current.get(location.key);
    if (
      !snapshot ||
      snapshot.pathname !== location.pathname ||
      snapshot.search !== location.search ||
      snapshot.hash !== location.hash
    )
      return;
    let frame = 0;
    let restored = false;
    const restore = () => {
      if (restored || !document.querySelector(".admin-workspace .admin-page")) return;
      restored = true;
      observer.disconnect();
      frame = requestAnimationFrame(() => {
        if (snapshot.focus) {
          const target = Array.from(document.querySelectorAll<HTMLElement>("[data-admin-focus]")).find(
            (element) =>
              element.getAttribute("data-admin-focus") === snapshot.focus && element.getClientRects().length > 0,
          );
          target?.focus({ preventScroll: true });
        }
        window.scrollTo({ top: snapshot.scroll, behavior: "instant" });
      });
    };
    // The origin query may have left the cache while a detail was open. Wait for
    // the real source screen rather than scrolling the short loading skeleton.
    const observer = new MutationObserver(restore);
    observer.observe(document.body, { childList: true, subtree: true });
    restore();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [location.key, location.pathname, location.search, location.hash, navigationType]);

  return (
    <AdminNavigationContext.Provider value={{ params, read, update, open, back }}>
      {children}
    </AdminNavigationContext.Provider>
  );
}
