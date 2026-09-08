<!--
  A labeled form input wrapper with optional hint text and validation
  error display. Used inside Section in ProductFormModal. Pass `full`
  to span both grid columns for wide inputs (textareas, tag fields).
-->
<template>
  <label class="flex flex-col gap-1.5 text-sm" :class="full ? 'sm:col-span-2' : ''">
    <span class="font-medium text-[#4d493e]">{{ label }}</span>
    <slot />
    <span v-if="hint && !error" class="text-xs text-[#a49c88]">{{ hint }}</span>
    <span v-if="error" class="text-xs text-[#a8493a]">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  hint?: string
  error?: string
  full?: boolean
}>()
</script>