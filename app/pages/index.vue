<template>
  <section class="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-linen p-6">
    <div class="pointer-events-none absolute -inset-[10%] bg-[radial-gradient(circle_at_20%_15%,rgba(184,131,74,0.06),transparent_40%),radial-gradient(circle_at_84%_80%,rgba(107,130,112,0.06),transparent_46%)]" aria-hidden="true" />
 
    <div class="relative w-full max-w-[25rem]">
      <div class="relative rounded-[14px] border border-[#e2ddd0] bg-card px-8 pt-9 pb-8 shadow-[0_24px_48px_-28px_rgba(36,34,29,0.18)] transition-[opacity,transform] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)]" :class="mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-[18px] scale-[0.98] opacity-0'">
        <span class="absolute top-[1.1rem] left-[1.1rem] size-2.5 rounded-full border border-[#d8d2c2] bg-linen" aria-hidden="true" />
 
        <div class="mb-6 flex gap-1.5" aria-hidden="true">
          <span
            v-for="(tone, i) in swatches"
            :key="tone"
            class="h-2.5 w-7 rounded-[2px] transition-[opacity,transform] duration-[420ms] ease-out"
            :class="mounted ? 'translate-x-0 opacity-100' : '-translate-x-1.5 opacity-0'"
            :style="{ background: tone, transitionDelay: `${180 + i * 70}ms` }"
          />
        </div>
 
        <p class="mb-[0.6rem] font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[#8c8571]">Welcome to</p>
 
        <h1 class="mb-[0.6rem] text-[2.5rem] leading-none font-medium text-ink">L.i.l.y</h1>

        <p class="mb-[0.6rem] font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[#8c8571]">Library for Interior Layouts & Yields</p>
        <p class="mb-7 max-w-[30ch] text-[0.9375rem] leading-[1.55] text-copy">
          A working library of every material your studio has ever
          specified, sourced, or saved.
        </p>
 
        <div class="flex flex-col gap-2.5 min-[420px]:flex-row">
            <NuxtLink to="auth/login" class="flex-1 rounded-[9px] border border-ochre bg-ochre px-5 py-3 text-center text-[0.9375rem] font-medium text-card transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-ochre-dark hover:bg-ochre-dark hover:shadow-[0_8px_18px_-8px_rgba(184,131,74,0.45)] active:scale-[0.97]">
              Sign in
            </NuxtLink>
            <NuxtLink to="auth/request-access" class="flex-1 rounded-[9px] border border-[#d8d2c2] bg-transparent px-5 py-3 text-center text-[0.9375rem] font-medium text-ink transition-[transform,background-color,border-color,box-shadow] duration-150 hover:border-[#c2baa4] hover:bg-[rgba(36,34,29,0.03)] active:scale-[0.97]">
              Request Access
            </NuxtLink>
        </div>
      </div>
 
      <p class="mt-[1.1rem] flex items-center justify-center gap-[0.4rem] font-mono text-[0.6875rem] tracking-[0.02em] text-[#a49c88] transition-[opacity,transform] delay-[260ms] duration-[480ms] ease-out" :class="mounted ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'">
        <span class="size-[5px] rounded-full bg-sage" aria-hidden="true" />
        Lily v0.1.0 — early access
      </p>
    </div>
  </section>
</template>
 
<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
const mounted = ref(false)
 
const swatches = ['#7A5A38', '#B8834A', '#C99B52', '#5F7466']
 
onMounted(() => {
  // rAF so the initial (unmounted) state paints first, guaranteeing the transition fires
  requestAnimationFrame(() => {
    mounted.value = true
  })
})
</script>
