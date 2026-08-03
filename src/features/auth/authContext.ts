import { createContext, useContext } from "react";
import type { AuthAdapter, AuthSession, SignUpInput, SignUpResult } from "./authAdapter";

export type AuthContextValue = {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  mode: AuthAdapter["mode"];
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignUpInput): Promise<SignUpResult>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
