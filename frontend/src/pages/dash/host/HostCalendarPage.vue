<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { addDays, monthMatrix, todayISO } from '@/utils/dates'
import { useDashboardStore } from '@/stores/dashboard'
import { useToast } from '@/composables/useToast'
import StatusPill from '@/components/dash/StatusPill.vue'
import AppIcon from '@/components/AppIcon.vue'

const dash = useDashboardStore()
const route = useRoute()
const toast = useToast()

const listingId = ref<string>(String(route.query.listing ?? dash.publishedListings[0]?.id ?? dash.myListings[0]?.id ?? ''))
const listing = computed(() => dash.listing(listingId.value))
const cursor = computed(() => {
  const d = new Date()
  return { y: d.getFullYear(), m: d.getMonth() }
})
const offset = ref(0)
const view = computed(() => {
  const d = new Date(cursor.value.y, cursor.value.m + offset.value, 1)
  return { y: d.getFullYear(), m: d.getMonth() }
})
const label = computed(() => new Date(view.value.y, view.value.m, 1)
  .toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
const cells = computed(() => monthMatrix(view.value.y, view.value.m).flat())

/** Nights already sold: check-in counts, check-out does not, so the next guest can arrive that day. */
const bookedNights = computed(() => {
  const map = new Map<string, { code: string; guest: string }>()
  if (!listing.value) return map
  for (const r of dash.hostReservations) {
    if (r.listingId !== listing.value.id || r.status === 'canceled') continue
    let day = r.checkIn
    while (day < r.checkOut) {
      map.set(day, { code: r.code, guest: r.guestName })
      day = addDays(day, 1)
    }
  }
  return map
})

function stateOf(iso: string): 'past' | 'booked' | 'blocked' | 'free' {
  if (iso < todayISO()) return 'past'
  if (bookedNights.value.has(iso)) return 'booked'
  return listing.value?.blocked.includes(iso) ? 'blocked' : 'free'
}

async function toggle(iso: string): Promise<void> {
  if (!listing.value) return
  const s = stateOf(iso)
  if (s === 'past') return toast.push('Past dates cannot be changed.', 'error')
  if (s === 'booked') return toast.push('That night belongs to a confirmed reservation.', 'error')
  const next = s === 'blocked'
    ? listing.value.blocked.filter((d) => d !== iso)
    : [...listing.value.blocked, iso].sort()
  await dash.setBlockedDates(listing.value.id, next)
  toast.push(s === 'blocked' ? 'Night reopened for bookings.' : 'Night blocked.', 'success')
}

const blockedCount = computed(() => listing.value?.blocked.length ?? 0)
const soldCount = computed(() => bookedNights.value.size)
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="label">Availability</p>
        <h1 class="mt-1 font-display text-3xl">Calendar</h1>
        <p class="mt-1 text-sm text-muted">Block nights you don't want to rent. Check-out days stay open, so the next guest can arrive.</p>
      </div>
      <select v-model="listingId" class="field max-w-xs" aria-label="Choose a listing">
        <option v-for="l in dash.myListings" :key="l.id" :value="l.id">{{ l.title }}</option>
      </select>
    </header>

    <div v-if="!dash.myListings.length" class="card p-8 text-center text-sm text-muted">
      Add a property first, then manage its calendar here.
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section class="card p-5">
        <div class="flex items-center justify-between">
          <button class="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink/30" aria-label="Previous month" @click="offset--">
            <AppIcon name="chevron-left" :size="16" />
          </button>
          <p class="font-display text-lg">{{ label }}</p>
          <button class="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink/30" aria-label="Next month" @click="offset++">
            <AppIcon name="chevron-right" :size="16" />
          </button>
        </div>

        <div class="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-muted">
          <span v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</span>
        </div>
        <div class="mt-1 grid grid-cols-7 gap-1">
          <template v-for="(iso, i) in cells" :key="i">
            <span v-if="!iso" />
            <button v-else type="button"
                    class="relative grid aspect-square place-items-center rounded-xl text-xs font-medium transition"
                    :class="[
                      stateOf(iso) === 'free' ? 'bg-sand/60 text-ink hover:bg-sand' : '',
                      stateOf(iso) === 'booked' ? 'bg-ink text-white' : '',
                      stateOf(iso) === 'blocked' ? 'bg-coral/15 text-coral-dark line-through' : '',
                      stateOf(iso) === 'past' ? 'text-muted/40' : '',
                    ]"
                    :data-day="iso"
                    :aria-label="`${iso} ${stateOf(iso)}`"
                    @click="toggle(iso)">
              {{ Number(iso.slice(8, 10)) }}
            </button>
          </template>
        </div>

        <div class="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-ink" /> Reserved · {{ soldCount }} nights</span>
          <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-coral/60" /> Blocked · {{ blockedCount }}</span>
          <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-sand" /> Open</span>
        </div>
      </section>

      <aside class="space-y-4">
        <div class="card p-5">
          <p class="label">This listing</p>
          <p class="mt-1 font-display text-lg leading-snug">{{ listing?.title }}</p>
          <p class="mt-1 text-sm text-muted">{{ listing?.city }}, {{ listing?.state }}</p>
          <div class="mt-3"><StatusPill :status="listing?.status ?? 'draft'" /></div>
          <p class="mt-3 text-xs text-muted">Changes save as you click and appear instantly on the public listing calendar.</p>
        </div>
        <div class="card p-5">
          <p class="label">Upcoming here</p>
          <ul class="mt-2 space-y-3 text-sm">
            <li v-for="r in dash.hostReservations.filter((x) => x.listingId === listingId && x.status === 'upcoming').slice(0, 4)" :key="r.code">
              <p class="font-medium">{{ r.guestName }}</p>
              <p class="text-xs text-muted">{{ r.checkIn }} → {{ r.checkOut }} · {{ r.code }}</p>
            </li>
            <li v-if="!dash.hostReservations.some((x) => x.listingId === listingId && x.status === 'upcoming')" class="text-sm text-muted">
              No upcoming stays yet.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
