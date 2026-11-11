<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AuthCard from '@/components/AuthCard.vue'

const auth = useAuthStore()
const router = useRouter()
const { push } = useToast()
const done = ref(false)
const busy = ref(false)
const email = computed(() => auth.user?.email ?? '')

async function verify(): Promise<void> {
  if (!email.value) { router.push('/login'); return }
  busy.value = true
  await auth.verify(email.value)
  done.value = true
  busy.value = false
  push('Email verified')
}
</script>

<template>
  <AuthCard title="Verify your email" :subtitle="done ? '' : `We sent a verification link to ${email || 'your inbox'}.`">
    <div v-if="done" class="space-y-4 text-sm text-muted">
      <p class="flex items-center gap-2 text-ink"><span class="grid h-6 w-6 place-items-center rounded-full bg-moss/10 text-moss">✓</span> Your email is verified.</p>
      <RouterLink to="/" class="btn-primary w-full">Start exploring</RouterLink>
    </div>
    <div v-else class="space-y-4 text-sm text-muted">
      <p>Clicking the link in the email would normally confirm your address. This demo has no mail server, so use the button below to simulate it.</p>
      <button class="btn-primary w-full" :disabled="busy" @click="verify">{{ busy ? 'Verifying…' : 'Simulate email verification' }}</button>
      <RouterLink to="/" class="block text-center text-xs link-underline">Skip for now</RouterLink>
    </div>
  </AuthCard>
</template>
