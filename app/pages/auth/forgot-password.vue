<template>
  <section class="flex min-h-[100svh] items-center justify-center bg-linen p-6">
    <div class="w-full max-w-[25rem] rounded-[14px] border border-rule bg-card p-8 shadow-sm">
      <h1 class="text-2xl font-medium text-ink">Forgot password?</h1>
      <p v-if="!loading && !message" class="mt-3 text-sm text-copy">Enter your email to receive a password reset link.</p>
      <div v-if="loading" role="status" aria-live="polite" aria-busy="true" class="mt-6 rounded-lg border border-rule bg-paper p-5 text-center">
        <span class="mx-auto block size-7 animate-spin rounded-full border-2 border-rule border-t-ochre motion-reduce:animate-none" aria-hidden="true" />
        <p class="mt-3 font-medium text-ink">Sending your reset link…</p>
        <p class="mt-2 break-words text-sm text-copy">We’re processing the request for {{ email }}. This may take a moment.</p>
      </div>
      <p v-else-if="message" role="status" class="mt-5 rounded-lg bg-paper p-3 text-sm text-copy">{{ message }}</p>
      <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
          <label class="block text-sm text-copy">Email<input v-model.trim="email" type="email" autocomplete="email" required class="mt-2 w-full rounded-lg border border-rule bg-paper px-3 py-2 text-ink" /></label>
          <p v-if="error" role="alert" class="text-sm text-danger">{{ error }}</p>
          <button type="submit" :disabled="loading" class="w-full cursor-pointer rounded-lg bg-ochre px-4 py-3 text-sm font-medium text-card hover:bg-ochre-dark disabled:cursor-wait disabled:opacity-60">{{ loading ? 'Sending…' : 'Send reset link' }}</button>
      </form>
      
      <NuxtLink to="/auth/login" class="mt-5 block text-center text-sm text-ochre hover:underline">Back to sign in</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
const api = useApi()
const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

async function submit() {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    const response = await api<{ message: string }>('/forgot-password', { method: 'POST', body: { email: email.value } })
    message.value = response.message
  } catch (err: any) {
    const errors = err?.data?.errors
    error.value = errors ? String(Object.values(errors).flat()[0]) : err?.data?.message ?? 'Unable to process your request. Please try again.'
  } finally { loading.value = false }
}
</script>
