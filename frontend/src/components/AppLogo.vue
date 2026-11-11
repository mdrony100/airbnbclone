<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean; light?: boolean }>(), { compact: false, light: false })
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <span class="grid h-9 w-9 place-items-center rounded-[13px] bg-ink">
      <svg viewBox="0 0 32 32" class="h-5 w-5" aria-hidden="true">
        <path d="M7 22c0-5 4-9 9-9s9 4 9 9" fill="none" :stroke="light ? '#FBF8F4' : '#E96A57'" stroke-width="3" stroke-linecap="round" />
        <circle cx="16" cy="9" r="3.2" :fill="light ? '#E96A57' : '#FBF8F4'" />
      </svg>
    </span>
    <span v-if="!compact" class="font-display text-[1.35rem] font-semibold leading-none tracking-tight">
      Stay<span class="text-coral">Nest</span>
    </span>
  </span>
</template>
