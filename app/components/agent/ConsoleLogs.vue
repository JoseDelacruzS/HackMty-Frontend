<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();
const terminal = useTemplateRef('terminal');

const isInitialLoading = ref(false)
const progress = ref(0)
const showCompletion = ref(false)
let progressTimer: ReturnType<typeof setInterval> | null = null

const isAnalyzing = computed(() => Boolean((store as any).analyze?.loading || isInitialLoading.value))

function startProgress() {
  progress.value = 8
  showCompletion.value = false
  if (progressTimer) clearInterval(progressTimer)
  progressTimer = setInterval(() => {
    if (progress.value < 88) {
      progress.value = Math.min(88, progress.value + Math.random() * 6 + 2)
    } else if (progress.value < 95) {
      progress.value = Math.min(95, progress.value + 0.6)
    }
  }, 180)
}

function finishProgress() {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  progress.value = 100
  // celebra 2.5s
  if ((store as any).analyze?.lastAnalyze && !(store as any).analyze?.error) {
    showCompletion.value = true
    setTimeout(() => (showCompletion.value = false), 2600)
  }
}

watch(isAnalyzing, (val) => {
  if (val) startProgress()
  else finishProgress()
})

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

        <!-- Animación de espera: agente IA pensando -->
        <div v-if="isAnalyzing" class="relative overflow-hidden rounded-xl border border-primary/20 bg-elevated p-4">
          <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 animate-pulse pointer-events-none" />
          <!-- shimmer bar -->
          <div class="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
            <div class="h-full w-1/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]" />
          </div>
          <div class="relative flex items-center gap-3">
            <div class="relative shrink-0">
              <div class="absolute -inset-1.5 bg-primary/20 rounded-full blur-md animate-pulse" />
              <div class="relative size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="size-5 text-primary animate-pulse" />
                <span class="absolute -top-0.5 -right-0.5 size-2.5 bg-primary rounded-full animate-ping opacity-75" />
                <span class="absolute -top-0.5 -right-0.5 size-2.5 bg-primary rounded-full" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-highlighted flex items-center gap-1.5">
                Agente IA analizando
                <span class="inline-flex items-center gap-1 ml-1">
                  <span class="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span class="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span class="size-1.5 bg-primary rounded-full animate-bounce" />
                </span>
              </p>
              <p class="text-xs text-muted truncate">Revisando flujo {{ rangeLabel || '...' }} · detectando fugas y proyección AFORE</p>
            </div>
            <UBadge color="primary" variant="subtle" size="xs" class="shrink-0 animate-pulse">En vivo</UBadge>
          </div>
          <div class="relative mt-3 space-y-1.5">
            <div class="flex justify-between text-[11px] text-muted">
              <span>Progreso del análisis</span>
              <span class="font-mono font-medium text-primary">{{ Math.round(progress) }}%</span>
            </div>
            <UProgress :model-value="Math.round(progress)" color="primary" size="xs" class="h-1.5" />
            <div class="flex gap-1.5 text-[10px] text-dimmed">
              <span class="animate-pulse">cash_flow</span><span class="text-muted">·</span><span class="animate-pulse [animation-delay:200ms]">leaks</span><span class="text-muted">·</span><span class="animate-pulse [animation-delay:400ms]">vault</span><span class="text-muted">·</span><span class="animate-pulse [animation-delay:600ms]">scores</span>
            </div>
          </div>
        </div>

        <!-- Animación de completado: el usuario sabe que terminó -->
        <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0 scale-95">
          <div v-if="showCompletion" class="relative overflow-hidden rounded-xl border border-success/20 bg-success/10 p-3 flex items-center gap-3">
            <div class="absolute inset-0 pointer-events-none">
              <span class="absolute size-1.5 bg-success rounded-full animate-ping left-[12%] top-[30%]" />
              <span class="absolute size-1 bg-success/60 rounded-full animate-ping [animation-delay:300ms] left-[78%] top-[20%]" />
              <span class="absolute size-1 bg-success/60 rounded-full animate-ping [animation-delay:600ms] left-[55%] top-[75%]" />
            </div>
            <div class="relative size-8 rounded-full bg-success text-white flex items-center justify-center shrink-0 animate-[bounce_0.6s_ease]">
              <UIcon name="i-heroicons-check" class="size-5" />
            </div>
            <div class="relative">
              <p class="text-sm font-bold text-success">¡Análisis completado!</p>
              <p class="text-xs text-success/80">El agente IA terminó — dashboard y recomendaciones actualizadas.</p>
            </div>
            <UIcon name="i-heroicons-sparkles" class="ml-auto size-5 text-success/60 animate-pulse" />
          </div>
        </Transition>

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

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
