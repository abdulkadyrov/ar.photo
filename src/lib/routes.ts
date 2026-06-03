export type Route =
  | { name: "home" }
  | { name: "dashboard" }
  | { name: "project"; id: string }
  | { name: "viewer"; id: string };

export function parseRoute(pathname: string): Route {
  const parts = normalizePath(pathname).split("/").filter(Boolean);
  if (parts[0] === "dashboard") return { name: "dashboard" };
  if (parts[0] === "project" && parts[1]) return { name: "project", id: parts[1] };
  if (parts[0] === "viewer" && parts[1]) return { name: "viewer", id: parts[1] };
  return { name: "home" };
}

export function href(path: string) {
  return withBase(path);
}

export function viewerUrl(id: string) {
  return `${window.location.origin}${withBase(`/viewer/${id}`)}`;
}

export function go(path: string) {
  history.pushState(null, "", withBase(path));
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function normalizePath(pathname: string) {
  const base = import.meta.env.BASE_URL;
  if (base !== "/" && pathname.startsWith(base)) return pathname.slice(base.length - 1);
  return pathname;
}

function withBase(path: string) {
  const base = import.meta.env.BASE_URL;
  if (base === "/") return path;
  return `${base.replace(/\/$/, "")}${path}`;
}
