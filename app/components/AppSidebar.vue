<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 flex min-h-screen flex-col overflow-y-auto border-r border-rule bg-paper transition-[width,padding] duration-200 ease-in-out"
    :class="collapsed ? 'w-[72px] px-3 py-7' : 'w-60 px-5 py-7'"
  >
    <nav class="flex flex-1 flex-col gap-1">
      <button
        type="button"
        class="mb-2 flex min-h-10 w-full items-center justify-center rounded-lg border-0 bg-transparent px-[0.7rem] py-[0.55rem] text-[#6b6156] transition-[background,color,padding] duration-150 hover:bg-[#f4f1ea] hover:text-[#33302b] cursor-pointer"
        :class="{ 'p-[0.6rem]': collapsed }"
        :aria-expanded="!collapsed"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleCollapsed"
      >
        <svg
          class="size-4 fill-none stroke-current stroke-[1.75] transition-transform duration-200 [stroke-linecap:round] [stroke-linejoin:round]"
          :class="{ 'rotate-180': collapsed }"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="M9 4.5v15M13 9l-3 3 3 3" />
        </svg>
      </button>

      <NuxtLink
        v-for="item in visibleNavItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center overflow-hidden rounded-lg px-[0.7rem] py-[0.55rem] text-[0.9rem] font-medium whitespace-nowrap text-[#6b6156] transition-[background,color,padding,justify-content] duration-200 hover:bg-[#f4f1ea] hover:text-[#33302b]"
        :class="collapsed
          ? 'justify-center gap-0 p-[0.6rem]'
          : item.parent === 'products'
            ? 'gap-[0.65rem] pl-9'
            : 'gap-[0.65rem]'"
        active-class="bg-[#f4f1ea] text-[#33302b]"
        :title="collapsed ? item.label : undefined"
      >
        <svg
          class="size-4 shrink-0 fill-none stroke-current stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path v-for="path in navIconPaths[item.icon]" :key="path" :d="path" />
        </svg>
        <span v-if="!collapsed" class="overflow-hidden text-ellipsis">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mt-6 border-t border-rule pt-5">
      <button
        type="button"
        class="flex w-full items-center rounded-lg px-[0.7rem] py-[0.55rem] text-[0.9rem] font-medium text-[#6b6156] transition-[background,color,padding,justify-content] duration-200 hover:bg-[#f4f1ea] hover:text-[#33302b] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        :class="collapsed ? 'justify-center gap-0 p-[0.6rem]' : 'gap-[0.65rem]'"
        :title="collapsed ? 'Log out' : undefined"
        :disabled="loggingOut"
        @click="handleLogout"
      >
        <svg class="size-4 shrink-0 fill-none stroke-current stroke-[1.75]" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10M14 8l4 4-4 4M18 12H9" />
        </svg>
        <span v-if="!collapsed">{{ loggingOut ? 'Signing out…' : 'Log out' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const router = useRouter()
const loggingOut = ref(false)

// Shared across components (e.g. a layout that needs to shift main content)
// and persisted across visits via cookie.
const collapsedCookie = useCookie<boolean>('sidebar_collapsed', { default: () => true })
const collapsed = useState('sidebarCollapsed', () => collapsedCookie.value)

watch(collapsed, (value) => {
  collapsedCookie.value = value
})

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

async function handleLogout() {
  loggingOut.value = true

  try {
    await logout()
    await router.push('/auth/login')
  } finally {
    loggingOut.value = false
  }
}

const navItems = [
  { label: 'Dashboard', to: '/client/dashboard', icon: 'dashboard', parent: null, roles: null },
  { label: 'Products', to: '/client/product', icon: 'package', parent: null, roles: null },
  { label: 'Classifications', to: '/client/classifications', icon: 'tags', parent: 'products', roles: null },
  // { label: 'Subcategories', to: '/client/subcategories', icon: 'folder-tree', parent: 'products', roles: null },
  { label: 'Group Admins', to: '/client/group-admins', icon: 'shield', parent: null, roles: ['super-admin'] },
  { label: 'Group Members', to: '/client/group-members', icon: 'users', parent: null, roles: ['group-admin'] },
  { label: 'Organizations', to: '/client/organizations', icon: 'building', parent: null, roles: ['super-admin'] },
  { label: 'Users', to: '/client/users', icon: 'user-round', parent: null, roles: ['super-admin'] } 
]

const navIconPaths: Record<string, string[]> = {
  dashboard: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
  package: ['m7.5 4.27 9 5.15', 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'M3.3 7 12 12l8.7-5', 'M12 22V12'],
  tags: ['M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2 2 0 0 0 2.82 0l7.18-7.18a2 2 0 0 0 0-2.82Z', 'M7 7h.01'],
  'folder-tree': ['M3 3h6l2 3h10v15H3z', 'M8 12h8', 'M12 12v5', 'M9 17h6'],
  shield: ['M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z', 'm9 12 2 2 4-4'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  building: ['M3 21h18', 'M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16', 'M10 7h4', 'M10 11h4', 'M10 15h4'],
  'user-round': ['M18 21a6 6 0 0 0-12 0', 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8']
}

const visibleNavItems = computed(() =>
  navItems.filter((item) => !item.roles || item.roles.includes(user.value?.role))
)
</script>
