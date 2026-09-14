<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#24221d]/40 px-4 py-8 sm:py-12" @mousedown.self="attemptClose">
        <Transition name="modal-pop" appear>
          <div v-if="modelValue" role="dialog" aria-modal="true" :aria-label="mode === 'edit' ? 'Edit classification' : 'Add new classification'" class="relative w-full max-w-lg rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_24px_60px_-20px_rgba(36,34,29,0.35)]">
            <button type="button" class="absolute top-6 right-6 flex size-8 items-center justify-center rounded-full text-[#a49c88] hover:bg-[#f1eee7] hover:text-[#24221d]" aria-label="Close" @click="attemptClose">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" /></svg>
            </button>

            <form class="p-6 sm:p-8" @submit.prevent="submit">
              <p class="font-mono text-xs uppercase tracking-wide text-[#a49c88]">{{ mode === 'edit' ? 'Editing' : 'New classification' }}</p>
              <h2 class="mt-1 pr-8 text-2xl font-medium text-[#24221d]">{{ mode === 'edit' ? 'Edit Classification' : 'Add New Classification' }}</h2>
              <div v-if="formError" class="mt-6 rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-4 py-3 text-sm text-[#a8493a]">{{ formError }}</div>

              <div class="mt-6 space-y-5">
                <label v-if="isSuperAdmin && mode === 'create'" class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Organization</span>
                  <select v-model="form.organization_id" class="input">
                    <option :value="null">Select organization…</option>
                    <option v-for="organization in organizations" :key="organization.id" :value="organization.id">{{ organization.name }}</option>
                  </select>
                  <p v-if="errors.organization_id" class="mt-1.5 text-xs text-[#a8493a]">{{ errors.organization_id }}</p>
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Type</span>
                  <select v-model="form.type" class="input" :disabled="mode === 'edit'">
                    <option value="category">Category</option>
                    <option value="subcategory">Subcategory</option>
                    <option value="brand">Brand</option>
                  </select>
                </label>

                <label v-if="form.type === 'subcategory'" class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Parent Category</span>
                  <select v-model="form.category_id" class="input" :disabled="mode === 'edit'">
                    <option :value="null">Select category…</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                  </select>
                  <p v-if="errors.category_id" class="mt-1.5 text-xs text-[#a8493a]">{{ errors.category_id }}</p>
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Name</span>
                  <input v-model.trim="form.name" type="text" :placeholder="namePlaceholder" maxlength="255" class="input" />
                  <p v-if="errors.name" class="mt-1.5 text-xs text-[#a8493a]">{{ errors.name }}</p>
                </label>
              </div>

              <div class="mt-7 flex justify-end gap-2 border-t border-[#e2ddd0] pt-5">
                <button type="button" class="rounded-lg border border-[#e2ddd0] px-4 py-2 text-sm font-medium text-[#24221d] hover:bg-[#f1eee7]" @click="attemptClose">Cancel</button>
                <button type="submit" class="rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:opacity-60" :disabled="submitting">{{ submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Classification' }}</button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type ClassificationType = 'category' | 'subcategory' | 'brand'
type Classification = { id: number | string; name: string; type: ClassificationType; category_id?: number | string | null }

const props = defineProps<{ modelValue: boolean; mode: 'create' | 'edit'; classification: Classification | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const { user } = useAuth()
const api = useApi()
const isSuperAdmin = computed(() => user.value?.role === 'super-admin')
const endpoints: Record<ClassificationType, string> = { category: 'categories', subcategory: 'subcategories', brand: 'brands' }
const form = reactive({ organization_id: null as number | string | null, type: 'category' as ClassificationType, name: '', category_id: null as number | string | null })
const categories = ref<any[]>([])
const organizations = ref<any[]>([])
const errors = reactive<Record<string, string>>({})
const formError = ref('')
const submitting = ref(false)
const isDirty = ref(false)

const namePlaceholder = computed(() => ({ category: 'e.g. Furniture', subcategory: 'e.g. Sofas', brand: 'e.g. Benjamin Moore' })[form.type])

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
  formError.value = ''
}

function resetForm() {
  form.organization_id = null
  form.type = props.classification?.type ?? 'category'
  form.name = props.classification?.name ?? ''
  form.category_id = props.classification?.category_id ?? null
  clearErrors()
  isDirty.value = false
}

async function loadReferences() {
  const [categoriesResponse, organizationsResponse] = await Promise.all([
    api('/categories'),
    isSuperAdmin.value ? api('/organizations') : Promise.resolve([]),
  ])
  categories.value = categoriesResponse?.data ?? categoriesResponse ?? []
  organizations.value = organizationsResponse?.data ?? organizationsResponse ?? []
}

function validate() {
  clearErrors()
  if (!form.name.trim()) errors.name = 'A name is required.'
  if (form.type === 'subcategory' && props.mode === 'create' && !form.category_id) errors.category_id = 'Choose a parent category.'
  if (isSuperAdmin.value && props.mode === 'create' && !form.organization_id) errors.organization_id = 'Choose an organization.'
  if (Object.keys(errors).length) {
    formError.value = 'Please fix the errors below.'
    return false
  }
  return true
}

watch(form, () => { isDirty.value = true }, { deep: true })
watch(() => form.type, (type) => { if (type !== 'subcategory') form.category_id = null })
watch(() => props.modelValue, async (open) => {
  if (!open) return
  resetForm()
  try {
    await loadReferences()
  } catch {
    formError.value = 'Unable to load the classification options. Please try again.'
  }
})

async function submit() {
  if (!validate()) return
  submitting.value = true

  try {
    const body: Record<string, unknown> = { name: form.name }
    if (props.mode === 'create' && isSuperAdmin.value) body.organization_id = form.organization_id
    if (form.type === 'subcategory' && props.mode === 'create') body.category_id = form.category_id

    const endpoint = `/${endpoints[form.type]}${props.mode === 'edit' ? `/${props.classification!.id}` : ''}`
    await api(endpoint, { method: props.mode === 'edit' ? 'PUT' : 'POST', body })
    isDirty.value = false
    emit('saved')
    emit('update:modelValue', false)
  } catch (error: any) {
    const payload = error?.data ?? error?.response?._data ?? {}
    Object.entries(payload.errors ?? {}).forEach(([key, messages]) => {
      errors[key] = Array.isArray(messages) ? messages[0] : String(messages)
    })
    formError.value = payload.message ?? 'Unable to save the classification. Please try again.'
  } finally {
    submitting.value = false
  }
}

function attemptClose() {
  if (!submitting.value && (!isDirty.value || confirm('Discard unsaved changes?'))) emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) attemptClose()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.input { width: 100%; border: 1px solid #e2ddd0; border-radius: 0.5rem; background: rgba(241, 238, 231, 0.4); padding: 0.625rem 0.75rem; font-size: 0.875rem; color: #24221d; }
.input:focus { outline: none; border-color: #b8834a; box-shadow: 0 0 0 3px rgba(184, 131, 74, 0.15); }
.input:disabled { cursor: not-allowed; opacity: 0.55; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 200ms ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-pop-enter-active { transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
.modal-pop-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
</style>
