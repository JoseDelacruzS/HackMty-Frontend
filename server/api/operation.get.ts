import { proxyToBackend } from "../utils/backend";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const qs = new URLSearchParams(query as Record<string, string>).toString();
  const path = `/operation${qs ? `?${qs}` : ""}`;
  try {
    return await proxyToBackend(event, path, { method: "GET" });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Operation proxy error", data: e?.data });
  }
});
