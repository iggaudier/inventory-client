<template>
  <div
    class="client-shell min-h-screen"
    :style="{ '--sidebar-width': collapsed ? '72px' : '240px' }"
  >
    <AppSidebar />
    <button v-if="!collapsed" type="button" class="app-mobile-backdrop" aria-label="Close navigation" @click="collapsed = true" />

    <div class="client-content min-h-screen bg-[#f9f7f3] transition-[margin] duration-200 ease-in-out" :style="{ marginLeft: 'var(--sidebar-width)' }">
      <AppHeader :title="pageTitle" :eyebrow="pageEyebrow" />

      <main class="app-main px-4 pt-[5.5rem] pb-5 sm:px-8 sm:pt-[6.5rem] sm:pb-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Same shared state AppSidebar writes to when toggled, so this layout's
// content offset stays in sync with the sidebar's current width.
const collapsedCookie = useCookie<boolean>('sidebar_collapsed', { default: () => true })
const collapsed = useState('sidebarCollapsed', () => collapsedCookie.value)

// Pages can set these via definePageMeta, e.g.:
// definePageMeta({ layout: 'client', title: 'Dashboard', eyebrow: 'Overview' })
const route = useRoute()
const pageTitle = computed(() => (route.meta.title as string) || 'Dashboard')
const pageEyebrow = computed(() => route.meta.eyebrow as string | undefined)
</script>
