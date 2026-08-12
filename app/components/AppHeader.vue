<template>
  <header class="app-header">
    <div class="app-header__titles">
      <p v-if="eyebrow" class="app-header__eyebrow">{{ eyebrow }}</p>
      <h2 class="app-header__title">{{ title }}</h2>
    </div>

    <div v-if="user" class="app-header__user">
      <div class="app-header__greeting">
        <p class="app-header__greeting-name">{{ user.name }}</p>
        <p class="app-header__greeting-role">{{ user.role }}</p>
      </div>

      <span
        class="app-header__avatar"
        :style="{ background: avatarColor }"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  eyebrow?: string
}>()

const { user } = useAuth()

const swatches = ['#7A5A38', '#B8834A', '#C99B52', '#5F7466']

const initials = computed(() => {
  if (!user.value?.name) return ''
  return user.value.name
    .split(' ')
    .map((part: string) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const avatarColor = computed(() => {
  if (!user.value?.name) return swatches[0]
  const index = user.value.name.charCodeAt(0) % swatches.length
  return swatches[index]
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  background: #fdfcfa;
  border-bottom: 1px solid #e2dcd2;
  transition: left 0.2s ease;
}

.app-header__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #857a6d;
  margin: 0 0 0.15rem;
}

.app-header__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #33302b;
  margin: 0;
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-header__greeting {
  text-align: right;
}

.app-header__greeting-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #33302b;
  margin: 0;
}

.app-header__greeting-role {
  font-size: 0.75rem;
  color: #857a6d;
  margin: 0.1rem 0 0;
  text-transform: capitalize;
}

.app-header__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fdfcfa;
  flex-shrink: 0;
}
</style>
