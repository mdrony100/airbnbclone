<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; footer?: string }>()
</script>

<template>
  <div class="shell py-12 sm:py-20">
    <div class="mx-auto max-w-md">
      <div class="rounded-card border border-line bg-white p-7 shadow-soft sm:p-9">
        <h1 class="font-display text-2xl">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1.5 text-sm text-muted">{{ subtitle }}</p>
        <div class="mt-6">
          <slot />
        </div>
      </div>
      <p v-if="footer || $slots.footer" class="mt-5 text-center text-sm text-muted">
        <slot name="footer">{{ footer }}</slot>
      </p>
    </div>
  </div>
</template>
