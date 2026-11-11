<script setup lang="ts">
import { FAQS } from '@/data/content'
import PageHeader from '@/components/PageHeader.vue'
import FaqAccordion from '@/components/FaqAccordion.vue'
import AppIcon from '@/components/AppIcon.vue'

const topics = [
  { icon: 'search', title: 'Finding a stay', body: 'Filters, dates, and how availability works.' },
  { icon: 'card', title: 'Pricing and fees', body: 'What makes up the total and when you pay.' },
  { icon: 'key', title: 'Check-in', body: 'When the address is shared and what to expect.' },
  { icon: 'alert', title: 'Problems on a trip', body: 'What to do if something is not as described.' },
]
</script>

<template>
  <div>
    <PageHeader eyebrow="Help centre" title="How can we help?" lead="Answers to the questions guests ask most, plus the policies behind them." />
    <div class="shell grid gap-6 pb-6 sm:grid-cols-2 lg:grid-cols-4">
      <article v-for="t in topics" :key="t.title" class="rounded-card border border-line bg-white p-5">
        <span class="grid h-9 w-9 place-items-center rounded-full bg-sand"><AppIcon :name="t.icon" :size="16" /></span>
        <h2 class="mt-3 font-display text-base font-semibold">{{ t.title }}</h2>
        <p class="mt-1.5 text-xs leading-relaxed text-muted">{{ t.body }}</p>
      </article>
    </div>
    <div class="shell grid gap-10 pb-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
      <aside class="rounded-card border border-line bg-sand/50 p-6 text-sm">
        <h2 class="font-display text-lg">Still stuck?</h2>
        <p class="mt-2 text-muted">Send us the details and we will come back to you within a business day.</p>
        <RouterLink to="/contact" class="btn-primary mt-4 w-full">Contact support</RouterLink>
      </aside>
      <FaqAccordion :items="FAQS" />
    </div>
  </div>
</template>
