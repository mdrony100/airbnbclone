import type { Property, Review } from '@/types'
import { DEMO_REVIEW_TEXT } from './properties'
import { seeded } from '@/utils/dates'

const GUESTS = [
  ['Hannah Cole', 'HC'], ['Diego Marín', 'DM'], ['Sarah Whitfield', 'SW'], ['Ade Okafor', 'AO'],
  ['Lena Fischer', 'LF'], ['Chris Patel', 'CP'], ['Maya Chen', 'MC'], ['Owen Brady', 'OB'],
  ['Isabel Ruiz', 'IR'], ['Noah Grant', 'NG'], ['Priya Raman', 'PR'], ['Elliot Jones', 'EJ'],
]

/** Deterministic demo reviews: the same stay always renders the same reviews. */
export function reviewsFor(property: Property): Review[] {
  const rand = seeded('reviews-' + property.slug)
  const count = Math.min(property.reviewCount, 12)
  const out: Review[] = []
  for (let i = 0; i < Math.min(count, 8); i++) {
    const g = GUESTS[Math.floor(rand() * GUESTS.length)]
    const base = DEMO_REVIEW_TEXT[Math.floor(rand() * DEMO_REVIEW_TEXT.length)]
    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November'][Math.floor(rand() * 11)]
    out.push({
      id: `${property.slug}-r${i}`,
      guest: g[0],
      initials: g[1],
      date: `${month} ${2024 + Math.floor(rand() * 2)}`,
      rating: base.rating,
      text: base.text,
      demo: true,
    })
  }
  return out
}

export function ratingBreakdown(property: Property): { label: string; value: number }[] {
  const rand = seeded('breakdown-' + property.slug)
  const labels = ['Cleanliness', 'Accuracy', 'Check-in', 'Communication', 'Location', 'Value']
  return labels.map((label) => ({ label, value: Math.round((4.6 + rand() * 0.4) * 10) / 10 }))
}
