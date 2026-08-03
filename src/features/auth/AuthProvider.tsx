import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { StatusPanel } from "../../shared/ui";
import { getAuthAdapter, type AuthAdapter, type AuthSession } from "./authAdapter";
import { AuthContext, type AuthContextValue, useAuth } from "./authContext";

export function AuthProvider({ children, adapter = getAuthAdapter() }: { children: ReactNode; adapter?: AuthAdapter }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const unsubscribe = adapter.onAuthStateChange((nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
    });

    adapter
      .getSession()
      .then((nextSession) => {
        if (!active) return;
        setSession(nextSession);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [adapter]);

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

  return children;
}
