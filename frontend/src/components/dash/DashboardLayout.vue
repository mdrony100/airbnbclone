<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import AppLogo from '@/components/AppLogo.vue'
import ModeSwitch from './ModeSwitch.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { useWishlistStore } from '@/stores/wishlist'

const auth = useAuthStore()
const dash = useDashboardStore()
const wishes = useWishlistStore()
const route = useRoute()
const router = useRouter()

const collapsed = ref(localStorage.getItem('staynest.sidebar.collapsed') === '1')
const mobileOpen = ref(false)
const noticesOpen = ref(false)
const userOpen = ref(false)

watch(collapsed, (v) => localStorage.setItem('staynest.sidebar.collapsed', v ? '1' : '0'))
watch(() => route.fullPath, () => { mobileOpen.value = false })

onMounted(async () => {
  if (!dash.accounts.length) await dash.load(auth.accountId)
  else dash.setAccount(auth.accountId)
  if (dash.mode === 'hosting' && dash.hostStatus !== 'approved') await dash.switchMode('traveling')
})

type NavItem = { to: string; label: string; icon: string; exact?: boolean; badge?: number }

const guestNav = computed<NavItem[]>(() => [
  { to: '/dashboard', label: 'Overview', icon: 'compass', exact: true },
  { to: '/dashboard/trips', label: 'My trips', icon: 'ticket' },
  { to: '/dashboard/wishlists', label: 'Wishlists', icon: 'heart', badge: wishes.count },
  { to: '/dashboard/messages', label: 'Messages', icon: 'chat', badge: dash.unreadForGuest },
  { to: '/dashboard/reviews', label: 'Reviews', icon: 'star' },
  { to: '/dashboard/account', label: 'Account', icon: 'user' },
])

const hostNav = computed<NavItem[]>(() => [
  { to: '/dashboard/host', label: 'Overview', icon: 'compass', exact: true },
  { to: '/dashboard/host/listings', label: 'My properties', icon: 'home' },
  { to: '/dashboard/host/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/dashboard/host/reservations', label: 'Reservations', icon: 'ticket' },
  { to: '/dashboard/host/earnings', label: 'Earnings', icon: 'wallet' },
  { to: '/dashboard/host/reviews', label: 'Reviews', icon: 'star' },
  { to: '/dashboard/host/settings', label: 'Settings', icon: 'sliders' },
])

const nav = computed(() => (dash.mode === 'hosting' ? hostNav.value : guestNav.value))
const notifications = computed(() => (dash.mode === 'hosting' ? dash.hostNotifications : dash.guestNotifications))

function isActive(item: { to: string; exact?: boolean }): boolean {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

async function openNotifications(): Promise<void> {
  noticesOpen.value = !noticesOpen.value
  userOpen.value = false
  if (noticesOpen.value) {
    const unread = notifications.value.filter((n) => !n.read).map((n) => n.id)
    if (unread.length) await dash.markNotificationsRead(unread)
  }
}

function signOut(): void {
  auth.logout()
  dash.setAccount(null)
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-paper">
    <!-- mobile top bar -->
    <div class="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
      <button class="grid h-9 w-9 place-items-center rounded-full border border-line" aria-label="Open dashboard menu" @click="mobileOpen = true">
        <AppIcon name="menu" :size="16" />
      </button>
      <RouterLink to="/" class="flex items-center gap-2"><AppLogo compact /></RouterLink>
      <button class="relative grid h-9 w-9 place-items-center rounded-full border border-line" aria-label="Notifications" @click="openNotifications">
        <AppIcon name="bell" :size="16" />
        <span v-if="dash.unreadNotifications" class="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{{ dash.unreadNotifications }}</span>
      </button>
    </div>

    <div class="flex">
      <!-- sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-line bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
        :class="[mobileOpen ? 'translate-x-0' : '-translate-x-full', collapsed ? 'lg:w-[84px]' : 'lg:w-[264px]']"
      >
        <div class="flex items-center justify-between px-4 py-4">
          <RouterLink to="/" class="flex items-center gap-2 overflow-hidden">
            <AppLogo :compact="collapsed" />
          </RouterLink>
          <button class="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-sand lg:hidden" aria-label="Close menu" @click="mobileOpen = false">
            <AppIcon name="close" :size="16" />
          </button>
        </div>

        <div class="px-3 pb-3" :class="collapsed ? 'lg:hidden' : ''">
          <ModeSwitch class="w-full justify-center" />
        </div>

        <nav class="mt-1 flex-1 space-y-1 overflow-y-auto px-2 pb-4" aria-label="Dashboard">
          <RouterLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
            :class="isActive(item) ? 'bg-ink text-white' : 'text-ink/70 hover:bg-sand hover:text-ink'"
            :title="item.label"
          >
            <AppIcon :name="item.icon" :size="17" class="shrink-0" />
            <span :class="collapsed ? 'lg:hidden' : ''" class="flex-1 truncate">{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              :class="isActive(item) ? 'bg-white/20 text-white' : 'bg-coral/10 text-coral'"
            >{{ item.badge }}</span>
          </RouterLink>
        </nav>

        <div class="border-t border-line p-3" :class="collapsed ? 'lg:px-2' : ''">
          <div class="flex items-center gap-2 rounded-xl px-2 py-2" :class="collapsed ? 'lg:justify-center' : ''">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-coral/15 text-xs font-bold text-coral">{{ dash.me?.initials ?? 'SN' }}</span>
            <div v-if="!collapsed" class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-ink">{{ dash.me?.name ?? 'Demo guest' }}</p>
              <p class="truncate text-[11px] text-muted">{{ dash.mode === 'hosting' ? 'Hosting' : 'Traveling' }}</p>
            </div>
            <button v-if="!collapsed" class="text-muted hover:text-ink" aria-label="Sign out" @click="signOut">
              <AppIcon name="logout" :size="16" />
            </button>
          </div>
          <button
            class="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-muted hover:bg-sand lg:flex"
            @click="collapsed = !collapsed"
          >
            <AppIcon :name="collapsed ? 'chevron-right' : 'chevron-left'" :size="14" />
            <span v-if="!collapsed">Collapse</span>
          </button>
        </div>
      </aside>

      <div v-if="mobileOpen" class="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm lg:hidden" @click="mobileOpen = false" />

      <!-- content -->
      <div class="min-w-0 flex-1">
        <header class="sticky top-0 z-20 hidden items-center justify-between gap-4 border-b border-line bg-paper/90 px-8 py-3 backdrop-blur lg:flex">
          <div class="flex items-center gap-3">
            <p class="text-sm text-muted">{{ dash.mode === 'hosting' ? 'Host dashboard' : 'Guest dashboard' }}</p>
            <span class="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/60">Demo data</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <button class="relative grid h-9 w-9 place-items-center rounded-full border border-line bg-white" aria-label="Notifications" @click="openNotifications">
                <AppIcon name="bell" :size="16" />
                <span v-if="dash.unreadNotifications" class="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{{ dash.unreadNotifications }}</span>
              </button>
              <div v-if="noticesOpen" class="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                <p class="border-b border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">Notifications</p>
                <ul class="max-h-80 divide-y divide-line overflow-y-auto">
                  <li v-for="n in notifications" :key="n.id">
                    <RouterLink :to="n.href ?? '/dashboard'" class="block px-4 py-3 hover:bg-sand/60" @click="noticesOpen = false">
                      <p class="text-sm font-semibold text-ink">{{ n.title }}</p>
                      <p class="mt-0.5 text-xs text-muted">{{ n.body }}</p>
                    </RouterLink>
                  </li>
                  <li v-if="!notifications.length" class="px-4 py-6 text-center text-xs text-muted">Nothing new.</li>
                </ul>
              </div>
            </div>
            <div class="relative">
              <button class="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3" @click="userOpen = !userOpen; noticesOpen = false">
                <span class="grid h-7 w-7 place-items-center rounded-full bg-coral/15 text-[11px] font-bold text-coral">{{ dash.me?.initials ?? 'SN' }}</span>
                <span class="text-xs font-semibold text-ink">{{ dash.me?.name?.split(' ')[0] ?? 'Demo' }}</span>
                <AppIcon name="chevron-down" :size="13" />
              </button>
              <div v-if="userOpen" class="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                <p class="px-4 py-3 text-xs text-muted">{{ dash.me?.email }}</p>
                <RouterLink to="/dashboard/account" class="block px-4 py-2 text-sm hover:bg-sand/60" @click="userOpen = false">Account settings</RouterLink>
                <RouterLink to="/" class="block px-4 py-2 text-sm hover:bg-sand/60" @click="userOpen = false">Back to staynest.com</RouterLink>
                <button class="block w-full px-4 py-2 text-left text-sm text-coral hover:bg-sand/60" @click="signOut">Sign out</button>
              </div>
            </div>
          </div>
        </header>

        <main class="mx-auto w-full max-w-[1120px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div v-if="dash.loading" class="space-y-4">
            <div class="skeleton h-8 w-52 rounded-lg" />
            <div class="grid gap-4 sm:grid-cols-3">
              <div v-for="i in 3" :key="i" class="skeleton h-28 rounded-2xl" />
            </div>
            <div class="skeleton h-64 rounded-2xl" />
          </div>
          <RouterView v-else />
        </main>
      </div>
    </div>
  </div>
</template>
