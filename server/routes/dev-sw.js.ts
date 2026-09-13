export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'application/javascript; charset=utf-8')
  return '// Service worker dev stub to prevent 404 warnings\nself.addEventListener("install", () => self.skipWaiting());\n'
})
