export default defineEventHandler(async (event) => {
  const sessionToken = getCookie(event, 'autoafore_session')

  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No active session cookie',
    })
  }

  // Session exists in HttpOnly cookie
  return {
    authenticated: true,
    user: {
      name: 'Sofía',
      email: 'sofia@ejemplo.mx',
      age: 26,
      retirementAge: 65,
      customerId: 'CUST_849201'
    }
  }
})
