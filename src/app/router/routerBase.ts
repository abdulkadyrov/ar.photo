export function getRouterBasename(baseUrl: string) {
  if (!baseUrl || baseUrl === "/") return undefined;
  return baseUrl.replace(/\/$/, "");
}
