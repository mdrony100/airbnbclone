<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import StatCard from '@/components/dash/StatCard.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import ReservationRow from '@/components/dash/ReservationRow.vue'
import PropertyCard from '@/components/PropertyCard.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useWishlistStore } from '@/stores/wishlist'
import { properties } from '@/data/properties'
import { dateLong, money } from '@/utils/format'
import { daysBetween } from '@/utils/dates'
import { todayISO } from '@/utils/dates'

const dash = useDashboardStore()
const wishes = useWishlistStore()

const next = computed(() => dash.nextTrip)
const daysAway = computed(() => (next.value ? daysBetween(todayISO(), next.value.checkIn) : 0))
const recent = computed(() => dash.myGuestReservations.slice().reverse().slice(0, 3))
const saved = computed(() => wishes.slugs.map((s) => properties.find((p) => p.slug === s)).filter(Boolean).slice(0, 3))
</script>

<template>
  <div class="space-y-8">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="label">Travelling dashboard</p>
        <h1 class="mt-1 font-display text-3xl text-ink">Hello, {{ dash.me?.name.split(' ')[0] }}</h1>
        <p class="mt-1 text-sm text-muted">Everything here is simulated demo data for milestone 2.</p>
      </div>
      <RouterLink to="/search" class="btn-ghost"><AppIcon name="search" :size="15" /> Find a stay</RouterLink>
    </header>

    <section v-if="next" class="card overflow-hidden">
      <div class="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <img :src="next.propertyPhoto" :alt="next.propertyTitle" class="h-48 w-full object-cover md:h-full" />
        <div class="flex flex-col justify-between gap-4 p-5">
          <div>
            <div class="flex items-center gap-2">
              <p class="label">Next trip</p>
              <StatusPill :status="next.status" />
            </div>
            <h2 class="mt-1 font-display text-2xl text-ink">{{ next.propertyTitle }}</h2>
            <p class="mt-1 text-sm text-muted">{{ next.city }}, {{ next.state }} · hosted by {{ next.hostName }}</p>
            <p class="mt-3 text-sm text-ink">
              {{ dateLong(next.checkIn) }} → {{ dateLong(next.checkOut) }}
              <span class="text-muted">· {{ next.breakdown.nights }} nights · {{ next.guests }} guests</span>
            </p>
            <p class="mt-1 inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink/70">
              <AppIcon name="clock" :size="13" /> {{ daysAway }} days to go
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <RouterLink :to="`/dashboard/trips/${next.code}`" class="btn-primary">Trip details</RouterLink>
            <RouterLink :to="`/dashboard/messages`" class="btn-ghost"><AppIcon name="chat" :size="15" /> Message host</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Upcoming trips" :value="String(dash.upcomingTrips.length)" hint="Confirmed stays ahead" icon="ticket" tone="coral" />
      <StatCard label="Saved stays" :value="String(wishes.count)" hint="From your public wishlist" icon="heart" />
      <StatCard label="Unread messages" :value="String(dash.unreadForGuest)" hint="Across your bookings" icon="chat" />
      <StatCard label="Notifications" :value="String(dash.unreadNotifications)" hint="Unread in this mode" icon="bell" />
    </section>

    <section class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-ink">Recent reservations</h2>
          <RouterLink to="/dashboard/trips" class="text-sm font-semibold text-coral hover:underline">All trips</RouterLink>
        </div>
        <ReservationRow v-for="r in recent" :key="r.code" :reservation="r" role="guest" />
        <p v-if="!recent.length" class="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          No reservations yet. Your first trip will appear here.
        </p>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-xl text-ink">Saved stays</h2>
          <RouterLink to="/dashboard/wishlists" class="text-sm font-semibold text-coral hover:underline">Manage</RouterLink>
        </div>
        <div v-if="saved.length" class="space-y-3">
          <RouterLink
            v-for="p in saved"
            :key="p!.slug"
            :to="`/stays/${p!.slug}`"
            class="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition hover:border-ink/20"
          >
            <img :src="p!.photos[0]" :alt="p!.title" class="h-14 w-16 rounded-xl object-cover" loading="lazy" />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">{{ p!.title }}</p>
              <p class="text-xs text-muted">{{ p!.city }}, {{ p!.state }} · {{ money(p!.pricePerNight) }} / night</p>
            </div>
          </RouterLink>
        </div>
        <p v-else class="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Tap the heart on any stay to save it here.
        </p>
      </div>
    </section>

    <section v-if="dash.hostStatus !== 'approved'" class="card flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p class="label">Hosting</p>
        <p class="mt-1 font-display text-lg text-ink">
          {{ dash.hostStatus === 'pending' ? 'Your host application is in review' : dash.hostStatus === 'rejected' ? 'Your application needs another look' : 'Turn your place into a stay' }}
        </p>
        <p class="mt-1 max-w-xl text-sm text-muted">
          {{ dash.hostStatus === 'pending'
            ? 'Demo reviewers usually respond within a day. You can keep travelling while you wait.'
            : dash.hostStatus === 'rejected'
              ? dash.me?.host.rejectionReason
              : 'One account books stays and hosts them. Apply once, then switch between the two modes.' }}
        </p>
      </div>
      <RouterLink to="/dashboard/host/apply" class="btn-primary">{{ dash.hostStatus === 'none' ? 'Start application' : 'View application' }}</RouterLink>
    </section>
  </div>
</template>
