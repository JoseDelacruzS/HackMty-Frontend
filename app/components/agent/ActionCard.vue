<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();

const isSubmitting = ref(false)
const errorMsg = ref("")

const recommendationResource = computed(() => (store as any).analyze?.recommendationResource as any)
const allocation = computed(() => recommendationResource.value?.recommendation?.allocation as any)
const rationale = computed(() => recommendationResource.value?.rationale as any)
const rangeLabel = computed(() => {
  const a: any = (store as any).analyze
  if (!a?.startDate || !a?.endDate) return ""
  return `${a.startDate} → ${a.endDate}`
})

// Deshabilitado si el analizador no hay aportaciones disponibles (sin saldo que usar)
const hasNoContribution = computed(() => {
  const rec = Number(store.metrics.recommendedAfore) || 0
  const safe = Number(store.metrics.safeToSave) || 0
  // El backend manda to_vault_mxn:0 + reason_key:no_margin cuando no hay margen
  const vaultZero = allocation.value ? Number(allocation.value.to_vault_mxn) === 0 : rec <= 0
  if (vaultZero) return true
  if (rec <= 0) return true
  if (safe <= 0) return true
  return false
})

const isDisabled = computed(() => store.executed || hasNoContribution.value || isSubmitting.value)

const emptyTitle = computed(() => {
  if (allocation.value?.reason_key === "no_margin") return "Este mes cuidamos tu margen"
  if (Number(store.metrics.safeToSave) < 0) return "Sin excedente este mes"
  return "Sin saldo disponible para reasignar"
})

const emptyDescription = computed(() => {
  // Prioriza la narrativa humana del modelo
  if (rationale.value?.narrative_es) return rationale.value.narrative_es
  if (rationale.value?.narrative_en) return rationale.value.narrative_en
  if (allocation.value?.reason_key === "no_margin") {
    const safe = Number(store.metrics.safeToSave)
    return safe < 0
      ? `Tus gastos fijos superaron tus ingresos por ${Math.abs(safe).toLocaleString()} MXN, así que no hay excedente para enviar a tu AFORE sin afectar tu día a día. En cuanto detecte margen, te propondré una aportación.`
      : "Tu flujo no dejó excedente este mes. No reasignaremos nada para no afectar tus gastos esenciales."
  }
  if (Number(store.metrics.safeToSave) <= 0) return "No quedó margen libre después de gastos fijos. Lo revisamos de nuevo en tu próximo corte."
  return "El analizador no asignó aportación para este periodo."
})

const emptyHint = computed(() => {
  if (!allocation.value) return ""
  const parts: string[] = []
  if (rangeLabel.value) parts.push(`Analizado ${rangeLabel.value}`)
  if (typeof allocation.value.capacity_mxn === "number") parts.push(`capacidad ${allocation.value.capacity_mxn.toLocaleString()} MXN`)
  if (typeof allocation.value.leak_recoverable_mxn === "number" && allocation.value.leak_recoverable_mxn > 0) parts.push(`fugas recuperables ${allocation.value.leak_recoverable_mxn.toLocaleString()} MXN`)
  return parts.join(" · ")
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

    <!-- Mensaje contextual: con y sin aportación -->
    <template v-if="hasNoContribution && !store.executed">
      <UCard class="mt-3 border-warning/20 bg-warning/5">
        <div class="flex gap-3">
          <div class="size-9 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center shrink-0">
            <UIcon name="i-heroicons-shield-exclamation" class="size-5 text-warning" />
          </div>
          <div class="min-w-0 flex-1 space-y-1">
            <p class="text-sm font-semibold text-highlighted">{{ emptyTitle }}</p>
            <p class="text-sm text-toned leading-relaxed">{{ emptyDescription }}</p>
            <p v-if="emptyHint" class="text-[11px] font-mono text-muted">{{ emptyHint }}</p>
            <div class="flex flex-wrap gap-1.5 pt-1">
              <UBadge color="warning" variant="subtle" size="xs">aportación: {{ allocation?.to_vault_mxn ?? 0 }} MXN</UBadge>
              <UBadge v-if="typeof store.metrics.safeToSave === 'number'" color="neutral" variant="subtle" size="xs">safe_to_save: ${{ store.metrics.safeToSave.toLocaleString() }} MXN</UBadge>
            </div>
          </div>
        </div>
      </UCard>
      <p class="mt-2 text-[11px] text-muted leading-relaxed">
        No te preocupes — mantenemos tu colchón intacto. Vuelve a analizar después de tu próximo ingreso y te sugeriré el monto ideal.
      </p>
    </template>
    <template v-else-if="!store.executed">
      <p class="text-sm text-toned">
        {{ t('action.detected') }} <strong class="text-highlighted">${{ ((store as any).analyze?.leakAmount || 0).toLocaleString() }} MXN</strong>
        <template v-if="(store as any).analyze?.leaksDetected"> · {{ (store as any).analyze.leaksDetected }} fugas</template>
        {{ t('action.leaksKind') }}
        {{ t('action.reassign') }} <strong class="text-highlighted">${{ store.metrics.recommendedAfore }} MXN</strong>
        {{ t('action.noLifestyleChange') }}
      </p>
    </template>
    <template v-else>
      <p class="text-sm text-success font-medium flex items-center gap-1.5">
        <UIcon name="i-heroicons-check-circle" class="size-4" />
        Aportación registrada — tu AFORE ya refleja el movimiento.
      </p>
    </template>

    <UAlert v-if="!hasNoContribution || store.executed" color="primary" icon="i-heroicons-chart-bar"
      :title="t('action.impact', { amount: (store.aforeProjection.withAgent - store.aforeProjection.withoutAgent).toLocaleString() })"
      :description="store.executed ? 'Movimiento aplicado.' : `Basado en ${rangeLabel || 'este periodo'} con confianza ${Math.round((recommendationResource?.recommendation?.confidence || 0)*100)}%`"
      class="mt-3" />
   

    <UAlert v-if="errorMsg" color="error" variant="subtle" icon="i-heroicons-x-circle" :title="errorMsg" class="mt-3" />

    <UButton :disabled="isDisabled" :loading="isSubmitting" :color="store.executed ? 'success' : hasNoContribution ? 'neutral' : 'primary'"
      :icon="store.executed ? 'i-heroicons-check-circle' : hasNoContribution ? 'i-heroicons-no-symbol' : 'i-heroicons-arrow-path'" block size="lg"
      class="mt-4 min-h-[52px] font-semibold" @click="onContribute">
      {{ store.executed ? t('action.ctaDone') : hasNoContribution ? 'Sin margen este mes — te aviso en cuanto haya' : t('action.cta', { amount: `$${store.metrics.recommendedAfore} MXN` }) }}
    </UButton>

 
  </UCard>
</template>
