import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/services/api'
import type { SessionUser } from '@/types'

const ACCOUNT_KEY = 'staynest.session.account.v1'

/** Demo accounts that exist in the seeded dashboard data. */
export const DEMO_ACCOUNTS = {
  guest: { id: 'acc_ada', email: 'guest@staynest.demo', label: 'Ada Lovelace (guest and host)' },
  host: { id: 'acc_marisol', email: 'host@staynest.demo', label: 'Marisol Vega (host)' },
} as const

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(api.currentUser())
  const accountId = ref<string | null>(localStorage.getItem(ACCOUNT_KEY))
  const loading = ref(false)

  const isSignedIn = computed(() => Boolean(user.value || accountId.value))

  function rememberAccount(id: string | null): void {
    accountId.value = id
    if (id) localStorage.setItem(ACCOUNT_KEY, id)
    else localStorage.removeItem(ACCOUNT_KEY)
  }

  function accountIdForEmail(email: string): string | null {
    const normalised = email.trim().toLowerCase()
    if (normalised === DEMO_ACCOUNTS.guest.email) return DEMO_ACCOUNTS.guest.id
    if (normalised === DEMO_ACCOUNTS.host.email) return DEMO_ACCOUNTS.host.id
    return null
  }

  async function login(email: string, password: string): Promise<void> {
    loading.value = true
    try {
      user.value = await api.login(email, password)
      rememberAccount(accountIdForEmail(email) ?? DEMO_ACCOUNTS.guest.id)
    } finally {
      loading.value = false
    }
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    loading.value = true
    try {
      user.value = await api.register(name, email, password)
      rememberAccount(accountIdForEmail(email) ?? DEMO_ACCOUNTS.guest.id)
    } finally {
      loading.value = false
    }
  }

  /** Demo-only shortcut so reviewers can enter either side of the marketplace. */
  function demoSignIn(role: 'guest' | 'host'): string {
    const account = DEMO_ACCOUNTS[role]
    user.value = {
      name: role === 'guest' ? 'Ada Lovelace' : 'Marisol Vega',
      email: account.email,
      verified: true,
    }
    rememberAccount(account.id)
    return account.id
  }

  async function verify(email: string): Promise<void> {
    user.value = await api.verifyEmail(email)
  }

  function logout(): void {
    api.logout()
    user.value = null
    rememberAccount(null)
  }

  return { user, accountId, loading, isSignedIn, login, register, verify, logout, demoSignIn }
})
