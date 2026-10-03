<template>
  <div class="bg-[#f1eee7] p-5 sm:p-8">
    <div class="mx-auto max-w-[1200px] rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <p class="mt-1 text-sm text-[#8c8571]">Manage every organization on the platform.</p>
        <button type="button" class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#b8834a] px-4 py-2.5 text-sm font-medium text-[#fbfaf6] transition-colors hover:bg-[#a6733d]" @click="openCreate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
          Add New Organization
        </button>
      </div>

      <div class="mb-6 flex flex-col gap-3 sm:flex-row">
        <div class="relative max-w-xl flex-1">
          <svg class="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#a49c88]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
          <input v-model="search" type="search" placeholder="Search organizations by name…" class="w-full rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 py-2.5 pr-4 pl-10 text-sm text-[#24221d] placeholder:text-[#a49c88] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none" />
        </div>
        <select v-model="statusFilter" class="rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 px-3.5 py-2.5 text-sm text-[#24221d] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none">
          <option value="">All statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      <div class="overflow-x-auto rounded-xl border border-[#e2ddd0]">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#e2ddd0] bg-[#f1eee7]/50 text-left text-[#8c8571]">
              <th class="px-4 py-3 font-medium">Organization</th>
              <th class="px-4 py-3 font-medium">Users</th>
              <th class="px-4 py-3 font-medium">Products</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in pending ? 5 : 0" :key="`skeleton-${n}`" class="border-b border-[#ece7da]">
              <td colspan="5" class="px-4 py-4"><div class="h-4 w-full animate-pulse rounded bg-[#ece7da]" /></td>
            </tr>

            <tr v-for="organization in organizations" :key="organization.id" class="border-b border-[#ece7da] last:border-0 hover:bg-[#f1eee7]/40">
              <td class="px-4 py-4">
                <p class="font-medium text-[#24221d]">{{ organization.name }}</p>
              </td>
              <td class="px-4 py-4 text-[#4d493e]">{{ organization.users_count ?? 0 }}</td>
              <td class="px-4 py-4 text-[#4d493e]">{{ organization.products_count ?? 0 }}</td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="organization.is_active ? 'bg-[#e7efe8] text-[#4a6b52]' : 'bg-[#f7e6e3] text-[#a8493a]'"
                >
                  {{ organization.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd0] px-3 py-1.5 text-xs font-medium text-[#24221d] hover:bg-[#f1eee7]"
                    @click="openEdit(organization)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M12 20h9" stroke-linecap="round" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke-linejoin="round" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-3 py-1.5 text-xs font-medium text-[#a8493a] hover:bg-[#f7e6e3]"
                    @click="confirmDelete(organization)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!pending && organizations.length === 0">
              <td colspan="5" class="px-4 py-10 text-center text-sm text-[#a49c88]">No organizations found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-[#8c8571]">
          Showing {{ organizations.length ? startIndex + 1 : 0 }} to {{ Math.min(startIndex + perPage, total) }} of {{ total }} organizations
        </p>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2ddd0] text-[#24221d] disabled:opacity-40"
            :disabled="page === 1"
            @click="page--"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <button
            v-for="p in pageNumbers"
            :key="p"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium"
            :class="p === page
              ? 'bg-[#b8834a] text-[#fbfaf6]'
              : 'border border-[#e2ddd0] text-[#24221d] hover:bg-[#f1eee7]'"
            @click="page = p"
          >
            {{ p }}
          </button>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2ddd0] text-[#24221d] disabled:opacity-40"
            :disabled="page === lastPage"
            @click="page++"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <OrganizationsOrganizationFormModal
      v-model="showOrgModal"
      :mode="formMode"
      :organization-id="selectedOrgId"
      @saved="refresh"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Organizations',
  middleware: ['auth', 'admin'],
  layout: 'client',
})

const api = useApi()
const search = ref('')
const debouncedSearch = ref('')
const statusFilter = ref<'' | '1' | '0'>('')

const showOrgModal = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedOrgId = ref<number | string | null>(null)

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { debouncedSearch.value = value }, 300)
})

const page = ref(1)
const perPage = 20
watch([debouncedSearch, statusFilter], () => { page.value = 1 })

const { data, pending, refresh } = await useAsyncData(
  'all-organizations-list',
  () => api('/organizations', {
    query: {
      search: debouncedSearch.value || undefined,
      is_active: statusFilter.value !== '' ? statusFilter.value : undefined,
      page: page.value,
      per_page: perPage,
    },
  }),
  { watch: [debouncedSearch, statusFilter, page] },
)
const organizations = computed(() => data.value?.data ?? data.value ?? [])
const total = computed(() => data.value?.meta?.total ?? organizations.value.length)
const lastPage = computed(() => data.value?.meta?.last_page ?? 1)
const startIndex = computed(() => (page.value - 1) * perPage)

const pageNumbers = computed(() => {
  const pages: number[] = []
  const max = Math.min(lastPage.value, 5)
  for (let i = 1; i <= max; i++) pages.push(i)
  return pages
})

function openCreate() {
  selectedOrgId.value = null
  formMode.value = 'create'
  showOrgModal.value = true
}

function openEdit(organization: { id: number | string }) {
  selectedOrgId.value = organization.id
  formMode.value = 'edit'
  showOrgModal.value = true
}

async function confirmDelete(organization: any) {
  if (!confirm(`Delete "${organization.name}"? This will affect every user and product under it. This cannot be undone.`)) return
  await api(`/organizations/${organization.id}`, { method: 'DELETE' })
  if (organizations.value.length === 1 && page.value > 1) page.value--
  else await refresh()
}
</script>