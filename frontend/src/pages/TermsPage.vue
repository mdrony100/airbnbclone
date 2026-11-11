<script setup lang="ts">
import LegalDoc from '@/components/LegalDoc.vue'

const sections = [
  { h: 'About these terms', p: ['These terms govern your use of StayNest, a vacation rental marketplace for properties in the United States. By using the site you agree to them.', 'This build is a demonstration. Listings, prices, availability and reviews are fictional demo content, and checkout is simulated. No money changes hands.'] },
  { h: 'Bookings and confirmation', p: ['A booking is created when you complete checkout and the demo payment succeeds. In the live product, a confirmed booking creates a contract between you and the host for the dates shown.', 'The exact address and check-in instructions are released after confirmation. Until then, all locations shown are approximate.'] },
  { h: 'Prices and fees', p: ['The total shown at checkout includes the nightly rate, the host cleaning fee, the StayNest service fee and estimated taxes. Nothing is added after you confirm.', 'Nightly rates are set by hosts and can change until a booking is confirmed.'] },
  { h: 'Guest responsibilities', p: ['You agree to provide accurate guest details, to respect the house rules and guest limits, and to leave the property in the condition you found it.', 'You must be legally able to enter into this contract and at least 18 years old.'] },
  { h: 'Host responsibilities', p: ['Hosts agree to describe their property accurately, keep the calendar current and honour confirmed bookings.', 'Hosts must hold the legal right to let the property and comply with local tax and short-term rental rules.'] },
  { h: 'Cancellations and refunds', p: ['Cancellation terms are set per stay and shown before booking. The standard policy is free cancellation up to seven days before check-in.', 'Refund timing depends on your payment provider. The full policy is on the cancellation policy page.'] },
  { h: 'Limitation of liability', p: ['StayNest is a marketplace, not the owner or operator of any property. To the extent permitted by law, we are not liable for the condition of a property or for a host or guest failing to meet their obligations.', 'Nothing in these terms limits liability that cannot be limited by law.'] },
  { h: 'Changes to these terms', p: ['We may update these terms. Material changes will be announced on the site before they take effect, and the date at the top of this page will change.'] },
]
</script>

<template>
  <LegalDoc eyebrow="Legal" title="Terms of service" updated="November 2026" :sections="sections" />
</template>
