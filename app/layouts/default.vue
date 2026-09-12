<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
const route = useRoute()
const { t } = useLocale()

const navItems = computed(() => [
  { label: t('nav.dashboard'), icon: 'i-heroicons-home', to: '/' },
  { label: t('nav.history'), icon: 'i-heroicons-arrows-right-left', to: '/history' },
  { label: t('nav.analytics'), icon: 'i-heroicons-chart-pie', to: '/analytics' }
])

function isActive(to: string) {
  return route.path === to
}
</script>
<template>
  <div class="min-h-dvh flex justify-center bg-muted sm:py-6 sm:px-4">
    <!-- Shell móvil: altura fija = viewport, no min-height -->
    <main
      class="w-full max-w-md flex flex-col bg-default border-default shadow-2xl h-dvh sm:h-211 sm:max-h-[90vh] sm:rounded-(--ui-radius) sm:border overflow-hidden">
      <!-- Header fijo -->
      <header class="shrink-0 z-30">
        <LayoutMobileHeader />
      </header>

      <!-- Única zona con scroll -->
      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <slot />
      </div>

      <!-- Bottom nav fijo -->
      <nav class="shrink-0 z-30 border-t border-default bg-default pb-[env(safe-area-inset-bottom)]">
        <div class="grid grid-cols-3 gap-1 px-2 py-2">
          <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
            class="flex flex-col items-center justify-center gap-1 rounded-[calc(var(--ui-radius)/1.5)] py-2 min-h-14 text-xs font-medium transition-colors"
            :class="isActive(item.to) ? 'text-primary bg-primary/10' : 'text-muted hover:text-highlighted'">
            <UIcon :name="item.icon" class="size-5 shrink-0" />
            <span class="leading-none">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>
    </main>
  </div>
</template>
