<script setup lang="ts">
import { computed } from 'vue'
import { properties } from '@/data/properties'
import { useWishlistStore } from '@/stores/wishlist'
import PropertyCard from '@/components/PropertyCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'

const wishlist = useWishlistStore()
const saved = computed(() => properties.filter((p) => wishlist.slugs.includes(p.slug)))
</script>

<template>
  <div>
    <PageHeader eyebrow="Your shortlist" title="Wishlist" :lead="saved.length ? `${saved.length} stay${saved.length > 1 ? 's' : ''} saved. Wishlists are kept in this browser.` : 'Save stays with the heart button and they will collect here.'" />
    <div class="shell">
      <div v-if="saved.length" class="grid gap-x-6 gap-y-10 pb-10 sm:grid-cols-2 lg:grid-cols-3">
        <PropertyCard v-for="p in saved" :key="p.slug" :property="p" />
      </div>
      <div v-else class="rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
        <span class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sand"><AppIcon name="heart" :size="22" /></span>
        <h2 class="mt-5 font-display text-2xl">Nothing saved yet</h2>
        <p class="mx-auto mt-2 max-w-sm text-sm text-muted">Tap the heart on any listing to keep it here while you compare options.</p>
        <RouterLink to="/search" class="btn-primary mt-6 inline-flex">Browse stays</RouterLink>
      </div>
    </div>
  </div>
</template>
