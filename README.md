# TradeWithCuso — website

React + Vite site for TradeWithCuso: the public homepage, plans and terms, the
trader dashboard where people choose and pay for a plan, and the admin
dashboard that runs it all. Everything comes from the
[Laravel API](../tradewithcusobackend).

## Setup

```bash
npm install
cp .env.example .env     # point VITE_API_URL at the API
npm run dev              # http://localhost:5173
```

The API needs to be running too — see its README. Open the
`tradewithcuso.code-workspace` file in the backend folder to get both in one
editor window.

## Layout

```
src/lib/api.js           website + trader API client
src/lib/adminApi.js      dashboard API client (bearer token)
src/lib/format.js        naira, dates, and status labels
src/context/             trader auth, admin auth, and site data (plans, settings)
src/pages/               website pages
src/pages/dashboard/     the trader's own area
src/pages/admin/         admin dashboard pages
src/components/admin/    dashboard shell and shared UI
```

## Routes

**Website** — `/`, `/plans`, `/register` (takes `?plan=slug`), `/login`, `/terms`.

**Trader dashboard** (signed in) — `/dashboard` overview, `/dashboard/plans`,
`/dashboard/subscribe/:slug` (checkout), `/dashboard/subscriptions/:reference`
(payment status — Paystack returns here), `/dashboard/profile`.

**Admin** — `/admin/login`, then `/admin` for the dashboard, subscriptions,
traders, plans, settings, team (owners only) and account.

## Things worth knowing

**All money is whole naira.** ₦25,000, never ₦25,000.00 — the API stores naira
and converts to kobo only when talking to Paystack.

**Payment methods follow the server.** Checkout only offers card if Paystack
keys are set on the API, and bank transfer only once bank details are filled
in under Admin → Settings. With neither, it says so instead of failing.

**Returning from Paystack proves nothing.** The subscription page asks the API
to verify the payment with Paystack; the API's webhook does the same on its own,
so a plan activates even if the trader closes the tab.

**Two separate sessions.** Traders and admins have different tokens in
different localStorage keys, so both can be signed in on one browser.
