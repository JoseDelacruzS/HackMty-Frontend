export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody<{ username: string; password: string }>(event);
  if (!body?.username || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: "username y password requeridos" });
  }
  const base = (config.bankApiBaseUrl as string).replace(/\/$/, "");
  const url = `${base}/auth/register`;
  try {
    const res = await $fetch<{ authToken: string }>(url, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: { username: body.username, password: body.password },
    });
    if (res?.authToken) {
      setCookie(event, "auth_token", res.authToken, { maxAge: 60 * 60 * 24 * 7, sameSite: "lax", path: "/" });
    }
    return res;
  } catch (e: any) {
    const status = e?.statusCode || e?.response?.status || 500;
    const message = e?.data?.message || e?.statusMessage || e?.message || "Error en registro";
    throw createError({ statusCode: status, statusMessage: message, data: e?.data });
  }
});
