<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useBookingStore } from '@/stores/booking'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()
const stage = ref('Contacting the payment provider…')

onMounted(async () => {
  const code = String(route.query.code ?? '')
  const card = String(route.query.card ?? '4242424242424242')
  if (!code) { router.replace('/search'); return }
  window.setTimeout(() => { stage.value = 'Confirming your reservation…' }, 700)
  window.setTimeout(() => { stage.value = 'Almost there…' }, 1200)
  try {
    const result = await api.confirmBooking(code, card)
    booking.current = result
    router.replace(result.status === 'confirmed' ? { name: 'booking-success', params: { code } } : { name: 'booking-failed', params: { code } })
  } catch {
    router.replace({ name: 'booking-failed', params: { code } })
  }
})
</script>

<template>
  <div class="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
    <div class="relative grid h-20 w-20 place-items-center">
      <span class="absolute inset-0 animate-ping rounded-full bg-coral/20" />
      <span class="relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-lift">
        <span class="h-7 w-7 animate-spin rounded-full border-[3px] border-line border-t-coral" />
      </span>
    </div>
    <h1 class="mt-8 font-display text-3xl">Processing your booking</h1>
    <p class="mt-2 text-sm text-muted">{{ stage }}</p>
    <p class="mt-8 max-w-sm text-xs leading-relaxed text-muted">
      This is the demo payment simulation. It holds for a couple of seconds so you can see the processing state, then resolves.
    </p>
  </div>
</template>
