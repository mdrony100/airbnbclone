<script setup lang="ts">
import { onMounted } from 'vue'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useReveal } from '@/composables/useReveal'

onMounted(() => {
  // keep the sticky header honest on refresh
  window.addEventListener('load', () => void 0, { once: true })
})

useReveal()
</script>

<template>
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
    Skip to content
  </a>
  <SiteHeader />
  <main id="main" class="min-h-[60vh]">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
  <ToastHost />
</template>

<style>
.page-enter-active, .page-leave-active { transition: opacity .28s ease, transform .28s ease; }
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
