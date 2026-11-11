<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Property } from '@/types'
import { api, isRangeAvailable, priceBreakdown } from '@/services/api'
import { dateLong, money } from '@/utils/format'
import { nightsBetween } from '@/utils/dates'
import AppIcon from '@/components/AppIcon.vue'
import { useBookingStore } from '@/stores/booking'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()
const auth = useAuthStore()

const property = ref<Property | null>(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const accepted = ref(false)
const cardNumber = ref('4242 4242 4242 4242')
const expiry = ref('12 / 30')
const cvc = ref('123')
const errors = ref<Record<string, string>>({})

const checkIn = computed(() => String(route.query.checkIn ?? ''))
const checkOut = computed(() => String(route.query.checkOut ?? ''))
const guests = computed(() => Number(route.query.guests ?? 2))
const nights = computed(() => nightsBetween(checkIn.value, checkOut.value))
const totals = computed(() => (property.value && nights.value ? priceBreakdown(property.value, checkIn.value, checkOut.value) : null))

onMounted(async () => {
  property.value = await api.property(String(route.params.slug))
  loading.value = false
  if (!property.value) return
  if (!nights.value || !isRangeAvailable(property.value, checkIn.value, checkOut.value)) {
    error.value = 'Those dates are not available for this stay. Choose different dates.'
  }
  if (auth.user) {
    const [first, ...rest] = auth.user.name.split(' ')
    booking.setGuest({ firstName: first ?? '', lastName: rest.join(' '), email: auth.user.email })
  }
})

watch(() => booking.guest.firstName, (v) => { if (v) delete errors.value.firstName })

function validate(): boolean {
  const e: Record<string, string> = {}
  const g = booking.guest
  if (!g.firstName.trim()) e.firstName = 'First name is required.'
  if (!g.lastName.trim()) e.lastName = 'Last name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(g.email)) e.email = 'Enter a valid email address.'
  if (g.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a contact number for the host.'
  if (cardNumber.value.replace(/\s/g, '').length < 15) e.card = 'Enter a card number (demo).'
  if (!accepted.value) e.accepted = 'Please accept the house rules and cancellation policy.'
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit(): Promise<void> {
  if (!property.value || !totals.value) return
  if (!validate()) {
    document.querySelector<HTMLElement>('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const created = await api.createBooking({
      propertySlug: property.value.slug,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      guests: guests.value,
      guest: { ...booking.guest },
    })
    booking.current = created
    booking.setDraft({ propertySlug: property.value.slug, checkIn: checkIn.value, checkOut: checkOut.value, guests: guests.value })
    router.push({ name: 'booking-processing', query: { code: created.code, card: cardNumber.value.replace(/\s/g, '') } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong creating the booking.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="shell py-8 sm:py-12">
    <RouterLink :to="property ? `/stays/${property.slug}` : '/search'" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
      <AppIcon name="arrow-left" :size="15" /> Back to the stay
    </RouterLink>

    <div v-if="loading" class="mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div class="skeleton h-96" />
      <div class="skeleton h-72" />
    </div>

    <div v-else-if="property" class="mt-4 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <div>
        <h1 class="font-display text-3xl sm:text-4xl">Confirm and pay</h1>
        <p class="mt-2 text-sm text-muted">Demo checkout. No card is charged and no reservation is really made.</p>

        <div v-if="error" class="mt-5 flex items-start gap-2 rounded-2xl border border-coral/30 bg-coral-soft p-4 text-sm text-coral-dark">
          <AppIcon name="alert" :size="17" class="mt-0.5 shrink-0" /> {{ error }}
        </div>

        <!-- guest details -->
        <section class="mt-8">
          <h2 class="font-display text-xl">Your details</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label :data-error="!!errors.firstName">
              <span class="label mb-2 block">First name</span>
              <input :value="booking.guest.firstName" class="field" :class="errors.firstName ? '!border-coral' : ''" id="firstName" autocomplete="given-name"
                     @input="booking.setGuest({ firstName: ($event.target as HTMLInputElement).value })" />
              <span v-if="errors.firstName" class="mt-1 block text-xs text-coral">{{ errors.firstName }}</span>
            </label>
            <label :data-error="!!errors.lastName">
              <span class="label mb-2 block">Last name</span>
              <input :value="booking.guest.lastName" class="field" :class="errors.lastName ? '!border-coral' : ''" id="lastName" autocomplete="family-name"
                     @input="booking.setGuest({ lastName: ($event.target as HTMLInputElement).value })" />
              <span v-if="errors.lastName" class="mt-1 block text-xs text-coral">{{ errors.lastName }}</span>
            </label>
            <label :data-error="!!errors.email">
              <span class="label mb-2 block">Email</span>
              <input :value="booking.guest.email" type="email" class="field" :class="errors.email ? '!border-coral' : ''" id="email" autocomplete="email"
                     @input="booking.setGuest({ email: ($event.target as HTMLInputElement).value })" />
              <span v-if="errors.email" class="mt-1 block text-xs text-coral">{{ errors.email }}</span>
            </label>
            <label :data-error="!!errors.phone">
              <span class="label mb-2 block">Phone</span>
              <input :value="booking.guest.phone" type="tel" class="field" :class="errors.phone ? '!border-coral' : ''" id="phone" autocomplete="tel"
                     @input="booking.setGuest({ phone: ($event.target as HTMLInputElement).value })" />
              <span v-if="errors.phone" class="mt-1 block text-xs text-coral">{{ errors.phone }}</span>
            </label>
            <label class="sm:col-span-2">
              <span class="label mb-2 block">Message to the host (optional)</span>
              <textarea :value="booking.guest.message" rows="3" class="field resize-none" placeholder="Arrival time, questions, anything useful"
                        @input="booking.setGuest({ message: ($event.target as HTMLTextAreaElement).value })" />
            </label>
          </div>
        </section>

        <!-- demo payment -->
        <section class="mt-8">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-xl">Payment</h2>
            <span class="rounded-pill bg-coral-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-coral-dark">Simulation</span>
          </div>
          <p class="mt-1.5 text-sm text-muted">This is a demo payment step. Do not enter a real card. Use 4242 4242 4242 4242 to succeed, or a number ending 0002 to see the failure screen.</p>
          <div class="mt-4 rounded-2xl border border-line bg-white p-4" :data-error="!!errors.card">
            <label>
              <span class="label mb-2 block">Card number</span>
              <input v-model="cardNumber" inputmode="numeric" class="field font-mono tracking-wider" :class="errors.card ? '!border-coral' : ''" />
            </label>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <label>
                <span class="label mb-2 block">Expiry</span>
                <input v-model="expiry" class="field font-mono" />
              </label>
              <label>
                <span class="label mb-2 block">CVC</span>
                <input v-model="cvc" class="field font-mono" />
              </label>
            </div>
            <p v-if="errors.card" class="mt-2 text-xs text-coral">{{ errors.card }}</p>
            <p class="mt-3 flex items-center gap-1.5 text-xs text-muted"><AppIcon name="lock" :size="13" /> Demo fields only. Nothing is transmitted or stored.</p>
          </div>
        </section>

        <!-- policy -->
        <section class="mt-8" :data-error="!!errors.accepted">
          <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
            <input id="policies" v-model="accepted" type="checkbox" class="mt-0.5 h-4 w-4 accent-coral" />
            <span class="text-muted">
              I agree to the <RouterLink to="/terms" target="_blank" class="link-underline text-ink">terms</RouterLink>,
              the <RouterLink to="/cancellation-policy" target="_blank" class="link-underline text-ink">cancellation policy</RouterLink>,
              and the house rules for this stay.
            </span>
          </label>
          <p v-if="errors.accepted" class="mt-1.5 text-xs text-coral">{{ errors.accepted }}</p>
        </section>

        <button class="mt-7 w-full btn-primary sm:w-auto sm:min-w-[16rem]" :disabled="submitting || (!!error && !totals)" @click="submit">
          <span v-if="submitting" class="flex items-center gap-2"><span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Creating booking…</span>
          <span v-else>Confirm demo booking{{ totals ? ` · ${money(totals.total)}` : '' }}</span>
        </button>
      </div>

      <!-- summary -->
      <aside class="lg:sticky lg:top-24">
        <div class="rounded-card border border-line bg-white p-5 shadow-soft">
          <div class="flex gap-4">
            <img :src="property.photos[0]" :alt="property.title" class="h-20 w-24 rounded-xl object-cover" />
            <div class="min-w-0">
              <p class="truncate font-display text-base font-semibold">{{ property.title }}</p>
              <p class="text-xs text-muted">{{ property.city }}, {{ property.stateCode }}</p>
              <p class="mt-1 text-xs text-muted">★ {{ property.rating }} ({{ property.reviewCount }})</p>
            </div>
          </div>

          <div class="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div class="flex justify-between"><span class="text-muted">Dates</span><span class="text-right">{{ dateLong(checkIn) }} → {{ dateLong(checkOut) }}</span></div>
            <div class="flex justify-between"><span class="text-muted">Guests</span><span>{{ guests }} guest{{ guests > 1 ? 's' : '' }}</span></div>
            <div class="flex justify-between"><span class="text-muted">Nights</span><span>{{ nights }}</span></div>
          </div>

          <div v-if="totals" class="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
            <div class="flex justify-between"><span class="text-muted">{{ money(property.pricePerNight) }} × {{ totals.nights }}</span><span>{{ money(totals.nightly) }}</span></div>
            <div class="flex justify-between"><span class="text-muted">Cleaning fee</span><span>{{ money(totals.cleaning) }}</span></div>
            <div class="flex justify-between"><span class="text-muted">Service fee</span><span>{{ money(totals.platform) }}</span></div>
            <div class="flex justify-between"><span class="text-muted">Estimated taxes</span><span>{{ money(totals.tax) }}</span></div>
            <div class="flex justify-between border-t border-line pt-3 text-base font-semibold"><span>Total (USD)</span><span>{{ money(totals.total) }}</span></div>
          </div>

          <div class="mt-4 rounded-2xl bg-sand/60 p-3 text-xs leading-relaxed text-muted">
            <p class="font-semibold text-ink">Cancellation</p>
            <p class="mt-1">Free cancellation until 7 days before check-in. After that the first night is non-refundable.</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
