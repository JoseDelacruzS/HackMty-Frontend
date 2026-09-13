<script setup lang="ts">
import { useFinancialStore } from '~/stores/financialStore'

const store = useFinancialStore()
const { t } = useLocale()

// Modals state
const depositModalOpen = ref(false)
const withdrawModalOpen = ref(false)
const operationAmount = ref<number>(500)
const isLoading = ref(false)
const isSubmitting = ref(false)

onMounted(async () => {
  isLoading.value = true
  await store.fetchCajita()
  isLoading.value = false
})

function openDeposit() {
  operationAmount.value = 500
  depositModalOpen.value = true
}

function openWithdraw() {
  operationAmount.value = Math.min(500, store.cajita.balance)
  withdrawModalOpen.value = true
}

async function handleDeposit() {
  if (operationAmount.value > 0) {
    isSubmitting.value = true
    await store.depositToCajitaRemote(operationAmount.value)
    isSubmitting.value = false
    depositModalOpen.value = false
  }
}

async function handleWithdraw() {
  if (operationAmount.value > 0 && operationAmount.value <= store.cajita.balance) {
    isSubmitting.value = true
    await store.withdrawFromCajitaRemote(operationAmount.value)
    isSubmitting.value = false
    withdrawModalOpen.value = false
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n)
}
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 pb-24">
    <!-- Header / Title -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-highlighted">{{ t('savings.title') }}</h1>
        <p class="text-xs text-muted">{{ t('savings.subtitle') }}</p>
      </div>
      <UBadge color="primary" variant="subtle" class="gap-1 font-semibold">
        <UIcon name="i-heroicons-bolt" class="size-3.5" />
        14.5% Tasa Fija
      </UBadge>
    </div>

    <div v-if="isLoading" class="py-10 flex justify-center">
      <UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-muted" />
    </div>
    <!-- Single Main Cajita Card -->
    <div v-else class="space-y-3">
      <UCard class="bg-elevated border-default">
        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="p-3 rounded-2xl bg-primary/10 text-primary">
                <UIcon :name="store.cajita.icon" class="size-7" />
              </div>
              <div>
                <h3 class="font-bold text-highlighted text-xl">{{ store.cajita.title }}</h3>
                <p class="text-muted text-sm">
                  Meta: {{ formatCurrency(store.cajita.goal) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xl font-extrabold text-highlighted">{{ formatCurrency(store.cajita.balance) }}</div>
              <div class="text-xs text-success font-medium flex items-center justify-end gap-0.5">
                <UIcon name="i-heroicons-arrow-trending-up" class="size-3.5" />
                +{{ formatCurrency(store.cajita.earnedYield) }} rend.
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs text-muted font-medium">
              <span>Progreso de meta</span>
              <span>{{ Math.min(100, Math.round((store.cajita.balance / store.cajita.goal) * 100)) }}%</span>
            </div>
            <UProgress :model-value="Math.min(100, Math.round((store.cajita.balance / store.cajita.goal) * 100))" color="primary" class="h-2" />
          </div>

          <!-- Action buttons -->
          <div class="grid grid-cols-2 gap-3 pt-2">
            <UButton size="md" variant="soft" color="primary" icon="i-heroicons-plus" class="justify-center" @click="openDeposit">
              {{ t('savings.deposit') }}
            </UButton>
            <UButton size="md" variant="ghost" color="neutral" icon="i-heroicons-minus" class="justify-center" @click="openWithdraw">
              {{ t('savings.withdraw') }}
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Deposit Modal -->
    <UModal v-model:open="depositModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-highlighted text-base">
              Guardar en {{ store.cajita.title }}
            </h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="sm" @click="depositModalOpen = false" />
          </div>
          <p class="text-xs text-muted">
            Transfiere fondos desde tu Safe-to-Save disponible para ganar 14.5% de rendimiento anual.
          </p>
          <div class="space-y-2">
            <label class="text-xs font-medium text-toned">{{ t('savings.amountLabel') }}</label>
            <UInput v-model.number="operationAmount" type="number" min="10" class="w-full" />
          </div>
          <div class="flex gap-3 pt-2">
            <UButton block color="neutral" variant="subtle" class="flex-1" @click="depositModalOpen = false">Cancelar</UButton>
            <UButton block color="primary" class="flex-1" :loading="isSubmitting" @click="handleDeposit">{{ t('savings.submit') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Withdraw Modal -->
    <UModal v-model:open="withdrawModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-highlighted text-base">
              Retirar de {{ store.cajita.title }}
            </h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="sm" @click="withdrawModalOpen = false" />
          </div>
          <p class="text-xs text-muted">
            Los retiros de tu cajita se abonan instantáneamente a tu cuenta principal.
          </p>
          <div class="space-y-2">
            <label class="text-xs font-medium text-toned">{{ t('savings.amountLabel') }}</label>
            <UInput v-model.number="operationAmount" type="number" min="10" :max="store.cajita.balance" class="w-full" />
            <span class="text-[11px] text-muted">Disponible: {{ formatCurrency(store.cajita.balance) }}</span>
          </div>
          <div class="flex gap-3 pt-2">
            <UButton block color="neutral" variant="subtle" class="flex-1" @click="withdrawModalOpen = false">Cancelar</UButton>
            <UButton block color="primary" class="flex-1" :loading="isSubmitting" @click="handleWithdraw">{{ t('savings.submit') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
