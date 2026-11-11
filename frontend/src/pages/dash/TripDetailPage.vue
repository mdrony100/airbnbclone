<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { dateLong, money, moneyExact } from '@/utils/format'
import { downloadReceipt } from '@/utils/receipt'

const dash = useDashboardStore()
const route = useRoute()
const router = useRouter()

const code = computed(() => String(route.params.code))
const trip = computed(() => dash.reservation(code.value))
const conversation = computed(() => (trip.value ? dash.conversationForReservation(trip.value.code) : null))
const estimate = computed(() => (trip.value && trip.value.status === 'upcoming' ? dash.refundEstimate(trip.value.code) : null))
const cancelling = ref(false)
const confirming = ref(false)
const error = ref('')

const addressVisible = computed(() => trip.value && trip.value.status !== 'canceled')
const canReview = computed(() => trip.value?.status === 'completed' && !trip.value.reviewId)
const review = computed(() => dash.myReviews.find((r) => r.reservationCode === code.value) ?? null)

async function cancel(): Promise<void> {
  if (!trip.value) return
  error.value = ''
  try {
    await dash.cancelReservation(trip.value.code)
    cancelling.value = false
    confirming.value = true
  } catch {
    error.value = 'We could not cancel this reservation. Try again.'
  }
}
</script>

<template>
  <div v-if="trip" class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <RouterLink to="/dashboard/trips" class="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <AppIcon name="chevron-left" :size="14" /> All trips
      </RouterLink>
      <StatusPill :status="trip.status" />
    </div>

    <div class="card overflow-hidden">
      <div class="grid md:grid-cols-[1.05fr_1fr]">
        <img :src="trip.propertyPhoto" :alt="trip.propertyTitle" class="h-56 w-full object-cover md:h-full" />
        <div class="p-5">
          <h1 class="font-display text-2xl text-ink">{{ trip.propertyTitle }}</h1>
          <p class="mt-1 text-sm text-muted">{{ trip.city }}, {{ trip.state }} · hosted by {{ trip.hostName }}</p>
          <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt class="label">Check-in</dt><dd class="mt-0.5 text-ink">{{ dateLong(trip.checkIn) }}</dd></div>
            <div><dt class="label">Check-out</dt><dd class="mt-0.5 text-ink">{{ dateLong(trip.checkOut) }}</dd></div>
            <div><dt class="label">Guests</dt><dd class="mt-0.5 text-ink">{{ trip.guests }}</dd></div>
            <div><dt class="label">Nights</dt><dd class="mt-0.5 text-ink">{{ trip.breakdown.nights }}</dd></div>
          </dl>
          <p class="mt-4 inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink/70">
            <AppIcon name="tag" :size="13" /> {{ trip.reference }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <RouterLink v-if="conversation" :to="`/dashboard/messages/${conversation.id}`" class="btn-ghost"><AppIcon name="chat" :size="15" /> Message host</RouterLink>
            <RouterLink to="/stays/cypress-point-cabin" class="btn-ghost" @click.prevent="router.push(`/stays/${trip.propertySlug}`)">View listing</RouterLink>
            <button class="btn-ghost" @click="downloadReceipt(trip)"><AppIcon name="download" :size="15" /> Receipt</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div class="space-y-6">
        <section class="card p-5">
          <h2 class="font-display text-lg text-ink">Where you are staying</h2>
          <p v-if="addressVisible" class="mt-2 text-sm text-ink">{{ trip.addressLine }}, {{ trip.city }}, {{ trip.state }}</p>
          <p v-else class="mt-2 text-sm text-muted">The exact address is only shown for confirmed reservations. This stay was cancelled.</p>
          <div class="mt-3 flex items-center gap-2 rounded-xl bg-sand/70 px-3 py-2 text-xs text-ink/70">
            <AppIcon name="info" :size="14" /> Approximate location shown on the public listing until booking is confirmed.
          </div>
        </section>

        <section class="card p-5">
          <h2 class="font-display text-lg text-ink">Payment summary</h2>
          <p class="text-xs text-muted">Simulated payment. No card was charged.</p>
          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-muted">{{ trip.breakdown.nights }} nights × {{ money(0) || '' }}</dt><dd class="text-ink">{{ money(trip.breakdown.nightly) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Cleaning fee</dt><dd class="text-ink">{{ money(trip.breakdown.cleaning) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Service fee</dt><dd class="text-ink">{{ money(trip.breakdown.platform) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Taxes</dt><dd class="text-ink">{{ money(trip.breakdown.tax) }}</dd></div>
            <div class="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total</dt><dd>{{ money(trip.breakdown.total) }}</dd></div>
            <div v-if="trip.refundAmount !== undefined" class="flex justify-between text-emerald-700"><dt>Refunded</dt><dd>−{{ money(trip.refundAmount) }}</dd></div>
          </dl>
          <button class="btn-ghost mt-4 w-full sm:w-auto" @click="downloadReceipt(trip)">
            <AppIcon name="download" :size="15" /> Download demo receipt (.txt)
          </button>
        </section>
      </div>

      <div class="space-y-6">
        <section class="card p-5">
          <h2 class="font-display text-lg text-ink">Your host</h2>
          <div class="mt-3 flex items-center gap-3">
            <span class="grid h-11 w-11 place-items-center rounded-full bg-sage/25 text-sm font-bold text-ink/70">{{ trip.hostName.split(' ').map((w) => w[0]).join('') }}</span>
            <div>
              <p class="text-sm font-semibold text-ink">{{ trip.hostName }}</p>
              <p class="text-xs text-muted">Demo host profile · no verification badge in this prototype</p>
            </div>
          </div>
          <RouterLink v-if="conversation" :to="`/dashboard/messages/${conversation.id}`" class="btn-ghost mt-3 w-full">Contact host</RouterLink>
        </section>

        <section class="card p-5">
          <h2 class="font-display text-lg text-ink">Cancellation</h2>
          <p class="mt-1 text-sm text-muted">
            Policy: <span class="font-semibold text-ink">{{ trip.policy }}</span>
            <template v-if="estimate"> · {{ estimate.explanation }}</template>
          </p>
          <template v-if="trip.status === 'upcoming'">
            <div v-if="estimate" class="mt-3 rounded-xl bg-sand/70 p-3 text-sm">
              <p class="flex justify-between"><span class="text-muted">Refund estimate</span><span class="font-semibold text-ink">{{ money(estimate.refund) }}</span></p>
              <p class="mt-1 flex justify-between"><span class="text-muted">Non-refundable</span><span class="text-ink">{{ money(estimate.kept) }}</span></p>
            </div>
            <button class="btn-ghost mt-3 w-full text-coral" @click="cancelling = true">Cancel reservation</button>
          </template>
          <p v-else-if="trip.status === 'canceled'" class="mt-2 text-sm text-muted">Cancelled {{ trip.canceledAt ? dateLong(trip.canceledAt.slice(0, 10)) : '' }} · refund issued to the demo payment method.</p>
          <p v-else class="mt-2 text-sm text-muted">Completed stays cannot be cancelled.</p>
        </section>

        <section v-if="canReview" class="card p-5">
          <h2 class="font-display text-lg text-ink">How was the stay?</h2>
          <p class="mt-1 text-sm text-muted">Reviews open once a stay is completed, and only once per booking.</p>
          <RouterLink to="/dashboard/reviews" class="btn-primary mt-3 w-full">Write a review</RouterLink>
        </section>
        <section v-else-if="review" class="card p-5">
          <h2 class="font-display text-lg text-ink">Your review</h2>
          <p class="mt-1 text-sm text-ink">“{{ review.text }}”</p>
          <p class="mt-2 text-xs text-muted">{{ review.rating }} / 5 · {{ dateLong(review.at.slice(0, 10)) }}</p>
          <p v-if="review.hostReply" class="mt-3 rounded-xl bg-sand/70 p-3 text-sm"><span class="font-semibold">Host reply:</span> {{ review.hostReply }}</p>
        </section>
      </div>
    </div>

    <!-- cancel dialog -->
    <div v-if="cancelling" class="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-lift">
        <h2 class="font-display text-xl text-ink">Cancel this reservation?</h2>
        <p class="mt-1 text-sm text-muted">This is a demo cancellation. The refund is calculated from the policy saved with the booking.</p>
        <div v-if="estimate" class="mt-3 rounded-xl bg-sand/70 p-3 text-sm">
          <p class="flex justify-between"><span>Refund</span><span class="font-semibold">{{ money(estimate.refund) }}</span></p>
          <p class="mt-1 flex justify-between"><span>Kept</span><span>{{ money(estimate.kept) }}</span></p>
          <p class="mt-2 text-xs text-muted">{{ estimate.explanation }}</p>
        </div>
        <p v-if="error" class="mt-2 text-sm text-coral">{{ error }}</p>
        <div class="mt-4 flex gap-2">
          <button class="btn-ghost flex-1" @click="cancelling = false">Keep reservation</button>
          <button class="btn-primary flex-1 !bg-ink" @click="cancel">Cancel and refund</button>
        </div>
      </div>
    </div>

    <div v-if="confirming" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lift">
        <span class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600"><AppIcon name="check" :size="22" /></span>
        <h2 class="mt-3 font-display text-xl text-ink">Reservation cancelled</h2>
        <p class="mt-1 text-sm text-muted">A refund of {{ money(trip.refundAmount ?? 0) }} was issued in this demo.</p>
        <button class="btn-primary mt-4 w-full" @click="confirming = false">Done</button>
      </div>
    </div>
  </div>

  <div v-else class="card p-8 text-center">
    <p class="font-display text-xl text-ink">Reservation not found</p>
    <p class="mt-1 text-sm text-muted">It may have been cancelled or removed from the demo data.</p>
    <RouterLink to="/dashboard/trips" class="btn-primary mt-4">Back to trips</RouterLink>
  </div>
</template>
