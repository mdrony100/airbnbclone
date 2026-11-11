import type { PropertyType, SearchQuery, SortKey } from '@/types'
import { addDays, todayISO } from './dates'

export const DEFAULT_QUERY: SearchQuery = {
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  minPrice: 0,
  maxPrice: 900,
  types: [],
  bedrooms: 0,
  bathrooms: 0,
  amenities: [],
  sort: 'recommended',
  page: 1,
  view: 'list',
}

const SORTS: SortKey[] = ['recommended', 'price-asc', 'price-desc', 'rating']
const TYPES: PropertyType[] = ['house', 'apartment', 'cabin', 'villa', 'beachhouse']

export function parseQuery(raw: Record<string, unknown>): SearchQuery {
  const num = (v: unknown, fallback: number): number => {
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 ? n : fallback
  }
  const list = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String)
    if (typeof v === 'string' && v.length) return v.split(',').map((s) => s.trim()).filter(Boolean)
    return []
  }
  const types = list(raw.types).filter((t): t is PropertyType => (TYPES as string[]).includes(t))
  const sort = (SORTS as string[]).includes(String(raw.sort)) ? (raw.sort as SortKey) : 'recommended'

  return {
    destination: typeof raw.destination === 'string' ? raw.destination : '',
    checkIn: typeof raw.checkIn === 'string' ? raw.checkIn : '',
    checkOut: typeof raw.checkOut === 'string' ? raw.checkOut : '',
    guests: num(raw.guests, 1),
    minPrice: num(raw.minPrice, 0),
    maxPrice: num(raw.maxPrice, 900),
    types,
    bedrooms: num(raw.bedrooms, 0),
    bathrooms: num(raw.bathrooms, 0),
    amenities: list(raw.amenities),
    sort,
    page: Math.max(1, num(raw.page, 1)),
    view: raw.view === 'map' ? 'map' : 'list',
  }
}

export function toQueryObject(q: SearchQuery): Record<string, string> {
  const out: Record<string, string> = {}
  if (q.destination) out.destination = q.destination
  if (q.checkIn) out.checkIn = q.checkIn
  if (q.checkOut) out.checkOut = q.checkOut
  if (q.guests > 1) out.guests = String(q.guests)
  if (q.minPrice > 0) out.minPrice = String(q.minPrice)
  if (q.maxPrice !== DEFAULT_QUERY.maxPrice) out.maxPrice = String(q.maxPrice)
  if (q.types.length) out.types = q.types.join(',')
  if (q.bedrooms) out.bedrooms = String(q.bedrooms)
  if (q.bathrooms) out.bathrooms = String(q.bathrooms)
  if (q.amenities.length) out.amenities = q.amenities.join(',')
  if (q.sort !== 'recommended') out.sort = q.sort
  if (q.page > 1) out.page = String(q.page)
  if (q.view === 'map') out.view = 'map'
  return out
}

export function activeFilterCount(q: SearchQuery): number {
  let n = 0
  if (q.minPrice > 0 || q.maxPrice !== DEFAULT_QUERY.maxPrice) n++
  n += q.types.length ? 1 : 0
  if (q.bedrooms) n++
  if (q.bathrooms) n++
  n += q.amenities.length
  return n
}

export function nextWeekend(): { checkIn: string; checkOut: string } {
  const now = new Date()
  const day = now.getDay()
  const toFriday = (5 - day + 7) % 7 || 7
  const checkIn = addDays(todayISO(), toFriday)
  return { checkIn, checkOut: addDays(checkIn, 2) }
}
