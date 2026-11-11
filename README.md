# StayNest

A USA vacation rental marketplace, built as an Airbnb-inspired MVP with original branding.

## Status

| Milestone | Scope | State |
| --- | --- | --- |
| 1 | Public website and booking frontend | Complete, on `develop` |
| 2 | Customer dashboard | Not started |
| 3 | Laravel REST API + MySQL | Not started |

## Repository layout

```
frontend/          Vue 3 SPA (this milestone)
docs/              API contract for the Laravel backend
```

The frontend is a standalone Vite application today so milestone 3 can add the Laravel
API alongside it without restructuring. Nothing in `frontend/` assumes a particular
backend host: every call goes through `frontend/src/services/api.ts`.

## Quick start

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check and build to dist/
npm run preview      # serve the production build
```

Requires Node 20+ and npm 10+.

## What works

- Search with destination, dates and guests, stored in URL query parameters so results are
  shareable and the back button behaves.
- Filters for price, property type, bedrooms, bathrooms, guests and amenities, plus sorting
  by recommended, price or rating, and a list/map toggle.
- Property pages with photo collage, full-screen gallery, availability calendar with
  blocked dates, host profile, amenities, house rules, reviews and related stays.
- Booking flow: date and guest validation, price breakdown, guest details, policy
  acceptance, simulated payment, then processing, success and failure screens.
- Wishlist that survives a reload, kept in local storage.
- Responsive layouts verified at 390px, 834px and 1440px, with keyboard navigation,
  focus-visible states and reduced-motion support.

## Demo content

All 20 properties, hosts, reviews and testimonials are fictional and labelled as demo
content in the interface. Photography is placeholder imagery (see
`frontend/src/data/photos.ts`). Nothing here is a real listing and no real payment can be
taken; the checkout is explicitly a simulation.

## Known limitations

- AI image generation was unavailable while building this milestone, so listing photos are
  licensed placeholders. Each property has a stable set, but the images are not visually
  matched to the property type. Swapping in real photography means editing one file.
- The map is a labelled placeholder with approximate pins. A real provider (Mapbox or
  Google) needs an API key before it can render tiles.
- Auth screens validate input and persist a session in local storage, but there is no
  server. Email verification, password reset and account management are UI-complete and
  wired to mock endpoints.
