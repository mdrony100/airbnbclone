<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppLogo from './AppLogo.vue'
import AppIcon from './AppIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const wishlist = useWishlistStore()
const route = useRoute()
const router = useRouter()
const { push } = useToast()

const scrolled = ref(false)
const menuOpen = ref(false)
const accountOpen = ref(false)
const accountRef = ref<HTMLElement | null>(null)

const onScroll = (): void => { scrolled.value = window.scrollY > 12 }
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})

function onDocClick(e: MouseEvent): void {
  if (accountOpen.value && accountRef.value && !accountRef.value.contains(e.target as Node)) accountOpen.value = false
}
function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') { accountOpen.value = false; menuOpen.value = false }
}
function logout(): void {
  auth.logout()
  accountOpen.value = false
  push('Signed out')
  router.push('/')
}
function goToBookings(): void {
  accountOpen.value = false
  push('Your trips will appear here once bookings are live')
}

const initials = computed(() => auth.user?.name?.slice(0, 1).toUpperCase() ?? '')
const isActive = (path: string): boolean => route.path === path
</script>

<template>
  <header class="sticky top-0 z-50 transition-all duration-300"
          :class="scrolled ? 'border-b border-line/80 bg-paper/92 backdrop-blur-md' : 'bg-transparent'">
    <div class="shell flex h-[72px] items-center justify-between gap-4">
      <RouterLink to="/" class="shrink-0" aria-label="StayNest home"><AppLogo /></RouterLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Primary">
        <RouterLink to="/search" class="btn-quiet !px-4 !py-2 text-sm" :class="isActive('/search') ? 'bg-sand' : ''">Explore</RouterLink>
        <RouterLink to="/#how-it-works" class="btn-quiet !px-4 !py-2 text-sm">How it works</RouterLink>
        <RouterLink to="/host" class="btn-quiet !px-4 !py-2 text-sm" :class="isActive('/host') ? 'bg-sand' : ''">Become a host</RouterLink>
      </nav>

      <div class="flex items-center gap-1.5">
        <RouterLink to="/wishlist" class="relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-sand md:hidden" aria-label="Wishlist">
          <AppIcon name="heart" />
          <span v-if="wishlist.count" class="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{{ wishlist.count }}</span>
        </RouterLink>

        <div ref="accountRef" class="relative">
          <button class="flex items-center gap-2 rounded-pill border border-line bg-white py-1.5 pl-3 pr-1.5 text-sm font-medium shadow-soft transition hover:shadow-lift"
                  :aria-expanded="accountOpen" aria-haspopup="menu" @click="accountOpen = !accountOpen">
            <AppIcon name="menu" :size="17" class="hidden sm:block" />
            <span v-if="auth.user" class="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-white">{{ initials }}</span>
            <span v-else class="grid h-8 w-8 place-items-center rounded-full bg-ink text-white"><AppIcon name="users" :size="16" /></span>
          </button>

          <Transition name="menu">
            <div v-if="accountOpen" role="menu"
                 class="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-lift">
              <template v-if="auth.user">
                <div class="px-4 pb-2 pt-1">
                  <p class="text-sm font-semibold">{{ auth.user.name }}</p>
                  <p class="truncate text-xs text-muted">{{ auth.user.email }}</p>
                </div>
                <RouterLink to="/wishlist" class="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-sand" @click="accountOpen = false">
                  <AppIcon name="heart" :size="16" /> Wishlist ({{ wishlist.count }})
                </RouterLink>
                <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-sand" @click="goToBookings">
                  <AppIcon name="calendar" :size="16" /> Trips
                </button>
                <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-sand" @click="logout">
                  <AppIcon name="arrow-right" :size="16" /> Sign out
                </button>
              </template>
              <template v-else>
                <RouterLink to="/login" class="block px-4 py-2.5 text-sm font-semibold hover:bg-sand" @click="accountOpen = false">Log in</RouterLink>
                <RouterLink to="/register" class="block px-4 py-2.5 text-sm hover:bg-sand" @click="accountOpen = false">Sign up</RouterLink>
                <div class="my-2 border-t border-line" />
                <RouterLink to="/host" class="block px-4 py-2.5 text-sm hover:bg-sand" @click="accountOpen = false">Become a host</RouterLink>
                <RouterLink to="/help" class="block px-4 py-2.5 text-sm hover:bg-sand" @click="accountOpen = false">Help centre</RouterLink>
              </template>
            </div>
          </Transition>
        </div>

        <button class="grid h-10 w-10 place-items-center rounded-full transition hover:bg-sand md:hidden" aria-label="Open menu" @click="menuOpen = true">
          <AppIcon name="menu" />
        </button>
      </div>
    </div>

    <Transition name="sheet">
      <div v-if="menuOpen" class="fixed inset-0 z-[60] md:hidden">
        <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="menuOpen = false" />
        <div class="absolute inset-x-0 top-0 rounded-b-[28px] bg-paper p-6 shadow-lift">
          <div class="flex items-center justify-between">
            <AppLogo />
            <button class="grid h-10 w-10 place-items-center rounded-full bg-sand" aria-label="Close menu" @click="menuOpen = false">
              <AppIcon name="close" />
            </button>
          </div>
          <nav class="mt-6 flex flex-col gap-1" aria-label="Mobile">
            <RouterLink to="/search" class="rounded-2xl px-4 py-3 text-lg hover:bg-sand" @click="menuOpen = false">Explore stays</RouterLink>
            <RouterLink to="/#how-it-works" class="rounded-2xl px-4 py-3 text-lg hover:bg-sand" @click="menuOpen = false">How it works</RouterLink>
            <RouterLink to="/host" class="rounded-2xl px-4 py-3 text-lg hover:bg-sand" @click="menuOpen = false">Become a host</RouterLink>
            <RouterLink to="/wishlist" class="rounded-2xl px-4 py-3 text-lg hover:bg-sand" @click="menuOpen = false">Wishlist ({{ wishlist.count }})</RouterLink>
            <RouterLink to="/help" class="rounded-2xl px-4 py-3 text-lg hover:bg-sand" @click="menuOpen = false">Help</RouterLink>
            <div class="my-2 border-t border-line" />
            <RouterLink v-if="!auth.user" to="/login" class="rounded-2xl px-4 py-3 text-lg font-semibold hover:bg-sand" @click="menuOpen = false">Log in</RouterLink>
            <RouterLink v-if="!auth.user" to="/register" class="rounded-2xl px-4 py-3 text-lg hover:bg-sand" @click="menuOpen = false">Sign up</RouterLink>
            <button v-else class="rounded-2xl px-4 py-3 text-left text-lg hover:bg-sand" @click="menuOpen = false; logout()">Sign out</button>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.menu-enter-active, .menu-leave-active { transition: opacity .18s ease, transform .18s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-6px); }
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
</style>
