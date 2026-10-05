<template>
  <div class="bg-[#f1eee7] p-5 sm:p-8">
    <div class="mx-auto max-w-[1200px] rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <p class="mt-1 text-sm text-[#8c8571]">View users across every organization.</p>
        <button type="button" class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#b8834a] px-4 py-2.5 text-sm font-medium text-[#fbfaf6] transition-colors hover:bg-[#a6733d]" @click="showUserModal = true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
          Add New User
        </button>
      </div>
      <div class="mb-6 flex flex-col gap-3 sm:flex-row">
        <div class="relative max-w-xl flex-1">
          <svg class="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#a49c88]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
          <input v-model="search" type="search" placeholder="Search users by name or email…" class="w-full rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 py-2.5 pr-4 pl-10 text-sm text-[#24221d] placeholder:text-[#a49c88] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none" />
        </div>
        <select v-model="organizationFilter" class="rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 px-3.5 py-2.5 text-sm text-[#24221d] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none"><option value="">All organizations</option><option v-for="organization in organizations" :key="organization.id" :value="organization.id">{{ organization.name }}</option></select>
      </div>
      <div class="overflow-x-auto rounded-xl border border-[#e2ddd0]">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-[#e2ddd0] bg-[#f1eee7]/50 text-left text-[#8c8571]"><th class="px-4 py-3 font-medium">User</th><th class="px-4 py-3 font-medium">Role</th><th class="px-4 py-3 font-medium">Organization</th><th class="px-4 py-3 font-medium">Status</th><th class="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody>
            <tr v-for="n in pending ? 5 : 0" :key="`skeleton-${n}`" class="border-b border-[#ece7da]"><td colspan="5" class="px-4 py-4"><div class="h-4 w-full animate-pulse rounded bg-[#ece7da]" /></td></tr>
            <tr v-for="user in users" :key="user.id" class="border-b border-[#ece7da] last:border-0 hover:bg-[#f1eee7]/40">
              <td class="px-4 py-4"><p class="font-medium text-[#24221d]">{{ user.name }}</p><p class="text-xs text-[#a49c88]">{{ user.email }}</p></td>
              <td class="px-4 py-4 capitalize text-[#4d493e]">{{ user.roles?.[0]?.name?.replace('-', ' ') ?? '—' }}</td>
              <td class="px-4 py-4 text-[#4d493e]">{{ user.organization?.name ?? '—' }}</td>
              <td class="px-4 py-4">
                <div v-if="!isSuperAdminRow(user)" class="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="user.is_active"
                    :title="user.is_active ? 'Click to deactivate' : 'Click to activate'"
                    class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-50"
                    :class="user.is_active ? 'bg-[#4a6b52]' : 'bg-[#d8c9b3]'"
                    :disabled="togglingId === user.id"
                    @click="toggleStatus(user)"
                  >
                    <span
                      class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                      :class="user.is_active ? 'translate-x-[18px]' : 'translate-x-1'"
                    />
                  </button>
                  <span class="text-xs font-medium" :class="user.is_active ? 'text-[#4a6b52]' : 'text-[#a8493a]'">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <span v-else class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="user.is_active ? 'bg-[#e7efe8] text-[#4a6b52]' : 'bg-[#f7e6e3] text-[#a8493a]'">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-4 text-right">
                <button v-if="!isSuperAdminRow(user)" type="button" class="rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-3 py-1.5 text-xs font-medium text-[#a8493a] hover:bg-[#f7e6e3]" @click="confirmDelete(user)">Delete</button>
              </td>
            </tr>
            <tr v-if="!pending && users.length === 0"><td colspan="5" class="px-4 py-10 text-center text-sm text-[#a49c88]">No users found.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <UsersUserFormModal v-model="showUserModal" @saved="refresh" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  title: 'All Users', 
  middleware: ['auth', 'admin'], 
  layout: 'client' })

const api = useApi()
const search = ref('')
const debouncedSearch = ref('')
const organizationFilter = ref<number | string | ''>('')
const showUserModal = ref(false)
const togglingId = ref<number | string | null>(null)
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (value) => { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { debouncedSearch.value = value }, 300) })

const { data: organizationsData } = await useAsyncData('users-organizations', () => api('/organizations'))
const organizations = computed(() => organizationsData.value?.data ?? organizationsData.value ?? [])
const { data, pending, refresh } = await useAsyncData(
  'all-users-list',
  () => api('/users', { query: { search: debouncedSearch.value || undefined, organization_id: organizationFilter.value || undefined } }),
  { watch: [debouncedSearch, organizationFilter] },
)
const users = computed(() => data.value?.data ?? data.value ?? [])

function isSuperAdminRow(user: any) {
  return user.roles?.some((role: any) => role.name === 'super-admin')
}

async function toggleStatus(user: any) {
  if (togglingId.value) return // avoid overlapping requests from a double-click

  const previous = user.is_active
  togglingId.value = user.id
  user.is_active = !previous // optimistic — flips instantly, no modal, no reload

  try {
    await api(`/users/${user.id}`, { method: 'PUT', body: { is_active: user.is_active } })
  } catch (error: any) {
    user.is_active = previous // revert on failure
    const payload = error?.data ?? error?.response?._data ?? {}
    alert(payload.message ?? 'Could not update status. Please try again.')
  } finally {
    togglingId.value = null
  }
}

async function confirmDelete(user: any) {
  if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return
  await api(`/users/${user.id}`, { method: 'DELETE' })
  await refresh()
}
</script>