import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SearchQuery } from '@/types'
import { DEFAULT_QUERY, activeFilterCount, parseQuery, toQueryObject } from '@/utils/search'

export const useSearchStore = defineStore('search', () => {
  const query = ref<SearchQuery>({ ...DEFAULT_QUERY })
  const filtersOpen = ref(false)
  const filters = computed(() => activeFilterCount(query.value))

  function hydrate(raw: Record<string, unknown>): void {
    query.value = parseQuery(raw)
  }
  function asRouteQuery(): Record<string, string> {
    return toQueryObject(query.value)
  }
  function patch(partial: Partial<SearchQuery>): void {
    query.value = { ...query.value, ...partial, page: partial.page ?? 1 }
  }
  function toggleType(type: SearchQuery['types'][number]): void {
    const set = new Set(query.value.types)
    set.has(type) ? set.delete(type) : set.add(type)
    patch({ types: [...set] })
  }
  function toggleAmenity(id: string): void {
    const set = new Set(query.value.amenities)
    set.has(id) ? set.delete(id) : set.add(id)
    patch({ amenities: [...set] })
  }
  function reset(): void {
    query.value = { ...DEFAULT_QUERY }
  }
  return { query, filters, filtersOpen, hydrate, asRouteQuery, patch, toggleType, toggleAmenity, reset }
})
