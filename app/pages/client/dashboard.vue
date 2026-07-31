<template>
  <section class="landing">
    <div class="landing__field" aria-hidden="true" />

    <div class="landing__stage">
      <div class="card card--in dashboard-card">
        <span class="card__punch" aria-hidden="true" />

        <p class="card__eyebrow">Signed in to</p>
        <h1 class="card__title">L.i.l.y</h1>

        <div v-if="user" class="dashboard-info">
          <p class="dashboard-info__row">
            <span class="dashboard-info__label">Name</span>
            <span class="dashboard-info__value">{{ user.name }}</span>
          </p>
          <p class="dashboard-info__row">
            <span class="dashboard-info__label">Email</span>
            <span class="dashboard-info__value">{{ user.email }}</span>
          </p>
          <p class="dashboard-info__row">
            <span class="dashboard-info__label">Role</span>
            <span class="dashboard-info__value">{{ user.role }}</span>
          </p>
        </div>

        <p v-else class="card__subtitle">
          Loading your session...
        </p>

        <div class="card__actions">
          <button
            type="button"
            class="btn btn--primary"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            {{ loggingOut ? 'Signing out...' : 'Log out' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()
const router = useRouter()
const loggingOut = ref(false)

async function handleLogout() {
  loggingOut.value = true
  try {
    await logout()
    await router.push('/auth/login')
  } finally {
    loggingOut.value = false
  }
}
</script>

<style scoped>
.dashboard-card {
  text-align: left;
}

.dashboard-info {
  width: 100%;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard-info__row {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2dcd2;
  border-radius: 0.6rem;
  background: #fdfcfa;
  margin: 0;
}

.dashboard-info__label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #857a6d;
}

.dashboard-info__value {
  font-size: 0.9rem;
  color: #33302b;
  font-weight: 500;
}

.card__actions {
  margin-top: 1.5rem;
  width: 100%;
}

.card__actions .btn {
  width: 100%;
  text-align: center;
}
</style>