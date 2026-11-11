<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ items: { q: string; a: string }[]; open?: number }>(), { open: 0 })
const active = ref<number | null>(0)
function toggle(i: number): void { active.value = active.value === i ? null : i }
</script>

<template>
  <div class="divide-y divide-line rounded-card border border-line bg-white">
    <div v-for="(item, i) in items" :key="item.q">
      <h3>
        <button class="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
                :aria-expanded="active === i" :aria-controls="`faq-${i}`" @click="toggle(i)">
          <span class="font-display text-base font-semibold sm:text-lg">{{ item.q }}</span>
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line transition duration-300"
                :class="active === i ? 'rotate-180 border-ink bg-ink text-white' : 'text-ink'">
            <AppIcon name="chevron-down" :size="15" />
          </span>
        </button>
      </h3>
      <div :id="`faq-${i}`" class="grid overflow-hidden transition-all duration-300 ease-gentle"
           :class="active === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
        <div class="overflow-hidden">
          <p class="px-5 pb-6 text-sm leading-relaxed text-muted sm:px-7 sm:text-base">{{ item.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
