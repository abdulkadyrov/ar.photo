import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoAuthAdapter } from "./authAdapter";

describe("demo auth adapter", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        key: (index: number) => [...values.keys()][index] ?? null,
        get length() {
          return values.size;
        },
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      } satisfies Storage,
    });
  });

  it("persists session changes and clears them on logout", async () => {
    const adapter = new DemoAuthAdapter();
    const listener = vi.fn();
    const unsubscribe = adapter.onAuthStateChange(listener);

    expect(await adapter.getSession()).toBeNull();

    await adapter.signIn("User@Example.com", "demo-password");
    expect((await adapter.getSession())?.user.email).toBe("user@example.com");
    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ email: "user@example.com" }) }),
    );

    await adapter.signOut();
    expect(await adapter.getSession()).toBeNull();
    expect(listener).toHaveBeenLastCalledWith(null);

    unsubscribe();
  });
});
