<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();
const isSubmitting = ref(false)
async function onContribute() {
  isSubmitting.value = true
  await store.contributeAforeRemote(store.metrics.recommendedAfore)
  isSubmitting.value = false
}
</script>
<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-sparkles" class="size-5 text-secondary shrink-0" />
        <h2 class="text-sm font-semibold text-highlighted">{{ t('action.title') }}</h2>
        <UBadge color="secondary" size="xs" class="ml-auto shrink-0">AI</UBadge>
      </div>
      <p class="mt-1 text-xs text-muted">{{ t('action.subtitle') }}</p>
    </template>

    <p class="text-sm text-toned">
      {{ t('action.detected') }} <strong class="text-highlighted">$840 MXN</strong>
      {{ t('action.leaksKind') }}
      {{ t('action.reassign') }} <strong class="text-highlighted">${{ store.metrics.recommendedAfore }} MXN</strong>
      {{ t('action.noLifestyleChange') }}
    </p>

    <UAlert color="primary" icon="i-heroicons-chart-bar"
      :title="t('action.impact', { amount: (store.aforeProjection.withAgent - store.aforeProjection.withoutAgent).toLocaleString() })"
      class="mt-3" />

    <UButton :disabled="store.executed" :loading="isSubmitting" :color="store.executed ? 'success' : 'primary'"
      :icon="store.executed ? 'i-heroicons-check-circle' : 'i-heroicons-arrow-path'" block size="lg"
      class="mt-4 min-h-[52px] font-semibold" @click="onContribute">
      {{ store.executed ? t('action.ctaDone') : t('action.cta', { amount: `$${store.metrics.recommendedAfore} MXN` }) }}
    </UButton>
  </UCard>
</template>
