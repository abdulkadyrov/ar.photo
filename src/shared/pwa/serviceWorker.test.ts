import { afterEach, describe, expect, it, vi } from "vitest";
import { activateServiceWorkerUpdate, registerServiceWorker } from "./serviceWorker";

describe("service worker update boundary", () => {
  afterEach(() => vi.restoreAllMocks());

  it("does not register a service worker outside production", () => {
    const register = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { register } });
    registerServiceWorker(vi.fn());
    expect(register).not.toHaveBeenCalled();
  });

  it("activates only the explicitly selected waiting worker", () => {
    const postMessage = vi.fn();
    const addEventListener = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { addEventListener } });
    activateServiceWorkerUpdate({ postMessage } as unknown as ServiceWorker);
    expect(addEventListener).toHaveBeenCalledWith("controllerchange", expect.any(Function), { once: true });
    expect(postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });
});
