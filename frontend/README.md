# StayNest frontend

Vue 3 + TypeScript + Vite + Vue Router + Pinia + Tailwind CSS. No UI framework and no
component library: the design system lives in `src/style.css` and small components.

## Commands

```bash
npm install
npm run dev        # dev server on 5173
npm run build      # vue-tsc, then vite build
npm run typecheck  # types only
```

## Structure

```
src/
  components/    header, footer, property card, search bar, filters, calendar, map, ...
  composables/   toast queue, scroll reveal
  data/          properties (20 seeded), destinations, reviews, content, photos
  pages/         one file per route
  router/        routes, titles, scroll restoration
  services/      api.ts - the mock API and the seam for the Laravel backend
  stores/        search query, wishlist, auth, booking draft
  utils/         money and date formatting, query serialisation, SEO tags
```

## Where things are mocked

`src/services/api.ts` is the only place that knows data is fake. It simulates latency,
persists bookings and accounts in local storage, and applies the same filtering rules the
Laravel API will apply. Point these functions at real endpoints and the UI keeps working.

## Demo content

All listings, hosts, reviews and testimonials are fictional. Photography is placeholder
imagery served from Lorem Picsum (Unsplash-sourced), defined in `src/data/photos.ts`; replace
`photo()` and `galleryFor()` there to swap in real property photography. The map panel
states it is a placeholder and requires a provider key to become live.
