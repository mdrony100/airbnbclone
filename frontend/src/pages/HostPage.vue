<script setup lang="ts">
import { ref } from 'vue'
import { HOST_BENEFITS, FAQS } from '@/data/content'
import { photo } from '@/data/photos'
import { money } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import FaqAccordion from '@/components/FaqAccordion.vue'
import { useToast } from '@/composables/useToast'

const { push } = useToast()
const email = ref('')
const city = ref('')
const sent = ref(false)

function submit(): void {
  if (!email.value.includes('@') || !city.value.trim()) { push('Add your email and city to continue'); return }
  sent.value = true
}

const example = { nightly: 280, cleaning: 140, nights: 3 }
const gross = example.nightly * example.nights + example.cleaning
const fee = Math.round(example.nightly * example.nights * 0.09)
</script>

<template>
  <div>
    <PageHeader eyebrow="Become a host" title="Host the place you would want to stay in" lead="List a house, cabin, villa or apartment. You set the price and the rules; we handle the booking, the pricing breakdown and the guest messages." />

    <div class="shell grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
      <img :src="photo('host-cta', 'hero')" alt="Host welcoming guests to a cabin" class="h-72 w-full rounded-card object-cover shadow-soft sm:h-96" />

      <div class="rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
        <h2 class="font-display text-2xl">See what you could earn</h2>
        <p class="mt-1.5 text-sm text-muted">A three-night booking at {{ money(example.nightly) }} a night with a {{ money(example.cleaning) }} cleaning fee.</p>
        <dl class="mt-5 space-y-2.5 text-sm">
          <div class="flex justify-between"><dt class="text-muted">Guest pays</dt><dd class="font-medium">{{ money(gross + fee) }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">Platform fee (9%)</dt><dd class="font-medium">− {{ money(fee) }}</dd></div>
          <div class="flex justify-between border-t border-line pt-2.5 text-base"><dt class="font-semibold">You earn</dt><dd class="font-semibold">{{ money(gross) }}</dd></div>
        </dl>

        <form v-if="!sent" class="mt-6 space-y-3" @submit.prevent="submit">
          <label class="block">
            <span class="label mb-2 block">Email</span>
            <input v-model="email" type="email" class="field" placeholder="you@example.com" />
          </label>
          <label class="block">
            <span class="label mb-2 block">Where is your place?</span>
            <input v-model="city" class="field" placeholder="Asheville, NC" />
          </label>
          <button class="btn-primary w-full">Request host information</button>
          <p class="text-center text-xs text-muted">Demo form. Nothing is submitted anywhere.</p>
        </form>
        <div v-else class="mt-6 rounded-2xl bg-sand/70 p-4 text-sm text-muted">
          <p class="font-semibold text-ink">Thanks — that is the end of the demo.</p>
          <p class="mt-1">Host onboarding is not part of milestone 1, so no email was sent.</p>
        </div>
      </div>
    </div>

    <section class="shell mt-16 grid gap-5 sm:grid-cols-2">
      <article v-for="b in HOST_BENEFITS" :key="b.title" class="reveal rounded-card border border-line bg-white p-6">
        <h3 class="font-display text-lg font-semibold">{{ b.title }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-muted">{{ b.body }}</p>
      </article>
    </section>

    <section class="shell mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <div>
        <h2 class="section-title">Host questions</h2>
        <p class="mt-3 text-sm text-muted">Everything about listing, pricing and payouts, in plain language.</p>
      </div>
      <FaqAccordion :items="FAQS.slice(0, 5)" />
    </section>
  </div>
</template>
