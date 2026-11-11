/**
 * Demo photography.
 *
 * AI image generation was unavailable for this milestone, so listing photos are
 * licensed placeholders served by Lorem Picsum (photography sourced from
 * Unsplash, used under the Unsplash licence). Every image is referenced only
 * from here, so replacing the demo set with real or generated photography is a
 * single-file change: swap `photo()` for local imports and the rest of the app
 * keeps working untouched.
 */
const SIZES = { card: [900, 700], hero: [1900, 1200], thumb: [420, 320], gallery: [1500, 1100] } as const

export function photo(seed: string, size: keyof typeof SIZES = 'card'): string {
  const [w, h] = SIZES[size]
  return `https://picsum.photos/seed/staynest-${seed}/${w}/${h}`
}

export function galleryFor(slug: string): string[] {
  return ['a', 'b', 'c', 'd', 'e'].map((k) => photo(`${slug}-${k}`, 'gallery'))
}

export function heroPhoto(): string {
  return 'https://picsum.photos/seed/staynest-hero-coast/1900/1200'
}
