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

describe("supabase explicit auth adapter", () => {
  it("does not create an anonymous session when no login exists", async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });
    const signOut = vi.fn();
    const adapter = new SupabaseAuthAdapter({ auth: { getSession, signOut } } as unknown as SupabaseBrowserClient);

    await expect(adapter.getSession()).resolves.toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("clears a legacy anonymous browser session instead of opening the cabinet", async () => {
    const session = {
      user: {
        id: "00000000-0000-4000-8000-000000000040",
        email: undefined,
        is_anonymous: true,
        user_metadata: { registration_source: "guest_test" },
      },
    } as unknown as Session;
    const getSession = vi.fn().mockResolvedValue({ data: { session }, error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const adapter = new SupabaseAuthAdapter({ auth: { getSession, signOut } } as unknown as SupabaseBrowserClient);

    await expect(adapter.getSession()).resolves.toBeNull();
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("restores an existing self-service session without a bootstrap mutation", async () => {
    const session = {
      user: {
        id: "00000000-0000-4000-8000-000000000043",
        email: "owner@example.com",
        is_anonymous: false,
        user_metadata: { registration_source: "self_service" },
      },
    } as unknown as Session;
    const getSession = vi.fn().mockResolvedValue({ data: { session }, error: null });
    const rpc = vi.fn().mockRejectedValue(new Error("temporary backend outage"));
    const adapter = new SupabaseAuthAdapter({ auth: { getSession }, rpc } as unknown as SupabaseBrowserClient);

    await expect(adapter.getSession()).resolves.toEqual(
      expect.objectContaining({ user: expect.objectContaining({ email: "owner@example.com" }) }),
    );
    expect(rpc).not.toHaveBeenCalled();
  });

  it("keeps an established session during token refresh without repeating account bootstrap", async () => {
    vi.useFakeTimers();
    const session = {
      user: {
        id: "00000000-0000-4000-8000-000000000041",
        email: "owner@example.com",
        is_anonymous: false,
        user_metadata: { registration_source: "self_service" },
      },
    } as unknown as Session;
    let authCallback: ((event: "TOKEN_REFRESHED", session: Session | null) => void) | undefined;
    const rpc = vi.fn();
    const unsubscribe = vi.fn();
    const client = {
      auth: {
        onAuthStateChange: vi.fn((callback) => {
          authCallback = callback;
          return { data: { subscription: { unsubscribe } } };
        }),
      },
      rpc,
    } as unknown as SupabaseBrowserClient;
    const adapter = new SupabaseAuthAdapter(client);
    const listener = vi.fn();
    const stop = adapter.onAuthStateChange(listener);

    authCallback?.("TOKEN_REFRESHED", session);
    await vi.runAllTimersAsync();

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ email: "owner@example.com" }) }),
    );
    expect(rpc).not.toHaveBeenCalled();
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("does not report logout when signed-in account bootstrap has a transient failure", async () => {
    vi.useFakeTimers();
    const session = {
      user: {
        id: "00000000-0000-4000-8000-000000000042",
        email: "owner@example.com",
        is_anonymous: false,
        user_metadata: { registration_source: "self_service" },
      },
    } as unknown as Session;
    let authCallback: ((event: "SIGNED_IN", session: Session | null) => void) | undefined;
    const client = {
      auth: {
        onAuthStateChange: vi.fn((callback) => {
          authCallback = callback;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
      },
      rpc: vi.fn().mockResolvedValue({ error: new Error("temporary backend outage") }),
    } as unknown as SupabaseBrowserClient;
    const adapter = new SupabaseAuthAdapter(client);
    const listener = vi.fn();
    adapter.onAuthStateChange(listener);

    authCallback?.("SIGNED_IN", session);
    await vi.runAllTimersAsync();

    expect(listener).toHaveBeenLastCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ email: "owner@example.com" }) }),
    );
    expect(listener).not.toHaveBeenCalledWith(null);
    vi.useRealTimers();
  });
});
