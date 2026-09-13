export default defineEventHandler(async (event) => {
  deleteCookie(event, 'autoafore_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  return {
    success: true,
    message: 'Logged out successfully, session cookie cleared.'
  }
})
