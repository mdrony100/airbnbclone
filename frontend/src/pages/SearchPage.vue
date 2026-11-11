<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Property, SearchQuery } from '@/types'
import { api, type SearchResult } from '@/services/api'
import { useSearchStore } from '@/stores/search'
import { dateLabel } from '@/utils/format'
import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import PropertyCard from '@/components/PropertyCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import Pagination from '@/components/Pagination.vue'
import MapPanel from '@/components/MapPanel.vue'
import AppIcon from '@/components/AppIcon.vue'
import { updateMeta } from '@/utils/seo'
import { destinations } from '@/data/destinations'

const store = useSearchStore()
const route = useRoute()
const router = useRouter()

const result = ref<SearchResult>({ data: [], meta: { page: 1, perPage: 9, total: 0, totalPages: 1 } })
const loading = ref(true)
const drawer = ref(false)
const activePin = ref('')
const criteriaOpen = ref(false)

const q = computed<SearchQuery>(() => store.query)
const dateSummary = computed(() => {
  if (!q.value.checkIn || !q.value.checkOut) return 'Any dates'
  return `${dateLabel(q.value.checkIn)} – ${dateLabel(q.value.checkOut)}`
})
const guestSummary = computed(() => (q.value.guests > 1 ? `${q.value.guests} guests` : '1 guest'))

async function load(): Promise<void> {
  loading.value = true
  result.value = await api.searchProperties(q.value)
  loading.value = false
  const found = destinations.find((d) => d.slug === q.value.destination)
  const where = found ? `in ${found.name}, ${found.state}` : 'across the United States'
  const total = result.value.meta.total
  updateMeta(
    `Vacation rentals ${where} — StayNest`,
    `${total} handpicked ${total === 1 ? 'stay' : 'stays'} ${where}. Compare nightly rates, capacity and availability.`,
  )
}

function syncUrl(): void {
  router.replace({ path: '/search', query: store.asRouteQuery() })
}

function apply(patch: Partial<SearchQuery>): void {
  store.patch(patch)
}

function clearAll(): void {
  store.reset()
  syncUrl()
  load()
}

function goPage(page: number): void {
  apply({ page })
  window.scrollTo({ top: 120, behavior: 'smooth' })
}

onMounted(load)

watch(
  () => JSON.stringify({ ...q.value }),
  () => { syncUrl(); load() },
)
watch(() => route.query, (next) => { store.hydrate(next as Record<string, unknown>) })
watch(() => q.value.view, (v) => { if (v === 'map') criteriaOpen.value = false })
</script>

<template>
  <div class="shell py-6 sm:py-10">
    <!-- editable criteria -->
    <div class="rounded-[24px] border border-line bg-white p-3 shadow-soft">
      <button class="flex w-full flex-wrap items-center gap-x-5 gap-y-1 px-2 py-1.5 text-left text-sm sm:hidden"
              :aria-expanded="criteriaOpen" @click="criteriaOpen = !criteriaOpen">
        <span class="font-semibold">{{ q.destination || 'Anywhere in the US' }}</span>
        <span class="text-muted">{{ dateSummary }}</span>
        <span class="text-muted">{{ guestSummary }}</span>
        <AppIcon name="chevron-down" :size="15" class="ml-auto" :class="criteriaOpen ? 'rotate-180' : ''" />
      </button>
      <div class="hidden sm:block">
        <SearchBar :destination="q.destination" :check-in="q.checkIn" :check-out="q.checkOut" :guests="q.guests" variant="inline" />
      </div>
      <div v-if="criteriaOpen" class="mt-3 sm:hidden">
        <SearchBar :destination="q.destination" :check-in="q.checkIn" :check-out="q.checkOut" :guests="q.guests" variant="inline" />
      </div>
    </div>

    <div class="mt-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-3xl leading-tight sm:text-4xl">
          {{ q.destination ? `Stays in ${q.destination}` : 'Every stay on StayNest' }}
        </h1>
        <p class="mt-1.5 text-sm text-muted">
          {{ loading ? 'Finding stays…' : `${result.meta.total} stay${result.meta.total === 1 ? '' : 's'}` }}
          · {{ dateSummary }} · {{ guestSummary }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="btn-ghost !py-2.5 text-sm lg:hidden" @click="drawer = true">
          <AppIcon name="filter" :size="15" /> Filters
          <span v-if="store.filters" class="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">{{ store.filters }}</span>
        </button>

        <label class="relative">
          <span class="sr-only">Sort results</span>
          <select :value="q.sort" class="field !w-auto !rounded-pill !py-2.5 pr-9 text-sm font-medium"
                  @change="apply({ sort: ($event.target as HTMLSelectElement).value as SearchQuery['sort'] })">
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>

        <div class="flex rounded-pill border border-line bg-white p-1">
          <button class="flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold transition"
                  :class="q.view === 'list' ? 'bg-ink text-white' : 'text-muted hover:text-ink'" @click="apply({ view: 'list' })">
            <AppIcon name="list" :size="14" /> List
          </button>
          <button class="flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold transition"
                  :class="q.view === 'map' ? 'bg-ink text-white' : 'text-muted hover:text-ink'" @click="apply({ view: 'map' })">
            <AppIcon name="map" :size="14" /> Map
          </button>
        </div>
      </div>
    </div>

    <div class="mt-8 grid gap-10" :class="q.view === 'list' ? 'lg:grid-cols-[16rem_1fr]' : ''">
      <aside v-if="q.view === 'list'" class="hidden lg:block">
        <div class="sticky top-24 rounded-card border border-line bg-white p-6">
          <FilterPanel :query="q" @patch="apply" @clear="clearAll" />
        </div>
      </aside>

      <div>
        <div v-if="q.view === 'map'" class="sticky top-20">
          <MapPanel :properties="result.data" :active-slug="activePin" @select="activePin = $event" />
          <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RouterLink v-for="p in result.data.slice(0, 3)" :key="p.slug" :to="`/stays/${p.slug}`"
                        class="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition hover:shadow-soft"
                        @mouseenter="activePin = p.slug">
              <img :src="p.photos[0]" :alt="p.title" class="h-16 w-20 rounded-xl object-cover" loading="lazy" />
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ p.title }}</p>
                <p class="truncate text-xs text-muted">{{ p.city }}, {{ p.stateCode }}</p>
                <p class="mt-0.5 text-xs font-medium">${{ p.pricePerNight }} / night</p>
              </div>
            </RouterLink>
          </div>
        </div>

        <template v-else>
          <div v-if="loading" class="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            <SkeletonCard v-for="n in 6" :key="n" />
          </div>

          <div v-else-if="result.data.length" class="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            <PropertyCard v-for="p in result.data" :key="p.slug" :property="p" :check-in="q.checkIn" :check-out="q.checkOut" />
          </div>

          <div v-else class="rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
            <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand text-ink"><AppIcon name="search" :size="22" /></span>
            <h2 class="mt-5 font-display text-2xl">Nothing matches those filters yet</h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              Try widening the price range, removing a requirement, or choosing different dates. Every filter is reversible.
            </p>
            <div class="mt-6 flex flex-wrap justify-center gap-3">
              <button class="btn-primary" @click="clearAll">Clear all filters</button>
              <RouterLink to="/#how-it-works" class="btn-ghost">How booking works</RouterLink>
            </div>
          </div>

          <Pagination :page="result.meta.page" :total-pages="result.meta.totalPages" @change="goPage" />
        </template>
      </div>
    </div>

    <!-- mobile filter drawer -->
    <Transition name="drawer">
      <div v-if="drawer" class="fixed inset-0 z-[60] lg:hidden">
        <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="drawer = false" />
        <div class="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[28px] bg-paper p-6 shadow-lift">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-display text-xl">Filters</h2>
            <button class="grid h-9 w-9 place-items-center rounded-full bg-sand" aria-label="Close filters" @click="drawer = false">
              <AppIcon name="close" :size="16" />
            </button>
          </div>
          <FilterPanel :query="q" @patch="apply" @clear="clearAll" />
          <div class="sticky bottom-0 mt-6 flex gap-3 bg-paper pt-3">
            <button class="btn-ghost flex-1" @click="clearAll">Clear all</button>
            <button class="btn-primary flex-1" @click="drawer = false">Show {{ result.meta.total }} stays</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: opacity .25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
</style>
