<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AuthCard from '@/components/AuthCard.vue'

const auth = useAuthStore()
const router = useRouter()
const { push } = useToast()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function submit(): Promise<void> {
  error.value = ''
  if (password.value.length < 8) { error.value = 'Use at least 8 characters for your password.'; return }
  try {
    await auth.register(name.value, email.value, password.value)
    push('Account created')
    router.push('/verify-email')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create the account.'
  }
}
</script>

<template>
  <AuthCard title="Create your StayNest account" subtitle="Save stays, keep your trips together, and book faster next time.">
    <form class="space-y-4" @submit.prevent="submit">
      <label class="block">
        <span class="label mb-2 block">Full name</span>
        <input v-model="name" required class="field" autocomplete="name" placeholder="Alex Morgan" />
      </label>
      <label class="block">
        <span class="label mb-2 block">Email</span>
        <input v-model="email" type="email" required class="field" autocomplete="email" placeholder="you@example.com" />
      </label>
      <label class="block">
        <span class="label mb-2 block">Password</span>
        <input v-model="password" type="password" required class="field" autocomplete="new-password" placeholder="At least 8 characters" />
      </label>
      <p v-if="error" class="text-xs font-medium text-coral">{{ error }}</p>
      <button class="btn-primary w-full" :disabled="auth.loading">{{ auth.loading ? 'Creating account…' : 'Create account' }}</button>
      <p class="text-center text-xs leading-relaxed text-muted">
        By continuing you agree to the <RouterLink to="/terms" class="link-underline">terms</RouterLink> and
        <RouterLink to="/privacy" class="link-underline">privacy policy</RouterLink>.
      </p>
    </form>
  </AuthCard>
</template>
