<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AuthCard from '@/components/AuthCard.vue'

const auth = useAuthStore()
const router = useRouter()
const { push } = useToast()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit(): Promise<void> {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    push('Signed in')
    router.push('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not sign in.'
  }
}
</script>

<template>
  <AuthCard title="Log in to StayNest" subtitle="Demo accounts are stored in your browser only.">
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block">
        <span class="label mb-2 block">Email</span>
        <input v-model="email" type="email" required class="field" autocomplete="email" placeholder="you@example.com" />
      </label>
      <label class="block">
        <span class="label mb-2 block">Password</span>
        <input v-model="password" type="password" required class="field" autocomplete="current-password" placeholder="••••••••" />
      </label>
      <p v-if="error" class="text-xs font-medium text-coral">{{ error }}</p>
      <button class="btn-primary w-full" :disabled="auth.loading">{{ auth.loading ? 'Signing in…' : 'Log in' }}</button>
    </form>
    <div class="mt-5 flex items-center justify-between text-xs text-muted">
      <RouterLink to="/forgot-password" class="link-underline">Forgot password?</RouterLink>
      <RouterLink to="/register" class="link-underline">Create an account</RouterLink>
    </div>
  </AuthCard>
</template>
