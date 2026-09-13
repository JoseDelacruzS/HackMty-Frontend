import { useAuthStore } from "~/stores/auth";

export function useApi() {
  const config = useRuntimeConfig();
  const auth = useAuthStore();
  const base = (config.public.apiBaseUrl as string).replace(/\/$/, "");

  function getHeaders(extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      accept: "application/json",
      "Content-Type": "application/json",
      ...extra,
    };
    if (auth.token) {
      headers["Authorization"] = `Bearer ${auth.token}`;
      // algunos backends esperan authToken header directo
      headers["authToken"] = auth.token;
    }
    return headers;
  }

  async function apiFetch<T>(path: string, opts: any = {}): Promise<T> {
    const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
    return await $fetch<T>(url, {
      ...opts,
      headers: {
        ...getHeaders(opts.headers),
        ...(opts.headers || {}),
      },
      // si es 401, desloguear y redirigir
      onResponseError: async (ctx: any) => {
        if (ctx.response?.status === 401) {
          auth.logout();
          if (import.meta.client && useRoute().path !== "/login") {
            await navigateTo("/login");
          }
        }
        if (opts.onResponseError) await opts.onResponseError(ctx);
      },
    });
  }

  return { apiFetch, base, getHeaders };
}
