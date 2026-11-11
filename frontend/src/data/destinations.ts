import type { Destination } from '@/types'
import { photo } from './photos'

export const destinations: Destination[] = [
  { slug: 'big-sur', name: 'Big Sur', state: 'California', blurb: 'Cliff roads, redwoods, and fog that burns off by noon.', photo: photo('dest-bigsur', 'card') },
  { slug: 'lake-tahoe', name: 'Lake Tahoe', state: 'California', blurb: 'Alpine water, granite shorelines, ski runs in winter.', photo: photo('dest-tahoe', 'card') },
  { slug: 'joshua-tree', name: 'Joshua Tree', state: 'California', blurb: 'Boulders, dark skies, and desert houses built for dusk.', photo: photo('dest-joshua', 'card') },
  { slug: 'aspen', name: 'Aspen', state: 'Colorado', blurb: 'Timber lodges, powder days, and long fireside evenings.', photo: photo('dest-aspen', 'card') },
  { slug: 'sedona', name: 'Sedona', state: 'Arizona', blurb: 'Red rock trails straight from the veranda.', photo: photo('dest-sedona', 'card') },
  { slug: 'miami-beach', name: 'Miami Beach', state: 'Florida', blurb: 'Art Deco blocks, warm water, late dinners.', photo: photo('dest-miami', 'card') },
  { slug: 'cannon-beach', name: 'Cannon Beach', state: 'Oregon', blurb: 'Sea stacks, driftwood, and a very good chowder.', photo: photo('dest-cannon', 'card') },
  { slug: 'asheville', name: 'Asheville', state: 'North Carolina', blurb: 'Blue ridge views with a city worth leaving the cabin for.', photo: photo('dest-asheville', 'card') },
  { slug: 'hudson-valley', name: 'Hudson Valley', state: 'New York', blurb: 'Farmhouses, orchards, and two hours from the city.', photo: photo('dest-hudson', 'card') },
  { slug: 'stowe', name: 'Stowe', state: 'Vermont', blurb: 'Maple runs, covered bridges, quiet snow.', photo: photo('dest-stowe', 'card') },
]
