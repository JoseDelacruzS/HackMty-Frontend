<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();

const isSubmitting = ref(false)
const errorMsg = ref("")

// Deshabilitado si el analizador no hay aportaciones disponibles (sin saldo que usar)
const hasNoContribution = computed(() => {
  const rec = Number(store.metrics.recommendedAfore) || 0
  const safe = Number(store.metrics.safeToSave) || 0
  // Si el allocation vino 0 o safe_to_save <=0 → no hay margen
  if (rec <= 0) return true
  if (safe <= 0) return true
  return false
})

const isDisabled = computed(() => store.executed || hasNoContribution.value || isSubmitting.value)

const disabledReason = computed(() => {
  if (store.executed) return ""
  if (Number(store.metrics.recommendedAfore) <= 0) return "Sin aportación disponible — el analizador no asignó saldo (to_vault_mxn: 0, reason: no_margin)."
  if (Number(store.metrics.safeToSave) <= 0) return "Sin margen disponible (safe_to_save ≤ 0)."
  return ""
})

async function onContribute() {
  if (isDisabled.value) return
  isSubmitting.value = true
  errorMsg.value = ""
  try {
    await store.executeAforeTransferViaOperation(store.metrics.recommendedAfore)
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.statusMessage || "No se pudo registrar la operación"
  } finally {
    isSubmitting.value = false
  }
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
      {{ t('action.detected') }} <strong class="text-highlighted">${{ ((store as any).analyze?.leakAmount || 0).toLocaleString() }} MXN</strong>
      <template v-if="(store as any).analyze?.leaksDetected"> · {{ (store as any).analyze.leaksDetected }} fugas</template>
      {{ t('action.leaksKind') }}
      {{ t('action.reassign') }} <strong class="text-highlighted">${{ store.metrics.recommendedAfore }} MXN</strong>
      {{ t('action.noLifestyleChange') }}
    </p>

    <!-- Aviso cuando no hay aportación -->
    <UAlert v-if="hasNoContribution && !store.executed" color="warning" variant="subtle" icon="i-heroicons-exclamation-triangle" class="mt-3"
      title="Sin saldo disponible para reasignar" :description="disabledReason" />

    <UAlert color="primary" icon="i-heroicons-chart-bar"
      :title="t('action.impact', { amount: (store.aforeProjection.withAgent - store.aforeProjection.withoutAgent).toLocaleString() })"
      class="mt-3" />

    <UAlert v-if="errorMsg" color="error" variant="subtle" icon="i-heroicons-x-circle" :title="errorMsg" class="mt-3" />

    <UButton :disabled="isDisabled" :loading="isSubmitting" :color="store.executed ? 'success' : hasNoContribution ? 'neutral' : 'primary'"
      :icon="store.executed ? 'i-heroicons-check-circle' : hasNoContribution ? 'i-heroicons-no-symbol' : 'i-heroicons-arrow-path'" block size="lg"
      class="mt-4 min-h-[52px] font-semibold" @click="onContribute">
      {{ store.executed ? t('action.ctaDone') : hasNoContribution ? 'Sin aportación disponible' : t('action.cta', { amount: `$${store.metrics.recommendedAfore} MXN` }) }}
    </UButton>
 
  </UCard>
</template>
