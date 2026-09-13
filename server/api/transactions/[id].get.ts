import { proxyToBackend } from "../../utils/backend";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  try {
    return await proxyToBackend(event, `/transactions/${id}`, { method: "GET" });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Transaction detail proxy error", data: e?.data });
  }
});
