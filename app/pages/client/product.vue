<!--
  Product list page — assumes your app's existing layout already
  provides the sidebar/shell, so this only renders the page content
  (header, search + filter, table, pagination), re-themed to the Lily
  palette. Adds a "View" action alongside Edit/Delete.

  Assumes a `useApi()` composable (see earlier setup) hitting your Laravel
  API. Swap the endpoint paths below if yours differ.
-->
<template>
  <div class="bg-[#f1eee7] p-5 sm:p-8">
    <div class="mx-auto max-w-[1200px] rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 sm:p-8 shadow-[0_1px_2px_rgba(36,34,29,0.04)]">
        <!-- Header -->
        <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 class="text-3xl font-medium text-[#24221d]">Products</h1>
            <p class="mt-1 text-sm text-[#8c8571]">Manage your material library — view, edit, or remove entries.</p>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-[#b8834a] px-4 py-2.5 text-sm font-medium text-[#fbfaf6] transition-colors hover:bg-[#a6733d]"
            @click="openCreate"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" />
            </svg>
            Add New Product
          </button>
        </div>

        <!-- Search + filter -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="relative flex-1">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a49c88]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" stroke-linecap="round" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Search products by name, SKU, or category…"
              class="w-full rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 py-2.5 pl-10 pr-4 text-sm text-[#24221d] placeholder:text-[#a49c88] focus:border-[#b8834a] focus:outline-none focus:ring-2 focus:ring-[#b8834a]/15"
            />
          </div>

          <select
            v-model="categoryFilter"
            class="rounded-lg border border-[#e2ddd0] bg-[#f1eee7]/40 px-3.5 py-2.5 text-sm text-[#24221d] focus:border-[#b8834a] focus:outline-none focus:ring-2 focus:ring-[#b8834a]/15"
          >
            <option value="">All Categories</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-[#e2ddd0]">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[#e2ddd0] bg-[#f1eee7]/50 text-left text-[#8c8571]">
                <th class="px-4 py-3 font-medium w-10">#</th>
                <th class="px-4 py-3 font-medium">Product</th>
                <th class="px-4 py-3 font-medium">Category</th>
                <th class="px-4 py-3 font-medium">Material / Color</th>
                <th class="px-4 py-3 font-medium">Price</th>
                <th class="px-4 py-3 font-medium">Lead Time</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="pending">
                <tr
                  v-for="n in 5"
                  :key="`skeleton-${n}`"
                  class="border-b border-[#ece7da] last:border-0"
                >
                  <td colspan="8" class="px-4 py-4">
                    <div class="h-4 w-full animate-pulse rounded bg-[#ece7da]" />
                  </td>
                </tr>
              </template>

              <template v-if="!pending">
                <tr
                  v-for="(product, i) in products"
                  :key="product.id"
                  class="border-b border-[#ece7da] last:border-0 hover:bg-[#f1eee7]/40"
                >
                <td class="px-4 py-4 text-[#a49c88]">{{ startIndex + i + 1 }}</td>

                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#e2ddd0] bg-[#f1eee7]">
                      <img
                        v-if="product.image_url"
                        :src="product.image_url"
                        :alt="product.name"
                        class="h-full w-full object-cover"
                      />
                      <div v-else class="flex h-full w-full items-center justify-center text-[#c2baa4]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="9" cy="9" r="1.5" />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p class="font-medium text-[#24221d]">{{ product.name }}</p>
                      <p class="text-xs text-[#a49c88]">SKU: {{ product.sku }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-4 text-[#4d493e]">
                  <p>{{ product.category?.name ?? '—' }}</p>
                  <p v-if="product.subcategory" class="text-xs text-[#a49c88]">{{ product.subcategory.name }}</p>
                </td>

                <td class="px-4 py-4 text-[#4d493e]">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="product.color_hex"
                      class="h-3.5 w-3.5 rounded-full border border-[#e2ddd0]"
                      :style="{ background: product.color_hex }"
                    />
                    <span>{{ [product.material, product.color].filter(Boolean).join(' · ') || '—' }}</span>
                  </div>
                </td>

                <td class="px-4 py-4 font-medium text-[#24221d]">
                  {{ formatCurrency(product.price, product.currency) }}
                </td>

                <td class="px-4 py-4 text-[#4d493e]">
                  {{ product.lead_time_days ? `${product.lead_time_days}d` : '—' }}
                </td>

                <td class="px-4 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="product.in_stock
                      ? 'bg-[#e7efe8] text-[#4a6b52]'
                      : 'bg-[#f7e6e3] text-[#a8493a]'"
                  >
                    {{ product.in_stock ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd0] px-3 py-1.5 text-xs font-medium text-[#24221d] hover:bg-[#f1eee7]"
                      @click="openView(product)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke-linejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </button>

                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2ddd0] px-3 py-1.5 text-xs font-medium text-[#24221d] hover:bg-[#f1eee7]"
                      @click="openEdit(product)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9" stroke-linecap="round" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke-linejoin="round" />
                      </svg>
                      Edit
                    </button>

                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-lg border border-[#f0d3cc] bg-[#fdf4f2] px-3 py-1.5 text-xs font-medium text-[#a8493a] hover:bg-[#f7e6e3]"
                      @click="confirmDelete(product)"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18" stroke-linecap="round" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              </template>

              <tr v-if="!pending && products.length === 0">
                <td colspan="8" class="px-4 py-10 text-center text-sm text-[#a49c88]">
                  No products match your search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-[#8c8571]">
            Showing {{ startIndex + 1 }} to {{ Math.min(startIndex + perPage, total) }} of {{ total }} products
          </p>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2ddd0] text-[#24221d] disabled:opacity-40"
              :disabled="page === 1"
              @click="page--"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
    </div>

    <ProductViewModal v-model="showViewModal" :product-id="selectedProductId" />
    <ProductFormModal
      v-model="showFormModal"
      :mode="formMode"
      :product-id="selectedProductId"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Products',
  middleware: 'auth',
  layout: 'client',
})

const api = useApi()

const showViewModal = ref(false)
const showFormModal = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedProductId = ref<number | string | null>(null)

function openView(product: { id: number | string }) {
  selectedProductId.value = product.id
  showViewModal.value = true
}

function openCreate() {
  selectedProductId.value = null
  formMode.value = 'create'
  showFormModal.value = true
}

function openEdit(product: { id: number | string }) {
  selectedProductId.value = product.id
  formMode.value = 'edit'
  showFormModal.value = true
}

async function onSaved() {
  await refresh()
}

const search = ref('')
const categoryFilter = ref('')
const page = ref(1)
const perPage = 8

// Debounce search so we're not firing a request per keystroke
const debouncedSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val
    page.value = 1
  }, 300)
})
watch(categoryFilter, () => { page.value = 1 })

const { data, pending, refresh } = await useAsyncData(
  'products-list',
  () => api('/products', {
    query: {
      search: debouncedSearch.value || undefined,
      category_id: categoryFilter.value || undefined,
      page: page.value,
      per_page: perPage,
    },
  }),
  { watch: [debouncedSearch, categoryFilter, page] }
)

const products = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta?.total ?? 0)
const lastPage = computed(() => data.value?.meta?.last_page ?? 1)
const startIndex = computed(() => (page.value - 1) * perPage)

const pageNumbers = computed(() => {
  const pages: number[] = []
  const max = Math.min(lastPage.value, 5)
  for (let i = 1; i <= max; i++) pages.push(i)
  return pages
})

const { data: categoriesData } = await useAsyncData(
  'categories-list',
  () => api('/categories', { query: { per_page: 100 } })
)
const categories = computed(() => categoriesData.value?.data ?? [])

function formatCurrency(value: number | string, currency = 'USD') {
  const amount = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0)
}

async function confirmDelete(product: any) {
  if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return
  await api(`/products/${product.id}`, { method: 'DELETE' })
  await refresh()
}
</script>