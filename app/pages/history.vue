<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore, type Transaction } from "~/stores/financialStore"
const store = useFinancialStore()
const { t } = useLocale()
const { code } = useAppLocale()

const leaks = computed(() => store.transactions.filter(txn => txn.isLeak).length)
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  await store.fetchOperations()
  isLoading.value = false
})

const open = ref(false)
const selected = ref<Transaction | null>(null)

function openDetail(txn: Transaction) {
  selected.value = txn
  open.value = true
}

function iconFor(txn: Transaction) {
  if (txn.category === 'income') return 'i-heroicons-arrow-down-left'
  if (txn.category === 'food_delivery') return 'i-heroicons-shopping-bag'
  if (txn.category === 'subscriptions') return 'i-heroicons-play-circle'
  return 'i-heroicons-arrows-right-left'
}

function lookup(ns: string, value: string) {
  const key = `${ns}.${value}`
  const label = t(key)
  return label === key ? value : label
}

function categoryLabel(category: string) {
  return lookup('category', category)
}

function dateLocale() {
  return code.value === 'es' ? 'es-MX' : 'en-US'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })
}

function formatFull(iso: string) {
  return new Date(iso).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short', year: 'numeric' })
}

const detail = computed(() => {
  const txn = selected.value
  if (!txn) return null
  return {
    merchant: txn.merchant,
    id: txn.id,
    medium: lookup('history.medium', txn.medium ?? 'balance'),
    status: lookup('history.status', txn.status ?? 'completed'),
    amount: `${txn.amount > 0 ? "+" : ""}$${txn.amount.toLocaleString()} MXN`,
    isPositive: txn.amount > 0,
    txnDate: formatFull(txn.timestamp),
    description: txn.description ?? txn.merchant,
    createdAt: formatFull(txn.timestamp),
    isLeak: txn.isLeak
  }
})
</script>
<template>
  <div class="p-4 space-y-3">
    <div class="flex items-end justify-between gap-2">
      <div>
        <p class="text-xs font-medium text-muted">{{ t('history.subtitle') }}</p>
        <h1 class="text-lg font-bold tracking-tight text-highlighted">{{ t('history.title') }}</h1>
      </div>
      <UBadge v-if="leaks" color="error" size="md">{{ t('history.leaks', { n: leaks }) }}</UBadge>
    </div>

    <div v-if="isLoading" class="py-6 flex justify-center">
      <UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-muted" />
    </div>
    <div v-else class="space-y-2">
      <UCard v-for="txn in store.transactions" :key="txn.id"
        :ui="{ body: 'p-3 flex items-center justify-between gap-3' }"
        class="cursor-pointer transition-colors hover:border-primary/40" @click="openDetail(txn)">
        <div class="flex items-center gap-3 min-w-0">
          <UAvatar :icon="iconFor(txn)" size="md" :color="txn.amount > 0 ? 'primary' : txn.isLeak ? 'error' : 'neutral'"
            variant="soft" class="shrink-0" />
          <div class="min-w-0">
            <div class="font-semibold text-sm text-highlighted flex items-center gap-1.5">
              <span class="truncate">{{ txn.merchant }}</span>
              <UBadge v-if="txn.isLeak" color="error" size="xs" class="shrink-0">{{ t('history.leak') }}</UBadge>
            </div>
            <div class="text-xs text-muted truncate">
              {{ formatDate(txn.timestamp) }} · {{ categoryLabel(txn.category) }}
            </div>
          </div>
        </div>
        <div class="text-sm font-bold tabular-nums whitespace-nowrap shrink-0"
          :class="txn.amount > 0 ? 'text-primary' : 'text-highlighted'">
          {{ txn.amount > 0 ? "+" : "" }}${{ txn.amount.toLocaleString() }}
        </div>
      </UCard>
    </div>

    <UModal v-model:open="open" :title="detail?.merchant ?? t('history.detail.title')">
      <template #body>
        <div v-if="detail">
          <div class="flex items-center gap-2 pb-3">
            <UBadge v-if="detail.isLeak" color="error" size="xs">{{ t('history.leak') }}</UBadge>
            <span class="text-xs text-muted">{{ detail.description }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 border-t border-default text-sm">
            <span class="text-muted">{{ t('history.detail.amount') }}</span>
            <strong class="tabular-nums" :class="detail.isPositive ? 'text-primary' : 'text-highlighted'">{{
              detail.amount }}</strong>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 border-t border-default text-sm">
            <span class="text-muted">{{ t('history.detail.status') }}</span>
            <UBadge color="neutral" size="sm">{{ detail.status }}</UBadge>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 border-t border-default text-sm">
            <span class="text-muted">{{ t('history.detail.medium') }}</span>
            <span class="text-highlighted font-medium">{{ detail.medium }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 border-t border-default text-sm">
            <span class="text-muted">{{ t('history.detail.txnDate') }}</span>
            <span class="text-highlighted font-medium">{{ detail.txnDate }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 border-t border-default text-sm">
            <span class="text-muted">{{ t('history.detail.description') }}</span>
            <span class="text-highlighted font-medium text-right truncate max-w-45">{{ detail.description }}</span>
          </div>
          <div class="flex items-center justify-between gap-3 py-2 border-y border-default text-sm">
            <span class="text-muted">{{ t('history.detail.id') }}</span>
            <span class="font-mono text-[11px] text-highlighted truncate max-w-45">{{ detail.id }}</span>
          </div>
          <p class="pt-4 text-sm text-dimmed">{{ t('history.detail.createdAt') }}: {{ detail.createdAt }}</p>
        </div>
      </template>
      <template #footer>
        <UButton color="neutral" variant="soft" block @click="open = false">
          {{ t('common.close') }}
        </UButton>
      </template>
    </UModal>
  </div>
</template>
