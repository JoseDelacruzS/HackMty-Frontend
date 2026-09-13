import { proxyToBackend } from "../../../utils/backend";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ amount: number }>(event);
  if (!body?.amount || body.amount <= 0) throw createError({ statusCode: 400, statusMessage: "amount requerido > 0" });
  try {
    return await proxyToBackend(event, "/savings/cajita/withdraw", { method: "POST", body });
  } catch (e: any) {
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: e?.statusMessage || "Withdraw proxy error", data: e?.data });
  }
});
