<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Reservation } from '@/types/dashboard'
import StatusPill from './StatusPill.vue'
import { money } from '@/utils/format'
import { dateShort } from '@/utils/format'

defineProps<{ reservation: Reservation; role: 'guest' | 'host' }>()
</script>

<template>
  <RouterLink
    :to="role === 'guest' ? `/dashboard/trips/${reservation.code}` : `/dashboard/host/reservations/${reservation.code}`"
    class="flex items-center gap-4 rounded-2xl border border-line bg-white p-3 transition hover:border-ink/20 hover:shadow-soft"
  >
    <img :src="reservation.propertyPhoto" :alt="reservation.propertyTitle" class="h-16 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="truncate text-sm font-semibold text-ink">{{ reservation.propertyTitle }}</p>
        <StatusPill :status="reservation.status" />
      </div>
      <p class="mt-0.5 truncate text-xs text-muted">
        {{ dateShort(reservation.checkIn) }} – {{ dateShort(reservation.checkOut) }} · {{ reservation.guests }} guests ·
        {{ role === 'guest' ? reservation.hostName : reservation.guestName }}
      </p>
      <p class="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted">{{ reservation.reference }}</p>
    </div>
    <div class="hidden shrink-0 text-right sm:block">
      <p class="text-sm font-semibold text-ink">{{ money(role === 'guest' ? reservation.breakdown.total : reservation.payout.net) }}</p>
      <p class="text-[11px] text-muted">{{ role === 'guest' ? 'Total' : 'Net' }}</p>
    </div>
  </RouterLink>
</template>
