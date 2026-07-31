<template>
  <section class="landing">
    <div class="landing__field" aria-hidden="true" />
 
    <div class="landing__stage">
      <div class="card" :class="{ 'card--in': mounted }">
        <span class="card__punch" aria-hidden="true" />
 
        <div class="card__swatches" aria-hidden="true">
          <span
            v-for="(tone, i) in swatches"
            :key="tone"
            class="card__swatch"
            :style="{ background: tone, transitionDelay: `${180 + i * 70}ms` }"
          />
        </div>
 
        <p class="card__eyebrow">Welcome to</p>
 
        <h1 class="card__title">L.i.l.y</h1>

        <p class="card__eyebrow">Library for Interior Layouts & Yields</p>
        <p class="card__subtitle">
          A working library of every material your studio has ever
          specified, sourced, or saved.
        </p>
 
        <div class="card__actions">
            <NuxtLink to="auth/login" class="btn btn--primary">
              Sign in
            </NuxtLink>
            <NuxtLink to="auth/request-access" class="btn btn--ghost">
              Request Access
            </NuxtLink>
        </div>
      </div>
 
      <p class="version-tag" :class="{ 'version-tag--in': mounted }">
        <span class="version-tag__dot" aria-hidden="true" />
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
