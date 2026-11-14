import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { StatusPanel } from "../../shared/ui";
import { getAuthAdapter, type AuthAdapter, type AuthSession } from "./authAdapter";
import { AuthContext, type AuthContextValue, useAuth } from "./authContext";

export function AuthProvider({ children, adapter = getAuthAdapter() }: { children: ReactNode; adapter?: AuthAdapter }) {
  const queryClient = useQueryClient();
  const identity = useRef<string | null | undefined>(undefined);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let authEventVersion = 0;
    const publishSession = (nextSession: AuthSession | null) => {
      const nextIdentity = nextSession?.user.id ?? null;
      if (identity.current !== nextIdentity) {
        // Queries are shared across routes and some legacy keys are not user-scoped.
        // Clear them before the next identity can mount any private screens. This
        // only affects in-memory QueryClient state, never offline media or storage.
        void queryClient.cancelQueries();
        queryClient.clear();
        identity.current = nextIdentity;
      }
      setSession(nextSession);
      setLoading(false);
    };
    const unsubscribe = adapter.onAuthStateChange((nextSession) => {
      if (!active) return;
      authEventVersion += 1;
      publishSession(nextSession);
    });
    const restoreVersion = authEventVersion;

    adapter
      .getSession()
      .then((nextSession) => {
        if (!active || authEventVersion !== restoreVersion) return;
        publishSession(nextSession);
      })
      .catch(() => {
        if (active && authEventVersion === restoreVersion) publishSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [adapter, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status: loading ? "loading" : session ? "authenticated" : "unauthenticated",
      mode: adapter.mode,
      signIn: (email, password) => adapter.signIn(email, password),
      signUp: (input) => adapter.signUp(input),
      signOut: () => adapter.signOut(),
      requestPasswordReset: (email) => adapter.requestPasswordReset(email),
      updatePassword: (password) => adapter.updatePassword(password),
    }),
    [adapter, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-ink">
        <StatusPanel title="Проверяем сессию…" text="Подготавливаем защищённое пространство AR Photo." />
      </main>
    );
  }

  if (!auth.session) {
    return <Navigate replace to="/login" state={{ from: `${location.pathname}${location.search}` }} />;
  }

  // Only protected screens own private query observers. Reset those on an
  // identity replacement while preserving the router and its pending returnTo.
  return <Fragment key={auth.session.user.id}>{children}</Fragment>;
}
