import type {
  Booking, BookingStatus, Destination, GuestDetails, PriceBreakdown, Property, SearchQuery, SessionUser,
} from '@/types'
import { properties, propertyBySlug } from '@/data/properties'
import { destinations } from '@/data/destinations'
import { nightsBetween } from '@/utils/dates'

/**
 * Mock API layer.
 *
 * Every function here mirrors the REST contract the Laravel API will implement
 * in milestone 3, so swapping this module for real fetch calls is the only
 * change needed:
 *
 *   GET    /api/properties                -> { data, meta }
 *   GET    /api/properties/{slug}         -> Property
 *   GET    /api/properties/{slug}/related -> Property[]
 *   GET    /api/destinations              -> Destination[]
 *   GET    /api/properties/{slug}/availability?from&to -> { blocked: string[] }
 *   POST   /api/bookings                  -> Booking
 *   POST   /api/bookings/{code}/confirm    -> Booking
 *   GET    /api/bookings/{code}           -> Booking
 *   POST   /api/auth/login|register|forgot|reset
 */

const KEY = {
  wishlist: 'staynest.wishlist.v1',
  bookings: 'staynest.bookings.v1',
  users: 'staynest.users.v1',
  session: 'staynest.session.v1',
}

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage may be unavailable in private mode: the app still works in memory */
  }
}

const wait = (ms = 260): Promise<void> => new Promise((r) => setTimeout(r, ms))

export const PLATFORM_FEE_RATE = 0.09
export const TAX_RATE = 0.085
export const PER_PAGE = 9

export function priceBreakdown(property: Property, checkIn: string, checkOut: string): PriceBreakdown {
  const nights = Math.max(1, nightsBetween(checkIn, checkOut) || 1)
  const nightly = property.pricePerNight * nights
  const cleaning = property.cleaningFee
  const platform = Math.round(nightly * PLATFORM_FEE_RATE)
  const tax = Math.round((nightly + cleaning + platform) * TAX_RATE)
  return { nights, nightly, cleaning, platform, tax, total: nightly + cleaning + platform + tax }
}

export function unavailableDates(property: Property): string[] {
  return property.blocked
}

export function isRangeAvailable(property: Property, checkIn: string, checkOut: string): boolean {
  if (!checkIn || !checkOut) return true
  const nights = nightsBetween(checkIn, checkOut)
  if (nights < 1) return false
  const blocked = new Set(property.blocked)
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn + 'T12:00:00')
    d.setDate(d.getDate() + i)
    if (blocked.has(d.toISOString().slice(0, 10))) return false
  }
  return true
}

export interface SearchResult {
  data: Property[]
  meta: { page: number; perPage: number; total: number; totalPages: number }
}

export const api = {
  async destinations(): Promise<Destination[]> {
    await wait(120)
    return destinations
  },

  async searchProperties(q: SearchQuery): Promise<SearchResult> {
    await wait(320)
    let rows = properties.slice()

    if (q.destination) {
      const needle = q.destination.toLowerCase()
      rows = rows.filter((p) =>
        p.city.toLowerCase().includes(needle) ||
        p.state.toLowerCase().includes(needle) ||
        p.slug.includes(needle.replace(/\s+/g, '-')),
      )
    }
    if (q.guests > 1) rows = rows.filter((p) => p.guests >= q.guests)
    if (q.minPrice > 0) rows = rows.filter((p) => p.pricePerNight >= q.minPrice)
    if (q.maxPrice) rows = rows.filter((p) => p.pricePerNight <= q.maxPrice)
    if (q.types.length) rows = rows.filter((p) => q.types.includes(p.type))
    if (q.bedrooms) rows = rows.filter((p) => p.bedrooms >= q.bedrooms)
    if (q.bathrooms) rows = rows.filter((p) => p.baths >= q.bathrooms)
    if (q.amenities.length) rows = rows.filter((p) => q.amenities.every((a) => p.amenities.includes(a)))
    if (q.checkIn && q.checkOut) rows = rows.filter((p) => isRangeAvailable(p, q.checkIn, q.checkOut))

    switch (q.sort) {
      case 'price-asc': rows.sort((a, b) => a.pricePerNight - b.pricePerNight); break
      case 'price-desc': rows.sort((a, b) => b.pricePerNight - a.pricePerNight); break
      case 'rating': rows.sort((a, b) => b.rating - a.rating); break
      default: rows.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating)
    }

    const total = rows.length
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
    const page = Math.min(q.page, totalPages)
    return { data: rows.slice((page - 1) * PER_PAGE, page * PER_PAGE), meta: { page, perPage: PER_PAGE, total, totalPages } }
  },

  async property(slug: string): Promise<Property | null> {
    await wait(180)
    return propertyBySlug(slug) ?? null
  },

  async featured(limit = 6): Promise<Property[]> {
    await wait(160)
    return properties.filter((p) => p.featured).slice(0, limit)
  },

  async collection(name: string, limit = 4): Promise<Property[]> {
    await wait(140)
    return properties.filter((p) => p.collections.includes(name)).slice(0, limit)
  },

  async related(slug: string, limit = 4): Promise<Property[]> {
    await wait(140)
    const base = propertyBySlug(slug)
    if (!base) return []
    return properties
      .filter((p) => p.slug !== slug)
      .sort((a, b) => {
        const score = (x: Property) => (x.type === base.type ? 2 : 0) + (x.region === base.region ? 1 : 0)
        return score(b) - score(a)
      })
      .slice(0, limit)
  },

  async availability(slug: string): Promise<{ blocked: string[] }> {
    await wait(120)
    const p = propertyBySlug(slug)
    return { blocked: p ? p.blocked : [] }
  },

  async createBooking(input: {
    propertySlug: string
    checkIn: string
    checkOut: string
    guests: number
    guest: GuestDetails
  }): Promise<Booking> {
    await wait(420)
    const property = propertyBySlug(input.propertySlug)
    if (!property) throw new Error('That stay could not be found.')
    if (nightsBetween(input.checkIn, input.checkOut) < 1) throw new Error('Choose at least one night.')
    if (input.guests > property.guests) throw new Error(`This stay sleeps up to ${property.guests} guests.`)
    if (!isRangeAvailable(property, input.checkIn, input.checkOut)) throw new Error('Those dates are no longer available.')

    const booking: Booking = {
      code: 'SN-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      propertySlug: property.slug,
      propertyTitle: property.title,
      propertyPhoto: property.photos[0],
      city: property.city,
      state: property.state,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      guest: input.guest,
      breakdown: priceBreakdown(property, input.checkIn, input.checkOut),
      status: 'processing',
      createdAt: new Date().toISOString(),
    }
    const all = read<Booking[]>(KEY.bookings, [])
    write(KEY.bookings, [booking, ...all])
    return booking
  },

  /**
   * Demo payment result. A card ending 0002 fails, everything else succeeds,
   * mirroring the usual sandbox convention so the failure screen is testable.
   */
  async confirmBooking(code: string, cardNumber: string): Promise<Booking> {
    await wait(1400)
    const all = read<Booking[]>(KEY.bookings, [])
    const idx = all.findIndex((b) => b.code === code)
    if (idx === -1) throw new Error('That booking could not be found.')
    const fails = cardNumber.replace(/\s+/g, '').endsWith('0002')
    const status: BookingStatus = fails ? 'failed' : 'confirmed'
    all[idx] = { ...all[idx], status, failureReason: fails ? 'The card was declined by the issuer (demo).' : undefined }
    write(KEY.bookings, all)
    return all[idx]
  },

  async booking(code: string): Promise<Booking | null> {
    await wait(120)
    return read<Booking[]>(KEY.bookings, []).find((b) => b.code === code) ?? null
  },

  async myBookings(): Promise<Booking[]> {
    await wait(120)
    return read<Booking[]>(KEY.bookings, [])
  },

  wishlist(): string[] {
    return read<string[]>(KEY.wishlist, [])
  },

  setWishlist(slugs: string[]): void {
    write(KEY.wishlist, slugs)
  },

  currentUser(): SessionUser | null {
    return read<SessionUser | null>(KEY.session, null)
  },

  async login(email: string, password: string): Promise<SessionUser> {
    await wait(400)
    const users = read<(SessionUser & { password: string })[]>(KEY.users, [])
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!found || found.password !== password) throw new Error('That email and password do not match.')
    const user: SessionUser = { name: found.name, email: found.email, verified: found.verified }
    write(KEY.session, user)
    return user
  },

  async register(name: string, email: string, password: string): Promise<SessionUser> {
    await wait(450)
    const users = read<(SessionUser & { password: string })[]>(KEY.users, [])
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('An account with that email already exists.')
    }
    const user = { name: name.trim(), email: email.trim(), verified: false, password }
    write(KEY.users, [...users, user])
    const session: SessionUser = { name: user.name, email: user.email, verified: false }
    write(KEY.session, session)
    return session
  },

  async verifyEmail(email: string): Promise<SessionUser> {
    await wait(350)
    const users = read<(SessionUser & { password: string })[]>(KEY.users, [])
    const next = users.map((u) => (u.email === email ? { ...u, verified: true } : u))
    write(KEY.users, next)
    const session = read<SessionUser | null>(KEY.session, null)
    if (session && session.email === email) {
      const updated = { ...session, verified: true }
      write(KEY.session, updated)
      return updated
    }
    return { name: email.split('@')[0], email, verified: true }
  },

  async requestReset(email: string): Promise<void> {
    await wait(400)
    if (!email.includes('@')) throw new Error('Enter a valid email address.')
  },

  async resetPassword(email: string, password: string): Promise<void> {
    await wait(400)
    const users = read<(SessionUser & { password: string })[]>(KEY.users, [])
    const next = users.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, password } : u))
    write(KEY.users, next)
  },

  logout(): void {
    write(KEY.session, null)
  },
}
