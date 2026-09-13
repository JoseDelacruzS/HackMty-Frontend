<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { VisXYContainer, VisArea, VisLine, VisAxis, VisTooltip } from '@unovis/vue'
import { useFinancialStore } from "~/stores/financialStore"

const store = useFinancialStore()
const { t } = useLocale()

const chartData = computed(() => {
  const startAge = store.user.age
  const endAge = store.user.retirementAge
  const points = []
  const baseWithout = store.aforeProjection.withoutAgent
  const baseWith = store.aforeProjection.withAgent

  for (let age = startAge; age <= endAge; age += 5) {
    const progress = (age - startAge) / (endAge - startAge || 1)
    const without = Math.round(baseWithout * Math.pow(progress, 1.8) + 40000 * (1 + progress))
    const withAg = Math.round(baseWith * Math.pow(progress, 1.9) + 70000 * (1 + progress))
    points.push({
      age,
      withoutAgent: Math.max(10000, without),
      withAgent: Math.max(15000, withAg),
    })
  }
  if (points.length > 0) {
    points[points.length - 1]!.withoutAgent = baseWithout
    points[points.length - 1]!.withAgent = baseWith
  }
  return points
})

</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-chart-bar" class="size-5 text-primary shrink-0" />
        <h2 class="text-sm font-semibold text-highlighted">{{ t('projectionGraph.title') }}</h2>
        <UBadge color="primary" size="xs" class="ml-auto shrink-0">AI Live</UBadge>
      </div>
      <p class="mt-1 text-xs text-muted">{{ t('projectionGraph.subtitle') }}</p>
    </template>

    <div class="space-y-4">
      <div class="flex items-center justify-end gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-neutral-500/50 shrink-0"></span>
          <span class="text-muted text-[11px]">{{ t('projectionGraph.withoutAgent') }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-primary shrink-0"></span>
          <span class="font-medium text-highlighted text-[11px]">{{ t('projectionGraph.withAgent') }}</span>
        </div>
      </div>

      <div class="h-60 w-full pt-2 unovis-minimal">
        <VisXYContainer 
          :data="chartData" 
          class="w-full h-full"
        >
          <VisArea
            :x="(d: any) => d.age"
            :y="[(d: any) => d.withoutAgent, (d: any) => d.withAgent]"
            :color="['transparent', ]"
            :opacity="0.08"
          />
          <VisLine
            :x="(d: any) => d.age"
            :y="[(d: any) => d.withoutAgent, (d: any) => d.withAgent]"
            :color="['var(--ui-color-neutral-600)', 'var(--ui-color-primary-500)']"
            :stroke-width="1.5"
          />
          <VisAxis
            type="x"
            :x="(d: any) => d.age"
            :tick-format="(d: number) => `${d}a`"
            :num-ticks="5"
            :grid-line="false"
            :domain-line="false"
            :tick-line="false"
          />
          <VisAxis
            type="y"
            :tick-format="(d: number) => `$${(d / 1000000).toFixed(1)}M`"
            :num-ticks="3"
            :grid-line="false"
            :domain-line="false"
            :tick-line="false"
          />
          <VisTooltip />
        </VisXYContainer>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
:deep(.unovis-minimal) {
  --vis-axis-grid-line-color: transparent;
  --vis-axis-domain-line-color: transparent;
  --vis-axis-tick-color: transparent;
  --vis-axis-tick-label-color: var(--ui-color-neutral-400);
  --vis-axis-tick-label-font-size: 10px;
}
</style>