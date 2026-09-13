import { proxyToBackend } from "../utils/backend";

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as { startDate?: string; endDate?: string };
  if (!query.startDate || !query.endDate) {
    throw createError({ statusCode: 400, statusMessage: "startDate y endDate requeridos (YYYY-MM-DD)" });
  }
  // Validación básica YYYY-MM-DD
  const isoRe = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRe.test(query.startDate) || !isoRe.test(query.endDate)) {
    throw createError({ statusCode: 400, statusMessage: "Formato inválido: usa YYYY-MM-DD" });
  }

  const qs = new URLSearchParams({ startDate: query.startDate, endDate: query.endDate }).toString();
  try {
    return await proxyToBackend(event, `/analyze?${qs}`, { method: "GET" });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Analyze proxy error", data: e?.data });
  }
});
