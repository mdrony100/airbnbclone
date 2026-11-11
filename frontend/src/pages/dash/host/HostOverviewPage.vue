<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import StatCard from '@/components/dash/StatCard.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import ReservationRow from '@/components/dash/ReservationRow.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { dateLong, money } from '@/utils/format'

const dash = useDashboardStore()

const arrivals = computed(() => dash.upcomingArrivals.slice(0, 4))
const pendingListings = computed(() => dash.myListings.filter((l) => l.status === 'pending' || l.status === 'rejected'))
const unread = computed(() => dash.unreadForHost)
const payoutSetup = computed(() => dash.me?.hostProfile?.payout.status ?? 'not_started')
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="label">Hosting dashboard</p>
        <h1 class="mt-1 font-display text-3xl text-ink">{{ dash.me?.hostProfile?.displayName || dash.me?.name.split(' ')[0] }}’s listings</h1>
        <p class="mt-1 text-sm text-muted">Earnings, reservations and payouts are simulated for this milestone.</p>
      </div>
      <RouterLink to="/dashboard/host/listings/new" class="btn-primary"><AppIcon name="plus" :size="15" /> New listing</RouterLink>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Active listings" :value="String(dash.publishedListings.length)" :hint="`${dash.myListings.length} total, ${pendingListings.length} need attention`" icon="home" tone="coral" />
      <StatCard label="Upcoming arrivals" :value="String(dash.upcomingArrivals.length)" hint="Confirmed and ahead" icon="ticket" />
      <StatCard label="Reservations" :value="String(dash.hostReservations.length)" hint="All time in this demo" icon="calendar" />
      <StatCard label="Estimated earnings" :value="money(dash.earnings.net)" hint="Net of fees and refunds" icon="wallet" />
    </section>

    <section class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-ink">Upcoming arrivals</h2>
          <RouterLink to="/dashboard/host/reservations" class="text-sm font-semibold text-coral hover:underline">All reservations</RouterLink>
        </div>
        <ReservationRow v-for="r in arrivals" :key="r.code" :reservation="r" role="host" />
        <p v-if="!arrivals.length" class="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">No upcoming arrivals.</p>
      </div>

      <div class="space-y-3">
        <h2 class="font-display text-xl text-ink">Pending actions</h2>
        <div class="space-y-2">
          <RouterLink to="/dashboard/messages" class="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:border-ink/20">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-coral/10 text-coral"><AppIcon name="chat" :size="15" /></span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-ink">Unread guest messages</p>
              <p class="text-xs text-muted">{{ unread }} waiting for a reply</p>
            </div>
            <AppIcon name="chevron-right" :size="15" class="text-muted" />
          </RouterLink>

          <RouterLink v-if="pendingListings.length" to="/dashboard/host/listings" class="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:border-ink/20">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-amber-50 text-amber-600"><AppIcon name="alert" :size="15" /></span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-ink">{{ pendingListings.length }} listing{{ pendingListings.length > 1 ? 's' : '' }} need attention</p>
              <p class="truncate text-xs text-muted">{{ pendingListings.map((l) => l.title).join(', ') }}</p>
            </div>
            <AppIcon name="chevron-right" :size="15" class="text-muted" />
          </RouterLink>

          <RouterLink v-if="payoutSetup !== 'connected'" to="/dashboard/host/earnings" class="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:border-ink/20">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-amber-50 text-amber-600"><AppIcon name="wallet" :size="15" /></span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-ink">Finish payout setup</p>
              <p class="text-xs text-muted">Payouts are paused until a method is added</p>
            </div>
            <AppIcon name="chevron-right" :size="15" class="text-muted" />
          </RouterLink>
        </div>

        <div class="card p-4">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-ink">Next payout</p>
            <StatusPill status="scheduled" />
          </div>
          <p class="mt-1 text-xs text-muted">{{ dash.me?.hostProfile?.payout.schedule ?? 'Weekly, Fridays' }}</p>
          <p class="mt-2 font-display text-xl text-ink">{{ money(dash.earnings.scheduled) }}</p>
          <RouterLink to="/dashboard/host/earnings" class="mt-2 inline-block text-xs font-semibold text-coral hover:underline">View payout history</RouterLink>
        </div>
      </div>
    </section>

    <section>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-display text-xl text-ink">Your properties</h2>
        <RouterLink to="/dashboard/host/listings" class="text-sm font-semibold text-coral hover:underline">Manage all</RouterLink>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="l in dash.myListings.slice(0, 3)"
          :key="l.id"
          :to="`/dashboard/host/listings/${l.id}/edit`"
          class="card overflow-hidden transition hover:shadow-lift"
        >
          <img :src="l.photos[0]" :alt="l.title" class="h-32 w-full object-cover" loading="lazy" />
          <div class="p-3">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm font-semibold text-ink">{{ l.title }}</p>
              <StatusPill :status="l.status" />
            </div>
            <p class="mt-1 text-xs text-muted">{{ l.city }}, {{ l.state }} · {{ money(l.pricePerNight) }} / night</p>
            <p v-if="l.status === 'pending'" class="mt-1 text-[11px] text-amber-700">In review since {{ l.submittedAt ? dateLong(l.submittedAt.slice(0, 10)) : 'today' }}</p>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
