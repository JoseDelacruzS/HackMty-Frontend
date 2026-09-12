<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'

export type NotificationKind = 'leak' | 'afore' | 'credit' | 'stream' | 'info'

export interface NotificationItem {
  id: string
  kind: NotificationKind
  titleKey: string
  bodyKey: string
  timestamp: string
  read?: boolean
}

const { t } = useLocale()

const props = withDefaults(defineProps<{
  initial?: NotificationItem[]
}>(), {
  initial: () => [
    {
      id: 'n1',
      kind: 'leak',
      titleKey: 'notifSamples.leakTitle',
      bodyKey: 'notifSamples.leakBody',
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      read: false
    },
    {
      id: 'n2',
      kind: 'afore',
      titleKey: 'notifSamples.aforeTitle',
      bodyKey: 'notifSamples.aforeBody',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false
    },
    {
      id: 'n3',
      kind: 'credit',
      titleKey: 'notifSamples.creditTitle',
      bodyKey: 'notifSamples.creditBody',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read: true
    },
    {
      id: 'n4',
      kind: 'stream',
      titleKey: 'notifSamples.streamTitle',
      bodyKey: 'notifSamples.streamBody',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true
    }
  ]
})

const open = ref(false)
const notifications = ref<NotificationItem[]>(props.initial.map(n => ({ ...n })))

const unread = computed(() => notifications.value.filter(n => !n.read).length)

function markRead(id: string) {
  const n = notifications.value.find(x => x.id === id)
  if (n) n.read = true
}

function markAllRead() {
  notifications.value.forEach(n => (n.read = true))
}

function iconFor(n: NotificationItem) {
  switch (n.kind) {
    case 'leak': return 'i-heroicons-exclamation-triangle'
    case 'afore': return 'i-heroicons-banknotes'
    case 'credit': return 'i-heroicons-chart-bar'
    case 'stream': return 'i-heroicons-bolt'
    default: return 'i-heroicons-information-circle'
  }
}

function toneFor(n: NotificationItem) {
  switch (n.kind) {
    case 'leak': return 'bg-error/10 text-error'
    case 'afore': return 'bg-primary/10 text-primary'
    case 'credit': return 'bg-info/10 text-info'
    case 'stream': return 'bg-primary/10 text-primary'
    default: return 'bg-muted text-muted'
  }
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return t('time.now')
  if (diff < 3600) return t('time.minutes', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('time.hours', { n: Math.floor(diff / 3600) })
  return t('time.days', { n: Math.floor(diff / 86400) })
}
</script>
<template>
  <UDrawer v-model:open="open" :handle="false" :ui="{ content: 'sm:max-w-md' }">
    <UTooltip :text="t('appHeader.notifications')">
      <UButton color="neutral" variant="ghost" icon="i-heroicons-bell" size="md" square
        :aria-label="t('appHeader.notifications')">
        <UChip v-if="unread > 0" :text="unread > 9 ? '9+' : unread" color="error" size="md" inset />
      </UButton>
    </UTooltip>

    <template #header>
      <div class="flex items-center gap-2 w-full">
        <UIcon name="i-heroicons-bell" class="size-4 text-muted" />
        <h2 class="text-highlighted font-semibold text-base flex-1">{{ t('notif.title') }}</h2>
        <UButton v-if="unread > 0" color="primary" variant="ghost" size="xs" :label="t('notif.markAll')"
          @click="markAllRead" />
        <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="md" square
          :aria-label="t('common.close')" @click="open = false" />
      </div>
    </template>

    <template #body>
      <div v-if="notifications.length === 0" class="p-6">
        <UEmpty icon="i-heroicons-bell-slash" :title="t('notif.empty.title')"
          :description="t('notif.empty.description')" />
      </div>

      <div v-else class="divide-y divide-default">
        <button v-for="n in notifications" :key="n.id" type="button"
          class="w-full text-left flex gap-3 p-4 transition-colors hover:bg-muted/50"
          :class="n.read ? 'opacity-60' : ''" @click="markRead(n.id)">
          <span class="grid place-items-center size-9 rounded-xl shrink-0" :class="toneFor(n)">
            <UIcon :name="iconFor(n)" class="size-4.5" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2">
              <p class="text-sm font-semibold text-highlighted truncate">{{ t(n.titleKey) }}</p>
              <UChip v-if="!n.read" color="primary" size="xs" />
            </div>
            <p class="text-xs text-muted line-clamp-2 mt-0.5">{{ t(n.bodyKey) }}</p>
            <p class="text-[11px] text-dimmed mt-1">{{ timeAgo(n.timestamp) }}</p>
          </div>
        </button>
      </div>
    </template>

    <template #footer>
      <div class="p-4">
        <UButton color="primary" variant="soft" block size="lg" to="/analytics" icon="i-heroicons-sparkles"
          class="min-h-12 font-semibold">
          {{ t('notif.viewAnalytics') }}
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
