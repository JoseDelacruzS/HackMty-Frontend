export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", "@vite-pwa/nuxt"],

  css: ["@/assets/css/main.css"],

  runtimeConfig: {
    bankApiKey: process.env.BANK_API_KEY || "nessie_secret_api_key_demo_2026",
    bankApiBaseUrl:
      process.env.BANK_API_BASE_URL ||
      "https://api.nessieisreal.com/enterprise",
    public: {
      // Public runtime config if any
      apiUrl: "",
    },
  },

  app: {
    head: {
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content",
      title: "AlcancIA",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/icons/icon-192.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
      ],
      meta: [
        {
          name: "theme-color",
          media: "(prefers-color-scheme: light)",
          content: "#f8fafc",
        },
        {
          name: "theme-color",
          media: "(prefers-color-scheme: dark)",
          content: "#082238",
        },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "apple-mobile-web-app-title", content: "AlcancIA" },
        { name: "format-detection", content: "telephone=no" },
      ],
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "AlcancIA",
      short_name: "AlcancIA",
      description:
        "AlcancIA — Agente financiero autónomo: convierte tu flujo de caja en aportaciones AFORE y solvencia.",
      id: "/",
      theme_color: "#082238",
      background_color: "#082238",
      display: "standalone",
      display_override: ["standalone", "minimal-ui"],
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      lang: "es",
      dir: "ltr",
      categories: ["finance", "utilities"],
      launch_handler: { client_mode: "focus-existing" },
      icons: [
        { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "icons/maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      shortcuts: [
        {
          name: "Aportar a mi AFORE",
          url: "/?aportar=1",
          icons: [
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          ],
        },
        {
          name: "Movimientos",
          url: "/history",
          icons: [
            { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          ],
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg,ico}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: "/",
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
          handler: "CacheFirst",
          options: {
            cacheName: "dicebear-avatars",
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
      ],
    },
    devOptions: {
      enabled: false,
      type: "module",
    },
  },
});
