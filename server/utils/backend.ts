export function getBackendBase(event?: any) {
  const config = useRuntimeConfig(event);
  return (config.bankApiBaseUrl as string).replace(/\/$/, "");
}

export function getAuthHeaders(event: any) {
  const token = getCookie(event, "auth_token") || getHeader(event, "authorization")?.replace(/^Bearer\s+/i, "") || getHeader(event, "authToken");
  const headers: Record<string, string> = { accept: "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["authToken"] = token;
  }
  const apiKey = useRuntimeConfig(event).bankApiKey;
  if (apiKey) headers["x-api-key"] = apiKey;
  return headers;
}

export async function proxyToBackend(event: any, path: string, opts: any = {}) {
  const base = getBackendBase(event);
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return await $fetch(url, {
    ...opts,
    headers: { ...getAuthHeaders(event), ...(opts.headers || {}) },
  });
}
