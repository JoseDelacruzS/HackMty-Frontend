<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();

const savingsRate = computed(() => (store.metrics.safeToSave / store.metrics.income) * 100);
const solvencyPct = computed(() => Math.min(100, Math.round((savingsRate.value / 20) * 100)));
</script>
<template>
  <div class="grid grid-cols-2 gap-3">
    <UCard>
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medium text-muted">Safe-to-Save™</span>
        <UIcon name="i-heroicons-shield-check" class="size-4 text-primary shrink-0" />
      </div>
      <div class="mt-1 text-xl font-extrabold tracking-tight text-primary tabular-nums">
        ${{ store.metrics.safeToSave.toLocaleString() }}
      </div>
      <span class="text-xs text-muted">{{ t('metrics.freeBuffer') }}</span>
      <UProgress :model-value="62" class="mt-2" size="xs" />
    </UCard>

    <UCard>
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medium text-muted">{{ t('metrics.savingsRate') }}</span>
        <UIcon name="i-heroicons-chart-pie" class="size-4 text-secondary shrink-0" />
      </div>
      <div class="mt-1 text-xl font-extrabold tracking-tight text-highlighted tabular-nums">
        {{ savingsRate.toFixed(1) }}<span class="text-xs font-medium text-muted">%</span>
      </div>
      <span class="text-xs font-medium text-primary flex items-center gap-1">
        <UIcon name="i-heroicons-check-badge" class="size-3.5" />
        {{ t('metrics.verified') }}
      </span>
      <UProgress :model-value="solvencyPct" color="secondary" class="mt-2" size="xs" />
    </UCard>
  </div>
</template>
