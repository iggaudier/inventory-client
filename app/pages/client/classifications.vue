<template>
  <div class="bg-[#f1eee7] p-5 sm:p-8">
     <div class="mx-auto max-w-[1200px] rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-8">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="mt-1 text-sm text-[#8c8571]">Manage the categories, subcategories, and brands available to your material library.</p>
        </div>
          <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-[#b8834a] px-4 py-2.5 text-sm font-medium text-[#fbfaf6] transition-colors hover:bg-[#a6733d]" @click="openCreate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round" /></svg>
          Add New Classification
        </button>
      </div>

      <div class="mb-6 flex flex-col gap-3 sm:flex-row">
        <div class="relative max-w-xl flex-1">
          <svg class="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#a49c88]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" /></svg>
          <input v-model="search" type="search" placeholder="Search classifications by name or type..." class="w-full rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 py-2.5 pr-4 pl-10 text-sm text-[#24221d] placeholder:text-[#a49c88] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none" />
        </div>
        <select v-if="isSuperAdmin" v-model="organizationFilter" class="rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 px-3.5 py-2.5 text-sm text-[#24221d] focus:border-[#b8834a] focus:ring-2 focus:ring-[#b8834a]/15 focus:outline-none">
          <option value="">All organizations</option>
          <option v-for="organization in organizations" :key="organization.id" :value="organization.id">{{ organization.name }}</option>
        </select>
      </div>

      <div class="overflow-x-auto rounded-xl border border-[#e2ddd0]">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[#e2ddd0] bg-[#f1eee7]/50 text-left text-[#8c8571]">
              <th class="px-4 py-3 font-medium">Classification</th>
              <th class="px-4 py-3 font-medium">Type</th>
              <th class="px-4 py-3 font-medium">Parent Category</th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in pending ? 5 : 0" :key="`skeleton-${n}`" class="border-b border-[#ece7da] last:border-0">
              <td colspan="4" class="px-4 py-4"><div class="h-4 w-full animate-pulse rounded bg-[#ece7da]" /></td>
            </tr>

            <tr v-for="item in filteredClassifications" :key="`${item.type}-${item.id}`" class="border-b border-[#ece7da] last:border-0 hover:bg-[#f1eee7]/40">
              <td class="px-4 py-4 font-medium text-[#24221d]">{{ item.name }}</td>
              <td class="px-4 py-4"><span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="typeStyles[item.type]">{{ item.typeLabel }}</span></td>
              <td class="px-4 py-4 text-[#4d493e]">{{ item.parentName ?? '—' }}</td>
              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <button type="button" class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd0] px-3 py-1.5 text-xs font-medium text-[#24221d] hover:bg-[#f1eee7]" @click="openEdit(item)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9" stroke-linecap="round" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke-linejoin="round" /></svg>
                    Edit
                  </button>
                  <button type="button" class="inline-flex items-center gap-1.5 rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-3 py-1.5 text-xs font-medium text-[#a8493a] hover:bg-[#f7e6e3]" @click="confirmDelete(item)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18" stroke-linecap="round" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    Delete
                  </button>
                </div>
                </td>
            </tr>
            <tr v-if="!pending && filteredClassifications.length === 0"><td colspan="4" class="px-4 py-10 text-center text-sm text-[#a49c88]">No classifications match your search.</td></tr>
          </tbody>
        </table>
      </div>
      <ClassificationFormModal v-model="showFormModal" :mode="formMode" :classification="selectedClassification" @saved="refresh" />
  </div>
</div>
</template>

<script setup lang="ts">
definePageMeta({ 
    title: 'Classifications', 
    middleware: 'auth', 
    layout: 'client' })

type ClassificationType = 'category' | 'subcategory' | 'brand'
type Classification = { id: number | string; name: string; type: ClassificationType; typeLabel: string; parentName?: string; category_id?: number | string | null }

const api = useApi()
const { user } = useAuth()
const search = ref('')
const organizationFilter = ref<number | string | ''>('')
const showFormModal = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedClassification = ref<Classification | null>(null)
const isSuperAdmin = computed(() => user.value?.role === 'super-admin')

const typeStyles: Record<ClassificationType, string> = {
  category: 'bg-[#eee8dc] text-[#6b5b45]',
  subcategory: 'bg-[#e7efe8] text-[#4a6b52]',
  brand: 'bg-[#e9edf5] text-[#4c607f]',
}
const endpoints: Record<ClassificationType, string> = { category: 'categories', subcategory: 'subcategories', brand: 'brands' }
const unwrapCollection = (response: any): any[] => {
  const collection = response?.data ?? response
  return Array.isArray(collection) ? collection : []
}

const { data: organizationsData } = await useAsyncData(
  'classification-organizations',
  () => isSuperAdmin.value ? api('/organizations') : Promise.resolve([]),
  { watch: [isSuperAdmin] },
)
const organizations = computed(() => unwrapCollection(organizationsData.value))

const { data, pending, refresh } = await useAsyncData('classifications-list', async () => {
  const query = { organization_id: organizationFilter.value || undefined }
  const [categoriesResponse, subcategoriesResponse, brandsResponse] = await Promise.all([
    api('/categories', { query }),
    api('/subcategories', { query }),
    api('/brands', { query }),
  ])
  return {
    categories: unwrapCollection(categoriesResponse),
    subcategories: unwrapCollection(subcategoriesResponse),
    brands: unwrapCollection(brandsResponse),
  }
}, { watch: [organizationFilter] })

const classifications = computed<Classification[]>(() => {
  const categories = data.value?.categories ?? []
  const categoryNames = new Map(categories.map((category: any) => [category.id, category.name]))

  return [
    ...categories.map((category: any) => ({ id: category.id, name: category.name, type: 'category' as const, typeLabel: 'Category' })),
    ...(data.value?.subcategories ?? []).map((subcategory: any) => ({ id: subcategory.id, name: subcategory.name, type: 'subcategory' as const, typeLabel: 'Subcategory', category_id: subcategory.category_id, parentName: subcategory.category?.name ?? categoryNames.get(subcategory.category_id) })),
    ...(data.value?.brands ?? []).map((brand: any) => ({ id: brand.id, name: brand.name, type: 'brand' as const, typeLabel: 'Brand' })),
  ].sort((a, b) => a.name.localeCompare(b.name))
})

const filteredClassifications = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return classifications.value
  return classifications.value.filter((item) =>
    [item.name, item.typeLabel, item.parentName]
      .filter((value): value is string => typeof value === 'string')
      .some((value) => value.toLowerCase().includes(query))
  )
})
function openCreate() {
    formMode.value = 'create'
    selectedClassification.value = null
    showFormModal.value = true
}
function openEdit(classification: Classification) {
  formMode.value = 'edit'
  selectedClassification.value = classification
  showFormModal.value = true
}
async function confirmDelete(classification: Classification) {
  if (!confirm(`Delete "${classification.name}"? This can't be undone.`)) return
  await api(`/${endpoints[classification.type]}/${classification.id}`, { method: 'DELETE' })
  await refresh()
}
</script>
