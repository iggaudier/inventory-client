<template>
  <section class="landing">
    <div class="landing__field" aria-hidden="true" />

    <div class="landing__stage">
      <div class="card" :class="{ 'card--in': mounted }">
        <span class="card__punch" aria-hidden="true" />

        <p class="card__eyebrow">Request access to</p>

        <h1 class="card__title">L.i.l.y</h1>

        <p class="card__subtitle">
          Tell us a bit about you and your studio. We'll review your
          request and get back to you by email.
        </p>

        <form v-if="!submitted" class="card__form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="email" class="field__label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="your.email@example.com""
              class="field__input"
            />
          </div>

          <div class="field">
            <label for="message" class="field__label">Message</label>
            <textarea
              id="message"
              v-model="message"
              rows="4"
              placeholder="Tell us about your studio and why you'd like access..."
              class="field__input field__input--textarea"
            />
          </div>

          <p v-if="errorMsg" class="field__error">
            {{ errorMsg }}
          </p>

          <div class="card__actions">
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="loading"
            >
              {{ loading ? 'Sending...' : 'Send Request' }}
            </button>
          </div>
        </form>

        <div v-else class="card__success">
          <p class="card__success-text">
            Thanks — your request has been sent. We'll be in touch soon.
          </p>
        </div>

        <p class="card__footer">
          Already have access?
          <NuxtLink to="/auth/login" class="card__footer-link">
            Sign in
          </NuxtLink>
        </p>
      </div>

      <p class="version-tag" :class="{ 'version-tag--in': mounted }">
        <span class="version-tag__dot" aria-hidden="true" />
        Lily v0.1.0 — early access
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
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

<style scoped>
/*
  styles that are not globally declared
*/

.card__form {
  width: 100%;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.field__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b6156;
  margin-bottom: 0.35rem;
}

.field__input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2dcd2;
  border-radius: 0.6rem;
  background: #fdfcfa;
  font-size: 0.95rem;
  color: #33302b;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field__input--textarea {
  resize: vertical;
  min-height: 5.5rem;
}

.field__input:focus {
  outline: none;
  border-color: #b8834a;
  box-shadow: 0 0 0 3px rgba(184, 131, 74, 0.15);
}

.field__error {
  font-size: 0.8rem;
  color: #c0463b;
  margin: -0.25rem 0 0;
}

.card__actions {
  margin-top: 0.25rem;
}

.card__actions .btn {
  width: 100%;
  text-align: center;
}

.card__success {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 0.6rem;
  background: #f4f1ea;
  border: 1px solid #e2dcd2;
}

.card__success-text {
  font-size: 0.9rem;
  color: #4a453d;
  text-align: center;
  margin: 0;
}

.card__footer {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #857a6d;
  text-align: center;
}

.card__footer-link {
  color: #b8834a;
  font-weight: 500;
  text-decoration: none;
}

.card__footer-link:hover {
  color: #9c6e3c;
}
</style>