<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

withDefaults(defineProps<{ label: string; value: string; hint?: string; icon?: string; tone?: 'default' | 'coral' }>(), {
  icon: 'spark', tone: 'default',
})
</script>

<template>
  <div class="card p-5">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{{ label }}</p>
      <span class="grid h-8 w-8 place-items-center rounded-full" :class="tone === 'coral' ? 'bg-coral/10 text-coral' : 'bg-sand text-ink/60'">
        <AppIcon :name="icon" :size="15" />
      </span>
    </div>
    <p class="mt-3 font-display text-2xl text-ink">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted">{{ hint }}</p>
  </div>
</template>
