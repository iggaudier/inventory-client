<template>
  <header class="fixed top-0 right-0 z-20 flex items-center justify-between border-b border-rule bg-paper px-8 py-5 transition-[left] duration-200 ease-in-out" :style="{ left: 'var(--sidebar-width)' }">
    <div>
      <p v-if="eyebrow" class="mb-[0.15rem] text-[0.7rem] uppercase tracking-[0.06em] text-muted">{{ eyebrow }}</p>
      <h2 class="m-0 text-xl font-semibold text-[#33302b]">{{ title }}</h2>
    </div>

    <div v-if="user" class="flex items-center gap-3">
      <div class="text-right">
        <p class="m-0 text-[0.85rem] font-semibold text-[#33302b]">{{ user.name }}</p>
        <p class="mt-[0.1rem] mb-0 text-[0.75rem] capitalize text-muted">{{ user.role }}</p>
      </div>

      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-semibold text-paper"
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
