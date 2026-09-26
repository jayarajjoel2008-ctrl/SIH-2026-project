// Shared by the auth pages (Login, Register, and any page that resumes a flow
// after sign-in, e.g. the MCP OAuth consent page). Keep the redirect
// validation in one place — it is security-sensitive and easy to drift.

// Resolve ?returnTo= to a safe same-origin path, else null.
export function safeReturnTo(defaultFallback = null) {
  const raw = new URLSearchParams(window.location.search).get("returnTo");
  if (!raw) return defaultFallback;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return defaultFallback;
    // Strip app-bootstrap params: app-params.js persists these from the URL into
    // localStorage before the SDK initializes, so a crafted returnTo could
    // otherwise poison the freshly issued session — repointing the app at an
    // attacker's backend (app_base_url/app_id/functions_version) or overwriting
    // the token. Normal app-flow params (e.g. the OAuth consent ctx) are kept.
    for (const p of ["access_token", "clear_access_token", "app_id", "app_base_url", "functions_version", "from_url"]) {
      url.searchParams.delete(p);
    }
    let path = url.pathname + url.search;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return defaultFallback;

    const base = import.meta.env.BASE_URL;
    if (base && base !== "/" && base !== "./") {
      const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
      if (path.startsWith(normalizedBase)) {
        path = path.slice(normalizedBase.length) || "/";
      }
    }

    if (path === "/" || path === "/login" || path === "/auth") return defaultFallback;
    return path;
  } catch {
    return defaultFallback;
  }
}
