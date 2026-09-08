<template>
  <div
    class="min-h-screen"
    :style="{ '--sidebar-width': collapsed ? '72px' : '240px' }"
  >
    <AppSidebar />

    <div class="min-h-screen bg-[#f9f7f3] transition-[margin] duration-200 ease-in-out" :style="{ marginLeft: 'var(--sidebar-width)' }">
      <AppHeader :title="pageTitle" :eyebrow="pageEyebrow" />

      <main class="px-8 pt-[6.5rem] pb-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Same shared state AppSidebar writes to when toggled, so this layout's
// content offset stays in sync with the sidebar's current width.
const collapsed = useState('sidebarCollapsed', () => false)

// Pages can set these via definePageMeta, e.g.:
// definePageMeta({ layout: 'client', title: 'Dashboard', eyebrow: 'Overview' })
const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || 'Dashboard')
const pageEyebrow = computed(() => route.meta.eyebrow as string | undefined)
</script>
