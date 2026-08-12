<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <nav class="sidebar__nav">
      <button
        type="button"
        class="sidebar__toggle"
        :aria-expanded="!collapsed"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleCollapsed"
      >
        <svg
          class="sidebar__toggle-icon"
          :class="{ 'sidebar__toggle-icon--flipped': collapsed }"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="M9 4.5v15M13 9l-3 3 3 3" />
        </svg>
      </button>

      <NuxtLink
        v-for="(item, i) in visibleNavItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item--active"
        :title="collapsed ? item.label : undefined"
      >
        <span
          class="nav-item__swatch"
          :style="{ background: swatches[i % swatches.length] }"
          aria-hidden="true"
        />
        <span v-if="!collapsed" class="nav-item__label">{{ item.label }}</span>
      </NuxtLink>
    </nav>
      <!-- <button
        type="button"
        class="btn btn--ghost sidebar__logout"
        :title="collapsed ? 'Log out' : undefined"
        :disabled="loggingOut"
        @click="handleLogout"
      >
        {{ collapsed ? '⏻' : (loggingOut ? 'Signing out...' : 'Log out') }}
      </button> -->
  </aside>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
// const router = useRouter()
// const loggingOut = ref(false)

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

const swatches = ['#7A5A38', '#B8834A', '#C99B52', '#5F7466']

const navItems = [
  { label: 'Dashboard', to: '/client/dashboard', roles: null },
  { label: 'Products', to: '/client/products', roles: null },
  { label: 'Categories', to: '/client/categories', roles: null },
  { label: 'Subcategories', to: '/client/subcategories', roles: null },
  { label: 'Group Admins', to: '/client/group-admins', roles: ['super-admin'] },
  { label: 'Group Members', to: '/client/group-members', roles: ['group-admin'] },
  { label: 'Organizations', to: '/client/organizations', roles: ['super-admin'] },
  { label: 'Users', to: '/client/users', roles: ['super-admin', 'group-admin'] }
]

const visibleNavItems = computed(() =>
  navItems.filter((item) => !item.roles || item.roles.includes(user.value?.role))
)
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  width: 240px;
  min-height: 100vh;
  overflow-y: auto;
  padding: 1.75rem 1.25rem;
  background: #fdfcfa;
  border-right: 1px solid #e2dcd2;
  box-sizing: border-box;
  transition: width 0.2s ease, padding 0.2s ease;
}

.sidebar--collapsed {
  width: 72px;
  padding: 1.75rem 0.75rem;
}

.sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 2.5rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 0.7rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: #6b6156;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, padding 0.2s ease;
}

.sidebar__toggle:hover {
  background: #f4f1ea;
  color: #33302b;
}

.sidebar__toggle-icon {
  width: 1rem;
  height: 1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.75;
  transition: transform 0.2s ease;
}

.sidebar__toggle-icon--flipped {
  transform: rotate(180deg);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.sidebar--collapsed .sidebar__toggle {
  padding: 0.6rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b6156;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.15s ease, color 0.15s ease, padding 0.2s ease, justify-content 0.2s ease;
}

.sidebar--collapsed .nav-item {
  justify-content: center;
  gap: 0;
  padding: 0.6rem;
}

.sidebar--collapsed .nav-item__swatch {
  width: 0.75rem;
  height: 0.75rem;
}

.nav-item:hover {
  background: #f4f1ea;
  color: #33302b;
}

.nav-item--active {
  background: #f4f1ea;
  color: #33302b;
}

.nav-item__swatch {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.nav-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__footer {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2dcd2;
}

.sidebar__user {
  margin-bottom: 0.75rem;
}

.sidebar__user-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #33302b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 0.78rem;
  color: #857a6d;
  margin: 0.1rem 0 0;
  text-transform: capitalize;
}

.sidebar__logout {
  width: 100%;
  text-align: center;
}
</style>
