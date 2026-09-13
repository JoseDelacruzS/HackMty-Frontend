<script setup lang="ts">
import { useLocale } from '@nuxt/ui/composables'
import { useAuthStore } from "~/stores/auth"
import { useFinancialStore } from "~/stores/financialStore"

definePageMeta({ layout: "auth" });

const { t } = useLocale()
const { code, setLocale } = useAppLocale()
const config = useRuntimeConfig()
const auth = useAuthStore()
const financial = useFinancialStore()

const localeOptions = [
  { value: 'es' as const, label: 'ES' },
  { value: 'en' as const, label: 'EN' }
]

const state = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')

// si ya esta autenticado el middleware redirige, pero por si acaso hidratamos token
onMounted(() => {
  auth.init()
  if (auth.isAuthenticated) navigateTo('/')
})

async function onSubmit() {
  error.value = ''

  if (!state.username || state.password.length < 6) {
    error.value = t('auth.error')
    return
  }

  try {
    isLoading.value = true
    await auth.login(state.username.trim(), state.password)

    // opcional: setear nombre en store financiera para saludo
    financial.setUser({ name: state.username })

    await navigateTo('/')
  } catch (e: any) {
    const status = e?.statusCode || e?.response?.status
    const dataMsg = e?.data?.message || e?.statusMessage || e?.message
    if (status === 401) {
      error.value = 'Usuario o contraseña incorrectos.'
    } else if (dataMsg) {
      error.value = dataMsg
    } else {
      error.value = t('auth.genericError')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Selector de idioma -->
    <div class="flex justify-center">
      <div class="inline-flex items-center gap-1 rounded-full border border-default bg-muted p-1" role="group"
        aria-label="Language / Idioma">
        <button v-for="opt in localeOptions" :key="opt.value" type="button"
          class="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
          :class="code === opt.value ? 'bg-elevated text-highlighted shadow-sm' : 'text-muted hover:text-highlighted'"
          :aria-pressed="code === opt.value" @click="setLocale(opt.value)">
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Alert de Error -->
    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in" leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-2 opacity-0">
      <UAlert v-if="error" color="error" variant="subtle" icon="i-heroicons-exclamation-triangle" :title="error"
        class="text-xs" />
    </Transition>

    <!-- Formulario con Nuxt UI -->
    <form @submit.prevent="onSubmit" class="space-y-4">
      <UFormField label="Usuario" name="username" required>
        <UInput v-model="state.username" type="text" icon="i-heroicons-user" placeholder="938832-8371AASd..."
          size="md" class="w-full" autocomplete="username" />
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

      <p class="text-[11px] text-muted text-center leading-relaxed">
        {{ t('auth.demo') }}<br />
        <span class="font-mono text-[10px]">POST {{ config.public.apiBaseUrl }}/auth/login</span>
      </p>
    </form>
  </div>
</template>
