import { proxyToBackend } from "../utils/backend";

export default defineEventHandler(async (event) => {
  try {
    return await proxyToBackend(event, "/analytics", { method: "GET" });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Analytics proxy error", data: e?.data });
  }
});
