<template>
  <div class="mx-auto max-w-3xl">
    <section class="rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <p class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a17647]">Your account</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#24221d] sm:text-3xl">Account settings</h1>
      <p class="mt-1 text-sm text-[#8c8571]">Update your display name or choose a new password.</p>
    </section>

    <section v-if="isGroupAdmin" class="mt-6 rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <h2 class="text-lg font-semibold text-[#24221d]">Organization</h2>
      <p class="mt-1 text-sm text-[#857d6f]">Update your organization name for all members.</p>
      <form class="mt-6 max-w-lg" @submit.prevent="saveOrganizationName">
        <label class="block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Organization name</span><input v-model.trim="organizationName" required maxlength="255" autocomplete="organization" class="input" /></label>
        <p v-if="organizationError" class="mt-3 text-sm text-[#a8493a]">{{ organizationError }}</p>
        <p v-if="organizationSuccess" class="mt-3 text-sm text-[#42623d]">{{ organizationSuccess }}</p>
        <button type="submit" class="mt-5 rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:cursor-not-allowed disabled:opacity-60" :disabled="savingOrganization">{{ savingOrganization ? 'Saving…' : 'Save organization name' }}</button>
      </form>
    </section>

    <section class="mt-6 rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <h2 class="text-lg font-semibold text-[#24221d]">Profile</h2>
      <p class="mt-1 text-sm text-[#857d6f]">This name is shown across Lily.</p>
      <form class="mt-6 max-w-lg" @submit.prevent="saveName">
        <label class="block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Name</span><input v-model.trim="name" required maxlength="255" autocomplete="name" class="input" /></label>
        <p v-if="nameError" class="mt-3 text-sm text-[#a8493a]">{{ nameError }}</p>
        <p v-if="nameSuccess" class="mt-3 text-sm text-[#42623d]">{{ nameSuccess }}</p>
        <button type="submit" class="mt-5 rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:cursor-not-allowed disabled:opacity-60" :disabled="savingName">{{ savingName ? 'Saving…' : 'Save name' }}</button>
      </form>
    </section>

    <section class="mt-6 rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <h2 class="text-lg font-semibold text-[#24221d]">Password</h2>
      <p class="mt-1 text-sm text-[#857d6f]">Use at least 8 characters with uppercase, lowercase, number, and symbol.</p>
      <form class="mt-6 max-w-lg space-y-5" @submit.prevent="savePassword">
        <label class="block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Current password</span><input v-model="password.current" required type="password" autocomplete="current-password" class="input" /></label>
        <label class="block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">New password</span><input v-model="password.next" required type="password" autocomplete="new-password" class="input" /></label>
        <label class="block"><span class="mb-1.5 block text-sm font-medium text-[#4d493e]">Confirm new password</span><input v-model="password.confirmation" required type="password" autocomplete="new-password" class="input" /></label>
        <p v-if="passwordError" class="text-sm text-[#a8493a]">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="text-sm text-[#42623d]">{{ passwordSuccess }}</p>
        <button type="submit" class="rounded-lg bg-[#b8834a] px-4 py-2 text-sm font-medium text-[#fbfaf6] hover:bg-[#a6733d] disabled:cursor-not-allowed disabled:opacity-60" :disabled="savingPassword">{{ savingPassword ? 'Updating…' : 'Update password' }}</button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ title: 'Account settings', eyebrow: 'Account', middleware: 'auth', layout: 'client' })

const api = useApi()
const { user, setUser } = useAuth()
const name = ref(user.value?.name ?? '')
const isGroupAdmin = computed(() => user.value?.role === 'group-admin')
const organizationName = ref(user.value?.organization_name ?? '')
const savingName = ref(false)
const nameError = ref('')
const nameSuccess = ref('')
const savingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const password = reactive({ current: '', next: '', confirmation: '' })
const savingOrganization = ref(false)
const organizationError = ref('')
const organizationSuccess = ref('')

function firstError(error: any, fallback: string) {
  const errors = error?.data?.errors ?? error?.response?._data?.errors
  return errors ? String(Object.values(errors).flat()[0]) : error?.data?.message ?? error?.response?._data?.message ?? fallback
}

async function saveName() {
  nameError.value = ''
  nameSuccess.value = ''
  savingName.value = true
  try {
    const updatedUser = await api('/account', { method: 'PATCH', body: { name: name.value } })
    setUser(updatedUser)
    nameSuccess.value = 'Your name has been updated.'
  } catch (error) {
    nameError.value = firstError(error, 'Unable to update your name.')
  } finally {
    savingName.value = false
  }
}

async function saveOrganizationName() {
  organizationError.value = ''
  organizationSuccess.value = ''
  savingOrganization.value = true
  try {
    const response = await api('/organizations/name', { method: 'PATCH', body: { name: organizationName.value } })
    const updatedName = response?.data?.name ?? organizationName.value
    organizationName.value = updatedName
    setUser({ ...user.value, organization_name: updatedName })
    organizationSuccess.value = 'Your organization name has been updated.'
  } catch (error) {
    organizationError.value = firstError(error, 'Unable to update your organization name.')
  } finally {
    savingOrganization.value = false
  }
}

async function savePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  if (password.next !== password.confirmation) {
    passwordError.value = 'New password and confirmation do not match.'
    return
  }
  savingPassword.value = true
  try {
    await api('/change-password', { method: 'POST', body: { current_password: password.current, new_password: password.next, new_password_confirmation: password.confirmation } })
    password.current = ''
    password.next = ''
    password.confirmation = ''
    passwordSuccess.value = 'Your password has been updated.'
  } catch (error) {
    passwordError.value = firstError(error, 'Unable to update your password.')
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.input { width: 100%; border: 1px solid #e2ddd0; border-radius: 0.5rem; background: rgba(241, 238, 231, 0.4); padding: 0.625rem 0.75rem; font-size: 0.875rem; color: #24221d; }
.input:focus { outline: none; border-color: #b8834a; box-shadow: 0 0 0 3px rgba(184, 131, 74, 0.15); }
</style>
