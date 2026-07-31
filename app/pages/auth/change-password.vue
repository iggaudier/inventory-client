<template>
  <section class="landing">
    <div class="landing__field" aria-hidden="true" />

    <div class="landing__stage">
      <div class="card" :class="{ 'card--in': mounted }">
        <span class="card__punch" aria-hidden="true" />

        <p class="card__eyebrow">Update your</p>
        <h1 class="card__title">Password</h1>

        <p class="card__subtitle">
          Choose a new password to secure your account.
        </p>

        <form v-if="!submitted" class="card__form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="current_password" class="field__label">Current password</label>
            <input
              id="current_password"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="field__input"
            />
          </div>

          <div class="field">
            <label for="new_password" class="field__label">New password</label>
            <input
              id="new_password"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="field__input"
            />
          </div>

          <div class="field">
            <label for="new_password_confirmation" class="field__label">Confirm new password</label>
            <input
              id="new_password_confirmation"
              v-model="newPasswordConfirmation"
              type="password"
              autocomplete="new-password"
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
              {{ loading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>

        <div v-else class="card__success">
          <p class="card__success-text">
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

<style scoped>
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
</style>