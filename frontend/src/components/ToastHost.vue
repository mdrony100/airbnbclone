<script setup lang="ts">
import { useToast } from '@/composables/useToast'
const { items } = useToast()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in items" :key="t.id"
           class="pointer-events-auto flex items-center gap-2.5 rounded-pill bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lift">
        <span class="h-1.5 w-1.5 rounded-full bg-coral" />
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .3s cubic-bezier(.22,.61,.36,1); }
.toast-enter-from { opacity: 0; transform: translateY(10px) scale(.96); }
.toast-leave-to { opacity: 0; transform: translateY(6px) scale(.98); }
</style>
