<script setup lang="ts">
import { useFinancialStore, type Cajita } from '~/stores/financialStore'

const store = useFinancialStore()
const { t } = useLocale()

const totalBalance = computed(() => store.cajitas.reduce((acc, c) => acc + c.balance, 0))
const totalYield = computed(() => store.cajitas.reduce((acc, c) => acc + c.earnedYield, 0))

// Modals state
const depositModalOpen = ref(false)
const withdrawModalOpen = ref(false)
const createModalOpen = ref(false)

const selectedCajita = ref<Cajita | null>(null)
const operationAmount = ref<number>(500)

// New cajita form
const newTitle = ref('')
const newGoal = ref(10000)
const newDeposit = ref(1000)
const newIcon = ref('i-heroicons-sparkles')

function openDeposit(cajita: Cajita) {
  selectedCajita.value = cajita
  operationAmount.value = 500
  depositModalOpen.value = true
}

function openWithdraw(cajita: Cajita) {
  selectedCajita.value = cajita
  operationAmount.value = Math.min(500, cajita.balance)
  withdrawModalOpen.value = true
}

function handleDeposit() {
  if (selectedCajita.value && operationAmount.value > 0) {
    store.depositToCajita(selectedCajita.value.id, operationAmount.value)
    depositModalOpen.value = false
  }
}

function handleWithdraw() {
  if (selectedCajita.value && operationAmount.value > 0) {
    store.withdrawFromCajita(selectedCajita.value.id, operationAmount.value)
    withdrawModalOpen.value = false
  }
}

function handleCreate() {
  if (newTitle.value.trim()) {
    store.createCajita({
      title: newTitle.value,
      icon: newIcon.value,
      goal: Number(newGoal.value) || 5000,
      initialDeposit: Number(newDeposit.value) || 0,
    })
    newTitle.value = ''
    newGoal.value = 10000
    newDeposit.value = 1000
    createModalOpen.value = false
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

    <!-- Summary Banner (Nu Bank style) -->
    <UCard class="bg-elevated border-default relative overflow-hidden">
      <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
      <div class="space-y-4 relative z-10">
        <div>
          <span class="text-xs text-muted font-medium uppercase tracking-wider">{{ t('savings.totalBalance') }}</span>
          <div class="text-3xl font-extrabold text-highlighted tracking-tight mt-0.5">
            {{ formatCurrency(totalBalance) }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-3 border-t border-default/60">
          <div>
            <span class="text-[11px] text-muted block">{{ t('savings.totalYield') }}</span>
            <span class="text-sm font-bold text-success flex items-center gap-1 mt-0.5">
              <UIcon name="i-heroicons-arrow-trending-up" class="size-4 shrink-0" />
              +{{ formatCurrency(totalYield) }}
            </span>
          </div>
          <div>
            <span class="text-[11px] text-muted block">Disponibilidad</span>
            <span class="text-sm font-semibold text-highlighted flex items-center gap-1 mt-0.5">
              <UIcon name="i-heroicons-clock" class="size-4 shrink-0 text-primary" />
              24/7 Inmediata
            </span>
          </div>
        </div>

        <div class="pt-2">
          <UButton block color="primary" icon="i-heroicons-plus-circle" @click="createModalOpen = true">
            {{ t('savings.addCajita') }}
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Vaults List (Cajitas) -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-highlighted">Tus Cajitas Activas</h2>
        <span class="text-xs text-muted">{{ store.cajitas.length }} cajitas</span>
      </div>

      <div class="grid gap-3">
        <UCard v-for="cajita in store.cajitas" :key="cajita.id" class="border-default bg-default hover:border-primary/50 transition-all">
          <div class="space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <UIcon :name="cajita.icon" class="size-6" />
                </div>
                <div>
                  <h3 class="font-semibold text-highlighted text-sm">{{ cajita.title }}</h3>
                  <p class="text-xs text-muted">
                    Meta: {{ formatCurrency(cajita.goal) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-base font-bold text-highlighted">{{ formatCurrency(cajita.balance) }}</div>
                <div class="text-[11px] text-success font-medium flex items-center justify-end gap-0.5">
                  <UIcon name="i-heroicons-arrow-trending-up" class="size-3" />
                  +{{ formatCurrency(cajita.earnedYield) }} rend.
                </div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] text-muted font-medium">
                <span>Progreso</span>
                <span>{{ Math.min(100, Math.round((cajita.balance / cajita.goal) * 100)) }}%</span>
              </div>
              <UProgress :model-value="Math.min(100, Math.round((cajita.balance / cajita.goal) * 100))" color="primary" class="h-1.5" />
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2 pt-1">
              <UButton size="xs" variant="soft" color="primary" icon="i-heroicons-plus" class="flex-1" @click="openDeposit(cajita)">
                {{ t('savings.deposit') }}
              </UButton>
              <UButton size="xs" variant="ghost" color="neutral" icon="i-heroicons-minus" class="flex-1" @click="openWithdraw(cajita)">
                {{ t('savings.withdraw') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Deposit Modal -->
    <UModal v-model:open="depositModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-highlighted text-base">
              Guardar en {{ selectedCajita?.title }}
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
            <UButton block color="primary" class="flex-1" @click="handleDeposit">{{ t('savings.submit') }}</UButton>
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
              Retirar de {{ selectedCajita?.title }}
            </h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="sm" @click="withdrawModalOpen = false" />
          </div>
          <p class="text-xs text-muted">
            Los retiros de cajitas se abonan instantáneamente a tu cuenta principal.
          </p>
          <div class="space-y-2">
            <label class="text-xs font-medium text-toned">{{ t('savings.amountLabel') }}</label>
            <UInput v-model.number="operationAmount" type="number" min="10" :max="selectedCajita?.balance || 0" class="w-full" />
            <span class="text-[11px] text-muted">Disponible: {{ formatCurrency(selectedCajita?.balance || 0) }}</span>
          </div>
          <div class="flex gap-3 pt-2">
            <UButton block color="neutral" variant="subtle" class="flex-1" @click="withdrawModalOpen = false">Cancelar</UButton>
            <UButton block color="primary" class="flex-1" @click="handleWithdraw">{{ t('savings.submit') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Create Cajita Modal -->
    <UModal v-model:open="createModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-highlighted text-base">{{ t('savings.modalCreateTitle') }}</h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="sm" @click="createModalOpen = false" />
          </div>
          <p class="text-xs text-muted">
            Crea una nueva cajita para separar tus metas con rendimiento diario del 14.5%.
          </p>
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-xs font-medium text-toned">{{ t('savings.cajitaNameLabel') }}</label>
              <UInput v-model="newTitle" placeholder="Ej. Computadora Nueva" class="w-full" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-toned">{{ t('savings.cajitaGoalLabel') }}</label>
              <UInput v-model.number="newGoal" type="number" min="500" class="w-full" />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-medium text-toned">Depósito inicial (MXN)</label>
              <UInput v-model.number="newDeposit" type="number" min="0" class="w-full" />
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <UButton block color="neutral" variant="subtle" class="flex-1" @click="createModalOpen = false">Cancelar</UButton>
            <UButton block color="primary" class="flex-1" @click="handleCreate" :disabled="!newTitle.trim()">Crear Cajita</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
