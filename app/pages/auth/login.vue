<template>
  <section class="landing">
    <div class="landing__field" aria-hidden="true" />

    <div class="landing__stage">
      <div class="card" :class="{ 'card--in': mounted }">
        <span class="card__punch" aria-hidden="true" />

        <p class="card__eyebrow">Welcome back to</p>

        <h1 class="card__title">L.i.l.y</h1>

        <p class="card__subtitle">
          Sign in to your account to keep working with your studio's
          material library.
        </p>

        <form class="card__form" @submit.prevent="handleSignIn">
          <div class="field">
            <label for="email" class="field__label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="field__input"
            />
          </div>

          <div class="field">
            <label for="password" class="field__label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="field__input"
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
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>

        <p class="card__footer">
          Need access?
          <NuxtLink to="/auth/request-access" class="card__footer-link">
            Request Access
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
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const router = useRouter()

onMounted(() => {
  // rAF so the initial (unmounted) state paints first, guaranteeing the transition fires
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

async function handleSignIn() {
  errorMsg.value = ''

  if (!email.value || !password.value) {
    errorMsg.value = 'Please enter both email and password.'
    return
  }

  loading.value = true

  const config = useRuntimeConfig()

  try {
    const response = await $fetch(`${config.public.apiBase}/api/login`, {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })

    const token = useCookie('auth_token', {
      maxAge: 60 * 60 * 24 * 7, // 7 days, adjust as needed
      sameSite: 'lax'
    })
    token.value = response.token

    if (response.must_change_password) {
      await router.push('/auth/change-password')
    } else {
      await router.push('/dashboard')
    }
  } catch (err) {
    errorMsg.value = err?.data?.message || 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/*
  These rely on your existing global classes:
  .landing, .landing__field, .landing__stage, .card, .card--in,
  .card__punch, .card__eyebrow, .card__title, .card__subtitle,
  .btn, .btn--primary, .btn--ghost, .version-tag, .version-tag--in,
  .version-tag__dot

  Only the form-specific bits below are new (not in the landing page),
  written to sit visually inside the same .card without breaking it.
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
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