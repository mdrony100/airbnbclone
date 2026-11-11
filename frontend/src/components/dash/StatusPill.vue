<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string; label?: string }>()

const tone = computed(() => {
  switch (props.status) {
    case 'published':
    case 'completed':
    case 'confirmed':
    case 'approved':
    case 'paid':
    case 'connected':
    case 'upcoming':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    case 'pending':
    case 'processing':
    case 'scheduled':
    case 'held':
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    case 'rejected':
    case 'canceled':
    case 'failed':
      return 'bg-rose-50 text-rose-700 ring-rose-200'
    case 'draft':
    case 'paused':
      return 'bg-stone-100 text-stone-600 ring-stone-200'
    default:
      return 'bg-sand text-ink/70 ring-line'
  }
})

const text = computed(() => {
  const raw = props.label ?? props.status
  return raw.replace(/(^|\s)\S/g, (c) => c.toUpperCase())
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset" :class="tone">
    {{ text }}
  </span>
</template>
