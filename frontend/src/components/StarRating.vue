<script setup lang="ts">
withDefaults(defineProps<{ value: number; showValue?: boolean; size?: number }>(), { showValue: true, size: 13 })
</script>

<template>
  <span class="inline-flex items-center gap-1 align-middle" :aria-label="`Rated ${value} out of 5`">
    <svg v-for="i in 5" :key="i" :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true"
         :class="i <= Math.round(value) ? 'text-coral' : 'text-line'" fill="currentColor">
      <path d="M12 2.6l2.9 6 6.6 1-4.8 4.6 1.1 6.5L12 17.6 6.2 20.7l1.1-6.5L2.5 9.6l6.6-1z" />
    </svg>
    <span v-if="showValue" class="ml-0.5 text-sm font-medium text-ink">{{ value.toFixed(2) }}</span>
  </span>
</template>
