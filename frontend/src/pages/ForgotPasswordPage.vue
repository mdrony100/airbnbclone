<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/services/api'
import AuthCard from '@/components/AuthCard.vue'

const email = ref('')
const sent = ref(false)
const error = ref('')
const busy = ref(false)

async function submit(): Promise<void> {
  busy.value = true
  error.value = ''
  try {
    await api.requestReset(email.value)
    sent.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not send the reset link.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthCard title="Reset your password" :subtitle="sent ? '' : 'We will send a reset link to your email address.'">
    <div v-if="sent" class="space-y-4 text-sm text-muted">
      <p>If an account exists for <span class="font-medium text-ink">{{ email }}</span>, a reset link is on its way. In this demo, continue below to set a new password.</p>
      <RouterLink :to="{ path: '/reset-password', query: { email } }" class="btn-primary w-full">Set a new password</RouterLink>
    </div>
    <form v-else class="space-y-4" @submit.prevent="submit">
      <label class="block">
        <span class="label mb-2 block">Email</span>
        <input v-model="email" type="email" required class="field" placeholder="you@example.com" />
      </label>
      <p v-if="error" class="text-xs font-medium text-coral">{{ error }}</p>
      <button class="btn-primary w-full" :disabled="busy">{{ busy ? 'Sending…' : 'Send reset link' }}</button>
      <RouterLink to="/login" class="block text-center text-xs text-muted link-underline">Back to log in</RouterLink>
    </form>
  </AuthCard>
</template>
