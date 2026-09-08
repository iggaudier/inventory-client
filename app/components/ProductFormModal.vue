<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#24221d]/40 px-4 py-8 sm:py-12"
        @mousedown.self="attemptClose"
      >
        <Transition name="modal-pop" appear>
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-label="mode === 'edit' ? 'Edit product' : 'Add new product'"
            class="relative w-full max-w-[760px] rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_24px_60px_-20px_rgba(36,34,29,0.35)]"
          >
            <button
              type="button"
              class="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full text-[#a49c88] hover:bg-[#f1eee7] hover:text-[#24221d]"
              aria-label="Close"
              @click="attemptClose"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>

            <div class="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
              <p class="font-mono text-xs uppercase tracking-wide text-[#a49c88]">
                {{ mode === 'edit' ? 'Editing' : 'New sample' }}
              </p>
              <h1 class="mt-1 pr-8 text-2xl font-medium text-[#24221d]">
                {{ mode === 'edit' ? 'Edit Product' : 'Add New Product' }}
              </h1>

              <!-- Loading existing record (edit mode) -->
              <div v-if="loadingProduct" class="mt-6">
                <div class="h-4 w-full animate-pulse rounded bg-[#ece7da] mb-2" />
                <div class="h-4 w-3/4 animate-pulse rounded bg-[#ece7da]" />
              </div>

              <form v-else class="mt-6 flex flex-col gap-5" @submit.prevent="submit">
                <div v-if="formError" class="rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-4 py-3 text-sm text-[#a8493a]">
                  {{ formError }}
                </div>
                <!-- For Super Admin -->
                 <FormField
                    v-if="isSuperAdmin"
                    label="Organization"
                    :error="errors.organization_id"
                  >
                    <select
                      v-model="form.organization_id"
                      class="input"
                    >
                      <option :value="null">
                        Select organization…
                      </option>

                      <option
                        v-for="org in organizations"
                        :key="org.id"
                        :value="org.id"
                      >
                        {{ org.name }}
                      </option>
                    </select>
                  </FormField>
                <!-- Basics -->
                <Section title="Basics">
                  <FormField label="Product Name" :error="errors.name">
                    <input v-model="form.name" type="text" class="input" placeholder="Chesterfield 3-Seater Sofa" />
                  </FormField>
                  <FormField label="SKU" :error="errors.sku">
                    <input v-model="form.sku" type="text" class="input" placeholder="SOF-001" />
                  </FormField>
                  <FormField label="Description" :error="errors.description" full>
                    <textarea v-model="form.description" rows="3" class="input resize-none" placeholder="Classic tufted leather Chesterfield sofa." />
                  </FormField>
                </Section>

                <!-- Classification -->
                <Section title="Classification">
                  <FormField label="Category" :error="errors.category_id">
                    <select v-model="form.category_id" class="input" @change="form.subcategory_id = null">
                      <option :value="null">Select category…</option>
                      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                  </FormField>
                  <FormField label="Subcategory" :error="errors.subcategory_id">
                    <select v-model="form.subcategory_id" class="input" :disabled="!form.category_id">
                      <option :value="null">Select subcategory…</option>
                      <option v-for="s in filteredSubcategories" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>
                  </FormField>
                  <FormField label="Brand" :error="errors.brand_id">
                    <select v-model="form.brand_id" class="input">
                      <option :value="null">Select brand…</option>
                      <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                  </FormField>
                </Section>

                <!-- Material & Appearance -->
                <Section title="Material & Appearance">
                  <FormField label="Material" :error="errors.material">
                    <input v-model="form.material" type="text" class="input" placeholder="Leather" />
                  </FormField>
                  <FormField label="Color" :error="errors.color">
                    <input v-model="form.color" type="text" class="input" placeholder="Tan" />
                  </FormField>
                  <FormField label="Color Hex" :error="errors.color_hex">
                    <div class="flex items-center gap-2">
                      <input v-model="form.color_hex" type="color" class="h-9 w-10 shrink-0 cursor-pointer rounded border border-[#e2ddd0] bg-transparent p-0.5" />
                      <input v-model="form.color_hex" type="text" class="input" placeholder="#B5651D" />
                    </div>
                  </FormField>
                  <FormField label="Style Tags" :error="errors.style_tags" full hint="Comma-separated, e.g. classic, chesterfield">
                    <input v-model="styleTagsInput" type="text" class="input" placeholder="classic, chesterfield" />
                  </FormField>
                  <FormField label="Room Tags" :error="errors.room_tags" full hint="Comma-separated, e.g. living-room, study">
                    <input v-model="roomTagsInput" type="text" class="input" placeholder="living-room" />
                  </FormField>
                </Section>

                <!-- Dimensions -->
                <Section title="Dimensions & Weight">
                  <FormField label="Length (cm)" :error="errors.length_cm">
                    <input v-model.number="form.length_cm" type="number" step="0.01" min="0" class="input" />
                  </FormField>
                  <FormField label="Width (cm)" :error="errors.width_cm">
                    <input v-model.number="form.width_cm" type="number" step="0.01" min="0" class="input" />
                  </FormField>
                  <FormField label="Height (cm)" :error="errors.height_cm">
                    <input v-model.number="form.height_cm" type="number" step="0.01" min="0" class="input" />
                  </FormField>
                  <FormField label="Weight (g)" :error="errors.weight_g">
                    <input v-model.number="form.weight_g" type="number" step="0.01" min="0" class="input" />
                  </FormField>
                </Section>

                <!-- Pricing -->
                <Section title="Pricing & Availability">
                  <FormField label="Price" :error="errors.price">
                    <input v-model.number="form.price" type="number" step="0.01" min="0" class="input" />
                  </FormField>
                  <FormField label="Trade Price" :error="errors.trade_price">
                    <input v-model.number="form.trade_price" type="number" step="0.01" min="0" class="input" />
                  </FormField>
                  <FormField label="Currency" :error="errors.currency">
                    <select v-model="form.currency" class="input">
                      <option v-for="cur in currencies" :key="cur" :value="cur">{{ cur }}</option>
                    </select>
                  </FormField>
                  <FormField label="Lead Time (days)" :error="errors.lead_time_days">
                    <input v-model.number="form.lead_time_days" type="number" min="0" class="input" />
                  </FormField>
                  <FormField label="Availability" :error="errors.in_stock" full>
                    <label class="flex items-center gap-2.5 text-sm text-[#24221d]">
                      <input v-model="form.in_stock" type="checkbox" class="h-4 w-4 rounded border-[#e2ddd0] text-[#b8834a] focus:ring-[#b8834a]/30" />
                      In stock
                    </label>
                  </FormField>
                </Section>

                <!-- Sourcing -->
                <Section title="Sourcing">
                  <FormField label="Country of Origin" :error="errors.country_origin">
                    <input v-model="form.country_origin" type="text" class="input" placeholder="Italy" />
                  </FormField>
                  <FormField label="Vendor URL" :error="errors.vendor_url">
                    <input v-model="form.vendor_url" type="url" class="input" placeholder="https://vendor.example.com/…" />
                  </FormField>
                  <FormField label="Image URL" :error="errors.image_url" full>
                    <input v-model="form.image_url" type="url" class="input" placeholder="https://…/image.jpg" />
                  </FormField>
                  <FormField label="Care Instructions" :error="errors.care_instructions" full>
                    <textarea v-model="form.care_instructions" rows="2" class="input resize-none" placeholder="Wipe clean with a damp cloth." />
                  </FormField>
                </Section>

                <!-- Actions -->
                <div class="mt-1 flex justify-end gap-2 border-t border-[#e2ddd0] pt-5">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd0] px-4 py-2 text-sm font-medium text-[#24221d] hover:bg-[#f1eee7]"
                    @click="attemptClose"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="inline-flex items-center gap-2 rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:opacity-60"
                    :disabled="submitting"
                  >
                    <svg v-if="submitting" class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M21 12a9 9 0 1 1-9-9" stroke-linecap="round" />
                    </svg>
                    {{ submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Product' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { user } = useAuth()

const isSuperAdmin = computed(() => {
  return user.value?.role === 'super-admin'
})

const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  productId?: number | string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [product: any]
}>()

const api = useApi()

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'PHP']

const emptyForm = () => ({
  organization_id: null as number | null,

  name: '',
  sku: '',
  description: '',
  category_id: null as number | null,
  subcategory_id: null as number | null,
  brand_id: null as number | null,
  material: '',
  color: '',
  color_hex: '',
  length_cm: null as number | null,
  width_cm: null as number | null,
  height_cm: null as number | null,
  weight_g: null as number | null,
  price: null as number | null,
  trade_price: null as number | null,
  currency: 'USD',
  lead_time_days: null as number | null,
  in_stock: true,
  image_url: '',
  country_origin: '',
  vendor_url: '',
  care_instructions: '',
})

const form = reactive(emptyForm())
const styleTagsInput = ref('')
const roomTagsInput = ref('')

const errors = reactive<Record<string, string>>({})
const formError = ref('')
const submitting = ref(false)
const loadingProduct = ref(false)
const isDirty = ref(false)

// Track dirtiness so we can warn before an accidental close
watch(form, () => { isDirty.value = true }, { deep: true })

// ---- Load organizations for super admin ----
const organizations = ref<any[]>([])

const fetchOrganizations = async () => {
  try {
    const response = await api('/organizations')

    organizations.value = response.data ?? response

    console.log('Organizations:', organizations.value)
  } catch (error) {
    console.error('Failed to load organizations', error)
  }
}

watch(
  isSuperAdmin,
  (value) => {
    if (value) {
      fetchOrganizations()
    }
  },
  { immediate: true }
)

// ---- Reference data (categories, subcategories, brands) ----
const { data: categoriesData } = await useAsyncData(
  'form-categories',
  () => api('/categories', { query: { per_page: 100 } })
)
const categories = computed(() => categoriesData.value?.data ?? [])

const { data: subcategoriesData } = await useAsyncData(
  'form-subcategories',
  () => api('/subcategories', { query: { per_page: 200 } })
)
const allSubcategories = computed(() => subcategoriesData.value?.data ?? [])
const filteredSubcategories = computed(() =>
  allSubcategories.value.filter((s: any) => s.category_id === form.category_id)
)

const { data: brandsData } = await useAsyncData(
  'form-brands',
  () => api('/brands', { query: { per_page: 200 } })
)
const brands = computed(() => brandsData.value?.data ?? [])

// ---- Load existing product when opening in edit mode ----
watch(
  () => [props.modelValue, props.mode, props.productId],
  async ([open, mode, id]) => {
    if (!open) return

    Object.assign(form, emptyForm())
    styleTagsInput.value = ''
    roomTagsInput.value = ''
    clearErrors()
    isDirty.value = false

    if (mode === 'edit' && id) {
      loadingProduct.value = true
      try {
        const res: any = await api(`/products/${id}`)
        const p = res.data ?? res
        Object.assign(form, {
          name: p.name ?? '',
          sku: p.sku ?? '',
          description: p.description ?? '',
          category_id: p.category_id ?? p.category?.id ?? null,
          subcategory_id: p.subcategory_id ?? p.subcategory?.id ?? null,
          brand_id: p.brand_id ?? p.brand?.id ?? null,
          material: p.material ?? '',
          color: p.color ?? '',
          color_hex: p.color_hex ?? '',
          length_cm: p.length_cm ?? null,
          width_cm: p.width_cm ?? null,
          height_cm: p.height_cm ?? null,
          weight_g: p.weight_g ?? null,
          price: p.price ?? null,
          trade_price: p.trade_price ?? null,
          currency: p.currency ?? 'USD',
          lead_time_days: p.lead_time_days ?? null,
          in_stock: !!p.in_stock,
          image_url: p.image_url ?? '',
          country_origin: p.country_origin ?? '',
          vendor_url: p.vendor_url ?? '',
          care_instructions: p.care_instructions ?? '',
        })
        styleTagsInput.value = (p.style_tags ?? []).join(', ')
        roomTagsInput.value = (p.room_tags ?? []).join(', ')
      } catch (e) {
        formError.value = 'Could not load this product. Please try again.'
      } finally {
        loadingProduct.value = false
        isDirty.value = false
      }
    }
  },
  { immediate: true }
)

function clearErrors() {
  Object.keys(errors).forEach((k) => delete errors[k])
  formError.value = ''
}

async function submit() {
  clearErrors()
  submitting.value = true

  const payload = {
    ...form,
    style_tags: styleTagsInput.value.split(',').map((t) => t.trim()).filter(Boolean),
    room_tags: roomTagsInput.value.split(',').map((t) => t.trim()).filter(Boolean),
  }

  try {
    const res: any = props.mode === 'edit'
      ? await api(`/products/${props.productId}`, { method: 'PUT', body: payload })
      : await api('/products', { method: 'POST', body: payload })

    isDirty.value = false
    emit('saved', res.data ?? res)
    emit('update:modelValue', false)
  } catch (e: any) {
    if (e?.response?.status === 422) {
      const fieldErrors = e.response._data?.errors ?? {}
      Object.entries(fieldErrors).forEach(([key, msgs]) => {
        errors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      })
      formError.value = e.response._data?.message ?? 'Please fix the errors below.'
    } else {
      formError.value = 'Something went wrong while saving. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

function attemptClose() {
  if (isDirty.value && !confirm('Discard unsaved changes?')) return
  emit('update:modelValue', false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) attemptClose()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  }
)
</script>

<style scoped>
.input {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e2ddd0;
  background: rgba(241, 238, 231, 0.4);
  padding: 0.55rem 0.75rem;
  font-size: 0.875rem;
  color: #24221d;
}
.input:focus {
  outline: none;
  border-color: #b8834a;
  box-shadow: 0 0 0 3px rgba(184, 131, 74, 0.15);
}
.input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.input::placeholder {
  color: #a49c88;
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