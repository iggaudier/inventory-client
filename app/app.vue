<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/images/lily-logo.svg' },
    { rel: 'icon', type: 'image/png', sizes: '1024x1024', href: '/images/lily-logo-png.png' },
    { rel: 'apple-touch-icon', sizes: '1024x1024', href: '/images/lily-logo-png.png' },
  ],
})
</script>
