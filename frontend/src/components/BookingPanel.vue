<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Property } from '@/types'
import { money } from '@/utils/format'
import { nightsBetween } from '@/utils/dates'
import { priceBreakdown } from '@/services/api'
import AppIcon from './AppIcon.vue'
import GuestsStepper from './GuestsStepper.vue'

const props = defineProps<{ property: Property; checkIn: string; checkOut: string; guests: number; mobile?: boolean }>()
const emit = defineEmits<{ 'update:checkIn': [v: string]; 'update:checkOut': [v: string]; 'update:guests': [v: number]; openCalendar: [] }>()
const router = useRouter()
const guestsOpen = ref(false)

const nights = computed(() => nightsBetween(props.checkIn, props.checkOut))
const breakdown = computed(() => (nights.value ? priceBreakdown(props.property, props.checkIn, props.checkOut) : null))
const canReserve = computed(() => nights.value > 0)

function reserve(): void {
  if (!canReserve.value) { emit('openCalendar'); return }
  router.push({
    path: `/checkout/${props.property.slug}`,
    query: { checkIn: props.checkIn, checkOut: props.checkOut, guests: String(props.guests) },
  })
}
</script>

<template>
  <div :class="mobile ? '' : 'rounded-card border border-line bg-white p-6 shadow-lift'">
    <div v-if="!mobile" class="flex items-baseline justify-between">
      <p class="text-xl">
        <span class="font-display text-2xl font-semibold">{{ money(property.pricePerNight) }}</span>
        <span class="text-sm text-muted"> / night</span>
      </p>
      <p class="text-xs text-muted">★ {{ property.rating }} · {{ property.reviewCount }} reviews</p>
    </div>

    <div class="mt-4 overflow-hidden rounded-2xl border border-line">
      <div class="grid grid-cols-2 divide-x divide-line">
        <button type="button" class="px-4 py-3 text-left transition hover:bg-sand/50" @click="emit('openCalendar')">
          <span class="label">Check-in</span>
          <span class="mt-0.5 block text-sm font-medium">{{ checkIn || 'Add date' }}</span>
        </button>
        <button type="button" class="px-4 py-3 text-left transition hover:bg-sand/50" @click="emit('openCalendar')">
          <span class="label">Check-out</span>
          <span class="mt-0.5 block text-sm font-medium">{{ checkOut || 'Add date' }}</span>
        </button>
      </div>
      <div class="relative border-t border-line">
        <button type="button" class="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-sand/50"
                :aria-expanded="guestsOpen" @click="guestsOpen = !guestsOpen">
          <span>
            <span class="label">Guests</span>
            <span class="mt-0.5 block text-sm font-medium">{{ guests }} guest{{ guests > 1 ? 's' : '' }}</span>
          </span>
          <AppIcon name="chevron-down" :size="16" class="text-muted" :class="guestsOpen ? 'rotate-180' : ''" />
        </button>
        <div v-if="guestsOpen" class="border-t border-line bg-paper/60 px-4 py-2">
          <GuestsStepper :model-value="guests" :max="property.guests" sublabel="This stay has a strict guest limit" @update:model-value="emit('update:guests', $event)" />
        </div>
      </div>
    </div>

    <button class="mt-4 w-full btn-primary" :disabled="!canReserve && false" @click="reserve">
      {{ canReserve ? 'Reserve' : 'Check availability' }}
    </button>
    <p class="mt-2 text-center text-xs text-muted">{{ canReserve ? 'You will not be charged yet · demo checkout' : 'Pick dates to see the total' }}</p>

    <div v-if="breakdown" class="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
      <div class="flex justify-between">
        <span class="text-muted">{{ money(property.pricePerNight) }} × {{ breakdown.nights }} night{{ breakdown.nights > 1 ? 's' : '' }}</span>
        <span>{{ money(breakdown.nightly) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Cleaning fee</span>
        <span>{{ money(breakdown.cleaning) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">StayNest service fee</span>
        <span>{{ money(breakdown.platform) }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Estimated taxes</span>
        <span>{{ money(breakdown.tax) }}</span>
      </div>
      <div class="mt-3 flex justify-between border-t border-line pt-3 text-base font-semibold">
        <span>Total</span>
        <span>{{ money(breakdown.total) }}</span>
      </div>
    </div>

    <div v-else class="mt-5 rounded-2xl bg-sand/60 p-4 text-xs leading-relaxed text-muted">
      Add your dates to see the nightly subtotal, cleaning fee, service fee, taxes and final total before you commit.
    </div>

    <p v-if="!mobile" class="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
      <AppIcon name="shield" :size="13" /> Exact address released after booking
    </p>
  </div>
</template>
