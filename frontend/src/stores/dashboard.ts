import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  Account, AccountMode, AppNotification, Conversation, Listing, Payout, PayoutMethod, RefundEstimate,
  Reservation, StayReview, SupportTicket,
} from '@/types/dashboard'
import { dashboardApi, refundEstimateFor } from '@/services/dashboardApi'
import { todayISO } from '@/utils/dates'

const isUpcoming = (r: Reservation) => r.status === 'upcoming'
const byDateAsc = (a: Reservation, b: Reservation) => a.checkIn.localeCompare(b.checkIn)
const byDateDesc = (a: Reservation, b: Reservation) => b.checkIn.localeCompare(a.checkIn)

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(true)
  const accounts = ref<Account[]>([])
  const listings = ref<Listing[]>([])
  const reservations = ref<Reservation[]>([])
  const conversations = ref<Conversation[]>([])
  const reviews = ref<StayReview[]>([])
  const payouts = ref<Payout[]>([])
  const notifications = ref<AppNotification[]>([])
  const tickets = ref<SupportTicket[]>([])
  const activeAccountId = ref<string | null>(null)

  const me = computed(() => accounts.value.find((a) => a.id === activeAccountId.value) ?? null)
  const mode = computed<AccountMode>(() => me.value?.mode ?? 'traveling')
  const isApprovedHost = computed(() => me.value?.host.status === 'approved')
  const hostStatus = computed(() => me.value?.host.status ?? 'none')

  const myGuestReservations = computed(() =>
    reservations.value.filter((r) => r.guestId === activeAccountId.value).sort(byDateAsc))
  const upcomingTrips = computed(() => myGuestReservations.value.filter(isUpcoming))
  const completedTrips = computed(() =>
    myGuestReservations.value.filter((r) => r.status === 'completed').sort(byDateDesc))
  const canceledTrips = computed(() =>
    myGuestReservations.value.filter((r) => r.status === 'canceled').sort(byDateDesc))
  const nextTrip = computed(() => upcomingTrips.value[0] ?? null)

  const myListings = computed(() => listings.value.filter((l) => l.hostId === activeAccountId.value))
  const publishedListings = computed(() => myListings.value.filter((l) => l.status === 'published'))
  const hostReservations = computed(() =>
    reservations.value.filter((r) => r.hostId === activeAccountId.value).sort(byDateAsc))
  const upcomingArrivals = computed(() =>
    hostReservations.value.filter((r) => r.status === 'upcoming' && r.checkIn >= todayISO()))
  const myPayouts = computed(() => payouts.value.slice().sort((a, b) => b.date.localeCompare(a.date)))

  const guestConversations = computed(() =>
    conversations.value.filter((c) => c.guestId === activeAccountId.value))
  const hostConversations = computed(() =>
    conversations.value.filter((c) => c.hostId === activeAccountId.value))

  const unreadForGuest = computed(() => guestConversations.value.reduce((n, c) =>
    n + c.messages.filter((m) => m.from !== 'guest' && !m.readByGuest).length, 0))
  const unreadForHost = computed(() => hostConversations.value.reduce((n, c) =>
    n + c.messages.filter((m) => m.from === 'guest' && !m.readByHost).length, 0))
  const unreadMessages = computed(() => (mode.value === 'hosting' ? unreadForHost.value : unreadForGuest.value))

  const myReviews = computed(() => reviews.value.filter((r) => r.guestId === activeAccountId.value))
  const hostReviews = computed(() => {
    const ids = new Set(myListings.value.map((l) => l.id))
    return reviews.value.filter((r) => ids.has(r.listingId)).sort((a, b) => b.at.localeCompare(a.at))
  })
  const reviewableTrips = computed(() =>
    completedTrips.value.filter((r) => !r.reviewId))

  const hostNotifications = computed(() =>
    notifications.value.filter((n) => (n.href ?? '').includes('/dashboard/host')))
  const guestNotifications = computed(() =>
    notifications.value.filter((n) => !(n.href ?? '').includes('/dashboard/host')))
  const unreadNotifications = computed(() => {
    const list = mode.value === 'hosting' ? hostNotifications.value : guestNotifications.value
    return list.filter((n) => !n.read).length
  })

  const earnings = computed(() => {
    const rows = myPayouts.value
    const completed = hostReservations.value.filter((r) => r.status === 'completed' || r.status === 'upcoming')
    const gross = completed.reduce((n, r) => n + r.payout.gross, 0)
    const fees = completed.reduce((n, r) => n + r.payout.platformFee, 0)
    const refunds = hostReservations.value
      .filter((r) => r.status === 'canceled')
      .reduce((n, r) => n + (r.refundAmount ?? 0), 0)
    return {
      gross,
      fees,
      refunds,
      net: gross - fees - refunds,
      collected: rows.filter((p) => p.status === 'completed').reduce((n, p) => n + p.net, 0),
      scheduled: rows.filter((p) => p.status !== 'completed').reduce((n, p) => n + p.net, 0),
      paidOut: rows.filter((p) => p.status === 'completed').reduce((n, p) => n + p.net, 0),
    }
  })

  function hydrateFrom(state: Awaited<ReturnType<typeof dashboardApi.load>>): void {
    accounts.value = state.accounts
    listings.value = state.listings
    reservations.value = state.reservations
    conversations.value = state.conversations
    reviews.value = state.reviews
    payouts.value = state.payouts
    notifications.value = state.notifications
    tickets.value = state.tickets
    accounts.value.forEach((a) => { a.mode = a.mode ?? 'traveling' })
  }

  async function load(accountId?: string | null): Promise<void> {
    loading.value = true
    try {
      const state = await dashboardApi.load()
      hydrateFrom(state)
      if (accountId) activeAccountId.value = accountId
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    const state = await dashboardApi.load()
    hydrateFrom(state)
  }

  function setAccount(id: string | null): void {
    activeAccountId.value = id
  }

  async function switchMode(next?: AccountMode): Promise<void> {
    const account = me.value
    if (!account) return
    const target = next ?? (account.mode === 'traveling' ? 'hosting' : 'traveling')
    if (target === 'hosting' && account.host.status !== 'approved') return
    const updated = await dashboardApi.updateAccount(account.id, { mode: target })
    const idx = accounts.value.findIndex((a) => a.id === updated.id)
    if (idx >= 0) accounts.value[idx] = updated
  }

  async function updateProfile(patch: Partial<Account>): Promise<void> {
    if (!me.value) return
    const updated = await dashboardApi.updateAccount(me.value.id, patch)
    const idx = accounts.value.findIndex((a) => a.id === updated.id)
    if (idx >= 0) accounts.value[idx] = updated
  }

  function reservation(code: string): Reservation | null {
    return reservations.value.find((r) => r.code === code) ?? null
  }
  function conversation(id: string): Conversation | null {
    return conversations.value.find((c) => c.id === id) ?? null
  }
  function conversationForReservation(code: string): Conversation | null {
    return conversations.value.find((c) => c.reservationCode === code) ?? null
  }
  function listing(id: string): Listing | null {
    return listings.value.find((l) => l.id === id) ?? null
  }
  function refundEstimate(code: string): RefundEstimate | null {
    const r = reservation(code)
    return r ? refundEstimateFor(r) : null
  }

  async function updateHostProfile(patch: Partial<NonNullable<Account['hostProfile']>>): Promise<void> {
    if (!me.value) return
    const base = me.value.hostProfile ?? ({} as NonNullable<Account['hostProfile']>)
    const hostProfile = { ...base, ...patch } as NonNullable<Account['hostProfile']>
    await updateProfile({ hostProfile })
  }

  async function setPayoutStatus(status: PayoutMethod['status']): Promise<void> {
    const hp = me.value?.hostProfile
    if (!hp) return
    await updateHostProfile({ payout: { ...hp.payout, status } })
  }

  async function cancelReservation(code: string): Promise<void> {
    const updated = await dashboardApi.cancelReservation(code)
    const idx = reservations.value.findIndex((r) => r.code === code)
    if (idx >= 0) reservations.value[idx] = updated
    await refresh()
  }

  async function sendMessage(conversationId: string, body: string): Promise<void> {
    const account = me.value
    if (!account) return
    const role = mode.value === 'hosting' ? 'host' : 'guest'
    const updated = await dashboardApi.sendMessage(conversationId, role, account.name, body)
    const idx = conversations.value.findIndex((c) => c.id === conversationId)
    if (idx >= 0) conversations.value[idx] = updated
  }

  async function markConversationRead(conversationId: string): Promise<void> {
    const role = mode.value === 'hosting' ? 'host' : 'guest'
    const updated = await dashboardApi.markRead(conversationId, role)
    if (updated) {
      const idx = conversations.value.findIndex((c) => c.id === conversationId)
      if (idx >= 0) conversations.value[idx] = updated
    }
  }

  async function addReview(code: string, rating: number, text: string): Promise<void> {
    await dashboardApi.addReview({ reservationCode: code, rating, text })
    await refresh()
  }

  async function replyToReview(reviewId: string, reply: string): Promise<void> {
    const updated = await dashboardApi.replyToReview(reviewId, reply)
    const idx = reviews.value.findIndex((r) => r.id === reviewId)
    if (idx >= 0) reviews.value[idx] = updated
  }

  async function saveListing(listing: Listing): Promise<Listing> {
    const saved = await dashboardApi.saveListing(listing)
    const idx = listings.value.findIndex((l) => l.id === saved.id)
    if (idx >= 0) listings.value[idx] = saved
    else listings.value.push(saved)
    return saved
  }

  async function setListingStatus(id: string, status: Listing['status'], reason?: string): Promise<void> {
    const updated = await dashboardApi.setListingStatus(id, status, reason)
    const idx = listings.value.findIndex((l) => l.id === id)
    if (idx >= 0) listings.value[idx] = updated
  }

  async function setBlockedDates(id: string, dates: string[]): Promise<void> {
    const updated = await dashboardApi.setBlockedDates(id, dates)
    const idx = listings.value.findIndex((l) => l.id === id)
    if (idx >= 0) listings.value[idx] = updated
  }

  async function submitTicket(subject: string, body: string): Promise<void> {
    const ticket = await dashboardApi.createTicket(subject, body)
    tickets.value.unshift(ticket)
  }

  async function submitApplication(profile: Account['hostProfile']): Promise<void> {
    if (!me.value) return
    const updated = await dashboardApi.submitApplication(me.value.id, profile)
    const idx = accounts.value.findIndex((a) => a.id === updated.id)
    if (idx >= 0) accounts.value[idx] = updated
  }

  async function simulateDecision(decision: 'approved' | 'rejected', reason?: string): Promise<void> {
    if (!me.value) return
    const updated = await dashboardApi.simulateDecision(me.value.id, decision, reason)
    const idx = accounts.value.findIndex((a) => a.id === updated.id)
    if (idx >= 0) accounts.value[idx] = updated
  }

  async function markNotificationsRead(ids: string[]): Promise<void> {
    await dashboardApi.markNotificationsRead(ids)
    notifications.value.forEach((n) => { if (ids.includes(n.id)) n.read = true })
  }

  return {
    loading, accounts, listings, reservations, conversations, reviews, payouts, notifications, tickets,
    activeAccountId, me, mode, isApprovedHost, hostStatus,
    myGuestReservations, upcomingTrips, completedTrips, canceledTrips, nextTrip,
    myListings, publishedListings, hostReservations, upcomingArrivals, myPayouts, earnings,
    guestConversations, hostConversations, unreadMessages, unreadForGuest, unreadForHost,
    myReviews, hostReviews, reviewableTrips, hostNotifications, guestNotifications, unreadNotifications,
    updateHostProfile, setPayoutStatus,
    load, refresh, setAccount, switchMode, updateProfile,
    reservation, conversation, conversationForReservation, listing, refundEstimate,
    cancelReservation, sendMessage, markConversationRead, addReview, replyToReview,
    saveListing, setListingStatus, setBlockedDates, submitTicket, submitApplication, simulateDecision,
    markNotificationsRead,
  }
})
