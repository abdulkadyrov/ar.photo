export type DiagnosticQr = { kind: "ar" | "card"; id: string };

/** Accept only public viewer/card links on this deployment; ignore all query credentials. */
export function parseDiagnosticQr(value: string, origin: string, basePath: string): DiagnosticQr | null {
  try {
    const url = new URL(value.trim(), origin);
    if (url.origin !== origin || url.username || url.password) return null;
    const base = `/${basePath.split("/").filter(Boolean).join("/")}`.replace(/\/$/, "");
    const prefix = `${base}/`;
    if (!url.pathname.startsWith(prefix)) return null;
    const path = url.pathname.slice(prefix.length).replace(/\/$/, "");
    const match = /^(ar|card)\/([a-f0-9]+)$/.exec(path);
    if (!match || match[2].length !== (match[1] === "ar" ? 36 : 32)) return null;
    return { kind: match[1] as DiagnosticQr["kind"], id: match[2] };
  } catch {
    return null;
  }
}
