<!--
  A labeled group used in both the product view modal (holding
  Field rows) and the add/edit form modal (holding FormField inputs).
  Renders its slot content in a responsive 2-column grid.
-->
<template>
  <div class="rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-5 sm:p-6">
    <h2 class="mb-4 font-mono text-xs font-medium uppercase tracking-wide text-[#a49c88]">
      {{ title }}
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>