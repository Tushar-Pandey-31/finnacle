# Live
https://finnacle-beta.vercel.app/

# Finnacle (Paper Trading Frontend)

React + Vite frontend for a paper trading app. Uses a backend for data proxying (Finnhub/CMC/FX) and JWT auth for portfolio/watchlist.

## Setup

1. Install deps:

```
npm i
```

2. Environment

Create `.env` and set your backend URL (defaults to the hosted backend) and optionally keys if you want to use the included Vercel serverless functions locally.

```
# Point frontend to the backend (Render instance by default)
VITE_BACKEND_URL=https://finnacle-backend.onrender.com

# Optional if using /api/* serverless functions locally instead of the backend
VITE_FINNHUB_API_KEY=...
VITE_CMC_API_KEY=...
VITE_FOREX_API_KEY=...
```

3. Run dev server:

```
npm run dev
```

## Pages

- `/` Dashboard: search by symbol, see quote and chart (candles may be plan-limited; sparkline fallback)
- `/options` Options: fetch option chain by symbol, filter by expiration, paper trade options (may be plan-limited)
- `/portfolio` Portfolio (client-only): see positions, cash, equity; close positions; data persists in localStorage
- `/my-portfolio` Portfolio (backend): create portfolio, add holdings, fetch holdings (requires login)
- `/watchlist` Watchlist (backend): manage multi-market watchlist (US, Crypto, Forex, India); live last price refresh

## Auth

- Register/Login via backend JWT: `/api/auth/register`, `/api/auth/login`
- Token is stored in localStorage and attached as `Authorization: Bearer <token>` to backend requests

## Notes

- Production data calls are proxied via the backend to keep keys secret, rate-limit, and cache responses.
- Vercel serverless functions exist under `api/` for Finnhub/CMC/FX if you prefer same-origin during local dev.
- Some Finnhub endpoints (candles/options) may be unavailable on the current plan; the UI handles this gracefully.
