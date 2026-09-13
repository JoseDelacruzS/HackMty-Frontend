import { proxyToBackend } from "../utils/backend";

export default defineEventHandler(async (event) => {
  try {
    // Backend debe exponer GET /dashboard
    return await proxyToBackend(event, "/dashboard", { method: "GET" });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Dashboard proxy error", data: e?.data });
  }
});
