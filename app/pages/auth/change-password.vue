<template>
  <section class="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-linen p-6">
    <div class="pointer-events-none absolute -inset-[10%] bg-[radial-gradient(circle_at_20%_15%,rgba(184,131,74,0.06),transparent_40%),radial-gradient(circle_at_84%_80%,rgba(107,130,112,0.06),transparent_46%)]" aria-hidden="true" />

    <div class="relative w-full max-w-[25rem]">
      <div class="relative rounded-[14px] border border-[#e2ddd0] bg-card px-8 pt-9 pb-8 shadow-[0_24px_48px_-28px_rgba(36,34,29,0.18)] transition-[opacity,transform] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)]" :class="mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-[18px] scale-[0.98] opacity-0'">
        <span class="absolute top-[1.1rem] left-[1.1rem] size-2.5 rounded-full border border-[#d8d2c2] bg-linen" aria-hidden="true" />

        <p class="mb-[0.6rem] font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[#8c8571]">Update your</p>
        <h1 class="mb-[0.6rem] text-[2.5rem] leading-none font-medium text-ink">Password</h1>

        <p class="mb-7 max-w-[30ch] text-[0.9375rem] leading-[1.55] text-copy">
          Choose a new password to secure your account.
        </p>

        <form v-if="!submitted" class="mt-6 flex w-full flex-col gap-4 text-left" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="current_password" class="mb-[0.35rem] block text-[0.8rem] font-medium text-[#6b6156]">Current password</label>
            <input
              id="current_password"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full rounded-[0.6rem] border border-rule bg-paper px-[0.85rem] py-[0.6rem] text-[0.95rem] text-[#33302b] transition-[border-color,box-shadow] duration-200 focus:border-ochre focus:ring-3 focus:ring-[rgba(184,131,74,0.15)] focus:outline-none"
            />
          </div>

          <div class="field">
            <label for="new_password" class="mb-[0.35rem] block text-[0.8rem] font-medium text-[#6b6156]">New password</label>
            <input
              id="new_password"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full rounded-[0.6rem] border border-rule bg-paper px-[0.85rem] py-[0.6rem] text-[0.95rem] text-[#33302b] transition-[border-color,box-shadow] duration-200 focus:border-ochre focus:ring-3 focus:ring-[rgba(184,131,74,0.15)] focus:outline-none"
            />
          </div>

          <div class="field">
            <label for="new_password_confirmation" class="mb-[0.35rem] block text-[0.8rem] font-medium text-[#6b6156]">Confirm new password</label>
            <input
              id="new_password_confirmation"
              v-model="newPasswordConfirmation"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full rounded-[0.6rem] border border-rule bg-paper px-[0.85rem] py-[0.6rem] text-[0.95rem] text-[#33302b] transition-[border-color,box-shadow] duration-200 focus:border-ochre focus:ring-3 focus:ring-[rgba(184,131,74,0.15)] focus:outline-none"
            />
          </div>

          <p v-if="errorMsg" class="-mt-1 text-[0.8rem] text-danger">
            {{ errorMsg }}
          </p>

          <div class="mt-1">
            <button
              type="submit"
              class="w-full rounded-[9px] border border-ochre bg-ochre px-5 py-3 text-center text-[0.9375rem] font-medium text-card transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-ochre-dark hover:bg-ochre-dark hover:shadow-[0_8px_18px_-8px_rgba(184,131,74,0.45)] active:scale-[0.97]"
              :disabled="loading"
            >
              {{ loading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>

        <div v-else class="mt-6 rounded-[0.6rem] border border-rule bg-[#f4f1ea] p-4">
          <p class="m-0 text-center text-[0.9rem] text-[#4a453d]">
            Your password has been updated.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const mounted = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const errorMsg = ref('')
const loading = ref(false)
const submitted = ref(false)

const api = useApi()
const router = useRouter()
const { fetchUser } = useAuth()

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

async function handleSubmit() {
  errorMsg.value = ''

  if (!currentPassword.value || !newPassword.value || !newPasswordConfirmation.value) {
    errorMsg.value = 'Please fill in all fields.'
    return
  }

  if (newPassword.value !== newPasswordConfirmation.value) {
    errorMsg.value = 'New password and confirmation do not match.'
    return
  }

  loading.value = true

  try {
    await api('/change-password', {
      method: 'POST',
      body: {
        current_password: currentPassword.value,
        new_password: newPassword.value,
        new_password_confirmation: newPasswordConfirmation.value
      }
    })

    await fetchUser()
    submitted.value = true

    setTimeout(() => {
      router.push('/client/dashboard')
    }, 1500)
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
