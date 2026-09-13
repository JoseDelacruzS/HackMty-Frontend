<template>
  <!-- Splash de carga instantáneo en SSR / PWA: cubre toda la pantalla desde el primer render -->
  <div v-if="showSplash" id="app-splash" :class="{ 'is-hidden': isFading }">
    <img src="/icons/icon-192.png" alt="AlcancIA" />
    <div class="splash-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>

  <UApp :locale="locale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const { locale, code } = useAppLocale()
const auth = useAuthStore()
const userStore = useUserStore()

useHead({
  htmlAttrs: { lang: code }
})

// hidrata token desde cookie/localStorage al arrancar
if (import.meta.client) {
  auth.init()
} else {
  const cookie = useCookie<string | null>('auth_token')
  if (cookie.value) auth.token = cookie.value
}

// perfil persistido: rehidrata al instante y refresca desde GET /user si hay sesión
userStore.init()
if (import.meta.client && auth.isAuthenticated) {
  userStore.fetchUser()
}

const showSplash = ref(true)
const isFading = ref(false)

function dismiss() {
  if (!isFading.value) {
    isFading.value = true
    setTimeout(() => {
      showSplash.value = false
    }, 450)
  }
}

onMounted(() => {
  // Desvanece el splash apenas Nuxt monta en el cliente
  setTimeout(dismiss, 350)
})
</script>
