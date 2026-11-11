<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import AppIcon from '@/components/AppIcon.vue'
import { useRouter } from 'vue-router'

const dash = useDashboardStore()
const router = useRouter()

async function go(target: 'traveling' | 'hosting'): Promise<void> {
  if (dash.mode === target) return
  if (target === 'hosting' && dash.hostStatus !== 'approved') {
    router.push(dash.hostStatus === 'none' ? '/dashboard/host/apply' : '/dashboard/host/apply')
    return
  }
  await dash.switchMode(target)
  router.push(target === 'hosting' ? '/dashboard/host' : '/dashboard')
}
</script>

<template>
  <div class="inline-flex items-center gap-1 rounded-full border border-line bg-white p-1 shadow-soft" role="group" aria-label="Switch dashboard mode">
    <button
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition"
      :class="dash.mode === 'traveling' ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'"
      :aria-pressed="dash.mode === 'traveling'"
      @click="go('traveling')"
    >
      <AppIcon name="compass" :size="13" /> Traveling
    </button>
    <button
      class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition"
      :class="dash.mode === 'hosting' ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'"
      :aria-pressed="dash.mode === 'hosting'"
      @click="go('hosting')"
    >
      <AppIcon name="home" :size="13" />
      {{ dash.hostStatus === 'approved' ? 'Hosting' : 'Become a host' }}
    </button>
  </div>
</template>
