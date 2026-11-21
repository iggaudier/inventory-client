<template>
  <section class="flex min-h-[100svh] items-center justify-center bg-linen p-6">
    <div class="w-full max-w-[25rem] rounded-[14px] border border-rule bg-card p-8 shadow-sm">
      <h1 class="text-2xl font-medium text-ink">Reset password</h1>
      <p v-if="!loading && !message" class="mt-3 text-sm text-copy">Choose a new password for your account.</p>
      <div v-if="loading" role="status" aria-live="polite" aria-busy="true" class="mt-6 rounded-lg border border-rule bg-paper p-5 text-center">
        <span class="mx-auto block size-7 animate-spin rounded-full border-2 border-rule border-t-ochre motion-reduce:animate-none" aria-hidden="true" />
        <p class="mt-3 font-medium text-ink">{{ signingIn ? 'Opening your dashboard…' : 'Resetting your password…' }}</p>
        <p class="mt-2 break-words text-sm text-copy">{{ signingIn ? 'Your password has been reset. We’re signing you in.' : 'We’re processing your new password. This may take a moment.' }}</p>
      </div>
      <p v-else-if="message" role="status" class="mt-5 rounded-lg bg-paper p-3 text-sm text-copy">{{ message }}</p>
      <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
          <label class="block text-sm text-copy">Email<input :value="email" type="email" autocomplete="email" readonly aria-readonly="true" class="mt-2 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-ink" /></label>
          <p class="text-xs text-muted">Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.</p>
          <label class="block text-sm text-copy">New password<input v-model="password" type="password" autocomplete="new-password" minlength="8" required class="mt-2 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-ink" /></label>
          <label class="block text-sm text-copy">Confirm password<input v-model="confirmation" type="password" autocomplete="new-password" minlength="8" required class="mt-2 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-ink" /></label>
          <p v-if="error" role="alert" class="text-sm text-danger">{{ error }}</p>
          <button type="submit" :disabled="loading" class="w-full cursor-pointer rounded-lg bg-ochre px-4 py-3 text-sm font-medium text-card hover:bg-ochre-dark disabled:cursor-wait disabled:opacity-60">{{ loading ? 'Sending…' : 'Reset password' }}</button>
      </form>
      <NuxtLink to="/auth/forgot-password" class="mt-5 block text-sm text-ochre hover:underline">Request a new reset link</NuxtLink>
      <NuxtLink to="/auth/login" class="mt-5 block text-center text-sm text-ochre hover:underline">Back to sign in</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
const api = useApi()
const route = useRoute()
const router = useRouter()
const authToken = useAuthToken()
const { setUser } = useAuth()
const signingIn = ref(false)
const email = typeof route.query.email === 'string' ? route.query.email : ''
const token = typeof route.query.token === 'string' ? route.query.token : ''
const password = ref('')
const confirmation = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

async function submit() {
  if (loading.value) return
  error.value = ''
  if (!token) { error.value = 'This reset link is invalid. Request a new link.'; return }
  if (password.value !== confirmation.value) { error.value = 'Passwords do not match.'; return }
  loading.value = true
  try {
    await api<{ message: string }>('/reset-password', { method: 'POST', body: { email, token, password: password.value, password_confirmation: confirmation.value } })
    signingIn.value = true
    try {
      const session = await api<{ token: string; user: any }>('/login', {
        method: 'POST', body: { email, password: password.value },
      })
      authToken.value = session.token
      setUser(session.user)
      await router.replace('/client/dashboard')
    } catch {
      message.value = 'Your password was reset successfully. Please sign in with your new password to continue.'
    }
  } catch (err: any) {
    const errors = err?.data?.errors
    error.value = errors ? String(Object.values(errors).flat()[0]) : err?.data?.message ?? 'Unable to process your request. Please try again.'
  } finally { loading.value = false; signingIn.value = false }
}
</script>
