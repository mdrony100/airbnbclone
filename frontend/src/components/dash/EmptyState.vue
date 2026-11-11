<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

withDefaults(defineProps<{ title: string; body?: string; icon?: string; action?: string }>(), { icon: 'spark' })
defineEmits<{ (e: 'action'): void }>()
</script>

<template>
  <div class="card flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
    <span class="grid h-12 w-12 place-items-center rounded-full bg-sand text-ink/60"><AppIcon :name="icon" :size="20" /></span>
    <p class="font-display text-lg text-ink">{{ title }}</p>
    <p v-if="body" class="max-w-sm text-sm text-muted">{{ body }}</p>
    <button v-if="action" class="btn-ghost mt-1" @click="$emit('action')">{{ action }}</button>
  </div>
</template>
