<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import { useToast } from '@/composables/useToast'
import AuthCard from '@/components/AuthCard.vue'

const route = useRoute()
const router = useRouter()
const { push } = useToast()
const email = ref(String(route.query.email ?? ''))
const password = ref('')
const confirm = ref('')
const error = ref('')
const busy = ref(false)

async function submit(): Promise<void> {
  error.value = ''
  if (password.value.length < 8) { error.value = 'Use at least 8 characters.'; return }
  if (password.value !== confirm.value) { error.value = 'The two passwords do not match.'; return }
  busy.value = true
  try {
    await api.resetPassword(email.value, password.value)
    push('Password updated')
    router.push('/login')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not update the password.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthCard title="Choose a new password" subtitle="You will be asked to log in again afterwards.">
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block">
        <span class="label mb-2 block">Email</span>
        <input v-model="email" type="email" required class="field" />
      </label>
      <label class="block">
        <span class="label mb-2 block">New password</span>
        <input v-model="password" type="password" required class="field" autocomplete="new-password" />
      </label>
      <label class="block">
        <span class="label mb-2 block">Confirm password</span>
        <input v-model="confirm" type="password" required class="field" autocomplete="new-password" />
      </label>
      <p v-if="error" class="text-xs font-medium text-coral">{{ error }}</p>
      <button class="btn-primary w-full" :disabled="busy">{{ busy ? 'Saving…' : 'Save new password' }}</button>
    </form>
  </AuthCard>
</template>
