<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Booking } from '@/types'
import { api } from '@/services/api'
import { dateLong, money } from '@/utils/format'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const booking = ref<Booking | null>(null)
const loading = ref(true)

onMounted(async () => {
  booking.value = await api.booking(String(route.params.code))
  loading.value = false
})
</script>

<template>
  <div class="shell py-12 sm:py-16">
    <div v-if="loading" class="skeleton mx-auto h-64 max-w-2xl" />
    <div v-else-if="!booking" class="py-20 text-center">
      <h1 class="font-display text-3xl">We could not find that booking</h1>
      <RouterLink to="/search" class="btn-primary mt-6 inline-flex">Back to search</RouterLink>
    </div>

    <div v-else class="mx-auto max-w-2xl">
      <div class="text-center">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-moss/10 text-moss">
          <AppIcon name="check" :size="30" />
        </span>
        <h1 class="mt-6 font-display text-3xl sm:text-4xl">You're booked in</h1>
        <p class="mt-2 text-sm text-muted">
          Confirmation <span class="font-mono font-semibold text-ink">{{ booking.code }}</span> · demo reservation, nothing was charged.
        </p>
      </div>

      <div class="mt-8 overflow-hidden rounded-card border border-line bg-white shadow-soft">
        <img :src="booking.propertyPhoto" :alt="booking.propertyTitle" class="h-44 w-full object-cover" />
        <div class="p-6">
          <h2 class="font-display text-xl">{{ booking.propertyTitle }}</h2>
          <p class="text-sm text-muted">{{ booking.city }}, {{ booking.state }}</p>

          <dl class="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
            <div><dt class="label">Check-in</dt><dd class="mt-1 font-medium">{{ dateLong(booking.checkIn) }} · after 4:00 PM</dd></div>
            <div><dt class="label">Check-out</dt><dd class="mt-1 font-medium">{{ dateLong(booking.checkOut) }} · by 11:00 AM</dd></div>
            <div><dt class="label">Guests</dt><dd class="mt-1 font-medium">{{ booking.guests }} guest{{ booking.guests > 1 ? 's' : '' }}</dd></div>
            <div><dt class="label">Total paid (demo)</dt><dd class="mt-1 font-medium">{{ money(booking.breakdown.total) }}</dd></div>
          </dl>

          <div class="mt-5 rounded-2xl bg-sand/60 p-4 text-sm leading-relaxed text-muted">
            <p class="font-semibold text-ink">Address and check-in details</p>
            <p class="mt-1">The host shares the exact address and arrival instructions once the booking is confirmed. In this demo build, that step is simulated and no message is sent.</p>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink to="/" class="btn-primary">Back to StayNest</RouterLink>
            <RouterLink :to="`/stays/${booking.propertySlug}`" class="btn-ghost">View the stay</RouterLink>
          </div>
        </div>
      </div>

      <p class="mt-6 text-center text-xs text-muted">
        Demo booking reference stored locally in your browser. Guest email: {{ booking.guest.email }}
      </p>
    </div>
  </div>
</template>
