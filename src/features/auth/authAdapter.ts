import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { getPublicRuntimeConfig } from "../../shared/config/env";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
};

export interface AuthAdapter {
  readonly mode: "supabase" | "demo";
  getSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  onAuthStateChange(listener: (session: AuthSession | null) => void): () => void;
}

class SupabaseAuthAdapter implements AuthAdapter {
  readonly mode = "supabase" as const;
  private readonly client = getSupabaseBrowserClient()!;

  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    return mapSession(data.session);
  }

  async signIn(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut({ scope: "local" });
    if (error) throw error;
  }

  async requestPasswordReset(email: string) {
    const config = getPublicRuntimeConfig();
    const appUrl = config.publicAppUrl ?? new URL(import.meta.env.BASE_URL, window.location.origin).toString();
    const redirectTo = new URL("update-password", ensureTrailingSlash(appUrl)).toString();
    const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await this.client.auth.updateUser({ password });
    if (error) throw error;
  }

  onAuthStateChange(listener: (session: AuthSession | null) => void) {
    const { data } = this.client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      listener(mapSession(session));
    });
    return () => data.subscription.unsubscribe();
  }
}

const DEMO_SESSION_KEY = "ar-photo-demo-session-v1";

export class DemoAuthAdapter implements AuthAdapter {
  readonly mode = "demo" as const;
  private readonly listeners = new Set<(session: AuthSession | null) => void>();

  async getSession() {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as AuthSession;
      return session.user?.id && session.user.email ? session : null;
    } catch {
      window.localStorage.removeItem(DEMO_SESSION_KEY);
      return null;
    }
  }

  async signIn(email: string, password: string) {
    void password;
    const session: AuthSession = {
      user: {
        id: `demo-${crypto.randomUUID()}`,
        email: email.trim().toLowerCase(),
      },
    };
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    this.emit(session);
  }

  async signOut() {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    this.emit(null);
  }

  async requestPasswordReset(email: string) {
    void email;
    return Promise.resolve();
  }

  async updatePassword(password: string) {
    void password;
    return Promise.resolve();
  }

  onAuthStateChange(listener: (session: AuthSession | null) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(session: AuthSession | null) {
    this.listeners.forEach((listener) => listener(session));
  }
}

let authAdapter: AuthAdapter | undefined;

export function getAuthAdapter(): AuthAdapter {
  if (authAdapter) return authAdapter;
  authAdapter = getSupabaseBrowserClient() ? new SupabaseAuthAdapter() : new DemoAuthAdapter();
  return authAdapter;
}

function mapSession(session: Session | null): AuthSession | null {
  const email = session?.user.email;
  if (!session || !email) return null;
  return { user: { id: session.user.id, email } };
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}
