<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();

const ratioWithout = computed(() =>
  Math.round((store.aforeProjection.withoutAgent / store.aforeProjection.withAgent) * 100)
);
const pct = computed(() =>
  Math.round(((store.aforeProjection.withAgent - store.aforeProjection.withoutAgent) / store.aforeProjection.withoutAgent) * 100)
);
</script><template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-semibold text-highlighted">{{ t('projection.title', { age: store.user.retirementAge })
          }}</h2>
        <UBadge color="primary" size="xs">+{{ pct }}%</UBadge>
      </div>
    </template>
    <div class="space-y-4">
      <div>
        <div class="flex justify-between items-baseline text-xs mb-1.5">
          <span class="text-muted">{{ t('projection.without') }}</span>
          <span class="font-bold text-toned tabular-nums">${{ store.aforeProjection.withoutAgent.toLocaleString()
            }}</span>
        </div>
        <UProgress :model-value="ratioWithout" color="neutral" size="md" />
      </div>
      <div>
        <div class="flex justify-between items-baseline text-xs mb-1.5">
          <span class="text-muted">{{ t('projection.with') }}</span>
          <span class="font-bold text-primary tabular-nums">${{ store.aforeProjection.withAgent.toLocaleString()
            }}</span>
        </div>
        <UProgress :model-value="100" size="md" />
      </div>
      <UAlert color="primary" icon="i-heroicons-chart-bar"
        :description="t('projection.gain', { amount: (store.aforeProjection.withAgent - store.aforeProjection.withoutAgent).toLocaleString() })" />
    </div>
  </UCard>
</template>
