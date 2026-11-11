import type { PriceBreakdown, PropertyType } from './index'

export type AccountMode = 'traveling' | 'hosting'
export type HostStatus = 'none' | 'pending' | 'approved' | 'rejected'
export type ListingStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'paused'
export type BookingState = 'upcoming' | 'completed' | 'canceled'

export type CancellationPolicy = 'flexible' | 'moderate' | 'strict'

export interface NotificationPrefs {
  emailBookings: boolean
  emailMessages: boolean
  emailMarketing: boolean
  pushBookings: boolean
  pushMessages: boolean
}

export interface PayoutMethod {
  status: 'not_started' | 'pending' | 'connected'
  method: string
  holder: string
  last4: string
  schedule: string
}

export interface HostProfile {
  displayName: string
  about: string
  contactEmail: string
  phone: string
  businessName: string
  businessType: 'individual' | 'company'
  address: { line1: string; city: string; state: string; zip: string }
  payout: PayoutMethod
  rulesAccepted: boolean
}

export interface HostApplication {
  status: HostStatus
  submittedAt: string | null
  decidedAt: string | null
  rejectionReason: string | null
  reviewedBy: string | null
}

export interface Account {
  id: string
  name: string
  email: string
  phone: string
  initials: string
  avatarTone: string
  verified: boolean
  joined: string
  mode: AccountMode
  host: HostApplication
  hostProfile: HostProfile | null
  notifications: NotificationPrefs
}

export interface Listing {
  id: string
  hostId: string
  slug: string
  title: string
  type: PropertyType
  description: string
  city: string
  state: string
  stateCode: string
  addressLine: string
  zip: string
  lat: number
  lng: number
  guests: number
  bedrooms: number
  beds: number
  baths: number
  amenities: string[]
  houseRules: string[]
  photos: string[]
  coverIndex: number
  pricePerNight: number
  cleaningFee: number
  minStay: number
  policy: CancellationPolicy
  blocked: string[]
  status: ListingStatus
  rejectionReason: string | null
  submittedAt: string | null
  publishedAt: string | null
  updatedAt: string
}

export interface Reservation {
  code: string
  listingId: string
  propertySlug: string
  propertyTitle: string
  propertyPhoto: string
  city: string
  state: string
  addressLine: string
  checkIn: string
  checkOut: string
  guests: number
  guestId: string
  guestName: string
  guestEmail: string
  hostId: string
  hostName: string
  breakdown: PriceBreakdown
  payout: { gross: number; platformFee: number; net: number }
  status: BookingState
  paymentStatus: 'paid' | 'refunded' | 'pending'
  policy: CancellationPolicy
  createdAt: string
  canceledAt?: string
  refundAmount?: number
  reviewId?: string
  reference: string
}

export interface ChatMessage {
  id: string
  from: 'guest' | 'host' | 'support'
  authorName: string
  body: string
  at: string
  readByHost: boolean
  readByGuest: boolean
}

export interface Conversation {
  id: string
  reservationCode: string
  listingId: string
  propertyTitle: string
  propertyPhoto: string
  guestId: string
  guestName: string
  hostId: string
  hostName: string
  messages: ChatMessage[]
}

export interface StayReview {
  id: string
  reservationCode: string
  listingId: string
  propertySlug: string
  propertyTitle: string
  guestId: string
  guestName: string
  rating: number
  text: string
  at: string
  hostReply: string | null
  hostRepliedAt: string | null
}

export interface Payout {
  id: string
  reservationCode: string
  propertyTitle: string
  date: string
  gross: number
  platformFee: number
  refunds: number
  net: number
  status: 'completed' | 'scheduled' | 'held'
  method: string
}

export interface AppNotification {
  id: string
  kind: 'booking' | 'message' | 'payout' | 'listing' | 'system'
  title: string
  body: string
  at: string
  read: boolean
  href?: string
}

export interface SupportTicket {
  id: string
  subject: string
  body: string
  status: 'open' | 'answered' | 'closed'
  at: string
  reply: string | null
}

export interface DashboardState {
  accounts: Account[]
  listings: Listing[]
  reservations: Reservation[]
  conversations: Conversation[]
  reviews: StayReview[]
  payouts: Payout[]
  notifications: AppNotification[]
  tickets: SupportTicket[]
}

export interface RefundEstimate {
  refund: number
  kept: number
  policy: CancellationPolicy
  explanation: string
  deadline: string
}
