import { proxyToBackend } from "../utils/backend";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body?.amount || body.amount === 0) throw createError({ statusCode: 400, statusMessage: "amount requerido (distinto de 0)" });
  try {
    return await proxyToBackend(event, "/operation", { method: "POST", body });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Operation POST proxy error", data: e?.data });
  }
});
