<script setup lang="ts">
import { photo } from '@/data/photos'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'

const values = [
  { icon: 'tag', title: 'Prices that hold', body: 'The nightly rate, cleaning fee, service fee and taxes are shown together before you commit. No surprise resort fee at the last step.' },
  { icon: 'home', title: 'Listings that match', body: 'Every stay lists the real layout, the real beds and the real rules, so the place you unlock is the place you booked.' },
  { icon: 'shield', title: 'Privacy by default', body: 'Exact addresses and host contact details are released only when a booking is confirmed.' },
]
</script>

<template>
  <div>
    <PageHeader eyebrow="About" title="A smaller, more honest way to book a holiday home" lead="StayNest is a vacation rental marketplace for the United States. We list houses, apartments, cabins, villas and beach houses, and we do the boring parts well." />
    <div class="shell grid gap-10 lg:grid-cols-2 lg:items-center">
      <img :src="photo('about-team', 'hero')" alt="Team reviewing property photography" class="h-72 w-full rounded-card object-cover shadow-soft sm:h-96" />
      <div class="prose-copy max-w-xl">
        <p class="!mt-0 text-base leading-relaxed text-ink">We started from a simple observation: booking a holiday home takes longer than it should, mostly because the information you need is scattered across photos, descriptions and a price that changes at the last step.</p>
        <p>StayNest puts the layout, the house rules, the availability calendar and the full price breakdown on one page. Guests decide with better information, and hosts get bookings from people who already know what they are getting.</p>
        <p>This milestone is the public website and the booking flow. Guest accounts, host tools and the admin console follow in the next milestones.</p>
      </div>
    </div>
    <section class="shell mt-16 grid gap-5 sm:grid-cols-3">
      <article v-for="v in values" :key="v.title" class="rounded-card border border-line bg-white p-6">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-sand"><AppIcon :name="v.icon" :size="18" /></span>
        <h2 class="mt-4 font-display text-lg">{{ v.title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">{{ v.body }}</p>
      </article>
    </section>
    <section class="shell mt-16">
      <div class="grid gap-6 rounded-card border border-line bg-white p-8 sm:grid-cols-3">
        <div><p class="font-display text-3xl">20</p><p class="text-sm text-muted">Demo stays across 10 states</p></div>
        <div><p class="font-display text-3xl">4.9</p><p class="text-sm text-muted">Average demo guest rating</p></div>
        <div><p class="font-display text-3xl">2 min</p><p class="text-sm text-muted">Typical time from search to booking</p></div>
      </div>
      <p class="mt-3 text-xs text-muted">Figures describe this demonstration build, not a live business.</p>
    </section>
  </div>
</template>
