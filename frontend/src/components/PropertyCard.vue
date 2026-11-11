<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Property } from '@/types'
import { money } from '@/utils/format'
import { nightsBetween } from '@/utils/dates'
import { priceBreakdown } from '@/services/api'
import { useWishlistStore } from '@/stores/wishlist'
import { useToast } from '@/composables/useToast'
import AppIcon from './AppIcon.vue'
import StarRating from './StarRating.vue'

const props = withDefaults(defineProps<{ property: Property; checkIn?: string; checkOut?: string; layout?: 'grid' | 'row' }>(), { checkIn: '', checkOut: '', layout: 'grid' })
const wishlist = useWishlistStore()
const { push } = useToast()

const index = ref(0)
const saved = computed(() => wishlist.has(props.property.slug))
const total = computed(() => {
  const nights = nightsBetween(props.checkIn ?? '', props.checkOut ?? '')
  if (!nights) return null
  return { nights, amount: priceBreakdown(props.property, props.checkIn!, props.checkOut!).total }
})

function step(dir: number): void {
  const len = props.property.photos.length
  index.value = (index.value + dir + len) % len
}
function toggleSave(): void {
  const nowSaved = wishlist.toggle(props.property.slug)
  push(nowSaved ? 'Saved to your wishlist' : 'Removed from your wishlist')
}
function onKey(e: KeyboardEvent): void {
  if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
  if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
}
</script>

<template>
  <article class="group relative">
    <RouterLink :to="`/stays/${property.slug}`" class="block focus-visible:outline-none">
      <div class="relative overflow-hidden rounded-card bg-line/50"
           :class="layout === 'row' ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[4/3]'"
           tabindex="0" role="group" :aria-label="`${property.title}, ${property.photos.length} photos`" @keydown="onKey">
        <div class="flex h-full w-full transition-transform duration-500 ease-gentle" :style="{ transform: `translateX(-${index * 100}%)` }">
          <img v-for="(src, i) in property.photos" :key="src" :src="src" :alt="`${property.title} — photo ${i + 1}`"
               class="h-full w-full shrink-0 object-cover" :loading="i === 0 ? 'eager' : 'lazy'" decoding="async" />
        </div>

        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <button type="button"
                class="absolute left-2.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-soft backdrop-blur transition hover:bg-white focus-visible:flex group-hover:flex md:flex"
                aria-label="Previous photo" @click.prevent.stop="step(-1)">
          <AppIcon name="chevron-left" :size="16" />
        </button>
        <button type="button"
                class="absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-soft backdrop-blur transition hover:bg-white focus-visible:flex group-hover:flex md:flex"
                aria-label="Next photo" @click.prevent.stop="step(1)">
          <AppIcon name="chevron-right" :size="16" />
        </button>

        <button type="button" class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-ink shadow-soft backdrop-blur transition hover:bg-white"
                :aria-pressed="saved" :aria-label="saved ? 'Remove from wishlist' : 'Save to wishlist'" @click.prevent.stop="toggleSave">
          <AppIcon name="heart" :size="18" :class="saved ? 'fill-coral text-coral' : ''" />
        </button>

        <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          <span v-for="(src, i) in property.photos" :key="'d' + src" class="h-1.5 rounded-full transition-all duration-300"
                :class="i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'" />
        </div>

        <span v-if="property.featured" class="absolute left-3 top-3 rounded-pill bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink backdrop-blur">
          Guest favourite
        </span>
      </div>

      <div class="mt-3.5 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="truncate font-display text-[1.05rem] font-semibold leading-snug">{{ property.title }}</h3>
          <p class="mt-0.5 truncate text-sm text-muted">{{ property.city }}, {{ property.stateCode }}</p>
          <p class="mt-1 text-xs text-muted">{{ property.bedrooms }} bed{{ property.bedrooms > 1 ? 's' : '' }} · {{ property.baths }} bath{{ property.baths > 1 ? 's' : '' }} · up to {{ property.guests }} guests</p>
        </div>
        <div class="shrink-0 text-right">
          <StarRating :value="property.rating" :size="12" />
          <p class="mt-1 text-xs text-muted">{{ property.reviewCount }} reviews</p>
        </div>
      </div>

      <p class="mt-2 text-sm">
        <span class="text-base font-semibold">{{ money(property.pricePerNight) }}</span>
        <span class="text-muted"> / night</span>
        <span v-if="total" class="text-muted"> · {{ money(total.amount) }} for {{ total.nights }} night{{ total.nights > 1 ? 's' : '' }}</span>
      </p>
    </RouterLink>
  </article>
</template>
