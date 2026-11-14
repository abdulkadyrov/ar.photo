import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AuthAdapter, AuthSession } from "./authAdapter";
import { AuthProvider, ProtectedRoute } from "./AuthProvider";
import { useAuth } from "./authContext";
import { LoginRoute } from "./AuthPages";

class FakeAuthAdapter implements AuthAdapter {
  readonly mode = "demo" as const;
  private listener?: (session: AuthSession | null) => void;

  constructor(private session: AuthSession | null) {}

  async getSession() {
    return this.session;
  }

  async signIn(email: string) {
    this.change({ user: { id: email.startsWith("admin") ? "admin" : "ordinary", email, isAnonymous: false } });
  }
  async signUp() {
    return { confirmationRequired: false };
  }
  async signOut() {
    this.change(null);
  }
  async requestPasswordReset() {}
  async updatePassword() {}

  onAuthStateChange(listener: (session: AuthSession | null) => void) {
    this.listener = listener;
    return () => {
      this.listener = undefined;
    };
  }

  change(session: AuthSession | null) {
    this.session = session;
    this.listener?.(session);
  }
  expire() {
    this.change(null);
  }
}

function renderProtected(adapter: AuthAdapter) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AuthProvider adapter={adapter}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/login" element={<p>Login screen</p>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <p>Private dashboard</p>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("auth session states", () => {
  it("redirects an unauthenticated visitor", async () => {
    renderProtected(new FakeAuthAdapter(null));
    expect(await screen.findByText("Login screen")).toBeVisible();
  });

  it("removes protected content when a session expires", async () => {
    const adapter = new FakeAuthAdapter({
      user: { id: "user-1", email: "user@example.com", isAnonymous: false },
    });
    renderProtected(adapter);

    expect(await screen.findByText("Private dashboard")).toBeVisible();
    act(() => adapter.expire());
    expect(await screen.findByText("Login screen")).toBeVisible();
  });
});

type RenderRecord = { user: string | null; admin?: string; factor?: string };
function CachedPrivateScreen({ record }: { record: (value: RenderRecord) => void }) {
  const auth = useAuth();
  const user = auth.session?.user.id ?? null;
  const admin = useQuery({
    queryKey: ["admin", "snapshot"],
    queryFn: async () => (user === "admin" ? "private-admin-data" : "ordinary-data"),
    enabled: Boolean(user),
    staleTime: Infinity,
  });
  const mfa = useQuery({
    queryKey: ["settings", "mfa"],
    queryFn: async () => (user === "admin" ? "admin-factor-id" : "ordinary-factor-id"),
    enabled: Boolean(user),
    staleTime: Infinity,
  });
  record({ user, admin: admin.data, factor: mfa.data });
  return (
    <p>
      {user}:{admin.data}:{mfa.data}
    </p>
  );
}
function renderCachedWorkspace(
  adapter: FakeAuthAdapter,
  record: (value: RenderRecord) => void,
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  render(
    <QueryClientProvider client={client}>
      <AuthProvider adapter={adapter}>
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <CachedPrivateScreen record={record} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
  return client;
}
const adminSession: AuthSession = { user: { id: "admin", email: "admin@example.com", isAnonymous: false } };
const ordinarySession: AuthSession = { user: { id: "ordinary", email: "ordinary@example.com", isAnonymous: false } };
describe("identity cache isolation", () => {
  it("never renders previous admin or MFA data after sign-out and ordinary sign-in", async () => {
    const adapter = new FakeAuthAdapter(adminSession);
    const renders: RenderRecord[] = [];
    const client = renderCachedWorkspace(adapter, (value) => renders.push(value));
    await screen.findByText("admin:private-admin-data:admin-factor-id");
    await act(() => adapter.signOut());
    expect(client.getQueryData(["admin", "snapshot"])).toBeUndefined();
    expect(client.getQueryData(["settings", "mfa"])).toBeUndefined();
    await act(() => adapter.signIn("ordinary@example.com"));
    await screen.findByText("ordinary:ordinary-data:ordinary-factor-id");
    expect(
      renders
        .filter((value) => value.user !== "admin")
        .some((value) => value.admin === "private-admin-data" || value.factor === "admin-factor-id"),
    ).toBe(false);
  });
  it("also isolates a direct identity replacement and aborts outstanding queries", async () => {
    const adapter = new FakeAuthAdapter(adminSession);
    const renders: RenderRecord[] = [];
    const client = renderCachedWorkspace(adapter, (value) => renders.push(value));
    await screen.findByText("admin:private-admin-data:admin-factor-id");
    const aborted = vi.fn();
    const pending = client
      .fetchQuery({
        queryKey: ["admin", "pending-private-request"],
        queryFn: ({ signal }) =>
          new Promise<string>((_resolve, reject) => {
            signal.addEventListener("abort", () => {
              aborted();
              reject(new Error("aborted"));
            });
          }),
      })
      .catch(() => undefined);
    act(() => adapter.change(ordinarySession));
    await screen.findByText("ordinary:ordinary-data:ordinary-factor-id");
    await pending;
    expect(aborted).toHaveBeenCalledOnce();
    expect(client.getQueryData(["admin", "pending-private-request"])).toBeUndefined();
    expect(
      renders
        .filter((value) => value.user === "ordinary")
        .some((value) => value.admin === "private-admin-data" || value.factor === "admin-factor-id"),
    ).toBe(false);
  });
  it("preserves the same user's cache on token refresh and MFA verification", async () => {
    const adapter = new FakeAuthAdapter(adminSession);
    const client = renderCachedWorkspace(adapter, () => {});
    await screen.findByText("admin:private-admin-data:admin-factor-id");
    const clear = vi.spyOn(client, "clear");
    act(() => adapter.change({ ...adminSession, user: { ...adminSession.user } }));
    await waitFor(() => expect(client.getQueryData(["admin", "snapshot"])).toBe("private-admin-data"));
    expect(clear).not.toHaveBeenCalled();
  });
});

function CurrentProtectedLocation() {
  const location = useLocation();
  return (
    <p>
      Requested screen: {location.pathname}
      {location.search}
    </p>
  );
}
describe("protected navigation during sign-in", () => {
  it.each(["/admin?section=accounts", "/projects?status=ready"])(
    "returns to %s without resetting the router",
    async (target) => {
      const adapter = new FakeAuthAdapter(null);
      render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <AuthProvider adapter={adapter}>
            <MemoryRouter initialEntries={["/landing"]}>
              <Routes>
                <Route path="/landing" element={<Link to={target}>Open requested screen</Link>} />
                <Route path="/login" element={<LoginRoute />} />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <CurrentProtectedLocation />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>,
      );
      fireEvent.click(screen.getByRole("link", { name: "Open requested screen" }));
      await screen.findByRole("heading", { name: "Вход в кабинет" });
      fireEvent.change(screen.getByLabelText("Пароль", { exact: true }), { target: { value: "Password123" } });
      fireEvent.click(screen.getByRole("button", { name: "Войти" }));
      expect(await screen.findByText(`Requested screen: ${target}`)).toBeVisible();
    },
  );
});
