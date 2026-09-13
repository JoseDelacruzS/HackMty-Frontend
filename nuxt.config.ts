export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", "@vite-pwa/nuxt"],

  css: ["@/assets/css/main.css"],

  runtimeConfig: {
    bankApiKey: process.env.BANK_API_KEY || "nessie_secret_api_key_demo_2026",
    bankApiBaseUrl:
      (process.env.BANK_API_BASE_URL || "https://api.nessieisreal.com/enterprise").replace(/^"|"$/g, "").replace(/\/$/, ""),
    public: {
      apiBaseUrl:
        (process.env.BANK_API_BASE_URL || "https://mlh-hackaton-app-backend.onrender.com/api/v1").replace(/^"|"$/g, "").replace(/\/$/, ""),
    },
  },

  app: {
    head: {
      viewport:
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
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
        {
          rel: "apple-touch-icon-precomposed",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "apple-touch-startup-image",
          href: "/icons/icon-512.png",
        },
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
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
      style: [
        {
          children: `
            html, body { background-color: #082238; }
            #app-splash {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              width: 100vw; height: 100vh;
              z-index: 999999;
              background-color: #082238;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 1.5rem;
              transition: opacity .4s ease, visibility .4s ease;
            }
            #app-splash.is-hidden {
              opacity: 0;
              visibility: hidden;
              pointer-events: none;
            }
            #app-splash img {
              width: 96px;
              height: 96px;
              border-radius: 24px;
              box-shadow: 0 12px 40px rgba(0,0,0,.45);
              animation: splash-breath 1.6s ease-in-out infinite;
            }
            #app-splash .splash-dots { display: flex; gap: .45rem; }
            #app-splash .splash-dots span {
              width: 7px;
              height: 7px;
              border-radius: 9999px;
              background: rgba(255,255,255,.45);
              animation: splash-dot 1.2s ease-in-out infinite;
            }
            #app-splash .splash-dots span:nth-child(2) { animation-delay: .15s; }
            #app-splash .splash-dots span:nth-child(3) { animation-delay: .3s; }
            @keyframes splash-breath { 0%,100% { transform: scale(1); opacity: .95; } 50% { transform: scale(1.06); opacity: 1; } }
            @keyframes splash-dot { 0%,80%,100% { transform: scale(.6); opacity: .3; } 40% { transform: scale(1); opacity: 1; } }
          `,
        },
      ],
      script: [
        {
          tagPosition: "bodyClose",
          innerHTML: `
            (function() {
              function dismissSplash() {
                var splash = document.getElementById('app-splash');
                if (splash && !splash.classList.contains('is-hidden')) {
                  splash.classList.add('is-hidden');
                  setTimeout(function() {
                    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
                  }, 400);
                }
              }
              if (document.readyState === 'complete' || document.readyState === 'interactive') {
                setTimeout(dismissSplash, 300);
              } else {
                window.addEventListener('DOMContentLoaded', function() { setTimeout(dismissSplash, 300); });
                window.addEventListener('load', function() { setTimeout(dismissSplash, 300); });
              }
              setTimeout(dismissSplash, 1500);
            })();
          `,
        },
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
      enabled: true,
      type: "module",
    },
  },
});
