export type Route =
  | { name: "home" }
  | { name: "dashboard" }
  | { name: "project"; id: string }
  | { name: "viewer"; id: string };

export function parseRoute(pathname: string): Route {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "dashboard") return { name: "dashboard" };
  if (parts[0] === "project" && parts[1]) return { name: "project", id: parts[1] };
  if (parts[0] === "viewer" && parts[1]) return { name: "viewer", id: parts[1] };
  return { name: "home" };
}

export function href(path: string) {
  return path;
}

export function viewerUrl(id: string) {
  return `${window.location.origin}/viewer/${id}`;
}

export function go(path: string) {
  history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
