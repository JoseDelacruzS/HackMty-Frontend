export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vite-pwa/nuxt'],

  css: ['@/assets/css/main.css'],

  runtimeConfig: {
    bankApiKey: process.env.BANK_API_KEY || 'nessie_secret_api_key_demo_2026',
    bankApiBaseUrl: process.env.BANK_API_BASE_URL || 'https://api.nessieisreal.com/enterprise',
    public: {
      // Public runtime config if any
      apiUrl: ''
    }
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: 'AutoAfore Agent',
      link: [
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#004977' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'AutoAfore' }
      ]
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'AutoAfore Agent',
      short_name: 'AutoAfore',
      description: 'Agente financiero autónomo: convierte tu flujo de caja en aportaciones AFORE y solvencia.',
      theme_color: '#004977',
      background_color: '#082238',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'es',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'dicebear-avatars',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }
          }
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})
