export type ServiceWorkerUpdateHandler = (waitingWorker: ServiceWorker) => void;

export function registerServiceWorker(onUpdate: ServiceWorkerUpdateHandler) {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return () => undefined;

  let disposed = false;
  const notifyWaitingWorker = (registration: ServiceWorkerRegistration) => {
    if (!disposed && registration.waiting) onUpdate(registration.waiting);
  };

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
      });
      notifyWaitingWorker(registration);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) notifyWaitingWorker(registration);
        });
      });
      void registration.update();
    } catch {
      // PWA installation/update is progressive enhancement and must not block the app.
    }
  };

  if (document.readyState === "complete") void register();
  else window.addEventListener("load", register, { once: true });

  return () => {
    disposed = true;
    window.removeEventListener("load", register);
  };
}

export function activateServiceWorkerUpdate(worker: ServiceWorker) {
  let reloading = false;
  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    },
    { once: true },
  );
  worker.postMessage({ type: "SKIP_WAITING" });
}
