import type {
  Account, AppNotification, Conversation, DashboardState, Listing, Payout, RefundEstimate,
  Reservation, StayReview, SupportTicket,
} from '@/types/dashboard'
import { seedDashboard } from '@/data/dashboardSeed'
import { properties } from '@/data/properties'
import { priceBreakdown } from './api'
import { addDays, daysBetween, todayISO } from '@/utils/dates'

/**
 * Dashboard mock API.
 *
 * Same shape as `services/api.ts`: every function below is one REST call in
 * milestone 3, and everything is persisted under a single localStorage key so
 * the demo survives reloads. Server-side authorization (ownership of a booking,
 * host scope on a listing) is NOT enforced here and must be enforced by Laravel
 * policies in milestone 3. See docs/api-contract.md.
 */
const KEY = 'staynest.dashboard.v2'
const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))

function read(): DashboardState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DashboardState
  } catch {
    /* fall through to a fresh seed */
  }
  const seeded = seedDashboard()
  localStorage.setItem(KEY, JSON.stringify(seeded))
  return seeded
}

function write(state: DashboardState): DashboardState {
  localStorage.setItem(KEY, JSON.stringify(state))
  return state
}

function update(mutator: (state: DashboardState) => void): DashboardState {
  const state = read()
  mutator(state)
  return write(state)
}

export function resetDemoData(): void {
  localStorage.removeItem(KEY)
}

/* ------------------------------- refunds ------------------------------- */

export function refundEstimateFor(reservation: Reservation, cancelOn = todayISO()): RefundEstimate {
  const days = daysBetween(cancelOn, reservation.checkIn)
  const paid = reservation.breakdown.total
  const policy = reservation.policy
  let ratio = 0
  let explanation = ''
  let deadline = reservation.checkIn

  if (policy === 'flexible') {
    ratio = days >= 1 ? 1 : 0
    deadline = addDays(reservation.checkIn, -1)
    explanation = days >= 1
      ? 'Flexible policy: full refund up to 24 hours before check-in.'
      : 'Flexible policy: cancellations inside 24 hours are not refundable.'
  } else if (policy === 'moderate') {
    ratio = days >= 5 ? 1 : days >= 1 ? 0.5 : 0
    deadline = addDays(reservation.checkIn, -5)
    explanation = days >= 5
      ? 'Moderate policy: full refund up to 5 days before check-in.'
      : days >= 1
        ? 'Moderate policy: 50% refund when cancelling between 5 days and 24 hours before check-in.'
        : 'Moderate policy: no refund inside 24 hours of check-in.'
  } else {
    ratio = days >= 7 ? 0.5 : 0
    deadline = addDays(reservation.checkIn, -7)
    explanation = days >= 7
      ? 'Strict policy: 50% refund up to 7 days before check-in.'
      : 'Strict policy: no refund inside 7 days of check-in.'
  }

  const refund = Math.round(paid * ratio)
  return { refund, kept: paid - refund, policy, explanation, deadline }
}

/* -------------------------------- listings ------------------------------ */

function listingPublicMirror(listing: Listing): void {
  // Keeps the public catalogue in step when a demo listing is published, so the
  // milestone 1 site reflects dashboard changes the way the real API will.
  const existing = properties.find((p) => p.slug === listing.slug)
  if (!existing) return
  existing.title = listing.title
  existing.pricePerNight = listing.pricePerNight
  existing.cleaningFee = listing.cleaningFee
  existing.guests = listing.guests
  existing.bedrooms = listing.bedrooms
  existing.baths = listing.baths
  existing.photos = listing.photos
  existing.amenities = listing.amenities
  existing.houseRules = listing.houseRules
  existing.blocked = listing.blocked
}

export const dashboardApi = {
  async load(): Promise<DashboardState> {
    await wait(260)
    return read()
  },

  reset(): void {
    resetDemoData()
  },

  /* accounts */
  async account(id: string): Promise<Account | null> {
    await wait(80)
    return read().accounts.find((a) => a.id === id) ?? null
  },
  async updateAccount(id: string, patch: Partial<Account>): Promise<Account> {
    await wait(160)
    const state = update((s) => {
      const a = s.accounts.find((x) => x.id === id)
      if (a) Object.assign(a, patch)
    })
    return state.accounts.find((a) => a.id === id)!
  },

  /* host onboarding */
  async submitApplication(id: string, profile: Account['hostProfile']): Promise<Account> {
    await wait(420)
    const state = update((s) => {
      const a = s.accounts.find((x) => x.id === id)
      if (!a) return
      a.hostProfile = profile
      a.host = {
        status: 'pending',
        submittedAt: new Date().toISOString(),
        decidedAt: null,
        rejectionReason: null,
        reviewedBy: null,
      }
    })
    return state.accounts.find((a) => a.id === id)!
  },
  /** Demo-only shortcut so the pending, approved and rejected states can all be seen. */
  async simulateDecision(id: string, decision: 'approved' | 'rejected', reason?: string): Promise<Account> {
    await wait(380)
    const state = update((s) => {
      const a = s.accounts.find((x) => x.id === id)
      if (!a) return
      a.host = {
        status: decision,
        submittedAt: a.host.submittedAt,
        decidedAt: new Date().toISOString(),
        rejectionReason: decision === 'rejected' ? (reason ?? 'Listing details could not be verified.') : null,
        reviewedBy: 'StayNest host review (simulated)',
      }
      if (decision === 'approved') a.mode = 'hosting'
    })
    return state.accounts.find((a) => a.id === id)!
  },

  /* reservations */
  async reservations(): Promise<Reservation[]> {
    await wait(200)
    return read().reservations
  },
  async reservation(code: string): Promise<Reservation | null> {
    await wait(140)
    return read().reservations.find((r) => r.code === code) ?? null
  },
  async cancelReservation(code: string): Promise<Reservation> {
    await wait(420)
    const state = update((s) => {
      const r = s.reservations.find((x) => x.code === code)
      if (!r) return
      const estimate = refundEstimateFor(r)
      r.status = 'canceled'
      r.paymentStatus = 'refunded'
      r.canceledAt = new Date().toISOString()
      r.refundAmount = estimate.refund
      const c = s.conversations.find((x) => x.reservationCode === code)
      if (c) {
        c.messages.push({
          id: `m_${Date.now()}`,
          from: 'support',
          authorName: 'StayNest support',
          body: `Reservation ${r.reference} was cancelled. Refund of $${estimate.refund} issued under the ${r.policy} policy.`,
          at: new Date().toISOString(),
          readByGuest: false,
          readByHost: true,
        })
      }
    })
    return state.reservations.find((r) => r.code === code)!
  },

  /* conversations */
  async sendMessage(conversationId: string, from: 'guest' | 'host', authorName: string, body: string): Promise<Conversation> {
    await wait(200)
    const state = update((s) => {
      const c = s.conversations.find((x) => x.id === conversationId)
      if (!c) return
      c.messages.push({
        id: `m_${Date.now()}`,
        from,
        authorName,
        body,
        at: new Date().toISOString(),
        readByGuest: from === 'guest',
        readByHost: from === 'host',
      })
    })
    return state.conversations.find((c) => c.id === conversationId)!
  },
  async markRead(conversationId: string, role: 'guest' | 'host'): Promise<Conversation | null> {
    const state = update((s) => {
      const c = s.conversations.find((x) => x.id === conversationId)
      if (!c) return
      c.messages.forEach((m) => {
        if (role === 'guest') m.readByGuest = true
        else m.readByHost = true
      })
    })
    return state.conversations.find((c) => c.id === conversationId) ?? null
  },

  /* reviews */
  async addReview(input: { reservationCode: string; rating: number; text: string }): Promise<StayReview> {
    await wait(380)
    const state = update((s) => {
      const r = s.reservations.find((x) => x.code === input.reservationCode)
      if (!r) throw new Error('Reservation not found')
      if (r.reviewId) throw new Error('This stay already has a review')
      const review: StayReview = {
        id: `rev_${r.code}`,
        reservationCode: r.code,
        listingId: r.listingId,
        propertySlug: r.propertySlug,
        propertyTitle: r.propertyTitle,
        guestId: r.guestId,
        guestName: r.guestName,
        rating: input.rating,
        text: input.text.trim(),
        at: new Date().toISOString(),
        hostReply: null,
        hostRepliedAt: null,
      }
      s.reviews.push(review)
      r.reviewId = review.id
    })
    return state.reviews[state.reviews.length - 1]
  },
  async replyToReview(reviewId: string, reply: string): Promise<StayReview> {
    await wait(240)
    const state = update((s) => {
      const rv = s.reviews.find((x) => x.id === reviewId)
      if (rv) {
        rv.hostReply = reply.trim()
        rv.hostRepliedAt = new Date().toISOString()
      }
    })
    return state.reviews.find((r) => r.id === reviewId)!
  },

  /* listings */
  async saveListing(listing: Listing): Promise<Listing> {
    await wait(300)
    const state = update((s) => {
      const existing = s.listings.find((l) => l.id === listing.id)
      listing.updatedAt = new Date().toISOString()
      if (existing) Object.assign(existing, listing)
      else s.listings.push(listing)
      if (listing.status === 'published') listingPublicMirror(listing)
    })
    return state.listings.find((l) => l.id === listing.id)!
  },
  async deleteListing(id: string): Promise<void> {
    await wait(200)
    update((s) => {
      s.listings = s.listings.filter((l) => l.id !== id)
    })
  },
  async setListingStatus(id: string, status: Listing['status'], reason?: string): Promise<Listing> {
    await wait(260)
    const state = update((s) => {
      const l = s.listings.find((x) => x.id === id)
      if (!l) return
      l.status = status
      l.updatedAt = new Date().toISOString()
      l.rejectionReason = status === 'rejected' ? (reason ?? 'Listing needs more detail before it can go live.') : null
      if (status === 'pending') l.submittedAt = new Date().toISOString()
      if (status === 'published') l.publishedAt = new Date().toISOString()
      if (status === 'published') listingPublicMirror(l)
    })
    return state.listings.find((l) => l.id === id)!
  },
  async setBlockedDates(id: string, dates: string[]): Promise<Listing> {
    await wait(240)
    const state = update((s) => {
      const l = s.listings.find((x) => x.id === id)
      if (l) {
        l.blocked = [...new Set(dates)].sort()
        listingPublicMirror(l)
      }
    })
    return state.listings.find((l) => l.id === id)!
  },

  /* payouts */
  async payouts(): Promise<Payout[]> {
    await wait(180)
    return read().payouts
  },

  /* notifications */
  async rememberNotification(notification: AppNotification): Promise<void> {
    update((s) => {
      s.notifications.unshift(notification)
    })
  },
  async markNotificationsRead(ids: string[]): Promise<void> {
    update((s) => {
      s.notifications.forEach((n) => {
        if (ids.includes(n.id)) n.read = true
      })
    })
  },

  /* support */
  async createTicket(subject: string, body: string): Promise<SupportTicket> {
    await wait(280)
    const state = update((s) => {
      s.tickets.unshift({
        id: `tk_${Date.now()}`,
        subject,
        body,
        status: 'open',
        at: new Date().toISOString(),
        reply: null,
      })
    })
    return state.tickets[0]
  },
}

/** Suggested nightly price band shown in the listing editor, from comparable stays. */
export function priceHint(state: string): { low: number; high: number } {
  const sameState = properties.filter((p) => p.stateCode === state)
  const pool = sameState.length ? sameState : properties
  const prices = pool.map((p) => p.pricePerNight).sort((a, b) => a - b)
  const low = prices[Math.floor(prices.length * 0.25)]
  const high = prices[Math.floor(prices.length * 0.75)]
  return { low, high }
}

export { priceBreakdown }
