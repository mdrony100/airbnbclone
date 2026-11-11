<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import EmptyState from '@/components/dash/EmptyState.vue'
import { useWishlistStore } from '@/stores/wishlist'
import { properties } from '@/data/properties'
import { money } from '@/utils/format'
import { useToast } from '@/composables/useToast'

const wishes = useWishlistStore()
const toast = useToast()

const saved = computed(() => wishes.slugs.map((s) => properties.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p)))

function remove(slug: string, title: string): void {
  wishes.toggle(slug)
  toast.push(`${title} removed from your wishlist.`)
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="label">Guest</p>
        <h1 class="mt-1 font-display text-3xl text-ink">Wishlists</h1>
        <p class="mt-1 text-sm text-muted">Saved from the public site. The same list drives the hearts on stay cards.</p>
      </div>
      <RouterLink to="/search" class="btn-ghost"><AppIcon name="search" :size="15" /> Browse stays</RouterLink>
    </header>

    <div v-if="saved.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article v-for="p in saved" :key="p.slug" class="card overflow-hidden">
        <RouterLink :to="`/stays/${p.slug}`">
          <img :src="p.photos[0]" :alt="p.title" class="h-40 w-full object-cover" loading="lazy" />
        </RouterLink>
        <div class="p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <RouterLink :to="`/stays/${p.slug}`" class="block truncate font-semibold text-ink hover:underline">{{ p.title }}</RouterLink>
              <p class="text-xs text-muted">{{ p.city }}, {{ p.state }} · ★ {{ p.rating.toFixed(2) }}</p>
            </div>
            <button
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-coral transition hover:bg-coral/10"
              :aria-label="`Remove ${p.title} from wishlist`"
              @click="remove(p.slug, p.title)"
            >
              <AppIcon name="heart" :size="15" />
            </button>
          </div>
          <p class="mt-2 text-sm text-ink">{{ money(p.pricePerNight) }} <span class="text-muted">/ night</span></p>
          <RouterLink :to="`/stays/${p.slug}`" class="btn-ghost mt-3 w-full">View stay</RouterLink>
        </div>
      </article>
    </div>
    <EmptyState
      v-else
      title="No saved stays yet"
      body="Tap the heart on any listing to keep it here for later."
      icon="heart"
      action="Browse stays"
      @action="$router.push('/search')"
    />
  </div>
</template>
