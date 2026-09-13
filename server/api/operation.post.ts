import { proxyToBackend } from "../utils/backend";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    type: string;
    medium: string;
    status: string;
    amount: number;
    description: string;
    merchant: string;
  }>(event);

  if (!body?.type || !body?.amount || !body?.description || !body?.merchant) {
    throw createError({ statusCode: 400, statusMessage: "type, amount, description y merchant requeridos" });
  }
  if (Number(body.amount) <= 0) {
    throw createError({ statusCode: 400, statusMessage: "amount debe ser > 0" });
  }

  // Normaliza para cajita: TRANSFER + AHORRO
  const payload = {
    type: body.type,
    medium: body.medium || "balance",
    status: body.status || "completed",
    amount: Number(body.amount),
    description: body.description,
    merchant: body.merchant,
  };

  try {
    return await proxyToBackend(event, "/operation", {
      method: "POST",
      body: payload,
    });
  } catch (e: any) {
    throw createError({
      statusCode: e?.statusCode || 502,
      statusMessage: e?.statusMessage || "Operation proxy error",
      data: e?.data,
    });
  }
});
