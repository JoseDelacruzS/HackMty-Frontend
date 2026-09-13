export function getBackendBase(event?: any) {
  const config = useRuntimeConfig(event);
  return (config.bankApiBaseUrl as string).replace(/\/$/, "");
}

export function getAuthHeaders(event: any) {
  // Lee token de sesión logueada desde múltiples fuentes (cookie, headers variantes)
  // El login guarda en `auth_token` (cookie + localStorage + Pinia), aquí lo reenviamos al backend
  const rawCookie = getHeader(event, "cookie") || "";
  const token =
    getCookie(event, "auth_token") ||
    getCookie(event, "authToken") ||
    getCookie(event, "token") ||
    // parse manual por si getCookie no ve la cookie httpOnly
    (rawCookie.match(/(?:^|;\s*)auth_token=([^;]+)/)?.[1] ?? null) ||
    (rawCookie.match(/(?:^|;\s*)authToken=([^;]+)/)?.[1] ?? null) ||
    getHeader(event, "authorization")?.replace(/^Bearer\s+/i, "") ||
    getHeader(event, "Authorization")?.replace(/^Bearer\s+/i, "") ||
    getHeader(event, "authToken") ||
    getHeader(event, "authtoken") ||
    getHeader(event, "token") ||
    getHeader(event, "x-auth-token") ||
    getHeader(event, "x-authtoken") ||
    null;

  const clean = token ? decodeURIComponent(token.toString().trim().replace(/^"|"$/g, "")) : null;
  const headers: Record<string, string> = { accept: "application/json" };
  if (clean) {
    // Envía en todos los formatos que el backend pueda esperar
    headers["Authorization"] = `Bearer ${clean}`;
    headers["authToken"] = clean;
    headers["token"] = clean;
    headers["x-auth-token"] = clean;
    headers["X-Auth-Token"] = clean;
  }
  const apiKey = useRuntimeConfig(event).bankApiKey;
  if (apiKey) headers["x-api-key"] = apiKey;
  return headers;
}

export async function proxyToBackend(event: any, path: string, opts: any = {}) {
  const base = getBackendBase(event);
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const authHeaders = getAuthHeaders(event);
  // Si no hay token, avisa claro en lugar de dejar que el backend dé 401 genérico
  if (!authHeaders["Authorization"] && !authHeaders["authToken"]) {
    console.warn(`[proxyToBackend] token ausente para ${path} — cookie: ${getHeader(event, "cookie") || "vacía"} — headers: Authorization=${getHeader(event,"authorization") || "—"}`);
  }
  return await $fetch(url, {
    ...opts,
    headers: { ...authHeaders, ...(opts.headers || {}) },
  });
}
