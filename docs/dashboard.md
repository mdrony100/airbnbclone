# Dashboard notes (milestone 2)

The dashboard is one signed-in area with two modes, not two apps. A guest browsing their
trips and a host managing properties are the same account row with `mode` set to
`traveling` or `hosting`. The mode switch in the sidebar writes that preference through
`PATCH /api/accounts/{id}`; it never gates access on its own.

## Data

All dashboard data is simulated in `frontend/src/data/dashboardSeed.ts` and served by
`frontend/src/services/dashboardApi.ts`, which persists to `localStorage` under
`staynest.dashboard.v2`. Bumping that key is how the seed is refreshed during development.
Dates in the seed are relative offsets from today, so the demo stays current: the upcoming
trip is always a few days out and the completed stays stay in the past.

Accounts:

- `acc_ada` — Ada Lovelace, guest with two upcoming trips and one review due.
- `acc_marisol` — Marisol Vega, approved host with published, pending, draft and rejected
  listings so every listing state is visible without editing data.

Both are reachable from the login screen's demo buttons, and the seeded emails
(`guest@staynest.demo`, `host@staynest.demo`) map to the same accounts if someone logs in
with the form instead.

## Hosting rules the UI enforces

- A new listing starts as `draft`. `Submit for review` moves it to `pending`; only admin
  approval can make it `published`.
- `Pause` moves a published listing to `paused` and hides it from search.
- Calendar nights are `past`, `booked`, `blocked` or `free`. Booked nights come from
  confirmed reservations and cannot be blocked or unblocked; past nights cannot change.
- Cancellation refunds are computed from the policy snapshotted on the reservation, not
  from the property's current policy, so policy edits never rewrite history.

## Scope limits

Identity verification, Stripe Connect payouts and real file uploads are deliberately not
faked. The host application marks payouts as `pending` and says so, photo steps accept
curated image URLs, and receipts are generated `.txt` files rather than signed PDFs. The
API contract in `docs/api-contract.md` describes what Laravel needs to implement.
