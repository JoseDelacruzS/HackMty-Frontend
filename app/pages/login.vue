<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useFinancialStore } from "~/stores/financialStore"

definePageMeta({ layout: "auth" });

const { t } = useLocale()
const { code, setLocale } = useAppLocale()
const store = useFinancialStore()

const localeOptions = [
  { value: 'es' as const, label: 'ES' },
  { value: 'en' as const, label: 'EN' }
]

const state = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''

  if (!state.email || state.password.length < 6) {
    error.value = t('auth.error')
    return
  }

  try {
    isLoading.value = true
    const res = await $fetch<{ success: boolean; user: any }>('/api/auth/login', {
      method: 'POST',
      body: { email: state.email, password: state.password }
    })

    if (res.success && res.user) {
      store.setUser(res.user)
    }

    await navigateTo('/')
  } catch (e) {
    error.value = t('auth.genericError')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Selector de idioma -->
    <div class="flex justify-center">
      <div class="inline-flex items-center gap-1 rounded-full border border-default bg-muted p-1" role="group" aria-label="Language / Idioma">
        <button
          v-for="opt in localeOptions"
          :key="opt.value"
          type="button"
          class="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
          :class="code === opt.value ? 'bg-elevated text-highlighted shadow-sm' : 'text-muted hover:text-highlighted'"
          :aria-pressed="code === opt.value"
          @click="setLocale(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Header interno del form -->
    <div class="text-center space-y-1.5">
      <h2 class="text-xl font-bold text-(--ui-text-highlighted)">
        {{ t('app.title') }}
      </h2>
      <p class="text-xs text-(--ui-text-muted)">
        {{ t('auth.subtitle') }}
      </p>
    </div>

    <!-- Alert de Error -->
    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0">
      <UAlert v-if="error" color="error" variant="subtle" icon="i-heroicons-exclamation-triangle" :title="error"
        class="text-xs" />
    </Transition>

    <!-- Formulario Personalizado con Nuxt UI v3 -->
    <form @submit.prevent="onSubmit" class="space-y-4">
      <UFormField :label="t('auth.email')" name="email" required>
        <UInput v-model="state.email" type="email" icon="i-heroicons-envelope" :placeholder="t('auth.emailPlaceholder')"
          size="md" class="w-full" autocomplete="email" />
      </UFormField>

      <UFormField :label="t('auth.password')" name="password" required>
        <UInput v-model="state.password" :type="showPassword ? 'text' : 'password'" icon="i-heroicons-lock-closed"
          placeholder="••••••••" size="md" class="w-full" autocomplete="current-password">
          <template #trailing>
            <UButton color="neutral" variant="link" size="xs"
              :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" :aria-label="t('auth.togglePassword')"
              @click="showPassword = !showPassword" />
          </template>
        </UInput>
      </UFormField>

      <UButton type="submit" block size="md" color="primary" variant="solid" :loading="isLoading"
        class="mt-2 shadow-md shadow-primary/20">
        {{ t('auth.submit') }}
      </UButton>
    </form>
  </div>
</template>