<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import StatusPill from '@/components/dash/StatusPill.vue'
import AppIcon from '@/components/AppIcon.vue'
import { money } from '@/utils/format'
import { nightsBetween } from '@/utils/dates'

const dash = useDashboardStore()
const route = useRoute()
const router = useRouter()
const res = computed(() => dash.reservation(String(route.params.code)))
const convo = computed(() => dash.conversationForReservation(String(route.params.code)))

function messageGuest(): void {
  if (convo.value) router.push(`/dashboard/host/messages/${convo.value.id}`)
}
</script>

<template>
  <div v-if="!res" class="card p-8 text-center">
    <p class="font-display text-xl">Reservation not found</p>
    <RouterLink to="/dashboard/host/reservations" class="mt-3 inline-block text-sm font-semibold text-coral hover:underline">Back to reservations</RouterLink>
  </div>

  <div v-else class="space-y-6">
    <RouterLink to="/dashboard/host/reservations" class="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
      <AppIcon name="chevron-left" :size="15" /> All reservations
    </RouterLink>

    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="label">Reservation {{ res.code }}</p>
        <h1 class="mt-1 font-display text-3xl">{{ res.guestName }}</h1>
        <p class="mt-1 text-sm text-muted">{{ res.propertyTitle }} · {{ res.city }}, {{ res.state }}</p>
      </div>
      <StatusPill :status="res.status" />
    </header>

    <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div class="space-y-6">
        <section class="card overflow-hidden">
          <img :src="res.propertyPhoto" :alt="res.propertyTitle" class="h-48 w-full object-cover" loading="lazy" />
          <div class="grid gap-4 p-5 sm:grid-cols-3">
            <div><p class="label">Check-in</p><p class="mt-1 text-sm font-medium">{{ res.checkIn }}</p></div>
            <div><p class="label">Check-out</p><p class="mt-1 text-sm font-medium">{{ res.checkOut }}</p></div>
            <div><p class="label">Nights</p><p class="mt-1 text-sm font-medium">{{ nightsBetween(res.checkIn, res.checkOut) }}</p></div>
            <div><p class="label">Guests</p><p class="mt-1 text-sm font-medium">{{ res.guests }}</p></div>
            <div><p class="label">Guest email</p><p class="mt-1 break-all text-sm font-medium">{{ res.guestEmail }}</p></div>
            <div><p class="label">Reference</p><p class="mt-1 font-mono text-sm font-medium">{{ res.reference }}</p></div>
          </div>
        </section>

        <section class="card p-5">
          <p class="label">Payment</p>
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-muted">{{ res.breakdown.nights }} nights</dt><dd>{{ money(res.breakdown.nightly) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Cleaning fee</dt><dd>{{ money(res.breakdown.cleaning) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Guest taxes and fees</dt><dd>{{ money(res.breakdown.platform + res.breakdown.tax) }}</dd></div>
            <div class="flex justify-between border-t border-line pt-2 font-semibold"><dt>Guest paid</dt><dd>{{ money(res.breakdown.total) }}</dd></div>
            <div class="flex justify-between text-muted"><dt>Platform fee</dt><dd>−{{ money(res.payout.platformFee) }}</dd></div>
            <div class="flex justify-between border-t border-line pt-2 font-semibold"><dt>Your payout</dt><dd>{{ money(res.payout.net) }}</dd></div>
          </dl>
          <p class="mt-3 text-xs text-muted">Payment status: {{ res.paymentStatus }}. Simulated financial data for the prototype.</p>
        </section>
      </div>

      <aside class="space-y-4">
        <div class="card p-5">
          <p class="label">Guest</p>
          <p class="mt-2 font-display text-lg">{{ res.guestName }}</p>
          <button class="btn-ghost mt-4 w-full justify-center" :disabled="!convo" @click="messageGuest">
            <AppIcon name="chat" :size="16" /> Message guest
          </button>
          <p v-if="!convo" class="mt-2 text-xs text-muted">No conversation exists for this reservation.</p>
        </div>
        <div class="card p-5">
          <p class="label">Need help?</p>
          <p class="mt-2 text-sm text-muted">Open a support ticket and our team will pick it up within one business day.</p>
          <RouterLink to="/dashboard/host/settings" class="mt-3 inline-block text-sm font-semibold text-coral hover:underline">Contact support</RouterLink>
        </div>
      </aside>
    </div>
  </div>
</template>
