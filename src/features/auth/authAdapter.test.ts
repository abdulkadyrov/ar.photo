import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import type { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { DemoAuthAdapter, SupabaseAuthAdapter, UnconfiguredAuthAdapter } from "./authAdapter";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

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

  it("creates a local demo session through the registration boundary", async () => {
    const adapter = new DemoAuthAdapter();
    await expect(
      adapter.signUp({
        email: "New@Example.com",
        password: "demo-password",
      }),
    ).resolves.toEqual({ confirmationRequired: false });
    expect((await adapter.getSession())?.user.email).toBe("new@example.com");
  });
});

describe("unconfigured auth adapter", () => {
  it("never creates a local session or accepts credentials", async () => {
    const adapter = new UnconfiguredAuthAdapter();
    expect(await adapter.getSession()).toBeNull();
    await expect(adapter.signIn("owner@example.com", "correct horse battery staple")).rejects.toThrow(
      /not configured/i,
    );
    await expect(
      adapter.signUp({
        email: "owner@example.com",
        password: "correct horse battery staple",
      }),
    ).rejects.toThrow(/not configured/i);
  });
});

describe("supabase guest auth adapter", () => {
  it("creates and bootstraps an isolated anonymous session when no login exists", async () => {
    const session = {
      user: {
        id: "00000000-0000-4000-8000-000000000040",
        email: undefined,
        is_anonymous: true,
        user_metadata: { registration_source: "guest_test" },
      },
    } as unknown as Session;
    const getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const signInAnonymously = vi.fn().mockResolvedValue({ data: { session }, error: null });
    const rpc = vi.fn().mockResolvedValue({ data: {}, error: null });
    const adapter = new SupabaseAuthAdapter({ auth: { getSession, signInAnonymously }, rpc } as unknown as SupabaseBrowserClient);

    await expect(adapter.getSession()).resolves.toEqual({
      user: {
        id: session.user.id,
        email: "Гостевой режим",
        isAnonymous: true,
      },
    });
    expect(signInAnonymously).toHaveBeenCalledWith({
      options: { data: { registration_source: "guest_test", full_name: "Гость" } },
    });
    expect(rpc).toHaveBeenCalledWith("bootstrap_guest_account");
  });
});
