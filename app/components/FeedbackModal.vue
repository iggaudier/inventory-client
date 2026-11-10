<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#24221d]/40 px-4 py-8 sm:py-12" @mousedown.self="close">
        <Transition name="modal-pop" appear>
          <div v-if="modelValue" role="dialog" aria-modal="true" aria-labelledby="feedback-title" class="relative w-full max-w-lg rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_24px_60px_-20px_rgba(36,34,29,0.35)]">
            <button type="button" class="absolute top-6 right-6 flex size-8 items-center justify-center rounded-full text-[#a49c88] hover:bg-[#f1eee7] hover:text-[#24221d]" aria-label="Close feedback form" :disabled="submitting" @click="close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" /></svg>
            </button>

            <form class="p-6 sm:p-8" @submit.prevent="submit">
              <p class="font-mono text-xs uppercase tracking-wide text-[#a49c88]">Help improve Lily</p>
              <h2 id="feedback-title" class="mt-1 pr-8 text-2xl font-medium text-[#24221d]">Send feedback</h2>
              <p class="mt-2 max-w-md text-sm leading-6 text-[#6b6156]">Report an issue, share an idea, or tell us what needs attention. We’ll receive your name and email so we can follow up.</p>

              <div v-if="formError" class="mt-6 rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-4 py-3 text-sm text-[#a8493a]">{{ formError }}</div>
              <div v-if="submitted" class="mt-6 rounded-lg border border-[#d9e7d2] bg-[#f3f8f0] px-4 py-3 text-sm text-[#42623d]">Thank you — your message has been sent.</div>

              <div v-if="!submitted" class="mt-6 space-y-5">
                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">What would you like to share?</span>
                  <select v-model="form.type" class="input" :disabled="submitting">
                    <option value="bug">Bug report</option>
                    <option value="feedback">Feedback</option>
                    <option value="report">Report an issue</option>
                    <option value="suggestion">Suggestion</option>
                  </select>
                </label>

                <label class="block">
                  <span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Details</span>
                  <textarea v-model.trim="form.message" class="input min-h-36 resize-y" maxlength="2000" placeholder="Include what happened, what you expected, and any helpful details." :disabled="submitting" />
                  <div class="mt-1.5 flex justify-between text-xs text-[#8a8174]">
                    <span v-if="errors.message" class="text-[#a8493a]">{{ errors.message }}</span>
                    <span v-else>Your message is sent securely to the support inbox.</span>
                    <span>{{ form.message.length }}/2000</span>
                  </div>
                </label>
              </div>

              <div class="mt-7 flex justify-end gap-2 border-t border-[#e2ddd0] pt-5">
                <button type="button" class="rounded-lg border border-[#e2ddd0] px-4 py-2 text-sm font-medium text-[#24221d] hover:bg-[#f1eee7] disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting" @click="close">{{ submitted ? 'Close' : 'Cancel' }}</button>
                <button v-if="!submitted" type="submit" class="rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:cursor-not-allowed disabled:opacity-60" :disabled="submitting">{{ submitting ? 'Sending…' : 'Send feedback' }}</button>
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
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const api = useApi()
const form = reactive({ type: 'bug', message: '' })
const errors = reactive<Record<string, string>>({})
const formError = ref('')
const submitted = ref(false)
const submitting = ref(false)

function resetForm() {
  form.type = 'bug'
  form.message = ''
  formError.value = ''
  submitted.value = false
  Object.keys(errors).forEach((key) => delete errors[key])
}

function close() {
  if (!submitting.value) emit('update:modelValue', false)
}

watch(() => props.modelValue, (open) => {
  if (open) resetForm()
})

async function submit() {
  formError.value = ''
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.message) {
    errors.message = 'Please describe what you would like to share.'
    return
  }

  submitting.value = true
  try {
    await api('/feedback', { method: 'POST', body: form })
    submitted.value = true
  } catch (error: any) {
    const payload = error?.data ?? error?.response?._data ?? {}
    Object.entries(payload.errors ?? {}).forEach(([key, messages]) => {
      errors[key] = Array.isArray(messages) ? messages[0] : String(messages)
    })
    formError.value = payload.message ?? 'Unable to send your feedback. Please try again.'
  } finally {
    submitting.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) close()
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
