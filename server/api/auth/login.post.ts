export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body || {}

  if (!email || !password || password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid credentials or password too short',
    })
  }

  // Generate secure session token (in production, validate against DB or auth service)
  const sessionToken = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36)

  // Set HttpOnly, Secure, SameSite cookie so JS cannot access it (prevents XSS token theft)
  setCookie(event, 'autoafore_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/'
  })

  return {
    success: true,
    user: {
      name: email.split('@')[0] || 'Sofía',
      email,
      age: 26,
      retirementAge: 65,
      customerId: 'CUST_' + Math.floor(100000 + Math.random() * 900000)
    }
  }
})
