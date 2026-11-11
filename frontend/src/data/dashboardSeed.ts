import type { DashboardState, Listing, Reservation, StayReview } from '@/types/dashboard'
import { properties } from './properties'
import { priceBreakdown } from '@/services/api'
import { galleryFor } from './photos'
import { addDays, todayISO } from '@/utils/dates'

const today = todayISO()
const iso = (offset: number) => addDays(today, offset)
const stamp = (offset: number, hour = 10) => `${iso(offset)}T${String(hour).padStart(2, '0')}:15:00.000Z`

const prop = (slug: string) => {
  const p = properties.find((x) => x.slug === slug)
  if (!p) throw new Error(`seed property missing: ${slug}`)
  return p
}

const ADA = 'acc_ada'
const MARISOL = 'acc_marisol'

function stay(input: {
  code: string
  slug: string
  checkIn: number
  nights: number
  guests: number
  hostId: string
  hostName: string
  guestId?: string
  guestName?: string
  guestEmail?: string
  status: Reservation['status']
  policy?: Reservation['policy']
  canceledOffset?: number
  refundAmount?: number
  reviewed?: boolean
}): Reservation {
  const p = prop(input.slug)
  const checkIn = iso(input.checkIn)
  const checkOut = iso(input.checkIn + input.nights)
  const b = priceBreakdown(p, checkIn, checkOut)
  return {
    code: input.code,
    listingId: `lst_${p.slug}`,
    propertySlug: p.slug,
    propertyTitle: p.title,
    propertyPhoto: galleryFor(p.slug)[0],
    city: p.city,
    state: p.state,
    addressLine: `${120 + (p.id.length % 80)} ${p.city} Ridge Road`,
    checkIn,
    checkOut,
    guests: input.guests,
    guestId: input.guestId ?? ADA,
    guestName: input.guestName ?? 'Ada Lovelace',
    guestEmail: input.guestEmail ?? 'guest@staynest.demo',
    hostId: input.hostId,
    hostName: input.hostName,
    breakdown: b,
    payout: {
      gross: b.nightly + b.cleaning,
      platformFee: b.platform,
      net: b.nightly + b.cleaning - b.platform,
    },
    status: input.status,
    paymentStatus: input.status === 'canceled' ? 'refunded' : 'paid',
    policy: input.policy ?? 'moderate',
    createdAt: stamp(input.checkIn - 12, 14),
    canceledAt: input.canceledOffset !== undefined ? stamp(input.canceledOffset, 9) : undefined,
    refundAmount: input.refundAmount,
    reviewId: input.reviewed ? `rev_${input.code}` : undefined,
    reference: input.code,
  }
}

const LISTING_META: Record<string, { status: Listing['status']; rejectionReason?: string; submittedOffset?: number; publishedOffset?: number }> = {
  'hudson-valley-farmhouse': { status: 'published', publishedOffset: -140 },
  'boulder-creek-house': { status: 'published', publishedOffset: -95 },
  'tahoe-ridge-cabin': { status: 'pending', submittedOffset: -2 },
  'charleston-piazza-flat': { status: 'draft' },
  'marfa-desert-studio': { status: 'rejected', submittedOffset: -16, rejectionReason: 'Photos are too dark to judge the space, and the description does not mention that the studio shares a driveway with the main house.' },
}

export function seedDashboard(): DashboardState {
  const listings: Listing[] = Object.entries(LISTING_META).map(([slug, meta]) => {
    const p = prop(slug)
    return {
      id: `lst_${slug}`,
      hostId: ADA,
      slug,
      title: p.title,
      type: p.type,
      description: p.description.join('\n\n'),
      city: p.city,
      state: p.state,
      stateCode: p.stateCode,
      addressLine: `${40 + (p.id.length % 60)} Orchard Lane`,
      zip: '00000',
      lat: p.lat,
      lng: p.lng,
      guests: p.guests,
      bedrooms: p.bedrooms,
      beds: p.beds,
      baths: p.baths,
      amenities: p.amenities,
      houseRules: p.houseRules,
      photos: p.photos,
      coverIndex: 0,
      pricePerNight: p.pricePerNight,
      cleaningFee: p.cleaningFee,
      minStay: 2,
      policy: 'moderate',
      blocked: p.blocked,
      status: meta.status,
      rejectionReason: meta.rejectionReason ?? null,
      submittedAt: meta.submittedOffset !== undefined ? stamp(meta.submittedOffset) : null,
      publishedAt: meta.publishedOffset !== undefined ? stamp(meta.publishedOffset) : null,
      updatedAt: stamp(meta.submittedOffset ?? meta.publishedOffset ?? -3),
    }
  })

  const reservations: Reservation[] = [
    stay({ code: 'SN-CABIN18', slug: 'cypress-point-cabin', checkIn: 18, nights: 4, guests: 2, hostId: MARISOL, hostName: 'Marisol Vega', status: 'upcoming' }),
    stay({ code: 'SN-DESRT42', slug: 'joshua-tree-desert-villa', checkIn: 46, nights: 3, guests: 4, hostId: MARISOL, hostName: 'Marisol Vega', status: 'upcoming' }),
    stay({ code: 'SN-SAVAN3', slug: 'savannah-forsyth-flat', checkIn: -38, nights: 3, guests: 2, hostId: MARISOL, hostName: 'Marisol Vega', status: 'completed', reviewed: true }),
    stay({ code: 'SN-BLURDG7', slug: 'asheville-blue-ridge-cabin', checkIn: -78, nights: 5, guests: 3, hostId: MARISOL, hostName: 'Marisol Vega', status: 'completed' }),
    stay({ code: 'SN-MAPLE5', slug: 'stowe-maple-cabin', checkIn: -11, nights: 4, guests: 2, hostId: MARISOL, hostName: 'Marisol Vega', status: 'canceled', canceledOffset: -14, refundAmount: 410 }),
    // Guests staying in Ada's own listings
    stay({ code: 'SN-HOST11', slug: 'hudson-valley-farmhouse', checkIn: 6, nights: 3, guests: 4, hostId: ADA, hostName: 'Ada Lovelace', guestId: 'acc_elena', guestName: 'Elena Ruiz', guestEmail: 'elena@example.com', status: 'upcoming' }),
    stay({ code: 'SN-HOST12', slug: 'boulder-creek-house', checkIn: 21, nights: 2, guests: 2, hostId: ADA, hostName: 'Ada Lovelace', guestId: 'acc_tom', guestName: 'Tom Becker', guestEmail: 'tom@example.com', status: 'upcoming' }),
    stay({ code: 'SN-HOST09', slug: 'hudson-valley-farmhouse', checkIn: -24, nights: 4, guests: 2, hostId: ADA, hostName: 'Ada Lovelace', guestId: 'acc_priya', guestName: 'Priya Nair', guestEmail: 'priya@example.com', status: 'completed' }),
    stay({ code: 'SN-HOST06', slug: 'boulder-creek-house', checkIn: -61, nights: 3, guests: 4, hostId: ADA, hostName: 'Ada Lovelace', guestId: 'acc_elena', guestName: 'Elena Ruiz', guestEmail: 'elena@example.com', status: 'completed' }),
  ]

  const reviews: StayReview[] = [
    {
      id: 'rev_SN-SAVAN3', reservationCode: 'SN-SAVAN3', listingId: 'lst_savannah-forsyth-flat', propertySlug: 'savannah-forsyth-flat',
      propertyTitle: prop('savannah-forsyth-flat').title, guestId: ADA, guestName: 'Ada Lovelace', rating: 5,
      text: 'Shaded courtyard, thick walls and a host who leaves you alone but answers in minutes. The flat is a five minute walk from Forsyth Park and you can hear the fountain at night.',
      at: stamp(-33, 18), hostReply: 'Thank you Ada, come back any time the azaleas are out.', hostRepliedAt: stamp(-32, 8),
    },
    {
      id: 'rev_SN-HOST09', reservationCode: 'SN-HOST09', listingId: 'lst_hudson-valley-farmhouse', propertySlug: 'hudson-valley-farmhouse',
      propertyTitle: prop('hudson-valley-farmhouse').title, guestId: 'acc_priya', guestName: 'Priya Nair', rating: 5,
      text: 'Quiet, warm and genuinely comfortable. The kitchen is properly stocked, which is rare. We cooked every night.',
      at: stamp(-19, 11), hostReply: null, hostRepliedAt: null,
    },
    {
      id: 'rev_SN-HOST06', reservationCode: 'SN-HOST06', listingId: 'lst_boulder-creek-house', propertySlug: 'boulder-creek-house',
      propertyTitle: prop('boulder-creek-house').title, guestId: 'acc_elena', guestName: 'Elena Ruiz', rating: 4,
      text: 'Great base for the trails and the creek is lovely. Only note is street parking gets tight after six.',
      at: stamp(-56, 9), hostReply: 'Fair point about parking, I now send the driveway code before arrival.', hostRepliedAt: stamp(-55, 12),
    },
  ]

  return {
    accounts: [
      {
        id: ADA, name: 'Ada Lovelace', email: 'guest@staynest.demo', phone: '+1 (415) 555-0142',
        initials: 'AL', avatarTone: 'coral', verified: true, joined: '2024-03-11', mode: 'traveling',
        host: { status: 'approved', submittedAt: stamp(-150), decidedAt: stamp(-143), rejectionReason: null, reviewedBy: 'StayNest host review' },
        hostProfile: {
          displayName: 'Ada', about: 'Weekend farmer, slow traveller, and a host who leaves good coffee in the kitchen.',
          contactEmail: 'ada.hosting@staynest.demo', phone: '+1 (415) 555-0142',
          businessName: 'Lovelace Cottages', businessType: 'individual',
          address: { line1: '18 Orchard Lane', city: 'Hudson', state: 'New York', zip: '12534' },
          payout: { status: 'connected', method: 'Bank transfer', holder: 'Ada Lovelace', last4: '4417', schedule: 'Weekly, Fridays' },
          rulesAccepted: true,
        },
        notifications: { emailBookings: true, emailMessages: true, emailMarketing: false, pushBookings: true, pushMessages: true },
      },
      {
        id: MARISOL, name: 'Marisol Vega', email: 'host@staynest.demo', phone: '+1 (805) 555-0199',
        initials: 'MV', avatarTone: 'sage', verified: true, joined: '2023-07-02', mode: 'hosting',
        host: { status: 'approved', submittedAt: stamp(-400), decidedAt: stamp(-395), rejectionReason: null, reviewedBy: 'StayNest host review' },
        hostProfile: {
          displayName: 'Marisol', about: 'Coastal cabins and desert villas, run by our family since 2019.',
          contactEmail: 'marisol@staynest.demo', phone: '+1 (805) 555-0199',
          businessName: 'Vega Stays LLC', businessType: 'company',
          address: { line1: '900 Cliff Road', city: 'Big Sur', state: 'California', zip: '93920' },
          payout: { status: 'connected', method: 'Bank transfer', holder: 'Vega Stays LLC', last4: '9082', schedule: 'Weekly, Fridays' },
          rulesAccepted: true,
        },
        notifications: { emailBookings: true, emailMessages: true, emailMarketing: true, pushBookings: false, pushMessages: true },
      },
    ],
    listings,
    reservations,
    conversations: [
      {
        id: 'cnv_cabin', reservationCode: 'SN-CABIN18', listingId: 'lst_cypress-point-cabin',
        propertyTitle: prop('cypress-point-cabin').title, propertyPhoto: galleryFor('cypress-point-cabin')[0],
        guestId: ADA, guestName: 'Ada Lovelace', hostId: MARISOL, hostName: 'Marisol Vega',
        messages: [
          { id: 'm1', from: 'guest', authorName: 'Ada Lovelace', body: 'Hi Marisol, we are driving down from San Francisco and will probably land around 7pm. Is late check-in alright?', at: stamp(-2, 16), readByHost: true, readByGuest: true },
          { id: 'm2', from: 'host', authorName: 'Marisol Vega', body: 'Absolutely. The keypad code is sent the morning of arrival, and the porch light stays on until 10pm. There is a torch in the hall cupboard too.', at: stamp(-2, 17), readByHost: true, readByGuest: true },
          { id: 'm3', from: 'guest', authorName: 'Ada Lovelace', body: 'Perfect. One more thing, is the coffee grinder still there? I remember it from the listing photos.', at: stamp(-1, 9), readByHost: false, readByGuest: true },
        ],
      },
      {
        id: 'cnv_desert', reservationCode: 'SN-DESRT42', listingId: 'lst_joshua-tree-desert-villa',
        propertyTitle: prop('joshua-tree-desert-villa').title, propertyPhoto: galleryFor('joshua-tree-desert-villa')[0],
        guestId: ADA, guestName: 'Ada Lovelace', hostId: MARISOL, hostName: 'Marisol Vega',
        messages: [
          { id: 'm1', from: 'host', authorName: 'Marisol Vega', body: 'Your dates are confirmed. I will send the gate code a week before, and the water is delivered on Tuesdays.', at: stamp(-9, 12), readByHost: true, readByGuest: true },
          { id: 'm2', from: 'guest', authorName: 'Ada Lovelace', body: 'Thanks! Do you have a favourite trail for sunrise?', at: stamp(-8, 19), readByHost: true, readByGuest: true },
        ],
      },
      {
        id: 'cnv_host11', reservationCode: 'SN-HOST11', listingId: 'lst_hudson-valley-farmhouse',
        propertyTitle: prop('hudson-valley-farmhouse').title, propertyPhoto: galleryFor('hudson-valley-farmhouse')[0],
        guestId: 'acc_elena', guestName: 'Elena Ruiz', hostId: ADA, hostName: 'Ada Lovelace',
        messages: [
          { id: 'm1', from: 'guest', authorName: 'Elena Ruiz', body: 'Hello! We are four adults and one toddler. Is there a travel cot, or should we bring ours?', at: stamp(-1, 20), readByHost: false, readByGuest: true },
          { id: 'm2', from: 'guest', authorName: 'Elena Ruiz', body: 'Also, we would love a late checkout on the Sunday if the calendar allows it.', at: stamp(0, 8), readByHost: false, readByGuest: true },
        ],
      },
      {
        id: 'cnv_host09', reservationCode: 'SN-HOST09', listingId: 'lst_hudson-valley-farmhouse',
        propertyTitle: prop('hudson-valley-farmhouse').title, propertyPhoto: galleryFor('hudson-valley-farmhouse')[0],
        guestId: 'acc_priya', guestName: 'Priya Nair', hostId: ADA, hostName: 'Ada Lovelace',
        messages: [
          { id: 'm1', from: 'guest', authorName: 'Priya Nair', body: 'We left the keys in the lockbox and stripped the beds. Thank you for a lovely week.', at: stamp(-20, 10), readByHost: true, readByGuest: true },
          { id: 'm2', from: 'host', authorName: 'Ada Lovelace', body: 'Thank you Priya, left you a review. Safe travels home.', at: stamp(-20, 11), readByHost: true, readByGuest: true },
        ],
      },
    ],
    reviews,
    payouts: [
      { id: 'pay_1', reservationCode: 'SN-HOST09', propertyTitle: prop('hudson-valley-farmhouse').title, date: iso(-17), gross: 1180, platformFee: 106, refunds: 0, net: 1074, status: 'completed', method: 'Bank transfer •••• 4417' },
      { id: 'pay_2', reservationCode: 'SN-HOST06', propertyTitle: prop('boulder-creek-house').title, date: iso(-54), gross: 905, platformFee: 81, refunds: 0, net: 824, status: 'completed', method: 'Bank transfer •••• 4417' },
      { id: 'pay_3', reservationCode: 'SN-HOST12', propertyTitle: prop('boulder-creek-house').title, date: iso(23), gross: 610, platformFee: 55, refunds: 0, net: 555, status: 'scheduled', method: 'Bank transfer •••• 4417' },
      { id: 'pay_4', reservationCode: 'SN-HOST11', propertyTitle: prop('hudson-valley-farmhouse').title, date: iso(9), gross: 1125, platformFee: 101, refunds: 0, net: 1024, status: 'held', method: 'Released 24h after check-in' },
    ],
    notifications: [
      { id: 'nt1', kind: 'message', title: 'Elena Ruiz sent you 2 messages', body: 'About the travel cot and a late checkout for Hudson Valley Farmhouse.', at: stamp(0, 8), read: false, href: '/dashboard/messages/cnv_host11' },
      { id: 'nt2', kind: 'booking', title: 'New reservation confirmed', body: 'Tom Becker booked Boulder Creek House for 2 guests.', at: stamp(-1, 15), read: false, href: '/dashboard/host/reservations/SN-HOST12' },
      { id: 'nt3', kind: 'listing', title: 'Tahoe Ridge Cabin is in review', body: 'Submitted 2 days ago. Most listings are reviewed within 24 hours.', at: stamp(-2, 13), read: true, href: '/dashboard/host/listings' },
      { id: 'nt4', kind: 'payout', title: 'Payout of $1,074 sent', body: 'For Hudson Valley Farmhouse, reservation SN-HOST09.', at: stamp(-17, 9), read: true, href: '/dashboard/host/earnings' },
      { id: 'nt5', kind: 'system', title: 'Prototype data notice', body: 'Every figure in this dashboard is simulated for the milestone 2 demo.', at: stamp(-20, 8), read: true },
    ],
    tickets: [
      { id: 'tk1', subject: 'Refund timing question', body: 'I cancelled a stay in Stowe and the refund is showing as processing. How long does it usually take?', status: 'answered', at: stamp(-11, 12), reply: 'Refunds to the original card usually land in 5 to 10 business days. Your refund was issued on the cancellation date.' },
      { id: 'tk2', subject: 'Listing photos look cropped', body: 'My cover photo is cut off on mobile search results.', status: 'open', at: stamp(-3, 17), reply: null },
    ],
  }
}
