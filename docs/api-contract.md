# StayNest API contract

The Laravel API (milestone 3) should implement this contract. The frontend already calls
these shapes through `frontend/src/services/api.ts`, so the mock layer can be swapped for
real `fetch` calls without touching components.

Base URL: `/api`. All responses JSON. Amounts are numbers in USD unless stated otherwise.
Dates are `YYYY-MM-DD` in local calendar terms, not UTC instants.

## Properties

`GET /api/properties`

| Param | Type | Notes |
| --- | --- | --- |
| `destination` | string | Destination slug, matches `Destination.slug` |
| `checkIn`, `checkOut` | date | When both are present, exclude stays with blocked nights |
| `guests` | int | Minimum capacity |
| `minPrice`, `maxPrice` | int | Nightly rate bounds |
| `types` | csv | `house,apartment,cabin,villa,beachhouse` |
| `bedrooms`, `bathrooms` | int | Minimums |
| `amenities` | csv | All must be present |
| `sort` | enum | `recommended`, `price-asc`, `price-desc`, `rating` |
| `page`, `perPage` | int | Defaults `1`, `9` |

Response:

```json
{
  "data": [ { "id": 1, "slug": "cypress-point-cabin", "title": "Cypress Point Cabin", "city": "Big Sur", "state": "California", "pricePerNight": 320, "rating": 4.94, "reviewCount": 128, "guests": 4, "bedrooms": 2, "beds": 2, "bathrooms": 1.5, "type": "cabin", "photos": ["..."], "amenities": ["wifi"], "latitude": 36.27, "longitude": -121.81, "host": { "name": "Mira", "superhost": true } } ],
  "meta": { "page": 1, "perPage": 9, "total": 14, "totalPages": 2 }
}
```

`GET /api/properties/{slug}` returns a single property with `description`, `houseRules`,
`host`, and `blocked` (array of `YYYY-MM-DD`).

`GET /api/properties/{slug}/related` returns up to 3 properties.

`GET /api/destinations` returns `{ slug, name, state, blurb, photo, stayCount }[]`.

## Bookings

`POST /api/bookings`

```json
{
  "propertySlug": "cypress-point-cabin",
  "checkIn": "2026-12-04",
  "checkOut": "2026-12-07",
  "guests": 2,
  "guest": { "firstName": "", "lastName": "", "email": "", "phone": "", "message": "" },
  "acceptedPolicies": true
}
```

Response `201`:

```json
{ "code": "SN-4F2A9C", "status": "processing", "total": 1059.84, "currency": "USD" }
```

Validation to enforce server-side, mirroring the frontend: dates present and ordered, no
blocked night in range, `guests <= property.guests`, no more than 365 nights, totals
recomputed on the server rather than trusted from the client.

`GET /api/bookings/{code}` returns the booking, the property summary and the breakdown.
`POST /api/bookings/{code}/pay` with `{ "outcome": "success" | "declined" }` exists only in
the mock; in milestone 3 this becomes a real payment intent and webhook.

## Auth

`POST /api/auth/register`, `/api/auth/login`, `/api/auth/forgot`, `/api/auth/reset`,
`POST /api/auth/verify-email`, `POST /api/auth/logout`, `GET /api/auth/me`.

Laravel Sanctum tokens, email verification by signed link, password reset by signed token.

## Wishlist

`GET /api/wishlist`, `POST /api/wishlist/{slug}`, `DELETE /api/wishlist/{slug}`. Until a
user is signed in, the frontend keeps these locally.

## Errors

`422` for validation with `{ "message": "", "errors": { "field": ["..."] } }`, `404` for
unknown property or booking, `409` when a requested range has become unavailable since the
client loaded it.
