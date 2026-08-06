import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../../shared/api/supabase";
import { getPublicRuntimeConfig } from "../../shared/config/env";

type SupabaseBrowserClient = NonNullable<ReturnType<typeof getSupabaseBrowserClient>>;

export type AuthUser = {
  id: string;
  email: string;
  isAnonymous: boolean;
};

export type AuthSession = {
  user: AuthUser;
};

export type SignUpInput = {
  email: string;
  password: string;
};

export type SignUpResult = {
  confirmationRequired: boolean;
};

export interface AuthAdapter {
  readonly mode: "supabase" | "demo" | "unconfigured";
  getSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignUpInput): Promise<SignUpResult>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  onAuthStateChange(listener: (session: AuthSession | null) => void): () => void;
}

export class SupabaseAuthAdapter implements AuthAdapter {
  readonly mode = "supabase" as const;

  constructor(private readonly client: SupabaseBrowserClient = getSupabaseBrowserClient()!) {}

  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    if (!data.session) return null;
    if (data.session.user.is_anonymous) {
      await this.client.auth.signOut({ scope: "local" });
      return null;
    }
    // Restoring an existing session is a read-only operation. Repeating the
    // self-service bootstrap here made every PWA launch depend on an unrelated
    // database mutation and turned a transient RPC failure into a logout.
    return mapSession(data.session);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.prepareSession(data.session);
  }

  async signUp(input: SignUpInput) {
    const config = getPublicRuntimeConfig();
    const appUrl = config.publicAppUrl ?? new URL(import.meta.env.BASE_URL, window.location.origin).toString();
    const emailRedirectTo = new URL("login?confirmed=1", ensureTrailingSlash(appUrl)).toString();
    const { data, error } = await this.client.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        emailRedirectTo,
        data: {
          registration_source: "self_service",
        },
      },
    });
    if (error) throw error;
    if (data.session) await this.prepareSession(data.session);
    return { confirmationRequired: !data.session };
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
    const { data } = this.client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      window.setTimeout(() => {
        if (!session || session.user.is_anonymous) {
          listener(null);
          return;
        }

        // A valid local Supabase session must not disappear from the UI just
        // because the account bootstrap RPC has a transient network/database
        // failure. TOKEN_REFRESHED and INITIAL_SESSION already describe an
        // established account and should never repeat that mutation.
        if (event !== "SIGNED_IN" || session.user.user_metadata.registration_source !== "self_service") {
          listener(mapSession(session));
          return;
        }

        void this.prepareSession(session)
          .then(listener)
          .catch(() => listener(mapSession(session)));
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }

  private async prepareSession(session: Session | null) {
    if (!session) return null;
    if (session.user.is_anonymous) return null;
    if (session.user.user_metadata.registration_source === "self_service") {
      const { error } = await this.client.rpc("bootstrap_self_service_account");
      if (error) throw error;
    }
    return mapSession(session);
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
      return session.user?.id && session.user.email
        ? { user: { ...session.user, isAnonymous: session.user.isAnonymous === true } }
        : null;
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
        isAnonymous: false,
      },
    };
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    this.emit(session);
  }

  async signUp(input: SignUpInput) {
    await this.signIn(input.email, input.password);
    return { confirmationRequired: false };
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

export class UnconfiguredAuthAdapter implements AuthAdapter {
  readonly mode = "unconfigured" as const;

  async getSession() {
    return null;
  }

  async signIn(_email: string, _password: string) {
    void _email;
    void _password;
    throw configurationError();
  }

  async signUp(_input: SignUpInput): Promise<SignUpResult> {
    void _input;
    throw configurationError();
  }

  async signOut() {
    throw configurationError();
  }

  async requestPasswordReset(_email: string) {
    void _email;
    throw configurationError();
  }

  async updatePassword(_password: string) {
    void _password;
    throw configurationError();
  }

  onAuthStateChange(_listener: (session: AuthSession | null) => void) {
    void _listener;
    return () => undefined;
  }
}

let authAdapter: AuthAdapter | undefined;

export function getAuthAdapter(): AuthAdapter {
  if (authAdapter) return authAdapter;
  const client = getSupabaseBrowserClient();
  authAdapter = client
    ? new SupabaseAuthAdapter()
    : getPublicRuntimeConfig().authMode === "demo"
      ? new DemoAuthAdapter()
      : new UnconfiguredAuthAdapter();
  return authAdapter;
}

function configurationError() {
  return new Error("AR Photo backend is not configured");
}

function mapSession(session: Session | null): AuthSession | null {
  if (!session) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? "Гостевой режим",
      isAnonymous: session.user.is_anonymous === true,
    },
  };
}

function ensureTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}
