<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import StatCard from '@/components/dash/StatCard.vue'
import StatusPill from '@/components/dash/StatusPill.vue'
import { useToast } from '@/composables/useToast'
import { money } from '@/utils/format'

const dash = useDashboardStore()
const toast = useToast()
const connecting = ref(false)

const e = computed(() => dash.earnings)
const payoutStatus = computed(() => dash.me?.hostProfile?.payout?.status ?? 'not_started')

async function connect(): Promise<void> {
  connecting.value = true
  await new Promise((r) => setTimeout(r, 900))
  await dash.setPayoutStatus('pending')
  connecting.value = false
  toast.push('Payout account submitted for verification (demo).', 'success')
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="label">Money</p>
      <h1 class="mt-1 font-display text-3xl">Earnings and payouts</h1>
      <p class="mt-1 text-sm text-muted">All figures are simulated demo data. No real money moves in this prototype.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Gross bookings" :value="money(e.gross)" hint="Confirmed and completed stays" />
      <StatCard label="Platform fees" :value="money(e.fees)" hint="Deducted from your payouts" />
      <StatCard label="Refunds issued" :value="money(e.refunds)" hint="Cancelled reservations" />
      <StatCard label="Net earnings" :value="money(e.net)" hint="Estimated, before taxes" emphasis />
    </div>

    <div class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-line/70 px-5 py-4">
          <p class="font-display text-lg">Payout history</p>
          <span class="text-xs text-muted">{{ dash.myPayouts.length }} entries</span>
        </div>
        <div class="hidden grid-cols-[1fr_1fr_.8fr] gap-4 border-b border-line/70 px-5 py-2.5 text-[11px] font-semibold uppercase text-muted sm:grid">
          <span>Date</span><span>Reservation</span><span class="text-right">Net</span>
        </div>
        <div v-for="p in dash.myPayouts" :key="p.id" class="grid gap-2 border-b border-line/60 px-5 py-3.5 text-sm last:border-0 sm:grid-cols-[1fr_1fr_.8fr] sm:items-center">
          <p class="text-muted">{{ p.date }}</p>
          <div>
            <p class="font-medium">{{ p.reservationCode }}</p>
            <p class="text-xs text-muted">{{ p.method }}</p>
          </div>
          <div class="sm:text-right">
            <p class="font-semibold">{{ money(p.net) }}</p>
            <StatusPill :status="p.status" class="mt-1" />
          </div>
        </div>
        <p v-if="!dash.myPayouts.length" class="px-5 py-10 text-center text-sm text-muted">No payouts yet.</p>
      </section>

      <aside class="space-y-4">
        <div class="card p-5">
          <p class="label">Payout account</p>
          <p class="mt-2 text-sm">
            Status:
            <span class="font-semibold">{{ payoutStatus === 'not_started' ? 'Not set up' : payoutStatus === 'pending' ? 'Verification pending' : 'Connected' }}</span>
          </p>
          <p class="mt-2 text-xs text-muted">Stripe Connect or a bank transfer account will be linked in milestone 3. This screen simulates that handoff.</p>
          <button v-if="payoutStatus === 'not_started'" class="btn-primary mt-4 w-full justify-center" :disabled="connecting" @click="connect">
            {{ connecting ? 'Opening…' : 'Set up payouts' }}
          </button>
          <p v-else class="mt-4 rounded-chip bg-sand px-3 py-2 text-xs text-ink">Verification is simulated. No bank details are collected.</p>
        </div>
        <div class="card p-5">
          <p class="label">Breakdown</p>
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-muted">Collected</dt><dd>{{ money(e.collected) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Scheduled</dt><dd>{{ money(e.scheduled) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted">Paid out</dt><dd>{{ money(e.paidOut) }}</dd></div>
          </dl>
        </div>
      </aside>
    </div>
  </div>
</template>
