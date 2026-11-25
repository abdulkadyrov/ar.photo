/**
 * Imported before BrowserRouter mounts: native window POP listeners run in registration
 * order in Chromium. The buyer must be able to suppress a POP before Router unmounts it.
 * No active buyer means this dispatcher leaves all history behavior untouched.
 */
let activeBuyer: ((event: PopStateEvent) => void) | null = null;
const dispatchBuyerPop = (event: PopStateEvent) => activeBuyer?.(event);
window.addEventListener("popstate", dispatchBuyerPop, true);

export function registerBuyerHistoryGuard(handler: (event: PopStateEvent) => void) {
  activeBuyer = handler;
  return () => {
    if (activeBuyer === handler) activeBuyer = null;
  };
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    activeBuyer = null;
    window.removeEventListener("popstate", dispatchBuyerPop, true);
  });
}
