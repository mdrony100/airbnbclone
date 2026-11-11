<script setup lang="ts">
import LegalDoc from '@/components/LegalDoc.vue'

const sections = [
  { h: 'What this demo stores', p: ['This milestone has no backend. Searches, wishlists, demo bookings and demo accounts are stored in your browser using local storage, and are not transmitted to any server.', 'Clearing your browser data removes all of it.'] },
  { h: 'Information collected in the live product', p: ['When the API is connected, creating a booking will require your name, email address, phone number and payment details. Payment details will be handled by a payment processor and never stored on our servers.', 'Hosts receive the guest name, guest count and message needed to prepare for an arrival.'] },
  { h: 'Cookies and local storage', p: ['Preferences such as saved stays and your last search are kept in local storage so the site works without an account.', 'We do not run advertising trackers in this build.'] },
  { h: 'How long data is kept', p: ['In the live product, booking records are kept for the period required by tax and accounting rules. Demo data stays in your browser until you clear it.'] },
  { h: 'Your rights', p: ['Depending on where you live, you may have the right to access, correct, export or delete your personal information. Requests can be made through the contact page.'] },
  { h: 'Contact', p: ['Questions about this policy can be sent through the contact page and will be answered by a person.'] },
]
</script>

<template>
  <LegalDoc eyebrow="Legal" title="Privacy policy" updated="November 2026" :sections="sections" />
</template>
