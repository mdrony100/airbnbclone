<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Booking } from '@/types'
import { api } from '@/services/api'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const booking = ref<Booking | null>(null)
onMounted(async () => { booking.value = await api.booking(String(route.params.code)) })
</script>

<template>
  <div class="shell py-16">
    <div class="mx-auto max-w-xl text-center">
      <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-coral-soft text-coral-dark">
        <AppIcon name="alert" :size="28" />
      </span>
      <h1 class="mt-6 font-display text-3xl sm:text-4xl">That payment did not go through</h1>
      <p class="mt-3 text-sm leading-relaxed text-muted">
        {{ booking?.failureReason ?? 'The payment provider declined the card.' }}
        Nothing was charged and no booking was created.
      </p>

      <div class="mt-8 rounded-card border border-line bg-white p-6 text-left shadow-soft">
        <p class="label">What to try next</p>
        <ul class="mt-3 space-y-2.5 text-sm text-muted">
          <li class="flex gap-2"><AppIcon name="check" :size="15" class="mt-0.5 shrink-0 text-moss" /> Check the card details and try again</li>
          <li class="flex gap-2"><AppIcon name="check" :size="15" class="mt-0.5 shrink-0 text-moss" /> Use a different card, or ask your bank about the decline</li>
          <li class="flex gap-2"><AppIcon name="check" :size="15" class="mt-0.5 shrink-0 text-moss" /> In this demo, any card number <em>not</em> ending in 0002 will succeed</li>
        </ul>
      </div>

      <div class="mt-7 flex flex-wrap justify-center gap-3">
        <RouterLink v-if="booking" :to="{ path: `/checkout/${booking.propertySlug}`, query: { checkIn: booking.checkIn, checkOut: booking.checkOut, guests: String(booking.guests) } }" class="btn-primary">
          Try again
        </RouterLink>
        <RouterLink to="/search" class="btn-ghost">Back to search</RouterLink>
      </div>
    </div>
  </div>
</template>
