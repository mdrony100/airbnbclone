import type { Amenity } from '@/types'

export const AMENITIES: Amenity[] = [
  { id: 'wifi', label: 'Fast wifi', icon: 'wifi', group: 'essentials' },
  { id: 'kitchen', label: 'Full kitchen', icon: 'kitchen', group: 'essentials' },
  { id: 'heating', label: 'Heating', icon: 'heating', group: 'essentials' },
  { id: 'air-conditioning', label: 'Air conditioning', icon: 'ac', group: 'essentials' },
  { id: 'washers', label: 'Washer and dryer', icon: 'washer', group: 'essentials' },
  { id: 'workspace', label: 'Dedicated workspace', icon: 'desk', group: 'essentials' },
  { id: 'fireplace', label: 'Fireplace', icon: 'fire', group: 'features' },
  { id: 'hot-tub', label: 'Hot tub', icon: 'tub', group: 'features' },
  { id: 'pool', label: 'Pool', icon: 'pool', group: 'features' },
  { id: 'beach-access', label: 'Beach access', icon: 'beach', group: 'features' },
  { id: 'mountain-view', label: 'Mountain view', icon: 'mountain', group: 'features' },
  { id: 'city-view', label: 'City view', icon: 'city', group: 'features' },
  { id: 'garden', label: 'Garden', icon: 'garden', group: 'features' },
  { id: 'free-parking', label: 'Free parking', icon: 'parking', group: 'features' },
  { id: 'bbq', label: 'BBQ grill', icon: 'bbq', group: 'features' },
  { id: 'fire-pit', label: 'Fire pit', icon: 'firepit', group: 'features' },
  { id: 'outdoor-shower', label: 'Outdoor shower', icon: 'shower', group: 'features' },
  { id: 'tv', label: 'TV', icon: 'tv', group: 'features' },
  { id: 'elevator', label: 'Elevator', icon: 'elevator', group: 'features' },
  { id: 'gym', label: 'Gym', icon: 'gym', group: 'features' },
  { id: 'smoke-alarm', label: 'Smoke alarm', icon: 'smoke', group: 'safety' },
  { id: 'co-alarm', label: 'Carbon monoxide alarm', icon: 'co', group: 'safety' },
  { id: 'first-aid', label: 'First aid kit', icon: 'aid', group: 'safety' },
]

export const amenityLabel = (id: string): string => AMENITIES.find((a) => a.id === id)?.label ?? id

export const PROPERTY_TYPES = [
  { id: 'house', label: 'Houses' },
  { id: 'apartment', label: 'Apartments' },
  { id: 'cabin', label: 'Cabins' },
  { id: 'villa', label: 'Villas' },
  { id: 'beachhouse', label: 'Beach houses' },
] as const

export const HOW_IT_WORKS = [
  { step: '01', title: 'Find somewhere that fits', body: 'Search by destination and dates, then narrow down by price, size and the things that actually matter to you.' },
  { step: '02', title: 'Check the details', body: 'Every stay lists the real layout, the house rules and the full price breakdown before you commit to anything.' },
  { step: '03', title: 'Book and go', body: 'Reserve with your dates and guest count. You get the exact address once the booking is confirmed.' },
]

export const TESTIMONIALS = [
  { name: 'Nadia R.', location: 'Chicago, IL', text: 'We booked a cabin outside Asheville on a Thursday and were in it by Saturday. The price it showed was the price we paid.', rating: 5 },
  { name: 'Tom & Priya', location: 'Austin, TX', text: 'Third stay through StayNest this year. The houses are described honestly, which sounds like a low bar until you use other sites.', rating: 5 },
  { name: 'Ellis M.', location: 'Brooklyn, NY', text: 'Filtering by real things like bedrooms and a workspace made the shortlist obvious. No surprises at checkout.', rating: 5 },
  { name: 'Marco D.', location: 'Seattle, WA', text: 'Asked the host a question at 9pm and had an answer in twenty minutes. The place was even better than the photos.', rating: 5 },
]

export const FAQS = [
  { q: 'What is StayNest?', a: 'StayNest is a marketplace for vacation rentals across the United States. We list houses, apartments, cabins, villas and beach houses, and handle the booking from search through confirmation.' },
  { q: 'How much does it cost to book?', a: 'You pay the nightly rate for each night of your stay, a one-off cleaning fee set by the host, and our platform fee. Any applicable tax is included in the total shown before you pay.' },
  { q: 'When do I get the exact address?', a: 'The exact address and check-in instructions are released once a booking is confirmed. Until then, listings show an approximate location and a map of the surrounding area.' },
  { q: 'Can I change or cancel a booking?', a: 'Cancellation terms are set per stay and shown on the listing before you book. Free cancellation is available on most stays up to a set number of days before check-in.' },
  { q: 'What if something is wrong when I arrive?', a: 'Contact the host first through your booking, since most issues are solved fastest that way. If that does not resolve it, our support team will step in and help.' },
  { q: 'Is this a real booking platform yet?', a: 'Not yet. This is a demonstration build: checkout and payment are simulated, and the listings are fictional demo content created for the project. No payment is taken and no booking is real.' },
]

export const HOST_BENEFITS = [
  { title: 'You set the price', body: 'Nightly rate, cleaning fee and minimum stay are yours to choose. Change them whenever you like.' },
  { title: 'You keep control of the calendar', body: 'Block dates, set seasonal pricing, and decide how far ahead guests can book.' },
  { title: 'Transparent fees', body: 'A flat platform fee on completed stays. No listing fee, no subscription, no surprise deductions.' },
  { title: 'Support that answers', body: 'A real person on the other end of the line for booking issues, damage claims and payout questions.' },
]
