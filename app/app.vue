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

useHead({
  htmlAttrs: { lang: code }
})

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
