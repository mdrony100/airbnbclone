<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import StatusPill from '@/components/dash/StatusPill.vue'
import EmptyState from '@/components/dash/EmptyState.vue'
import { money } from '@/utils/format'

const dash = useDashboardStore()
const status = ref('all')
const listingId = ref('all')
const from = ref('')
const query = ref('')

const rows = computed(() => dash.hostReservations.filter((r) => {
  if (status.value !== 'all' && r.status !== status.value) return false
  if (listingId.value !== 'all' && r.listingId !== listingId.value) return false
  if (from.value && r.checkOut < from.value) return false
  if (query.value.trim()) {
    const q = query.value.trim().toLowerCase()
    const hay = `${r.guestName} ${r.code} ${r.propertyTitle}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}))

const tabs = ['all', 'upcoming', 'completed', 'canceled']
const clear = (): void => { status.value = 'all'; listingId.value = 'all'; from.value = ''; query.value = '' }
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="label">Bookings</p>
      <h1 class="mt-1 font-display text-3xl">Reservations</h1>
      <p class="mt-1 text-sm text-muted">{{ dash.hostReservations.length }} stays across your listings, including past and cancelled ones.</p>
    </header>

    <section class="card p-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex flex-wrap gap-1.5">
          <button v-for="t in tabs" :key="t"
                  class="rounded-pill px-3 py-1.5 text-xs font-semibold capitalize transition"
                  :class="status === t ? 'bg-ink text-white' : 'border border-line text-muted hover:text-ink'"
                  @click="status = t">{{ t }}</button>
        </div>
        <div class="ml-auto flex flex-wrap items-center gap-2">
          <input v-model="query" class="field !w-52 !py-2 text-sm" placeholder="Guest or reference" aria-label="Search reservations" />
          <select v-model="listingId" class="field !w-48 !py-2 text-sm" aria-label="Filter by listing">
            <option value="all">All properties</option>
            <option v-for="l in dash.myListings" :key="l.id" :value="l.id">{{ l.title }}</option>
          </select>
          <input v-model="from" type="date" class="field !w-40 !py-2 text-sm" aria-label="Check-out on or after" />
          <button class="text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline" @click="clear">Reset</button>
        </div>
      </div>
    </section>

    <EmptyState v-if="!rows.length" icon="calendar" title="No reservations match" body="Try a different status, property or date." />

    <div v-else class="card overflow-hidden">
      <div class="hidden grid-cols-[1.6fr_1fr_1fr_.9fr_.8fr_.5fr] gap-4 border-b border-line/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted md:grid">
        <span>Guest and stay</span><span>Dates</span><span>Property</span><span>Total</span><span>Status</span><span />
      </div>
      <div v-for="r in rows" :key="r.code" class="grid gap-3 border-b border-line/60 px-5 py-4 text-sm last:border-0 md:grid-cols-[1.6fr_1fr_1fr_.9fr_.8fr_.5fr] md:items-center">
        <div>
          <p class="font-medium">{{ r.guestName }}</p>
          <p class="text-xs text-muted">{{ r.guests }} guests · {{ r.code }}</p>
        </div>
        <p class="text-xs text-muted">{{ r.checkIn }} → {{ r.checkOut }}</p>
        <p class="text-xs">{{ r.propertyTitle }}</p>
        <p class="font-medium">{{ money(r.breakdown.total) }}</p>
        <StatusPill :status="r.status" />
        <RouterLink :to="`/dashboard/host/reservations/${r.code}`" class="text-xs font-semibold text-coral hover:underline">Open</RouterLink>
      </div>
    </div>
  </div>
</template>
