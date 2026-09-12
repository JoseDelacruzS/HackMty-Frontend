<template>
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
</script>
