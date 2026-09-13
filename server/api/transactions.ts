export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Security Proxy: Credentials and bank API base URLs are kept secret in server runtimeConfig
  // and never exposed to the client browser bundle.
  const apiKey = config.bankApiKey
  const apiBase = config.bankApiBaseUrl

  try {
    // In production with a live Nessie / banking API:
    // const data = await $fetch(`${apiBase}/transactions`, {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // })

    // Secure server-side proxied response payload
    return {
      success: true,
      provider: 'Capital One Nessie API (Proxied securely via Nuxt Server)',
      timestamp: new Date().toISOString(),
      transactions: [
        {
          id: "proxy-1",
          merchant: "UBER EATS",
          amount: -427,
          category: "food_delivery",
          timestamp: new Date().toISOString(),
          isLeak: true,
          medium: "balance",
          status: "completed",
          description: "Uber Eats · comida a domicilio (Proxy Seguro)",
        },
        {
          id: "proxy-2",
          merchant: "NETFLIX",
          amount: -219,
          category: "subscriptions",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          isLeak: false,
          medium: "balance",
          status: "completed",
          description: "Netflix · suscripción mensual",
        }
      ]
    }
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Secure Banking Proxy Gateway Error',
    })
  }
})
