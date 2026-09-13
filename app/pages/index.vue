<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useAgentEngine } from "~/composables/useAgentEngine"
import { useFinancialStore } from "~/stores/financialStore"

const store = useFinancialStore()
const { t } = useLocale()
const firstName = computed(() => store.user.name?.split(' ')[0] ?? 'Sofía')

const { start } = useAgentEngine()
const isLoadingDashboard = ref(false)

// Dashboard se llena desde /analyze (rango mes actual ±1 día)
// Después /analyze se encadeniza /analyze/recommendation para la consola
onMounted(async () => {
  isLoadingDashboard.value = true
  // Pipelines: /analyze hidrata métricas/usuario/proyección; recommendations hidrata consola
  await store.fetchAnalyzeAndRecommendations()
  // Fallback si backend aún no tiene /analyze: intenta /dashboard
  if (!(store as any).analyze?.lastAnalyze) {
    await store.fetchDashboard()
  }
  isLoadingDashboard.value = false
  start()
})
</script>
<template>
  <div class="p-4 space-y-4">
    <section>
      <p class="text-xs font-medium text-muted">{{ t('app.greeting') }}</p>
      <h2 class="text-xl font-bold tracking-tight text-highlighted">{{ t('app.greetingQuestion', { name: firstName }) }}</h2>
    </section>

    <DashboardMetricCards />
    <AgentActionCard />
    <DashboardProjectionChart />
    <AgentConsoleLogs />
  </div>
</template>
