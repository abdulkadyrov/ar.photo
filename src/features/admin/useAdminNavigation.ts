import { createContext, useContext } from "react";
export type AdminNavigationPatch = Record<string, string | null>;
export type AdminNavigationOrigin = {
  key: string;
  pathname: string;
  search: string;
  hash: string;
  scroll: number;
  focus: string | null;
};
export type AdminNavigation = {
  params: URLSearchParams;
  read: (key: string) => string | null;
  update: (patch: AdminNavigationPatch) => void;
  open: (patch: AdminNavigationPatch) => void;
  back: (fallback: AdminNavigationPatch) => void;
};
export const AdminNavigationContext = createContext<AdminNavigation | null>(null);
export function useAdminNavigation() {
  const value = useContext(AdminNavigationContext);
  if (!value) throw new Error("Admin navigation requires its workspace provider");
  return value;
}
