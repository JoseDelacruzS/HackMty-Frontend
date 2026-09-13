import { proxyToBackend } from "../utils/backend";

export default defineEventHandler(async (event) => {
  try {
    return await proxyToBackend(event, "/user", { method: "GET" });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "User proxy error", data: e?.data });
  }
});
