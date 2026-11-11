<script setup lang="ts">
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{ modelValue: number; max?: number; label?: string; sublabel?: string }>(), {
  max: 16, label: 'Guests', sublabel: 'Adults and children',
})
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function bump(delta: number): void {
  const next = Math.min(props.max, Math.max(1, props.modelValue + delta))
  if (next !== props.modelValue) emit('update:modelValue', next)
}
</script>

<template>
  <div class="flex items-center justify-between gap-6 py-2">
    <div>
      <p class="text-sm font-medium">{{ label }}</p>
      <p class="text-xs text-muted">{{ sublabel }}</p>
    </div>
    <div class="flex items-center gap-3">
      <button type="button" class="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:border-ink/40 disabled:opacity-40"
              :disabled="modelValue <= 1" :aria-label="`Fewer ${label.toLowerCase()}`" @click="bump(-1)">
        <AppIcon name="close" :size="14" class="rotate-45" />
      </button>
      <span class="w-6 text-center text-sm font-semibold" aria-live="polite">{{ modelValue }}</span>
      <button type="button" class="grid h-8 w-8 place-items-center rounded-full border border-line text-ink transition hover:border-ink/40 disabled:opacity-40"
              :disabled="modelValue >= max" :aria-label="`More ${label.toLowerCase()}`" @click="bump(1)">
        <span class="text-lg leading-none">+</span>
      </button>
    </div>
  </div>
</template>
