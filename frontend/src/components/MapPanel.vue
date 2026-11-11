<script setup lang="ts">
import { computed } from 'vue'
import type { Property } from '@/types'
import { money } from '@/utils/format'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ properties: Property[]; activeSlug?: string; checkIn?: string; checkOut?: string }>()
const emit = defineEmits<{ select: [slug: string] }>()

// Rough US bounding box used to place pins on the placeholder map.
const BOUNDS = { minLat: 24, maxLat: 49, minLng: -125, maxLng: -66 }
const pins = computed(() =>
  props.properties.map((p) => ({
    slug: p.slug,
    title: p.title,
    price: p.pricePerNight,
    city: `${p.city}, ${p.stateCode}`,
    left: `${((p.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100}%`,
    top: `${((BOUNDS.maxLat - p.lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100}%`,
  })),
)
</script>

<template>
  <div class="relative overflow-hidden rounded-card border border-line bg-[#EAE3D8]">
    <div class="absolute inset-0 opacity-[0.5]"
         style="background-image: radial-gradient(circle at 20% 30%, #DCD3C4 0, transparent 45%), radial-gradient(circle at 78% 68%, #D7CDBC 0, transparent 40%), repeating-linear-gradient(115deg, rgba(255,255,255,.35) 0 2px, transparent 2px 26px);" />
    <div class="absolute left-4 top-4 z-10 max-w-[15rem] rounded-2xl border border-line bg-white/95 p-3 text-xs leading-relaxed shadow-soft backdrop-blur">
      <p class="flex items-center gap-1.5 font-semibold text-ink"><AppIcon name="info" :size="14" class="text-coral" /> Map preview</p>
      <p class="mt-1 text-muted">Approximate locations only. A live map provider key is required for the interactive map, so these pins are illustrative.</p>
    </div>

    <div class="relative h-[520px] w-full lg:h-[calc(100vh-13rem)]">
      <button v-for="p in pins" :key="p.slug" type="button"
              class="group absolute -translate-x-1/2 -translate-y-1/2 rounded-pill border px-3 py-1.5 text-xs font-semibold shadow-soft transition duration-300"
              :class="p.slug === activeSlug ? 'z-20 scale-105 border-ink bg-ink text-white' : 'z-10 border-line bg-white text-ink hover:z-20 hover:scale-105'"
              :style="{ left: p.left, top: p.top }"
              :aria-label="`${p.title}, ${p.city}, ${money(p.price)} per night`"
              @click="emit('select', p.slug)">
        {{ money(p.price) }}
        <span class="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 hidden w-max max-w-[12rem] -translate-x-1/2 rounded-xl bg-ink px-2.5 py-1.5 text-[11px] font-medium text-white group-hover:block">
          {{ p.title }} · {{ p.city }}
        </span>
      </button>
    </div>

    <p class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-white/90 px-3 py-1 text-[11px] font-medium text-muted shadow-soft">
      {{ pins.length }} stays plotted · exact addresses shown after booking
    </p>
  </div>
</template>
