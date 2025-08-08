#Live
https://finnacle-beta.vercel.app/

# Finnacle (Paper Trading Frontend)

React + Vite frontend for a paper trading app using Finnhub API (no backend yet).

## Setup

1. Install deps:

```
npm i
```

2. Create `.env` from `.env.example` and set your Finnhub key:

```
cp .env.example .env
# edit .env and set VITE_FINNHUB_API_KEY
```

3. Run dev server:

```
npm run dev
```

## Pages

- `/` Dashboard: search by symbol, see quote and candlestick chart
- `/options` Options: fetch option chain by symbol, filter by expiration, paper trade options
- `/portfolio` Portfolio: see positions, cash, equity; close positions; data persists in localStorage

## Notes

- API calls are made directly from the client using `VITE_FINNHUB_API_KEY`. For production, proxy via a backend to keep the key secret and to add rate-limiting & caching.
- Option chain structure is handled defensively; minor field differences can be adapted easily in `src/pages/Options.jsx`.
