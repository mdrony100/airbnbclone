import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import type { SessionUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(api.currentUser())
  const loading = ref(false)

  async function login(email: string, password: string): Promise<void> {
    loading.value = true
    try { user.value = await api.login(email, password) } finally { loading.value = false }
  }
  async function register(name: string, email: string, password: string): Promise<void> {
    loading.value = true
    try { user.value = await api.register(name, email, password) } finally { loading.value = false }
  }
  async function verify(email: string): Promise<void> {
    user.value = await api.verifyEmail(email)
  }
  function logout(): void {
    api.logout()
    user.value = null
  }
  return { user, loading, login, register, verify, logout }
})
