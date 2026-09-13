<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();
const terminal = useTemplateRef('terminal');

const isInitialLoading = ref(false)

watch(() => store.agentLogs.length, async () => {
  await nextTick();
  terminal.value?.scrollTo({ top: terminal.value.scrollHeight, behavior: 'smooth' });
});

const rangeLabel = computed(() => {
  const s = (store as any).analyze?.startDate
  const e = (store as any).analyze?.endDate
  if (!s || !e) return ""
  return `${s} → ${e}`
})

const rawLabel = computed(() => {
  const s = (store as any).analyze?.rawStart
  const e = (store as any).analyze?.rawEnd
  if (!s || !e) return ""
  return `${s} → ${e} (mes actual)`
})

const recommendations = computed(() => ((store as any).analyze?.recommendations ?? []) as any[])
const recommendationResource = computed(() => (store as any).analyze?.recommendationResource as any)

function formatRecommendation(r: any): string {
  if (typeof r === "string") return r
  return r.message || r.description || r.title || r.recommendation || JSON.stringify(r)
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

async function runAnalyze() {
  isInitialLoading.value = true
  await store.fetchAnalyzeAndRecommendations()
  isInitialLoading.value = false
  await nextTick()
  terminal.value?.scrollTo({ top: terminal.value.scrollHeight, behavior: 'smooth' })
}

onMounted(() => {
  const a: any = (store as any).analyze
  if (!a?.recommendations?.length && !a?.loading && !a?.lastAnalyze && !a?.recommendationResource) {
    runAnalyze()
  }
})
</script>
<template>
  <UAccordion :items="[{ label: t('console.title'), icon: 'i-heroicons-command-line', slot: 'logs' }]">
    <template #logs>
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="space-y-0.5">
            <p class="text-[11px] text-muted flex items-center gap-1.5">
              <UIcon name="i-heroicons-calendar-days" class="size-3.5" />
              Rango expandido (mes actual): <span class="font-mono font-semibold text-highlighted">{{ rangeLabel || 'calculando...' }}</span>
            </p>
            <p v-if="rawLabel" class="text-[10px] text-dimmed font-mono">Base: {{ rawLabel }}</p>
            <p v-if="(store as any).analyze?.error" class="text-[11px] text-error font-medium">{{ (store as any).analyze.error }}</p>
          </div>
          <UButton size="xs" variant="soft" color="primary" icon="i-heroicons-arrow-path" :loading="((store as any).analyze?.loading || isInitialLoading)" @click="runAnalyze">
            Analizar
          </UButton>
        </div>

        <div ref="terminal"
          class="font-mono text-xs text-primary bg-muted border border-default rounded-[calc(var(--ui-radius)/1.5)] p-3 h-36 overflow-y-auto space-y-1">
          <p v-if="!store.agentLogs.length" class="text-muted opacity-60">Sin logs aún — ejecutando /analyze...</p>
          <p v-for="(log, i) in store.agentLogs" :key="i" class="break-words">
            <span class="select-none opacity-60">&gt;</span> {{ log }}
          </p>
        </div>

        <div v-if="recommendationResource" class="space-y-3">
          <UCard class="border-primary/30 bg-primary/5">
            <div class="flex gap-2">
              <UIcon name="i-heroicons-sparkles" class="size-5 text-primary shrink-0 mt-0.5" />
              <div class="space-y-1">
                <p class="text-xs font-semibold text-highlighted">Recomendación del modelo</p>
                <p class="text-sm text-toned leading-relaxed">{{ recommendationResource.rationale?.narrative_es || recommendationResource.rationale?.narrative_en || '—' }}</p>
                <div class="flex flex-wrap gap-1.5 pt-1">
                  <UBadge color="primary" variant="subtle" size="xs">Confianza {{ Math.round((recommendationResource.recommendation?.confidence || 0)*100) }}%</UBadge>
                  <UBadge color="neutral" variant="subtle" size="xs">{{ recommendationResource.recommendation?.action || '—' }}</UBadge>
                  <UBadge color="neutral" variant="subtle" size="xs">Cadencia: {{ recommendationResource.recommendation?.cadence || '—' }}</UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div v-else-if="recommendations.length" class="space-y-1.5">
          <p class="text-[11px] font-semibold text-highlighted flex items-center gap-1">
            <UIcon name="i-heroicons-light-bulb" class="size-3.5 text-primary" />
            Recomendaciones ({{ recommendations.length }}) — GET /api/v1/analyze/recommendation
          </p>
          <div class="grid gap-1.5">
            <UCard v-for="(rec, idx) in recommendations" :key="idx" class="border-default bg-elevated">
              <p class="text-xs text-toned leading-relaxed">
                <span class="font-semibold text-highlighted">{{ idx + 1 }}.</span> {{ formatRecommendation(rec) }}
              </p>
            </UCard>
          </div>
        </div>
        <p v-else-if="!(store as any).analyze?.loading && !isInitialLoading && (store as any).analyze?.lastAnalyze" class="text-[11px] text-muted">
          Análisis completado — sin recomendaciones adicionales.
        </p>
      </div>
    </template>
  </UAccordion>
</template>
