<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { en, es } from '@nuxt/ui/locale'
const { t } = useLocale()
const { code, setLocale } = useAppLocale()
const colorMode = useColorMode()

const open = ref(false)

const themeOptions = computed(() => [
  { value: 'light' as const, label: t('colorMode.light'), icon: 'i-heroicons-sun' },
  { value: 'dark' as const, label: t('colorMode.dark'), icon: 'i-heroicons-moon' },
  { value: 'system' as const, label: t('colorMode.system'), icon: 'i-heroicons-computer-desktop' }
])

function setTheme(value: 'light' | 'dark' | 'system') {
  colorMode.preference = value
}

function onLocaleChange(value: string) {
  setLocale(value as 'es' | 'en')
}
</script><template>
  <UDrawer v-model:open="open" :handle="false" :ui="{ content: 'sm:max-w-md' }">
    <UTooltip :text="t('appHeader.settings')">
      <UButton color="neutral" variant="ghost" icon="i-heroicons-cog-6-tooth" size="md" square
        :aria-label="t('appHeader.settings')" />
    </UTooltip>

    <template #header>
      <div class="flex items-center gap-2 w-full">
        <UIcon name="i-heroicons-cog-6-tooth" class="size-4 text-muted" />
        <h2 class="text-highlighted font-semibold text-base flex-1">{{ t('settings.title') }}</h2>
        <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark" size="md" square
          :aria-label="t('common.close')" @click="open = false" />
      </div>
    </template>

    <template #body>
      <div class="p-4 space-y-6">
        <!-- Apariencia -->
        <section>
          <header class="mb-3">
            <h3 class="text-sm font-semibold text-highlighted">{{ t('settings.appearance') }}</h3>
            <p class="text-xs text-muted mt-0.5">{{ t('settings.appearanceDescription') }}</p>
          </header>
          <UCard :ui="{ body: 'p-3' }">
            <div class="grid grid-cols-3 gap-2">
              <button v-for="opt in themeOptions" :key="opt.value" type="button"
                class="flex flex-col items-center gap-2 py-3 px-2 rounded-[calc(var(--ui-radius)/1.5)] border transition-colors min-h-18"
                :class="colorMode.preference === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-default text-muted hover:text-highlighted hover:bg-muted/40'" @click="setTheme(opt.value)">
                <UIcon :name="opt.icon" class="size-5" />
                <span class="text-[11px] font-medium leading-none">{{ opt.label }}</span>
              </button>
            </div>
          </UCard>
        </section>

        <!-- Idioma / Language -->
        <section>
          <header class="mb-3">
            <h3 class="text-sm font-semibold text-highlighted">{{ t('settings.language') }}</h3>
            <p class="text-xs text-muted mt-0.5">{{ t('settings.languageDescription') }}</p>
          </header>
          <ULocaleSelect :model-value="code" :locales="[es, en]" :ui="{ base: 'w-full' }"
            @update:model-value="onLocaleChange" />
        </section>
      </div>
    </template>
  </UDrawer>
</template>
