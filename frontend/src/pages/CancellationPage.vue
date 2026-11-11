<script setup lang="ts">
import LegalDoc from '@/components/LegalDoc.vue'

const sections = [
  { h: 'Standard policy', p: ['Free cancellation until 7 days before check-in. You receive a full refund of the nightly rate, cleaning fee and service fee.', 'Inside 7 days, the first night is non-refundable and the remaining nights are refunded.'] },
  { h: 'Within 48 hours of check-in', p: ['Cancellations inside 48 hours of check-in, or after check-in has started, are not refundable unless the property was materially not as described.'] },
  { h: 'Host cancellations', p: ['If a host cancels, you receive a full refund and help finding a comparable stay. In the live product, a host who cancels repeatedly may be removed from the marketplace.'] },
  { h: 'Extenuating circumstances', p: ['Where a government order, a natural disaster or a serious medical emergency makes the trip impossible, contact us before check-in and we will review the case individually.'] },
  { h: 'How to cancel', p: ['Open your trip, choose cancel, and select a reason. Refunds are returned to the original payment method, typically within five to ten business days.'] },
]
</script>

<template>
  <LegalDoc eyebrow="Legal" title="Cancellation policy" updated="November 2026" :sections="sections" />
</template>
