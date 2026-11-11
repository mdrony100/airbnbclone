<script setup lang="ts">
import { computed } from 'vue'
import type { SearchQuery } from '@/types'
import { PROPERTY_TYPES, AMENITIES } from '@/data/content'
import { money } from '@/utils/format'
import AppIcon from './AppIcon.vue'

const props = defineProps<{ query: SearchQuery }>()
const emit = defineEmits<{ patch: [partial: Partial<SearchQuery>]; clear: [] }>()

const featuredAmenities = computed(() => AMENITIES.filter((a) => ['wifi', 'kitchen', 'pool', 'hot-tub', 'fireplace', 'free-parking', 'air-conditioning', 'beach-access', 'workspace'].includes(a.id)))
const maxPrice = 900

function setType(id: SearchQuery['types'][number]): void {
  const set = new Set(props.query.types)
  set.has(id) ? set.delete(id) : set.add(id)
  emit('patch', { types: [...set] })
}
function setAmenity(id: string): void {
  const set = new Set(props.query.amenities)
  set.has(id) ? set.delete(id) : set.add(id)
  emit('patch', { amenities: [...set] })
}
function setPriceMax(v: number): void {
  emit('patch', { maxPrice: Math.max(v, props.query.minPrice + 25) })
}
</script>

<template>
  <div class="space-y-7">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-lg font-semibold">Filters</h2>
      <button class="text-xs font-semibold text-muted underline decoration-line underline-offset-4 hover:text-ink" @click="emit('clear')">
        Clear all
      </button>
    </div>

    <section>
      <h3 class="label mb-3">Price per night</h3>
      <div class="flex items-center gap-2">
        <label class="flex-1">
          <span class="sr-only">Minimum price</span>
          <input :value="query.minPrice" type="number" min="0" max="900" step="10" class="field text-center text-sm"
                 @input="emit('patch', { minPrice: Number(($event.target as HTMLInputElement).value) })" placeholder="0" />
        </label>
        <span class="text-muted">–</span>
        <label class="flex-1">
          <span class="sr-only">Maximum price</span>
          <input :value="query.maxPrice" type="number" min="25" max="900" step="10" class="field text-center text-sm"
                 @input="emit('patch', { maxPrice: Number(($event.target as HTMLInputElement).value) || 900 })" />
        </label>
      </div>
      <input :value="query.maxPrice" type="range" min="100" max="900" step="25" class="mt-4 w-full accent-coral"
             aria-label="Maximum nightly price" @input="setPriceMax(Number(($event.target as HTMLInputElement).value))" />
      <p class="mt-1 text-xs text-muted">Up to {{ money(query.maxPrice) }} a night</p>
    </section>

    <section>
      <h3 class="label mb-3">Property type</h3>
      <div class="flex flex-wrap gap-2">
        <button v-for="t in PROPERTY_TYPES" :key="t.id" type="button" class="chip"
                :class="query.types.includes(t.id) ? 'chip-active' : ''" :aria-pressed="query.types.includes(t.id)"
                @click="setType(t.id)">
          {{ t.label }}
        </button>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3">
      <label>
        <span class="label mb-2 block">Bedrooms</span>
        <select :value="query.bedrooms" class="field" @change="emit('patch', { bedrooms: Number(($event.target as HTMLSelectElement).value) })">
          <option :value="0">Any</option>
          <option v-for="n in 5" :key="n" :value="n">{{ n }}+</option>
        </select>
      </label>
      <label>
        <span class="label mb-2 block">Bathrooms</span>
        <select :value="query.bathrooms" class="field" @change="emit('patch', { bathrooms: Number(($event.target as HTMLSelectElement).value) })">
          <option :value="0">Any</option>
          <option v-for="n in 4" :key="n" :value="n">{{ n }}+</option>
        </select>
      </label>
    </section>

    <section>
      <h3 class="label mb-3">Amenities</h3>
      <div class="space-y-2.5">
        <label v-for="a in featuredAmenities" :key="a.id" class="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" class="h-4 w-4 rounded border-line text-coral accent-coral"
                 :checked="query.amenities.includes(a.id)" @change="setAmenity(a.id)" />
          <AppIcon :name="a.icon" :size="16" class="text-muted" />
          <span>{{ a.label }}</span>
        </label>
      </div>
    </section>
  </div>
</template>
