import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { AuthAdapter, AuthSession } from "./authAdapter";
import { AuthProvider, ProtectedRoute } from "./AuthProvider";

class FakeAuthAdapter implements AuthAdapter {
  readonly mode = "demo" as const;
  private listener?: (session: AuthSession | null) => void;

  constructor(private session: AuthSession | null) {}

  async getSession() {
    return this.session;
  }

  async signIn() {}
  async signUp() {
    return { confirmationRequired: false };
  }
  async signOut() {}
  async requestPasswordReset() {}
  async updatePassword() {}

  onAuthStateChange(listener: (session: AuthSession | null) => void) {
    this.listener = listener;
    return () => {
      this.listener = undefined;
    };
  }

  expire() {
    this.session = null;
    this.listener?.(null);
  }
}

function renderProtected(adapter: AuthAdapter) {
  return render(
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
    </AuthProvider>,
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
