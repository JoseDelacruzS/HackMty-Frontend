<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'

const route = useRoute()
const { t } = useLocale()

const navItems = computed(() => [
  { label: t('nav.dashboard'), icon: 'i-heroicons-home', to: '/' },
  { label: t('nav.history'), icon: 'i-heroicons-arrows-right-left', to: '/history' },
  { label: t('nav.analytics'), icon: 'i-heroicons-chart-pie', to: '/analytics' },
  { label: t('nav.savings'), icon: 'i-heroicons-wallet', to: '/saving' }
])
</script>

<template>
  <!-- Shell anclado al viewport real: position:fixed evita el desfase del dvh en iOS PWA -->
  <div class="fixed inset-0 overflow-hidden bg-default">

    <!-- Columna de contenido: ocupa toda la pantalla, sin franjas -->
    <main class="flex h-full w-full flex-col overflow-hidden bg-default">

      <!-- Header con acolchado para la Notch / Status Bar en iOS -->
      <header class="shrink-0 z-30 pt-[env(safe-area-inset-top)] bg-default select-none">
        <LayoutMobileHeader />
      </header>

      <!-- Zona de contenido deslizable -->
      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <slot />
      </div>

      <!-- Bottom Nav: max() blinda el safe-area si env() devuelve 0 en standalone -->
      <nav class="shrink-0 z-30 border-t border-default bg-default pb-[max(env(safe-area-inset-bottom),1.25rem)] select-none"
        aria-label="Navegación principal">
        <div class="grid grid-cols-4 gap-1 px-2 pt-2 pb-1">
          <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" prefetch
            class="flex flex-col items-center justify-center gap-1 rounded-[calc(var(--ui-radius)/1.5)] min-h-11 text-xs font-medium transition-colors touch-manipulation active:scale-95"
            :class="route.path === item.to ? 'text-primary bg-primary/10' : 'text-muted hover:text-highlighted'"
            :aria-current="route.path === item.to ? 'page' : undefined">
            <UIcon :name="item.icon" class="size-5 shrink-0" />
            <span class="leading-none tracking-tight">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

    </main>
  </div>
</template>