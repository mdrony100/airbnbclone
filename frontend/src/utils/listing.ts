import type { Listing } from '@/types/dashboard'
import type { PropertyType } from '@/types'

export const LISTING_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'villa', label: 'Villa' },
  { value: 'beachhouse', label: 'Beach house' },
]

export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
] as const

const STATE_CODES: Record<string, string> = {
  California: 'CA', Colorado: 'CO', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Maine: 'ME', Massachusetts: 'MA',
  Michigan: 'MI', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', Oregon: 'OR', 'South Carolina': 'SC',
  Texas: 'TX', Utah: 'UT', Vermont: 'VT', Washington: 'WA', Arizona: 'AZ', Nevada: 'NV', Tennessee: 'TN',
}

export function newListing(hostId: string): Listing {
  const id = `lst_${Date.now().toString(36)}`
  return {
    id,
    hostId,
    slug: id,
    title: '',
    type: 'house',
    description: '',
    city: '',
    state: '',
    stateCode: '',
    addressLine: '',
    zip: '',
    lat: 39 + Math.random() * 2,
    lng: -98 + Math.random() * 2,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [],
    houseRules: [],
    photos: [],
    coverIndex: 0,
    pricePerNight: 180,
    cleaningFee: 60,
    minStay: 2,
    policy: 'moderate',
    blocked: [],
    status: 'draft',
    rejectionReason: null,
    submittedAt: null,
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  }
}

export function stateCodeFor(state: string): string {
  return STATE_CODES[state] ?? state.slice(0, 2).toUpperCase()
}

export interface StepError { field: string; message: string }

export function validateStep(step: number, listing: Listing): StepError[] {
  const errors: StepError[] = []
  if (step === 1) {
    if (!listing.type) errors.push({ field: 'type', message: 'Choose a property type.' })
    if (listing.title.trim().length < 8) errors.push({ field: 'title', message: 'Give the listing a title of at least 8 characters.' })
    if (listing.description.trim().length < 40) errors.push({ field: 'description', message: 'Write at least 40 characters describing the stay.' })
  }
  if (step === 2) {
    if (listing.addressLine.trim().length < 4) errors.push({ field: 'addressLine', message: 'Add the street address.' })
    if (!listing.city.trim()) errors.push({ field: 'city', message: 'Add the city.' })
    if (!listing.state) errors.push({ field: 'state', message: 'Choose the state.' })
    if (!/^\d{5}$/.test(listing.zip.trim())) errors.push({ field: 'zip', message: 'Enter a 5-digit ZIP code.' })
  }
  if (step === 3) {
    if (listing.guests < 1) errors.push({ field: 'guests', message: 'Allow at least one guest.' })
    if (listing.beds < 1) errors.push({ field: 'beds', message: 'Add at least one bed.' })
    if (listing.baths < 1) errors.push({ field: 'baths', message: 'Add at least one bathroom.' })
    if (listing.bedrooms < 0) errors.push({ field: 'bedrooms', message: 'Bedrooms cannot be negative.' })
  }
  if (step === 4) {
    if (listing.amenities.length < 3) errors.push({ field: 'amenities', message: 'Choose at least three amenities.' })
    if (listing.houseRules.length < 1) errors.push({ field: 'houseRules', message: 'Add at least one house rule.' })
  }
  if (step === 5) {
    if (listing.photos.length < 3) errors.push({ field: 'photos', message: 'Add at least three photos, including a cover image.' })
  }
  if (step === 6) {
    if (listing.pricePerNight < 20) errors.push({ field: 'pricePerNight', message: 'Nightly price must be at least $20.' })
    if (listing.cleaningFee < 0) errors.push({ field: 'cleaningFee', message: 'Cleaning fee cannot be negative.' })
    if (listing.minStay < 1) errors.push({ field: 'minStay', message: 'Minimum stay is at least one night.' })
  }
  return errors
}

export function validateListing(listing: Listing): StepError[] {
  return [1, 2, 3, 4, 5, 6].flatMap((s) => validateStep(s, listing))
}
