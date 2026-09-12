<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore"
const store = useFinancialStore()
const { t } = useLocale()

const SAVINGS_GOAL_RATE = 0.2

const income = computed(() => store.metrics.income)
const variableExpenses = computed(() =>
  store.transactions
    .filter(txn => txn.amount < 0)
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0)
)
const totalExpenses = computed(() => store.metrics.fixedExpenses + variableExpenses.value)
const net = computed(() => income.value - totalExpenses.value)

interface Bucket {
  key: string
  label: string
  amount: number
  hasLeak: boolean
}

function sumBy(categories: string[]) {
  return store.transactions
    .filter(txn => txn.amount < 0 && categories.includes(txn.category))
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0)
}

function leakIn(categories: string[]) {
  return store.transactions.some(txn => categories.includes(txn.category) && txn.isLeak)
}

const buckets = computed<Bucket[]>(() => [
  { key: 'housing', label: t('analytics.housing'), amount: store.metrics.fixedExpenses, hasLeak: false },
  { key: 'food', label: t('analytics.food'), amount: sumBy(['food_delivery', 'coffee']), hasLeak: leakIn(['food_delivery', 'coffee']) },
  { key: 'subs', label: t('analytics.subs'), amount: sumBy(['subscriptions', 'convenience']), hasLeak: leakIn(['subscriptions', 'convenience']) }
])

function shareOf(amount: number) {
  if (totalExpenses.value <= 0) return 0
  return Math.round((amount / totalExpenses.value) * 100)
}

const savingsRate = computed(() => store.metrics.safeToSave / store.metrics.income)
const solvencyPct = computed(() => Math.min(100, Math.round((savingsRate.value / SAVINGS_GOAL_RATE) * 100)))
</script>
<template>
  <div class="p-4 space-y-4">
    <div>
      <p class="text-xs font-medium text-muted">{{ t('analytics.subtitle') }}</p>
      <h1 class="text-lg font-bold tracking-tight text-highlighted">{{ t('analytics.title') }}</h1>
    </div>

    <!-- Resumen de balance -->
    <UCard>
      <template #header>
        <h2 class="text-sm font-semibold text-highlighted">{{ t('analytics.balance') }}</h2>
      </template>
      <div class="flex items-center justify-between text-sm py-2 border-b border-default">
        <span class="text-muted flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-trending-up" class="size-4 text-success" />
          {{ t('analytics.income') }}
        </span>
        <strong class="tabular-nums text-success">+${{ income.toLocaleString() }}</strong>
      </div>
      <div class="flex items-center justify-between text-sm py-2 border-b border-default">
        <span class="text-muted flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-trending-down" class="size-4 text-error" />
          {{ t('analytics.expenses') }}
        </span>
        <strong class="tabular-nums text-error">-${{ totalExpenses.toLocaleString() }}</strong>
      </div>
      <div class="flex items-center justify-between text-sm py-2">
        <span class="text-muted">{{ t('analytics.net') }}</span>
        <strong class="tabular-nums text-base" :class="net >= 0 ? 'text-primary' : 'text-error'">
          {{ net >= 0 ? "+" : "-" }}${{ Math.abs(net).toLocaleString() }}
        </strong>
      </div>
    </UCard>

    <!-- Desglose por categoría -->
    <UCard>
      <template #header>
        <h2 class="text-sm font-semibold text-highlighted">{{ t('analytics.breakdown') }}</h2>
      </template>
      <div class="space-y-4">
        <div v-for="bucket in buckets" :key="bucket.key">
          <div class="flex justify-between items-center text-xs mb-1.5">
            <span class="text-muted flex items-center gap-1.5">
              {{ bucket.label }}
              <UBadge v-if="bucket.hasLeak" color="error" size="xs">{{ t('history.leak') }}</UBadge>
            </span>
            <span class="font-bold text-toned tabular-nums">
              ${{ bucket.amount.toLocaleString() }} · {{ shareOf(bucket.amount) }}%
            </span>
          </div>
          <UProgress :model-value="shareOf(bucket.amount)" :color="bucket.hasLeak ? 'error' : 'primary'" size="md" />
        </div>
      </div>
    </UCard>

    <!-- Solvencia financiera -->
    <UCard :ui="{ body: 'p-6 flex flex-col items-center gap-1 text-center' }">
      <UIcon name="i-heroicons-shield-check" class="size-8 text-primary" />
      <h2 class="mt-1 text-base font-bold tracking-tight text-highlighted">{{ t('analytics.solvencyTitle') }}</h2>
      <UMeter :value="solvencyPct" :min="0" :max="100" color="primary" size="lg" class="w-full max-w-55" />
      <p class="text-xs font-semibold text-primary">{{ t('analytics.ofGoal', { pct: solvencyPct }) }}</p>
      <p class="mt-1 text-xs text-muted leading-relaxed">
        {{ t('analytics.solvencyBody', { amount: `$${store.metrics.safeToSave.toLocaleString()} MXN`, rate: (savingsRate * 100).toFixed(1) }) }}
      </p>
      <p class="mt-1 text-[11px] text-dimmed">{{ t('analytics.solvencyHint') }}</p>
    </UCard>
  </div>
</template>
