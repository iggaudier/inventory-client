<template>
  <header class="app-header fixed top-0 right-0 z-20 flex items-center justify-between border-b border-rule bg-paper px-4 py-3 transition-[left] duration-200 ease-in-out sm:px-8 sm:py-5" :style="{ left: 'var(--sidebar-width)' }">
    <div class="flex min-w-0 items-center gap-3">
      <button type="button" class="flex size-10 shrink-0 items-center justify-center rounded-lg text-[#6b6156] hover:bg-[#f4f1ea] sm:hidden" aria-label="Open navigation" @click="toggleMobileNavigation">
        <svg class="size-5 fill-none stroke-current stroke-[1.75]" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" /></svg>
      </button>
      <div class="min-w-0">
      <p v-if="eyebrow" class="mb-[0.15rem] text-[0.7rem] uppercase tracking-[0.06em] text-muted">{{ eyebrow }}</p>
      <h2 class="m-0 truncate text-lg font-semibold text-[#33302b] sm:text-xl">{{ title }}</h2>
      </div>
    </div>

    <div v-if="user" class="flex items-center gap-3">
      <div class="hidden text-right sm:block">
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
const collapsed = useState('sidebarCollapsed', () => true)

function toggleMobileNavigation() {
  collapsed.value = !collapsed.value
}

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
