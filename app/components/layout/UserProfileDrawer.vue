<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useAuthStore } from '~/stores/auth'
import { useFinancialStore } from '~/stores/financialStore'
const { t } = useLocale()
const auth = useAuthStore()
const financial = useFinancialStore()

const props = withDefaults(defineProps<{
  profile: UserProfile
}>(), {
  profile: () => ({
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
  })
})

export interface UserProfile {
  last_name: string
  first_name: string
  _id: string
  address: {
    street_number: string
    street_name: string
    city: string
    state: string
    zip: string
  }
  avatar?: string
}

const open = ref(false)

const shortId = computed(() => `${props.profile._id.slice(0, 8)}…`)
const fullStreet = computed(
  () => `${props.profile.address.street_name} ${props.profile.address.street_number}`
)

async function logout() {
  open.value = false
  auth.logout()
  financial.logout()
  await navigateTo('/login')
}
</script>
<template>
  <UDrawer v-model:open="open" direction="right" :handle="false" :ui="{ content: 'sm:max-w-md' }">
    <UTooltip :text="t('appHeader.profile')">
      <UAvatar :src="profile.avatar" :alt="`${profile.first_name} ${profile.last_name}`" size="md"
        class="cursor-pointer" />
    </UTooltip>

    <template #header>
      <div class="flex items-center gap-3 w-full">
        <UAvatar :src="profile.avatar" :alt="`${profile.first_name} ${profile.last_name}`" size="lg" />
        <div class="min-w-0 flex-1">
          <h2 class="text-highlighted font-semibold text-base truncate">
            {{ profile.first_name }} {{ profile.last_name }}
          </h2>
          <p class="text-xs text-muted truncate">ID · {{ shortId }}</p>
        </div>
        <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="md" square
          :aria-label="t('common.close')" @click="open = false" />
      </div>
    </template>

    <template #body>
      <div class="space-y-4 p-4">
        <!-- Datos personales -->
        <section>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            {{ t('profile.personal') }}
          </h3>
          <UCard :ui="{ body: 'p-0 divide-y divide-default' }">
            <div class="flex items-center gap-3 px-4 py-3">
              <UIcon name="i-heroicons-user" class="size-4 text-muted shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] text-muted">{{ t('profile.name') }}</p>
                <p class="text-sm text-highlighted truncate">{{ profile.first_name }} {{ profile.last_name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 px-4 py-3">
              <UIcon name="i-heroicons-identification" class="size-4 text-muted shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-[11px] text-muted">{{ t('profile.customerId') }}</p>
                <p class="text-sm font-mono text-highlighted truncate">{{ profile._id }}</p>
              </div>
            </div>
          </UCard>
        </section>

        <!-- Dirección -->
        <section>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            {{ t('profile.address') }}
          </h3>
          <UCard :ui="{ body: 'p-4 space-y-2' }">
            <div class="flex items-start gap-3">
              <UIcon name="i-heroicons-map-pin" class="size-4 text-muted shrink-0 mt-0.5" />
              <div class="min-w-0 flex-1">
                <p class="text-sm text-highlighted">
                  {{ fullStreet }}
                </p>
                <p class="text-sm text-toned">
                  {{ profile.address.city }}, {{ profile.address.state }}
                </p>
                <p class="text-sm text-muted">
                  {{ t('profile.zip') }} {{ profile.address.zip }}
                </p>
              </div>
            </div>
          </UCard>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="p-4 flex flex-col gap-2">
        <UButton color="primary" block size="lg" icon="i-heroicons-pencil-square" class="min-h-12 font-semibold">
          {{ t('profile.edit') }}
        </UButton>
        <UButton color="error" variant="soft" block size="lg" icon="i-heroicons-arrow-right-on-rectangle" class="min-h-12 font-semibold" @click="logout">
          {{ t('profile.logout') }}
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
