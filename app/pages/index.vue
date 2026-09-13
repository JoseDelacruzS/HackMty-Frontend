<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useAgentEngine } from "~/composables/useAgentEngine"
import { useFinancialStore } from "~/stores/financialStore"

const store = useFinancialStore()
const { t } = useLocale()
const firstName = computed(() => store.user.name?.split(' ')[0] ?? 'Sofía')

const { start } = useAgentEngine()
const isLoadingDashboard = ref(false)

// Hidratación real: GET /api/dashboard
onMounted(async () => {
  isLoadingDashboard.value = true
  await store.fetchDashboard()
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
