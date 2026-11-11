<script setup lang="ts">
import AppIcon from './AppIcon.vue'
const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ change: [page: number] }>()

function go(page: number): void {
  if (page >= 1 && page <= props.totalPages && page !== props.page) emit('change', page)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
    <button class="grid h-10 w-10 place-items-center rounded-full border border-line bg-white transition hover:border-ink/30 disabled:opacity-40"
            :disabled="page === 1" aria-label="Previous page" @click="go(page - 1)">
      <AppIcon name="chevron-left" :size="16" />
    </button>
    <button v-for="p in totalPages" :key="p"
            class="grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-semibold transition"
            :class="p === page ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink/30'"
            :aria-current="p === page ? 'page' : undefined" @click="go(p)">
      {{ p }}
    </button>
    <button class="grid h-10 w-10 place-items-center rounded-full border border-line bg-white transition hover:border-ink/30 disabled:opacity-40"
            :disabled="page === totalPages" aria-label="Next page" @click="go(page + 1)">
      <AppIcon name="chevron-right" :size="16" />
    </button>
  </nav>
</template>
