export type PropertyType = 'house' | 'apartment' | 'cabin' | 'villa' | 'beachhouse'

export interface Host {
  name: string
  initials: string
  superhost: boolean
  joined: string
  bio: string
  responseRate: number
  responseTime: string
}

export interface Review {
  id: string
  guest: string
  initials: string
  date: string
  rating: number
  text: string
  demo: true
}

export interface Amenity {
  id: string
  label: string
  icon: string
  group: 'essentials' | 'features' | 'safety'
}

export interface Property {
  id: string
  slug: string
  title: string
  type: PropertyType
  summary: string
  city: string
  state: string
  stateCode: string
  region: 'West' | 'South' | 'Midwest' | 'Northeast' | 'Southwest' | 'Pacific'
  lat: number
  lng: number
  pricePerNight: number
  cleaningFee: number
  rating: number
  reviewCount: number
  guests: number
  bedrooms: number
  beds: number
  baths: number
  amenities: string[]
  host: Host
  description: string[]
  houseRules: string[]
  photos: string[]
  featured: boolean
  collections: string[]
  /** ISO dates that are already booked, used by the demo availability calendar */
  blocked: string[]
}

export interface Destination {
  slug: string
  name: string
  state: string
  blurb: string
  photo: string
}

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating'

export interface SearchQuery {
  destination: string
  checkIn: string
  checkOut: string
  guests: number
  minPrice: number
  maxPrice: number
  types: PropertyType[]
  bedrooms: number
  bathrooms: number
  amenities: string[]
  sort: SortKey
  page: number
  view: 'list' | 'map'
}

export interface PriceBreakdown {
  nights: number
  nightly: number
  cleaning: number
  platform: number
  tax: number
  total: number
}

export interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
}

export type BookingStatus = 'processing' | 'confirmed' | 'failed'

export interface Booking {
  code: string
  propertySlug: string
  propertyTitle: string
  propertyPhoto: string
  city: string
  state: string
  checkIn: string
  checkOut: string
  guests: number
  guest: GuestDetails
  breakdown: PriceBreakdown
  status: BookingStatus
  createdAt: string
  failureReason?: string
}

export interface SessionUser {
  name: string
  email: string
  verified: boolean
}
