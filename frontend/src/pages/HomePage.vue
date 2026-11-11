<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Destination, Property } from '@/types'
import { api } from '@/services/api'
import { updateMeta } from '@/utils/seo'
import { destinations } from '@/data/destinations'
import { FAQS, HOW_IT_WORKS, PROPERTY_TYPES, TESTIMONIALS } from '@/data/content'
import { properties } from '@/data/properties'
import { heroPhoto, photo } from '@/data/photos'
import { nextWeekend } from '@/utils/search'
import { dateLabel } from '@/utils/format'
import SearchBar from '@/components/SearchBar.vue'
import PropertyCard from '@/components/PropertyCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import AppIcon from '@/components/AppIcon.vue'
import StarRating from '@/components/StarRating.vue'
import FaqAccordion from '@/components/FaqAccordion.vue'

const featured = ref<Property[]>([])
const weekend = ref<Property[]>([])
const loading = ref(true)
const weekendDates = computed(() => nextWeekend())
const dests = ref<Destination[]>(destinations)

const typeCounts = computed(() =>
  PROPERTY_TYPES.map((t) => ({ ...t, count: properties.filter((p) => p.type === t.id).length })),
)

onMounted(async () => {
  updateMeta(
    'StayNest — Vacation rentals across the United States',
    'Handpicked homes, cabins, villas and beach houses across the US. Transparent pricing and a two-minute booking flow.',
    heroPhoto(),
  )
  const [f, w] = await Promise.all([api.featured(6), api.collection('weekend', 6)])
  featured.value = f
  weekend.value = w
  loading.value = false
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden pb-10 pt-6 sm:pt-10">
      <div class="pointer-events-none absolute -right-32 -top-24 h-[26rem] w-[26rem] rounded-full bg-coral/10 blur-3xl" />
      <div class="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-sand blur-3xl" />
      <div class="shell relative">
        <div class="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span class="inline-flex items-center gap-2 rounded-pill border border-line bg-white/80 px-3 py-1.5 text-xs font-semibold text-muted shadow-soft">
              <span class="h-1.5 w-1.5 rounded-full bg-coral" />
              20 handpicked stays across the US
            </span>
            <h1 class="mt-5 font-display text-[2.6rem] leading-[1.03] tracking-tight text-balance sm:text-6xl">
              Find a place worth<br class="hidden sm:block" /> staying in longer.
            </h1>
            <p class="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Cabins, coast houses and desert villas from California to Maine. Real prices, full breakdowns, and a booking flow that takes about two minutes.
            </p>

            <div class="mt-8">
              <SearchBar />
            </div>

            <div class="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted">
              <span class="flex items-center gap-1.5"><AppIcon name="shield" :size="15" class="text-moss" /> Transparent pricing</span>
              <span class="flex items-center gap-1.5"><AppIcon name="clock" :size="15" class="text-moss" /> Instant confirmation</span>
              <span class="flex items-center gap-1.5"><AppIcon name="key" :size="15" class="text-moss" /> Address after booking</span>
            </div>
          </div>

          <div class="relative hidden lg:block">
            <div class="grid grid-cols-2 gap-3">
              <img :src="heroPhoto()" alt="Coastal vacation rental at golden hour" class="col-span-2 h-64 w-full rounded-[28px] object-cover shadow-lift" />
              <img :src="photo('hero-cabin', 'card')" alt="Mountain cabin exterior" class="h-44 w-full rounded-[24px] object-cover shadow-soft" />
              <img :src="photo('hero-desert', 'card')" alt="Desert villa with pool" class="h-44 w-full rounded-[24px] object-cover shadow-soft" />
            </div>
            <div class="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lift backdrop-blur">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-coral/12 text-coral"><AppIcon name="star" :size="17" /></span>
              <div>
                <p class="text-sm font-semibold">4.9 average guest rating</p>
                <p class="text-xs text-muted">from 2,400+ demo reviews</p>
              </div>
            </div>
          </div>
        </div>

        <!-- categories -->
        <div class="mt-14">
          <div class="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
            <RouterLink v-for="t in typeCounts" :key="t.id" :to="`/search?types=${t.id}`"
                        class="group flex min-w-[9.5rem] flex-col gap-2 rounded-2xl border border-line bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-soft">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-sand text-ink transition group-hover:bg-coral group-hover:text-white">
                <AppIcon :name="t.id === 'apartment' ? 'city' : t.id === 'cabin' ? 'mountain' : t.id === 'beachhouse' ? 'beach' : t.id === 'villa' ? 'pool' : 'home'" :size="17" />
              </span>
              <span class="text-sm font-semibold">{{ t.label }}</span>
              <span class="text-xs text-muted">{{ t.count }} stays</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section class="shell mt-16 sm:mt-24">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="label">Featured stays</p>
          <h2 class="section-title mt-2">Places guests keep coming back to</h2>
        </div>
        <RouterLink to="/search" class="btn-ghost !py-2.5 text-sm">
          Browse all stays <AppIcon name="arrow-right" :size="15" />
        </RouterLink>
      </div>

      <div class="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <template v-if="loading">
          <SkeletonCard v-for="n in 6" :key="n" />
        </template>
        <PropertyCard v-for="p in featured" v-else :key="p.slug" :property="p" />
      </div>
    </section>

    <!-- Destinations -->
    <section class="shell mt-20 sm:mt-28">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="label">Popular in the US</p>
          <h2 class="section-title mt-2">Where people are going this season</h2>
        </div>
        <RouterLink to="/search" class="text-sm font-semibold link-underline">All destinations</RouterLink>
      </div>
      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink v-for="(d, i) in dests" :key="d.slug" :to="`/search?destination=${encodeURIComponent(d.name)}`"
                    class="group relative overflow-hidden rounded-card" :class="i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''">
          <img :src="d.photo" :alt="`${d.name}, ${d.state}`" loading="lazy"
               class="h-44 w-full object-cover transition duration-700 ease-gentle group-hover:scale-[1.04]"
               :class="i === 0 ? 'sm:h-[22rem] lg:h-full' : ''" />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-4">
            <p class="font-display text-lg font-semibold text-white">{{ d.name }}</p>
            <p class="text-xs text-white/80">{{ d.state }}</p>
            <p v-if="i === 0" class="mt-2 max-w-xs text-sm text-white/85">{{ d.blurb }}</p>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Weekend collection -->
    <section class="mt-20 bg-sand/50 py-16 sm:mt-28">
      <div class="shell">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="label">Weekend getaways</p>
            <h2 class="section-title mt-2">Two nights, no long haul</h2>
            <p class="mt-2 text-sm text-muted">
              Priced for {{ dateLabel(weekendDates.checkIn) }} – {{ dateLabel(weekendDates.checkOut) }}, the next free weekend on most calendars.
            </p>
          </div>
          <RouterLink :to="`/search?checkIn=${weekendDates.checkIn}&checkOut=${weekendDates.checkOut}`" class="btn-ghost !py-2.5 text-sm">
            See weekend availability
          </RouterLink>
        </div>
        <div class="no-scrollbar -mx-5 mt-8 flex snap-x-mandatory gap-5 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
          <div v-for="p in weekend" :key="p.slug" class="w-[78vw] shrink-0 snap-start-always sm:w-[22rem]">
            <PropertyCard :property="p" :check-in="weekendDates.checkIn" :check-out="weekendDates.checkOut" />
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="shell mt-20 scroll-mt-24 sm:mt-28">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p class="label">How it works</p>
          <h2 class="section-title mt-2">Three steps, no phone calls</h2>
          <p class="mt-4 max-w-md text-base leading-relaxed text-muted">
            StayNest is built around the parts of booking a holiday home that usually go wrong: unclear fees, vague descriptions, and calendars that are out of date.
          </p>
          <div class="mt-7 flex flex-wrap gap-3">
            <RouterLink to="/search" class="btn-primary">Find a stay</RouterLink>
            <RouterLink to="/host" class="btn-ghost">List your place</RouterLink>
          </div>
        </div>
        <ol class="space-y-4">
          <li v-for="s in HOW_IT_WORKS" :key="s.step" class="reveal flex gap-5 rounded-card border border-line bg-white p-6 shadow-soft">
            <span class="font-display text-2xl font-semibold text-coral">{{ s.step }}</span>
            <div>
              <h3 class="font-display text-lg font-semibold">{{ s.title }}</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ s.body }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="shell mt-20 sm:mt-28">
      <p class="label">Guest stories</p>
      <h2 class="section-title mt-2">What staying with us is like</h2>
      <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <figure v-for="t in TESTIMONIALS" :key="t.name" class="reveal flex flex-col rounded-card border border-line bg-white p-6 shadow-soft">
          <StarRating :value="t.rating" :size="13" />
          <blockquote class="mt-3 flex-1 text-sm leading-relaxed text-muted">“{{ t.text }}”</blockquote>
          <figcaption class="mt-5 text-sm">
            <span class="font-semibold text-ink">{{ t.name }}</span>
            <span class="block text-xs text-muted">{{ t.location }}</span>
          </figcaption>
        </figure>
      </div>
      <p class="mt-4 text-xs text-muted">Testimonials are fictional demo content created for this build.</p>
    </section>

    <!-- Host CTA -->
    <section class="shell mt-20 sm:mt-28">
      <div class="relative overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-white sm:px-14">
        <div class="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-coral/25 blur-3xl" />
        <div class="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-coral">Become a host</p>
            <h2 class="mt-3 max-w-lg font-display text-3xl leading-tight sm:text-4xl">Your place, priced by you, described honestly.</h2>
            <p class="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Set your nightly rate and cleaning fee, keep your calendar in your own hands, and pay one flat platform fee on completed stays.
            </p>
            <div class="mt-7 flex flex-wrap gap-3">
              <RouterLink to="/host" class="btn bg-coral text-white hover:bg-coral-dark">Start hosting</RouterLink>
              <RouterLink to="/help" class="btn border border-white/25 text-white hover:bg-white/10">Read host guide</RouterLink>
            </div>
          </div>
          <dl class="grid grid-cols-2 gap-4 text-sm">
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
              <dt class="text-white/60">Platform fee</dt>
              <dd class="mt-1 font-display text-2xl">9%</dd>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
              <dt class="text-white/60">Listing fee</dt>
              <dd class="mt-1 font-display text-2xl">$0</dd>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
              <dt class="text-white/60">Payout</dt>
              <dd class="mt-1 font-display text-2xl">24h</dd>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/5 p-4">
              <dt class="text-white/60">Support</dt>
              <dd class="mt-1 font-display text-2xl">7 days</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="shell mt-20 sm:mt-28">
      <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p class="label">Questions</p>
          <h2 class="section-title mt-2">Before you book</h2>
          <p class="mt-3 text-sm leading-relaxed text-muted">
            Still unsure about something? The <RouterLink to="/help" class="link-underline">help centre</RouterLink> covers fees, cancellation and check-in in more detail.
          </p>
        </div>
        <FaqAccordion :items="FAQS" />
      </div>
    </section>
  </div>
</template>
