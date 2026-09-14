<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#24221d]/40 px-4 py-8 sm:py-12"
        @mousedown.self="close"
      >
        <Transition name="modal-pop" appear>
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-label="product?.name ?? 'Product details'"
            class="relative w-full max-w-[720px] rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_24px_60px_-20px_rgba(36,34,29,0.35)]"
          >
            <!-- Close button -->
            <button
              type="button"
              class="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-[#a49c88] hover:bg-[#f1eee7] hover:text-[#24221d]"
              aria-label="Close"
              @click="close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>

            <div class="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
              <!-- Loading state -->
              <div v-if="pending" class="pr-8">
                <div class="h-6 w-48 animate-pulse rounded bg-[#ece7da] mb-4" />
                <div class="h-4 w-full animate-pulse rounded bg-[#ece7da] mb-2" />
                <div class="h-4 w-3/4 animate-pulse rounded bg-[#ece7da]" />
              </div>

              <template v-else-if="product">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row gap-6 pr-8">
                  <button
                    type="button"
                    class="group relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-[#e2ddd0] bg-[#f1eee7]"
                    :class="product.image_url ? 'cursor-zoom-in' : 'cursor-default'"
                    :disabled="!product.image_url"
                    @click="product.image_url && (showLightbox = true)"
                  >
                    <img
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-[#c2baa4]">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>

                    <span
                      v-if="product.image_url"
                      class="absolute inset-0 flex items-center justify-center bg-[#24221d]/0 opacity-0 transition-all duration-150 group-hover:bg-[#24221d]/25 group-hover:opacity-100"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbfaf6" stroke-width="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                        <path d="M11 8v6M8 11h6" stroke-linecap="round" />
                      </svg>
                    </span>
                  </button>

                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="min-w-0 break-words">
                        <p class="font-mono text-xs uppercase tracking-wide text-[#a49c88] break-all">SKU: {{ product.sku }}</p>
                        <h1 class="mt-1 font-serif text-2xl font-medium text-[#24221d]">{{ product.name }}</h1>
                      </div>

                      <span
                        class="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium"
                        :class="product.in_stock
                          ? 'bg-[#e7efe8] text-[#4a6b52]'
                          : 'bg-[#f7e6e3] text-[#a8493a]'"
                      >
                        {{ product.in_stock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>

                    <p class="mt-3 text-sm leading-relaxed text-[#6b6558]">
                      {{ product.description || 'No description provided.' }}
                    </p>

                    <div class="mt-4 flex flex-wrap gap-2">
                      <span v-for="tag in product.style_tags" :key="`style-${tag}`" class="chip">{{ tag }}</span>
                      <span v-for="tag in product.room_tags" :key="`room-${tag}`" class="chip chip--muted">{{ tag }}</span>
                    </div>
                  </div>
                </div>

                <!-- Detail sections -->
                <div class="mt-6 grid gap-4">
                  <Section title="Classification">
                    <Field label="Category" :value="product.category?.name" />
                    <Field label="Subcategory" :value="product.subcategory?.name" />
                    <Field label="Brand" :value="product.brand?.name" />
                    <Field label="Organization" :value="product.organization?.name" />
                  </Section>

                  <Section title="Material & Appearance">
                    <Field label="Material" :value="product.material" />
                    <Field label="Color" :value="product.color" />
                    <Field label="Color Hex">
                      <div class="flex items-center gap-2">
                        <span
                          v-if="product.color_hex"
                          class="h-4 w-4 rounded-full border border-[#e2ddd0]"
                          :style="{ background: product.color_hex }"
                        />
                        <span>{{ product.color_hex || '—' }}</span>
                      </div>
                    </Field>
                  </Section>

                  <Section title="Dimensions & Weight">
                    <Field label="Length" :value="formatNum(product.length_cm, 'cm')" />
                    <Field label="Width" :value="formatNum(product.width_cm, 'cm')" />
                    <Field label="Height" :value="formatNum(product.height_cm, 'cm')" />
                    <Field label="Weight" :value="formatNum(product.weight_g, 'g')" />
                  </Section>

                  <Section title="Pricing & Availability">
                    <Field label="Price" :value="formatCurrency(product.price, product.currency)" />
                    <Field label="Trade Price" :value="formatCurrency(product.trade_price, product.currency)" />
                    <Field label="Currency" :value="product.currency" />
                    <Field label="Lead Time" :value="product.lead_time_days ? `${product.lead_time_days} days` : '—'" />
                    <Field label="Stock Status" :value="product.in_stock ? 'In Stock' : 'Out of Stock'" />
                  </Section>

                  <Section title="Sourcing">
                    <Field label="Country of Origin" :value="product.country_origin" />
                    <Field label="Vendor URL">
                      <a
                        v-if="product.vendor_url"
                        :href="product.vendor_url"
                        target="_blank"
                        rel="noopener"
                        class="break-all text-[#b8834a] underline underline-offset-2 hover:text-[#a6733d]"
                      >
                        {{ product.vendor_url }}
                      </a>
                      <span v-else>—</span>
                    </Field>
                    <Field label="Care Instructions" :value="product.care_instructions" />
                  </Section>

                  <Section title="Record Info">
                    <Field label="Added By" :value="product.added_by?.name ?? product.addedBy?.name" />
                    <Field label="Created" :value="formatDate(product.created_at)" />
                    <Field label="Last Updated" :value="formatDate(product.updated_at)" />
                  </Section>
                </div>

                <!-- Actions -->
                <div class="mt-6 flex justify-end">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd0] px-4 py-2 text-sm font-medium text-[#24221d] hover:bg-[#f1eee7]"
                    @click="close"
                  >
                    Close
                  </button>
                </div>
              </template>

              <div v-else class="pr-8 text-center text-sm text-[#a49c88] py-6">
                Product not found.
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Image lightbox -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showLightbox && product?.image_url"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-[#17140f]/85 p-6"
        @mousedown.self="showLightbox = false"
      >
        <button
          type="button"
          class="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#f3efe6]/80 hover:bg-white/10 hover:text-[#f3efe6]"
          aria-label="Close image"
          @click="showLightbox = false"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
          </svg>
        </button>

        <img
          :src="product.image_url"
          :alt="product.name"
          class="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  productId: number | string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const api = useApi()

// Only fetch once the modal is actually open AND we have an id —
// avoids firing a request on every mount before the user clicks View.
const shouldFetch = computed(() => props.modelValue && !!props.productId)

const { data: product, pending, execute } = await useAsyncData(
  () => `product-modal-${props.productId}`,
  () => api(`/products/${props.productId}`).then((res: any) => res.data ?? res),
  { immediate: false }
)

watch(
  () => [props.modelValue, props.productId],
  ([open, id]) => {
    if (open && id) execute()
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

const showLightbox = ref(false)

// Reset the lightbox any time the view modal itself closes, so it's
// never left open behind a closed dialog.
watch(
  () => props.modelValue,
  (open) => {
    if (!open) showLightbox.value = false
  }
)

// Close on Escape — lightbox takes priority if it's open
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (showLightbox.value) {
    showLightbox.value = false
  } else if (props.modelValue) {
    close()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// Lock background scroll while open
watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  }
)

function formatCurrency(value: number | string | null | undefined, currency = 'USD') {
  if (value === null || value === undefined) return '—'
  const amount = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount)
}

function formatNum(value: number | string | null | undefined, unit: string) {
  if (value === null || value === undefined || value === '') return '—'
  return `${value} ${unit}`
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(184, 131, 74, 0.1);
  color: #a6733d;
}
.chip--muted {
  background: rgba(107, 130, 112, 0.1);
  color: #5f7466;
}

/* Backdrop fade */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 200ms ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Card pop */
.modal-pop-enter-active {
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
.modal-pop-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .modal-pop-enter-active,
  .modal-pop-leave-active {
    transition-duration: 0.01ms !important;
  }
}
</style>