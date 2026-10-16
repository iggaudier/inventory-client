<template>
  <div class="mx-auto max-w-[1200px]">
    <section class="overflow-hidden rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] shadow-[0_1px_2px_rgba(36,34,29,0.04)]">
      <div class="relative grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div class="absolute top-0 left-0 h-1 w-28" aria-hidden="true" />
        <div><p class="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#a17647]">Inventory pulse</p><h1 class="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#24221d] sm:text-3xl">A clear view of your catalogue.</h1><p class="mt-2 max-w-xl text-sm text-[#766f61]">See what is available, where your collection is concentrated, and the newest pieces added to your library.</p></div>
        <NuxtLink to="/client/product" class="inline-flex w-fit items-center gap-2 rounded-lg bg-[#b8834a] px-4 py-2.5 text-sm font-medium text-[#fbfaf6] transition-colors hover:bg-[#a6733d]">Browse products <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg></NuxtLink>
      </div>
      <div class="border-t border-[#e2ddd0] px-6 py-5 sm:px-8">
        <div v-if="pending" class="grid gap-5 sm:grid-cols-3"><div v-for="index in 3" :key="index" class="h-16 animate-pulse rounded-lg bg-[#f1eee7]" /></div>
        <div v-else class="grid divide-y divide-[#e2ddd0] sm:grid-cols-2 sm:divide-x sm:divide-y-0" :class="isSuperAdmin ? 'xl:grid-cols-5' : isGroupAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'">
          <div class="py-3 sm:pr-6"><p class="text-xs font-medium uppercase tracking-[0.08em] text-[#958b78]">Catalogue</p><p class="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#24221d]">{{ summary.total_products }}</p><p class="mt-1 text-xs text-[#857d6f]">products across {{ summary.categories }} categories</p></div>
          <div class="py-3 sm:px-6"><p class="text-xs font-medium uppercase tracking-[0.08em] text-[#958b78]">Available now</p><p class="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#4f7157]">{{ summary.in_stock }}</p><p class="mt-1 text-xs text-[#857d6f]">ready to specify or order</p></div>
          <div class="py-3 sm:pl-6"><p class="text-xs font-medium uppercase tracking-[0.08em] text-[#958b78]">Needs attention</p><p class="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#a8493a]">{{ summary.out_of_stock }}</p><p class="mt-1 text-xs text-[#857d6f]">currently unavailable</p></div>
          <div v-if="isGroupAdmin || isSuperAdmin" class="py-3 sm:px-6"><p class="text-xs font-medium uppercase tracking-[0.08em] text-[#958b78]">Users</p><p class="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#24221d]">{{ summary.users }}</p><p class="mt-1 text-xs text-[#857d6f]">{{ isSuperAdmin ? 'users across all accounts' : 'users in your organization' }}</p></div>
          <div v-if="isSuperAdmin" class="py-3 sm:pl-6"><p class="text-xs font-medium uppercase tracking-[0.08em] text-[#958b78]">Organizations</p><p class="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#24221d]">{{ summary.organizations }}</p><p class="mt-1 text-xs text-[#857d6f]">organizations on the platform</p></div>
        </div>
      </div>
    </section>

    <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(290px,0.8fr)]">
      <section class="rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-7">
        <div class="flex items-start justify-between gap-4"><div><p class="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#a17647]">Recent activity</p><h2 class="mt-1 text-lg font-semibold text-[#24221d]">Latest additions</h2></div><NuxtLink to="/client/product" class="text-sm font-medium text-[#8a6238] hover:text-[#6f4c29]">View all</NuxtLink></div>
        <div v-if="pending" class="mt-5 space-y-3"><div v-for="index in 4" :key="index" class="h-14 animate-pulse rounded-lg bg-[#f1eee7]" /></div>
        <div v-else-if="recentProducts.length" class="mt-5 overflow-x-auto rounded-xl border border-[#e2ddd0]"><table class="w-full min-w-[510px] text-sm"><thead class="bg-[#f1eee7]/60 text-left text-xs text-[#857d6f]"><tr><th class="px-4 py-3 font-medium">Product</th><th class="px-4 py-3 font-medium">Classification</th><th class="px-4 py-3 font-medium">Added</th><th class="px-4 py-3 font-medium text-right">Status</th></tr></thead><tbody><tr v-for="product in recentProducts" :key="product.id" class="border-t border-[#ece7da] text-[#4d493e]"><td class="px-4 py-3"><p class="font-medium text-[#24221d]">{{ product.name }}</p><p class="mt-0.5 text-xs text-[#a49c88]">{{ product.sku }}</p></td><td class="px-4 py-3 text-[#766f61]">{{ product.category?.name ?? product.brand?.name ?? 'Unclassified' }}</td><td class="px-4 py-3 text-[#766f61]">{{ formatDate(product.created_at) }}</td><td class="px-4 py-3 text-right"><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="product.in_stock ? 'bg-[#e7efe8] text-[#4a6b52]' : 'bg-[#f7e6e3] text-[#a8493a]'">{{ product.in_stock ? 'In stock' : 'Out of stock' }}</span></td></tr></tbody></table></div>
        <div v-else class="mt-5 rounded-xl border border-dashed border-[#dcd4c6] px-5 py-10 text-center"><p class="text-sm font-medium text-[#4d493e]">Your catalogue is waiting for its first product.</p><NuxtLink to="/client/product" class="mt-2 inline-block text-sm font-medium text-[#8a6238] hover:underline">Add a product</NuxtLink></div>
      </section>

      <aside class="rounded-2xl border border-[#e2ddd0] bg-[#fbfaf6] p-6 shadow-[0_1px_2px_rgba(36,34,29,0.04)] sm:p-7"><p class="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#a17647]">Collection balance</p><h2 class="mt-1 text-lg font-semibold text-[#24221d]">Category mix</h2><p class="mt-1 text-sm text-[#857d6f]">Where the catalogue is most concentrated.</p><div v-if="pending" class="mt-7 space-y-5"><div v-for="index in 4" :key="index" class="h-8 animate-pulse rounded bg-[#f1eee7]" /></div><div v-else-if="categoryMix.length" class="mt-7 space-y-5"><div v-for="category in categoryMix" :key="category.name"><div class="mb-2 flex items-center justify-between gap-3 text-sm"><span class="truncate font-medium text-[#4d493e]">{{ category.name }}</span><span class="font-mono text-xs text-[#857d6f]">{{ category.count }}</span></div><div class="h-1.5 overflow-hidden rounded-full bg-[#eee9de]"><div class="h-full rounded-full bg-[#b8834a]" :style="{ width: `${(category.count / largestCategory) * 100}%` }" /></div></div></div><div v-else class="mt-7 rounded-xl bg-[#f1eee7]/60 px-4 py-5 text-sm text-[#857d6f]">Add products with classifications to see your category mix.</div><div class="mt-8 border-t border-[#e2ddd0] pt-5"><p class="text-sm text-[#766f61]"><span class="font-semibold text-[#24221d]">{{ summary.brands }}</span> brands represented in your library</p></div></aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'client', title: 'Dashboard' })

type DashboardProduct = { id: number; name: string; sku: string; in_stock: boolean; created_at: string; category?: { name: string } | null; brand?: { name: string } | null }
type CategoryMix = { name: string; count: number }
const api = useApi()
const { user } = useAuth()
const { data, pending } = await useAsyncData('dashboard', () => api('/dashboard'))
const summary = computed(() => data.value?.data?.summary ?? { total_products: 0, in_stock: 0, out_of_stock: 0, categories: 0, brands: 0, users: 0, organizations: 0 })
const isSuperAdmin = computed(() => user.value?.role === 'super-admin')
const isGroupAdmin = computed(() => user.value?.role === 'group-admin')
const recentProducts = computed<DashboardProduct[]>(() => data.value?.data?.recent_products ?? [])
const categoryMix = computed<CategoryMix[]>(() => data.value?.data?.category_mix ?? [])
const largestCategory = computed(() => Math.max(...categoryMix.value.map((category) => category.count), 1))
function formatDate(date: string) { return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date)) }
</script>
