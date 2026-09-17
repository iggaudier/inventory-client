<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center bg-[#24221d]/40 px-4 py-8 sm:py-12" @mousedown.self="close">
        <Transition name="modal-pop" appear>
          <div v-if="modelValue" role="dialog" aria-modal="true" aria-label="Add group member" class="relative w-full max-w-lg rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_24px_60px_-20px_rgba(36,34,29,0.35)]">
            <button type="button" class="absolute top-6 right-6 flex size-8 items-center justify-center rounded-full text-[#a49c88] hover:bg-[#f1eee7] hover:text-[#24221d]" aria-label="Close" @click="close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" /></svg>
            </button>

            <form class="p-6 sm:p-8" @submit.prevent="submit">
              <p class="font-mono text-xs uppercase tracking-wide text-[#a49c88]">New teammate</p>
              <h2 class="mt-1 pr-8 text-2xl font-medium text-[#24221d]">Add Group Member</h2>
              <p class="mt-2 text-sm text-[#8c8571]">They will receive a temporary password by email.</p>

              <div v-if="formError" class="mt-6 rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-4 py-3 text-sm text-[#a8493a]">{{ formError }}</div>

              <div class="mt-6 space-y-5">
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Full name</span>
                  <input v-model.trim="form.name" type="text" autocomplete="name" maxlength="255" placeholder="e.g. Jamie Cruz" class="input" />
                  <p v-if="errors.name" class="error">{{ errors.name }}</p>
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Email address</span>
                  <input v-model.trim="form.email" type="email" autocomplete="email" maxlength="255" placeholder="jamie@example.com" class="input" />
                  <p v-if="errors.email" class="error">{{ errors.email }}</p>
                </label>
              </div>

              <div class="mt-7 flex justify-end gap-2 border-t border-[#e2ddd0] pt-5">
                <button type="button" class="rounded-lg border border-[#e2ddd0] px-4 py-2 text-sm font-medium text-[#24221d] hover:bg-[#f1eee7]" @click="close">Cancel</button>
                <button type="submit" class="rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:opacity-60" :disabled="submitting">{{ submitting ? 'Sending…' : 'Add Member' }}</button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const api = useApi()
const form = reactive({ name: '', email: '' })
const errors = reactive<Record<string, string>>({})
const formError = ref('')
const submitting = ref(false)
const isDirty = ref(false)

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key])
  formError.value = ''
}

function resetForm() {
  form.name = ''
  form.email = ''
  clearErrors()
  isDirty.value = false
}

function validate() {
  clearErrors()
  if (!form.name) errors.name = 'A full name is required.'
  if (!form.email) errors.email = 'An email address is required.'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email address.'
  if (Object.keys(errors).length) {
    formError.value = 'Please fix the errors below.'
    return false
  }
  return true
}

watch(form, () => { isDirty.value = true }, { deep: true })
watch(() => props.modelValue, (open) => { if (open) resetForm() })

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    await api('/group-members', { method: 'POST', body: form })
    isDirty.value = false
    emit('saved')
    emit('update:modelValue', false)
  } catch (error: any) {
    const payload = error?.data ?? error?.response?._data ?? {}
    Object.entries(payload.errors ?? {}).forEach(([key, messages]) => {
      errors[key] = Array.isArray(messages) ? messages[0] : String(messages)
    })
    formError.value = payload.message ?? 'Unable to add the group member. Please try again.'
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
