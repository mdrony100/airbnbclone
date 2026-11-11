<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReservationRow from '@/components/dash/ReservationRow.vue'
import EmptyState from '@/components/dash/EmptyState.vue'
import { useDashboardStore } from '@/stores/dashboard'

const dash = useDashboardStore()
const route = useRoute()
const router = useRouter()

type Tab = 'upcoming' | 'completed' | 'canceled'
const tab = ref<Tab>((route.query.tab as Tab) ?? 'upcoming')

const tabs = computed(() => ([
  { key: 'upcoming' as Tab, label: 'Upcoming', count: dash.upcomingTrips.length },
  { key: 'completed' as Tab, label: 'Completed', count: dash.completedTrips.length },
  { key: 'canceled' as Tab, label: 'Canceled', count: dash.canceledTrips.length },
]))

const list = computed(() => {
  if (tab.value === 'completed') return dash.completedTrips
  if (tab.value === 'canceled') return dash.canceledTrips
  return dash.upcomingTrips
})

function select(next: Tab): void {
  tab.value = next
  router.replace({ query: { ...route.query, tab: next } })
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="label">Guest</p>
      <h1 class="mt-1 font-display text-3xl text-ink">My trips</h1>
      <p class="mt-1 text-sm text-muted">Reservations are simulated, including payments and receipts.</p>
    </header>

    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Trip status">
      <button
        v-for="t in tabs"
        :key="t.key"
        role="tab"
        :aria-selected="tab === t.key"
        class="rounded-full border px-4 py-2 text-sm font-semibold transition"
        :class="tab === t.key ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink/70 hover:border-ink/25'"
        @click="select(t.key)"
      >
        {{ t.label }} <span class="ml-1 opacity-70">{{ t.count }}</span>
      </button>
    </div>

    <div v-if="list.length" class="space-y-3">
      <ReservationRow v-for="r in list" :key="r.code" :reservation="r" role="guest" />
    </div>
    <EmptyState
      v-else
      :title="tab === 'upcoming' ? 'No upcoming trips' : tab === 'completed' ? 'No completed stays yet' : 'Nothing cancelled'"
      body="Search the catalogue and book a demo stay to see it appear here."
      icon="ticket"
      action="Find a stay"
      @action="router.push('/search')"
    />
  </div>
</template>
