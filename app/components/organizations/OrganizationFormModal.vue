<!--
  components/organizations/OrganizationFormModal.vue

  Add/Edit modal for organizations. Works in two modes:

    Create:  <OrganizationsOrganizationFormModal v-model="showModal" mode="create" @saved="onSaved" />
    Edit:    <OrganizationsOrganizationFormModal v-model="showModal" mode="edit" :organization-id="selectedId" @saved="onSaved" />

  Posts to POST /organizations (create) or PUT /organizations/{id} (edit).
-->

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center bg-[#24221d]/40 px-4 py-8 sm:py-12" @mousedown.self="close">
        <Transition name="modal-pop" appear>
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-label="mode === 'edit' ? 'Edit organization' : 'Add new organization'"
            class="relative w-full max-w-md rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_24px_60px_-20px_rgba(36,34,29,0.35)]"
          >
            <button type="button" class="absolute top-6 right-6 flex size-8 items-center justify-center rounded-full text-[#a49c88] hover:bg-[#f1eee7] hover:text-[#24221d]" aria-label="Close" @click="close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" /></svg>
            </button>

            <div class="p-6 sm:p-8">
              <p class="font-mono text-xs uppercase tracking-wide text-[#a49c88]">
                {{ mode === 'edit' ? 'Editing' : 'New organization' }}
              </p>
              <h2 class="mt-1 pr-8 text-2xl font-medium text-[#24221d]">
                {{ mode === 'edit' ? 'Edit Organization' : 'Add New Organization' }}
              </h2>

              <div v-if="loadingOrganization" class="mt-6">
                <div class="h-4 w-full animate-pulse rounded bg-[#ece7da] mb-2" />
                <div class="h-4 w-3/4 animate-pulse rounded bg-[#ece7da]" />
              </div>

              <form v-else class="mt-6" @submit.prevent="submit">
                <div v-if="formError" class="mb-5 rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-4 py-3 text-sm text-[#a8493a]">{{ formError }}</div>

                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Organization name</span>
                  <input v-model.trim="form.name" type="text" maxlength="255" placeholder="e.g. Acme Interiors" class="input" />
                  <p v-if="errors.name" class="error">{{ errors.name }}</p>
                </label>

                <label class="mt-5 flex items-center gap-2.5 text-sm text-[#24221d]">
                  <input v-model="form.is_active" type="checkbox" class="h-4 w-4 rounded border-[#e2ddd0] text-[#b8834a] focus:ring-[#b8834a]/30" />
                  Active
                </label>
                <p v-if="errors.is_active" class="error">{{ errors.is_active }}</p>

                <div class="mt-7 flex justify-end gap-2 border-t border-[#e2ddd0] pt-5">
                  <button type="button" class="rounded-lg border border-[#e2ddd0] px-4 py-2 text-sm font-medium text-[#24221d] hover:bg-[#f1eee7]" @click="close">Cancel</button>
                  <button type="submit" class="rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:opacity-60" :disabled="submitting">
                    {{ submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Organization' }}
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
const props = defineProps<{
  modelValue: boolean
  mode: 'create' | 'edit'
  organizationId?: number | string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const api = useApi()

const emptyForm = () => ({
  name: '',
  is_active: true,
})

const form = reactive(emptyForm())
const errors = reactive<Record<string, string>>({})
const formError = ref('')
const submitting = ref(false)
const loadingOrganization = ref(false)
const isDirty = ref(false)

watch(form, () => { isDirty.value = true }, { deep: true })

watch(
  () => [props.modelValue, props.mode, props.organizationId],
  async ([open, mode, id]) => {
    if (!open) return

    Object.assign(form, emptyForm())
    clearErrors()
    isDirty.value = false

    if (mode === 'edit' && id) {
      loadingOrganization.value = true
      try {
        const res: any = await api(`/organizations/${id}`)
        const org = res.data ?? res
        form.name = org.name ?? ''
        form.is_active = !!org.is_active
      } catch (e) {
        formError.value = 'Could not load this organization. Please try again.'
      } finally {
        loadingOrganization.value = false
        isDirty.value = false
      }
    }
  },
  { immediate: true }
)

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
  formError.value = ''
}

async function submit() {
  clearErrors()
  submitting.value = true

  try {
    if (props.mode === 'edit') {
      await api(`/organizations/${props.organizationId}`, { method: 'PUT', body: form })
    } else {
      await api('/organizations', { method: 'POST', body: form })
    }

    isDirty.value = false
    emit('saved')
    emit('update:modelValue', false)
  } catch (error: any) {
    const payload = error?.data ?? error?.response?._data ?? {}
    Object.entries(payload.errors ?? {}).forEach(([key, messages]) => {
      errors[key] = Array.isArray(messages) ? messages[0] : String(messages)
    })
    formError.value = payload.message ?? 'Unable to save the organization. Please try again.'
  } finally {
    submitting.value = false
  }
}

function close() {
  if (!submitting.value && (!isDirty.value || confirm('Discard unsaved changes?'))) emit('update:modelValue', false)
}
</script>

<style scoped>
.input { width: 100%; border: 1px solid #e2ddd0; border-radius: 0.5rem; background: rgba(241, 238, 231, 0.4); padding: 0.625rem 0.75rem; font-size: 0.875rem; color: #24221d; }
.input:focus { outline: none; border-color: #b8834a; box-shadow: 0 0 0 3px rgba(184, 131, 74, 0.15); }
.error { margin-top: 0.375rem; font-size: 0.75rem; color: #a8493a; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 200ms ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-pop-enter-active { transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
.modal-pop-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.modal-pop-enter-from, .modal-pop-leave-to { opacity: 0; transform: translateY(10px) scale(0.98); }
</style>