<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore";
const store = useFinancialStore();
const { t } = useLocale();
const terminal = useTemplateRef('terminal');

watch(() => store.agentLogs.length, async () => {
  await nextTick();
  terminal.value?.scrollTo({ top: terminal.value.scrollHeight, behavior: 'smooth' });
});
</script>
<template>
  <UAccordion :items="[{ label: t('console.title'), icon: 'i-heroicons-command-line', slot: 'logs' }]">
    <template #logs>
      <div ref="terminal"
        class="font-mono text-xs text-primary bg-muted border border-default rounded-[calc(var(--ui-radius)/1.5)] p-3 h-32 overflow-y-auto space-y-1">
        <p v-for="(log, i) in store.agentLogs" :key="i" class="break-words">
          <span class="select-none opacity-60">&gt;</span> {{ log }}
        </p>
      </div>
    </template>
  </UAccordion>
</template>
