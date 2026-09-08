<!--
  A single label/value display row (read-only). Pass `value` as a
  prop for plain text, or use the default slot when you need custom
  markup (a swatch, a link, a status pill, etc). Used inside Section
  in the product view modal.
-->
<template>
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
    <span class="shrink-0 text-[#a49c88]">{{ label }}</span>
    <span class="min-w-0 flex-1 break-words text-right font-medium text-[#24221d]">
      <slot>{{ value || '—' }}</slot>
    </span>
  </div>
</template>
 
<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number | null
}>()
</script>