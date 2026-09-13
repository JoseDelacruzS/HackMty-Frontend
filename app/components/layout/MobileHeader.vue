<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
const { t } = useLocale()

const profile = {
  last_name: 'Arecjoha',
  first_name: 'Test Eugenio',
  _id: 'e96df8a9-433b-4f53-91db-fb19def43c07',
  address: {
    street_number: '528',
    street_name: 'Av arturo B',
    city: 'San Nicolas',
    state: 'Nuevo Leon',
    zip: '66414'
  },
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Arecjoha'
}
</script>
<template>
  <header
    class="flex items-center justify-between gap-3 px-4 border-b border-default bg-default/80 backdrop-blur-md">
    <div class="py-3 flex items-center gap-2.5 min-w-0">
      <LayoutUserProfileDrawer :profile="profile" />
      <div class="min-w-0">
        <h1 class="text-[15px] font-bold tracking-tight text-highlighted leading-none">
          {{ t('app.title') }}
        </h1>
        <p class="mt-1 text-[11px] text-muted flex items-center gap-1.5">
          <UBadge color="primary" variant="soft" size="xs" class="gap-1">
            <template #leading>
              <span class="relative flex size-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span class="relative inline-flex rounded-full size-1.5 bg-primary" />
              </span>
            </template>
            {{ t('app.live') }}
          </UBadge>
          <span class="truncate">{{ t('app.stream') }}</span>
        </p>
      </div>
    </div>

    <div class="flex items-center gap-1 py-3">
      <LayoutNotificationsDrawer />
      <LayoutSettingsDrawer />
    </div>
  </header>
</template>
