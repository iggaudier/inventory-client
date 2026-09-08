<template>
  <section class="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-linen p-6">
    <div class="pointer-events-none absolute -inset-[10%] bg-[radial-gradient(circle_at_20%_15%,rgba(184,131,74,0.06),transparent_40%),radial-gradient(circle_at_84%_80%,rgba(107,130,112,0.06),transparent_46%)]" aria-hidden="true" />

    <div class="relative w-full max-w-[25rem]">
      <div class="relative rounded-[14px] border border-[#e2ddd0] bg-card px-8 pt-9 pb-8 shadow-[0_24px_48px_-28px_rgba(36,34,29,0.18)] transition-[opacity,transform] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)]" :class="mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-[18px] scale-[0.98] opacity-0'">
        <span class="absolute top-[1.1rem] left-[1.1rem] size-2.5 rounded-full border border-[#d8d2c2] bg-linen" aria-hidden="true" />

        <p class="mb-[0.6rem] font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[#8c8571]">Request access to</p>

        <h1 class="mb-[0.6rem] text-[2.5rem] leading-none font-medium text-ink">L.i.l.y</h1>

        <p class="mb-7 max-w-[30ch] text-[0.9375rem] leading-[1.55] text-copy">
          Tell us a bit about you and your studio. We'll review your
          request and get back to you by email.
        </p>

        <form v-if="!submitted" class="mt-6 flex w-full flex-col gap-4 text-left" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="email" class="mb-[0.35rem] block text-[0.8rem] font-medium text-[#6b6156]">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="your.email@example.com"
              class="w-full rounded-[0.6rem] border border-rule bg-paper px-[0.85rem] py-[0.6rem] text-[0.95rem] text-[#33302b] transition-[border-color,box-shadow] duration-200 focus:border-ochre focus:ring-3 focus:ring-[rgba(184,131,74,0.15)] focus:outline-none"
            />
          </div>

          <div class="field">
            <label for="message" class="mb-[0.35rem] block text-[0.8rem] font-medium text-[#6b6156]">Message</label>
            <textarea
              id="message"
              v-model="message"
              rows="4"
              placeholder="Tell us about your studio and why you'd like access..."
              class="min-h-[5.5rem] w-full resize-y rounded-[0.6rem] border border-rule bg-paper px-[0.85rem] py-[0.6rem] text-[0.95rem] text-[#33302b] transition-[border-color,box-shadow] duration-200 focus:border-ochre focus:ring-3 focus:ring-[rgba(184,131,74,0.15)] focus:outline-none"
            />
          </div>

          <p v-if="errorMsg" class="-mt-1 text-[0.8rem] text-danger">
            {{ errorMsg }}
          </p>

          <div class="mt-1">
            <button
              type="submit"
              class="w-full rounded-[9px] border border-ochre bg-ochre px-5 py-3 text-center text-[0.9375rem] font-medium text-card transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-ochre-dark hover:bg-ochre-dark hover:shadow-[0_8px_18px_-8px_rgba(184,131,74,0.45)] active:scale-[0.97] cursor-pointer"
              :disabled="loading"
            >
              {{ loading ? 'Sending...' : 'Send Request' }}
            </button>
          </div>
        </form>

        <div v-else class="mt-6 rounded-[0.6rem] border border-rule bg-[#f4f1ea] p-4">
          <p class="m-0 text-center text-[0.9rem] text-[#4a453d]">
            Thanks — your request has been sent. We'll be in touch soon.
          </p>
        </div>

        <p class="mt-6 text-center text-[0.85rem] text-muted">
          Already have access?
          <NuxtLink to="/auth/login" class="font-medium text-ochre hover:text-[#9c6e3c]">
            Sign in
          </NuxtLink>
        </p>
      </div>

      <p class="mt-[1.1rem] flex items-center justify-center gap-[0.4rem] font-mono text-[0.6875rem] tracking-[0.02em] text-[#a49c88] transition-[opacity,transform] delay-[260ms] duration-[480ms] ease-out" :class="mounted ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'">
        <span class="size-[5px] rounded-full bg-sage" aria-hidden="true" />
        Lily v0.1.0 — early access
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
const mounted = ref(false)
const email = ref('')
const message = ref('')
const errorMsg = ref('')
const loading = ref(false)
const submitted = ref(false)

onMounted(() => {
  // rAF so the initial (unmounted) state paints first, guaranteeing the transition fires
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

async function handleSubmit() {
  errorMsg.value = ''

  if (!email.value || !message.value) {
    errorMsg.value = 'Please fill in both your email and message.'
    return
  }

  loading.value = true

  const config = useRuntimeConfig()

  try {
    await $fetch(`${config.public.apiBase}/api/request-access`, {
      method: 'POST',
      body: {
        email: email.value,
        message: message.value
      }
    })

    submitted.value = true
  } catch (err) {
    errorMsg.value = 'Something went wrong sending your request. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
