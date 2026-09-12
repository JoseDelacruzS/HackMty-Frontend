<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'

const { t } = useLocale()
const initial = computed(() => t('app.shortTitle').charAt(0))
</script>

<template>
  <div
    class="min-h-screen bg-(--ui-bg-muted)/60 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
    <!-- Glow de fondo decorativo -->
    <div class="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
    <div class="absolute -bottom-40 -right-40 size-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

    <div class="w-full max-w-md space-y-6 relative z-10">
      <!-- Branding / Header -->
      <div class="flex flex-col items-center justify-center space-y-3 text-center">
        <div
          class="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20 ring-4 ring-primary/10 transition-transform hover:scale-105">
          {{ initial }}
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-bold tracking-tight text-(--ui-text-highlighted)">
            {{ t('app.shortTitle') }}
          </h1>
        </div>
      </div>

      <!-- Card Contenedor -->
      <main
        class="bg-(--ui-bg) border border-(--ui-border-muted) rounded-2xl shadow-xl shadow-black/5 p-6 sm:p-8 backdrop-blur-sm">
        <slot />
      </main>
    </div>
  </div>
</template>