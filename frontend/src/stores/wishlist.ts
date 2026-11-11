import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'

export const useWishlistStore = defineStore('wishlist', () => {
  const slugs = ref<string[]>(api.wishlist())
  const count = computed(() => slugs.value.length)
  const has = (slug: string): boolean => slugs.value.includes(slug)
  function toggle(slug: string): boolean {
    const next = has(slug) ? slugs.value.filter((s) => s !== slug) : [...slugs.value, slug]
    slugs.value = next
    api.setWishlist(next)
    return has(slug)
  }
  return { slugs, count, has, toggle }
})
