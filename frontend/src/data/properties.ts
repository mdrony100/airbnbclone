import type { Host, Property, PropertyType, Review } from '@/types'
import { galleryFor } from './photos'
import { addDays, seeded, todayISO } from '@/utils/dates'

interface Seed {
  slug: string
  title: string
  type: PropertyType
  city: string
  state: string
  stateCode: string
  region: Property['region']
  lat: number
  lng: number
  price: number
  cleaning: number
  rating: number
  reviews: number
  guests: number
  bedrooms: number
  beds: number
  baths: number
  host: string
  featured?: boolean
  collections?: string[]
  summary: string
  description: string[]
}

const HOST_BIOS: Record<string, string> = {
  Marisol: 'Coastal architect. I restore old beach cottages and keep the good parts.',
  Jonah: 'Ski patroller in winter, trail builder in summer. Ask me where the quiet runs are.',
  Priya: 'I run a small design studio and host two cabins I built with my brother.',
  Dell: 'Third-generation rancher. The desert is better in person than in photos.',
  Tessa: 'Former hotelier who thinks a good rental should feel like a friend lent you their place.',
  Marcus: 'Chef turned host. There is always something simmering when you arrive.',
  Aiko: 'Grew up on the island. I stock the kitchen with things I actually cook.',
  Ben: 'Carpenter, sailor, part-time tour guide on the weekends.',
}

const HOSTS: Host[] = Object.entries(HOST_BIOS).map(([name, bio], i) => ({
  name,
  initials: name.slice(0, 2).toUpperCase(),
  superhost: i % 3 !== 2,
  joined: ['2017', '2018', '2019', '2020', '2021'][i % 5],
  bio,
  responseRate: 96 + (i % 4),
  responseTime: ['within an hour', 'within a few hours', 'same day'][i % 3],
}))

const SEEDS: Seed[] = [
  {
    slug: 'cypress-point-cabin',
    title: 'Cypress Point Cabin',
    type: 'cabin',
    city: 'Big Sur', state: 'California', stateCode: 'CA', region: 'West',
    lat: 36.2704, lng: -121.8081, price: 420, cleaning: 180, rating: 4.94, reviews: 128,
    guests: 4, bedrooms: 2, beds: 2, baths: 2, host: 'Marisol', featured: true,
    collections: ['coastal', 'weekend'],
    summary: 'Cedar cabin on the ridge above the Pacific, with a deck built for watching fog roll in.',
    description: [
      'A quiet two-bedroom cabin ten minutes up a private road from the highway. The living room is one long window facing west, so the whole house fills with light in the afternoon.',
      'The kitchen is small but serious: gas range, sharp knives, a pantry stocked with coffee from a roaster in Carmel. Bring groceries, the nearest market is a 25 minute drive.',
      'Cell service is patchy by design. There is fibre wifi for anyone who needs it, and a landline for the rest.',
    ],
  },
  {
    slug: 'sands-end-beach-house',
    title: "Sand's End Beach House",
    type: 'beachhouse',
    city: 'Cannon Beach', state: 'Oregon', stateCode: 'OR', region: 'Pacific',
    lat: 45.8918, lng: -123.9615, price: 365, cleaning: 160, rating: 4.88, reviews: 214,
    guests: 8, bedrooms: 4, beds: 5, baths: 3, host: 'Tessa', featured: true,
    collections: ['coastal', 'family', 'weekend'],
    summary: 'Shingled beach house one dune back from the sand, with a wood stove and a deep porch.',
    description: [
      'Four bedrooms spread across two floors, which makes it work for two families or a group of friends who still want their own space.',
      'The porch is where everyone ends up. Two rockers, a long table, and a path straight over the dune to the beach.',
      'Wetsuits, beach chairs and a crab pot live in the shed. Help yourself.',
    ],
  },
  {
    slug: 'tahoe-ridge-cabin',
    title: 'Tahoe Ridge Cabin',
    type: 'cabin',
    city: 'South Lake Tahoe', state: 'California', stateCode: 'CA', region: 'West',
    lat: 38.9399, lng: -119.9772, price: 290, cleaning: 140, rating: 4.91, reviews: 176,
    guests: 6, bedrooms: 3, beds: 4, baths: 2, host: 'Jonah',
    collections: ['mountain', 'weekend'],
    summary: 'Timber A-frame with a hot tub under the pines, fifteen minutes from the lifts.',
    description: [
      'Built in 1974 and renovated in 2021, so it has the bones of an old ski cabin and none of the draft.',
      'Upstairs is one open room with a wood stove and a wall of windows. The bunk room sleeps four and is genuinely popular with kids.',
      'Hot tub on the lower deck, cleared after every snowfall.',
    ],
  },
  {
    slug: 'joshua-tree-desert-villa',
    title: 'Joshua Tree Desert Villa',
    type: 'villa',
    city: 'Joshua Tree', state: 'California', stateCode: 'CA', region: 'Southwest',
    lat: 34.1347, lng: -116.3131, price: 480, cleaning: 200, rating: 4.97, reviews: 96,
    guests: 6, bedrooms: 3, beds: 3, baths: 3, host: 'Dell', featured: true,
    collections: ['desert', 'design'],
    summary: 'Low-slung desert villa with an outdoor bath, a plunge pool and nothing but boulders behind it.',
    description: [
      'The house sits on five acres at the end of a dirt road, angled so no neighbour is visible from the pool.',
      'Concrete floors, plaster walls, and a kitchen that opens entirely to the courtyard. Designed for warm evenings.',
      'The outdoor tub fills in about ten minutes. Best at dusk, when the sky goes pink behind the rocks.',
    ],
  },
  {
    slug: 'sedona-red-rock-villa',
    title: 'Red Rock Villa',
    type: 'villa',
    city: 'Sedona', state: 'Arizona', stateCode: 'AZ', region: 'Southwest',
    lat: 34.8697, lng: -111.761, price: 395, cleaning: 175, rating: 4.86, reviews: 142,
    guests: 8, bedrooms: 4, beds: 4, baths: 3, host: 'Priya',
    collections: ['desert', 'family'],
    summary: 'Terracotta villa facing Cathedral Rock, with a long veranda and a courtyard fire pit.',
    description: [
      'Four bedrooms around a central courtyard, which keeps the house cool in the afternoon and loud in a good way at dinner.',
      'Trailheads for Cathedral Rock and Bell Rock are within a ten minute drive. The host keeps printed maps and a headlamp in the hall cupboard.',
      'Fire pit is wood-burning. Please check the county fire restrictions before lighting it in summer.',
    ],
  },
  {
    slug: 'aspen-hollow-lodge',
    title: 'Aspen Hollow Lodge',
    type: 'house',
    city: 'Aspen', state: 'Colorado', stateCode: 'CO', region: 'West',
    lat: 39.1911, lng: -106.8175, price: 780, cleaning: 320, rating: 4.95, reviews: 74,
    guests: 10, bedrooms: 5, beds: 6, baths: 4, host: 'Jonah', featured: true,
    collections: ['mountain', 'ski', 'family'],
    summary: 'Stone and timber lodge with a boot room, a sauna and space for ten.',
    description: [
      'A proper ski house: heated boot room at the entrance, drying racks for gloves, and a shuttle stop at the end of the drive.',
      'The main room has a twenty foot stone fireplace and enough seating for everyone to be in it at once.',
      'The sauna is wood-fired and takes about forty minutes to come up to temperature. Instructions are on the wall.',
    ],
  },
  {
    slug: 'boulder-creek-house',
    title: 'Boulder Creek House',
    type: 'house',
    city: 'Boulder', state: 'Colorado', stateCode: 'CO', region: 'West',
    lat: 40.015, lng: -105.2705, price: 310, cleaning: 150, rating: 4.82, reviews: 163,
    guests: 6, bedrooms: 3, beds: 4, baths: 2, host: 'Ben',
    collections: ['mountain', 'weekend'],
    summary: 'Creekside house with a bike workshop and direct access to the creek path.',
    description: [
      'The creek runs along the back of the property and you can hear it from every bedroom with the windows open.',
      'There is a real workshop in the garage: stand pump, tools, and a hose for washing bikes after the trails.',
      'Downtown is a twenty minute walk along the path, or four minutes on a bike.',
    ],
  },
  {
    slug: 'ocean-drive-apartment',
    title: 'Ocean Drive Apartment',
    type: 'apartment',
    city: 'Miami Beach', state: 'Florida', stateCode: 'FL', region: 'South',
    lat: 25.7825, lng: -80.13, price: 340, cleaning: 130, rating: 4.79, reviews: 288,
    guests: 4, bedrooms: 2, beds: 2, baths: 2, host: 'Marcus',
    collections: ['city', 'coastal'],
    summary: 'Art Deco two-bedroom one block from the sand, with a balcony over the boulevard.',
    description: [
      'Second floor of a 1939 building, restored in 2022 with the original terrazzo floors kept and the bathrooms replaced.',
      'The balcony faces the boulevard. It is lively at night, which is either the point or the reason to bring earplugs.',
      'Beach towels, chairs and an umbrella are in the hall closet.',
    ],
  },
  {
    slug: 'key-west-conch-cottage',
    title: 'Conch Cottage',
    type: 'beachhouse',
    city: 'Key West', state: 'Florida', stateCode: 'FL', region: 'South',
    lat: 24.5551, lng: -81.78, price: 410, cleaning: 165, rating: 4.9, reviews: 191,
    guests: 5, bedrooms: 3, beds: 3, baths: 2, host: 'Aiko',
    collections: ['coastal', 'island', 'weekend'],
    summary: 'Classic conch cottage with a shaded garden, outdoor shower and two cruiser bikes.',
    description: [
      'One of the small wooden houses the island is known for, with a wraparound porch and a garden that stays cool all day.',
      'Two cruiser bikes come with the cottage. The old town is flat and everything is ten minutes away.',
      'Outdoor shower off the back porch, which is the correct way to end a beach day.',
    ],
  },
  {
    slug: 'savannah-forsyth-flat',
    title: 'Forsyth Flat',
    type: 'apartment',
    city: 'Savannah', state: 'Georgia', stateCode: 'GA', region: 'South',
    lat: 32.0717, lng: -81.0957, price: 235, cleaning: 105, rating: 4.84, reviews: 207,
    guests: 4, bedrooms: 2, beds: 2, baths: 1, host: 'Tessa',
    collections: ['city', 'historic'],
    summary: 'Second-floor flat on a quiet square, with twelve foot ceilings and live oaks outside.',
    description: [
      'Tall windows, heart pine floors, and a sitting room that gets the morning sun through the oaks.',
      'Forsyth Park is two blocks one way, coffee and a bakery two blocks the other.',
      'Street parking is by permit. The host leaves a visitor pass in the kitchen drawer.',
    ],
  },
  {
    slug: 'bar-harbor-harborside-house',
    title: 'Harborside House',
    type: 'house',
    city: 'Bar Harbor', state: 'Maine', stateCode: 'ME', region: 'Northeast',
    lat: 44.3876, lng: -68.2039, price: 320, cleaning: 155, rating: 4.87, reviews: 119,
    guests: 7, bedrooms: 4, beds: 4, baths: 2, host: 'Ben',
    collections: ['coastal', 'family'],
    summary: 'White clapboard house above the harbour, with a screened porch and a wood stove.',
    description: [
      'The screened porch faces the water and is where breakfast happens, even in September with a blanket.',
      'Acadia entrance is a five minute drive. The host leaves a park pass on the hook by the door.',
      'Kitchen is stocked for lobster nights: two big pots, crackers, and a roll of paper towels you will need.',
    ],
  },
  {
    slug: 'cape-cod-shingle-house',
    title: 'Shingle House on the Neck',
    type: 'house',
    city: 'Wellfleet', state: 'Massachusetts', stateCode: 'MA', region: 'Northeast',
    lat: 41.9376, lng: -70.0325, price: 285, cleaning: 140, rating: 4.83, reviews: 155,
    guests: 6, bedrooms: 3, beds: 3, baths: 2, host: 'Marisol',
    collections: ['coastal', 'historic', 'weekend'],
    summary: 'Weathered shingle house with an outdoor shower and a path to the bay.',
    description: [
      'A classic Cape house that has been in the same family since the fifties, with the good kind of wear on the floors.',
      'The bay beach is a four minute walk down a sandy path. Warm water, big tides, no waves.',
      'Bikes in the shed for the ride into town, and a kettle that whistles.',
    ],
  },
  {
    slug: 'sleeping-bear-dunes-cabin',
    title: 'Sleeping Bear Dunes Cabin',
    type: 'cabin',
    city: 'Empire', state: 'Michigan', stateCode: 'MI', region: 'Midwest',
    lat: 44.8117, lng: -86.0533, price: 245, cleaning: 120, rating: 4.81, reviews: 133,
    guests: 5, bedrooms: 3, beds: 4, baths: 2, host: 'Priya',
    collections: ['lakeside', 'family', 'weekend'],
    summary: 'Timber cabin minutes from the dune climb, with a fire pit and a screened sleeping porch.',
    description: [
      'The lake is a short drive, the dunes are closer. The cabin is set back in the trees so the fire pit is genuinely private.',
      'Sleeping porch has two single beds and screens on three sides. Popular from June to September only.',
      'Firewood is provided. Please do not bring your own, to keep local pests out.',
    ],
  },
  {
    slug: 'taos-adobe-villa',
    title: 'Adobe Courtyard Villa',
    type: 'villa',
    city: 'Taos', state: 'New Mexico', stateCode: 'NM', region: 'Southwest',
    lat: 36.4072, lng: -105.5734, price: 340, cleaning: 150, rating: 4.89, reviews: 88,
    guests: 6, bedrooms: 3, beds: 3, baths: 2, host: 'Dell',
    collections: ['desert', 'design'],
    summary: 'Earth-walled adobe villa around a courtyard, with a kiva fireplace and mountain views.',
    description: [
      'Thick adobe walls keep the house cool without air conditioning, which is the entire trick.',
      'Kiva fireplace in the sitting room; firewood and matches are by the hearth. The chimney is cleaned each October.',
      'The courtyard has a table for six and a view of the Sangre de Cristo range.',
    ],
  },
  {
    slug: 'hudson-valley-farmhouse',
    title: 'Hudson Valley Farmhouse',
    type: 'house',
    city: 'Rhinebeck', state: 'New York', stateCode: 'NY', region: 'Northeast',
    lat: 41.9268, lng: -73.9126, price: 275, cleaning: 135, rating: 4.86, reviews: 172,
    guests: 8, bedrooms: 4, beds: 5, baths: 3, host: 'Tessa',
    collections: ['countryside', 'family', 'weekend'],
    summary: '1880s farmhouse on four acres, with a pond, an orchard and a very good porch.',
    description: [
      'Four bedrooms upstairs, all with window seats, and a kitchen that was extended in 2019 with a long table for eight.',
      'Apple trees in the orchard, a rowboat on the pond, and a fire pit with a stack of seasoned wood.',
      'Ten minutes to Rhinebeck for dinner, twenty to the train if you are coming up from the city.',
    ],
  },
  {
    slug: 'asheville-blue-ridge-cabin',
    title: 'Blue Ridge Frame',
    type: 'cabin',
    city: 'Asheville', state: 'North Carolina', stateCode: 'NC', region: 'South',
    lat: 35.5951, lng: -82.5515, price: 260, cleaning: 125, rating: 4.92, reviews: 236,
    guests: 6, bedrooms: 3, beds: 3, baths: 2, host: 'Jonah',
    collections: ['mountain', 'weekend'],
    summary: 'Glass-fronted cabin on a ridge with a wood-fired tub and long mountain views.',
    description: [
      'Built in 2020, mostly of glass and blackened timber, facing the ridge line.',
      'Wood-fired tub on the deck takes about an hour to heat. Start it when you arrive and eat late.',
      'The Blue Ridge Parkway is six minutes away, and there is a trailhead at the bottom of the access road.',
    ],
  },
  {
    slug: 'charleston-piazza-flat',
    title: 'Piazza Flat',
    type: 'apartment',
    city: 'Charleston', state: 'South Carolina', stateCode: 'SC', region: 'South',
    lat: 32.7765, lng: -79.9311, price: 250, cleaning: 110, rating: 4.8, reviews: 148,
    guests: 4, bedrooms: 2, beds: 2, baths: 1, host: 'Marcus',
    collections: ['city', 'historic'],
    summary: 'Single-house flat with a private piazza, two blocks from the market.',
    description: [
      'The piazza is yours alone and faces east, so it is the coolest spot on the street by four in the afternoon.',
      'Walk to the market in four minutes, to the water in fifteen. Most guests leave the car parked all week.',
      'Kitchen is small but well equipped, with a proper coffee ritual supplied.',
    ],
  },
  {
    slug: 'park-city-slope-side-condo',
    title: 'Slope Side Condo',
    type: 'apartment',
    city: 'Park City', state: 'Utah', stateCode: 'UT', region: 'West',
    lat: 40.6461, lng: -111.498, price: 305, cleaning: 145, rating: 4.85, reviews: 201,
    guests: 6, bedrooms: 3, beds: 4, baths: 2, host: 'Aiko',
    collections: ['mountain', 'ski', 'family'],
    summary: 'Three-bedroom condo with ski lockers, a shared hot tub and a shuttle at the door.',
    description: [
      'True ski-in, ski-out on the lower mountain, which matters more than the photos suggest.',
      'Heated ski locker in the lobby, shared hot tub a short walk away, and a shuttle stop right outside.',
      'Summer guests get mountain bike storage in the garage and trail access from the same door.',
    ],
  },
  {
    slug: 'stowe-maple-cabin',
    title: 'Maple Run Cabin',
    type: 'cabin',
    city: 'Stowe', state: 'Vermont', stateCode: 'VT', region: 'Northeast',
    lat: 44.4654, lng: -72.6874, price: 230, cleaning: 115, rating: 4.88, reviews: 167,
    guests: 4, bedrooms: 2, beds: 3, baths: 1, host: 'Ben',
    collections: ['mountain', 'weekend', 'ski'],
    summary: 'Small cabin on the maple run, with a wood stove and a porch that faces the mountain.',
    description: [
      'Two bedrooms, a sleeping loft for a third couple or two kids, and one bathroom that everyone shall share.',
      'The stove heats the whole place in twenty minutes. Firewood is stacked on the porch.',
      'The ski hill is twelve minutes away, a farm stand with the best cheddar in the state is eight.',
    ],
  },
  {
    slug: 'marfa-desert-studio',
    title: 'Marfa Light Studio',
    type: 'villa',
    city: 'Marfa', state: 'Texas', stateCode: 'TX', region: 'Southwest',
    lat: 30.3095, lng: -104.0207, price: 265, cleaning: 120, rating: 4.93, reviews: 64,
    guests: 3, bedrooms: 2, beds: 2, baths: 1, host: 'Priya',
    collections: ['desert', 'design'],
    summary: 'Restored adobe studio with a dark-sky deck, a record player and almost no neighbours.',
    description: [
      'One big studio room with a sleeping end and a sitting end, plus a small second bedroom off the courtyard.',
      'The deck faces east for sunrise and is far enough from town that the sky is genuinely dark.',
      'Records, books, and a very slow coffee routine are provided. Ask about the light watch nights.',
    ],
  },
]

function blockedWindows(slug: string): string[] {
  const rand = seeded(slug)
  const out: string[] = []
  const starts = [9, 27, 48, 71, 94]
  for (const offset of starts) {
    if (rand() < 0.55) {
      const start = addDays(todayISO(), offset + Math.floor(rand() * 5))
      const len = 2 + Math.floor(rand() * 4)
      for (let i = 0; i < len; i++) out.push(addDays(start, i))
    }
  }
  return out
}

export const properties: Property[] = SEEDS.map((s, i) => ({
  id: `stay_${String(i + 1).padStart(3, '0')}`,
  slug: s.slug,
  title: s.title,
  type: s.type,
  summary: s.summary,
  city: s.city,
  state: s.state,
  stateCode: s.stateCode,
  region: s.region,
  lat: s.lat,
  lng: s.lng,
  pricePerNight: s.price,
  cleaningFee: s.cleaning,
  rating: s.rating,
  reviewCount: s.reviews,
  guests: s.guests,
  bedrooms: s.bedrooms,
  beds: s.beds,
  baths: s.baths,
  amenities: pickAmenities(s.type, i),
  host: HOSTS.find((h) => h.name === s.host)!,
  description: s.description,
  houseRules: [
    'Check-in after 4:00 PM, check-out by 11:00 AM',
    'No parties or events',
    s.type === 'cabin' || s.type === 'house' ? 'No smoking indoors' : 'No smoking',
    'Pets welcome on request for select stays',
    'Quiet hours 10:00 PM to 8:00 AM',
  ],
  photos: galleryFor(s.slug),
  featured: Boolean(s.featured),
  collections: s.collections ?? [],
  blocked: blockedWindows(s.slug),
}))

function pickAmenities(type: PropertyType, i: number): string[] {
  const base = ['wifi', 'kitchen', 'heating', 'workspace', 'smoke-alarm', 'co-alarm', 'first-aid']
  const byType: Record<PropertyType, string[]> = {
    cabin: ['fireplace', 'hot-tub', 'free-parking', 'mountain-view', 'washers'],
    apartment: ['elevator', 'air-conditioning', 'tv', 'city-view', 'gym'],
    villa: ['pool', 'air-conditioning', 'outdoor-shower', 'fire-pit', 'free-parking'],
    house: ['fireplace', 'garden', 'free-parking', 'bbq', 'washers'],
    beachhouse: ['beach-access', 'outdoor-shower', 'bbq', 'washers', 'free-parking'],
  }
  const extra = byType[type]
  return [...base, ...extra.filter((_, idx) => (idx + i) % 4 !== 3)]
}

export const propertyBySlug = (slug: string): Property | undefined => properties.find((p) => p.slug === slug)

export const DEMO_REVIEW_TEXT: Omit<Review, 'id' | 'date' | 'guest' | 'initials' | 'demo'>[] = [
  { rating: 5, text: 'Exactly as described, and quieter than we expected. We walked to dinner every night and never moved the car.' },
  { rating: 5, text: 'The photos undersell the light. We spent most of the trip on the porch doing nothing at all.' },
  { rating: 4, text: 'Lovely house and a thoughtful host. Only note is the road in, take it slow after dark.' },
  { rating: 5, text: 'Spotless, easy check-in, and the kitchen had everything we needed for a proper breakfast every day.' },
  { rating: 5, text: 'Booked it for a work week and ended up staying an extra two days. The desk and the wifi both hold up.' },
  { rating: 4, text: 'Great for our group of six. Bathrooms are on the small side but the living space more than makes up for it.' },
]
