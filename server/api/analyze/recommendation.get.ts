import { proxyToBackend } from "../../utils/backend";

export default defineEventHandler(async (event) => {
  try {
    return await proxyToBackend(event, "/analyze/recommendation", { method: "GET" });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Analyze recommendation proxy error", data: e?.data });
  }
});
