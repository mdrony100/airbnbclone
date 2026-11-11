<script setup lang="ts">
import { photo } from '@/data/photos'
</script>

<template>
  <div class="shell flex min-h-[62vh] flex-col items-center justify-center py-16 text-center">
    <img :src="photo('not-found', 'card')" alt="" class="h-40 w-64 rounded-card object-cover opacity-80 shadow-soft" />
    <p class="mt-8 font-display text-5xl">404</p>
    <h1 class="mt-3 font-display text-2xl sm:text-3xl">This page checked out early</h1>
    <p class="mt-2 max-w-sm text-sm text-muted">The link may be broken, or the stay may no longer be listed.</p>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <RouterLink to="/" class="btn-primary">Back home</RouterLink>
      <RouterLink to="/search" class="btn-ghost">Browse stays</RouterLink>
    </div>
  </div>
</template>
