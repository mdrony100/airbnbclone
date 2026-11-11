<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; lead?: string }>()
</script>

<template>
  <header class="shell pb-8 pt-10 sm:pt-14">
    <p v-if="eyebrow" class="label">{{ eyebrow }}</p>
    <h1 class="mt-2 max-w-3xl font-display text-4xl leading-[1.08] sm:text-5xl">{{ title }}</h1>
    <p v-if="lead" class="mt-4 max-w-2xl text-base leading-relaxed text-muted">{{ lead }}</p>
  </header>
</template>
