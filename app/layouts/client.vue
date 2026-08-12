<template>
  <div
    class="client-layout"
    :style="{ '--sidebar-width': collapsed ? '72px' : '240px' }"
  >
    <AppSidebar />

    <div class="client-content">
      <AppHeader :title="pageTitle" :eyebrow="pageEyebrow" />

      <main class="client-main">
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

<style scoped>
.client-content {
  min-height: 100vh;
  margin-left: var(--sidebar-width);
  background: #f9f7f3;
  transition: margin-left 0.2s ease;
}

.client-main {
  padding: 6.5rem 2rem 2rem;
}
</style>
