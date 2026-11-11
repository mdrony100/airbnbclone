<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AuthCard from '@/components/AuthCard.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const busy = ref('')
const { push } = useToast()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit(): Promise<void> {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    push('Signed in')
    router.push((route.query.next as string) || '/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not sign in.'
  }
}

async function demo(role: 'guest' | 'host'): Promise<void> {
  busy.value = role
  error.value = ''
  try {
    await auth.demoSignIn(role)
    push(role === 'host' ? 'Signed in as demo host' : 'Signed in as demo guest')
    router.push(role === 'host' ? '/dashboard/host' : (route.query.next as string) || '/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not sign in.'
  } finally {
    busy.value = ''
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

    <div class="mt-6 border-t border-line pt-5">
      <p class="label mb-2">Demo access</p>
      <p class="mb-3 text-xs text-muted">No password needed. Both accounts share the same simulated data (prototype only).</p>
      <div class="flex flex-wrap gap-2">
        <button class="btn-ghost" :disabled="!!busy" @click="demo('guest')">{{ busy === 'guest' ? 'Opening…' : 'Enter as guest (Ada)' }}</button>
        <button class="btn-ghost" :disabled="!!busy" @click="demo('host')">{{ busy === 'host' ? 'Opening…' : 'Enter as host (Marisol)' }}</button>
      </div>
    </div>
    <div class="mt-5 flex items-center justify-between text-xs text-muted">
      <RouterLink to="/forgot-password" class="link-underline">Forgot password?</RouterLink>
      <RouterLink to="/register" class="link-underline">Create an account</RouterLink>
    </div>
  </AuthCard>
</template>
