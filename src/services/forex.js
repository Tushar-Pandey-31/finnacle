import axios from 'axios';

const FX_BASE = import.meta.env.DEV ? '/fx/v1' : 'https://api.forexrateapi.com/v1';
const fxKey = import.meta.env.VITE_FOREX_API_KEY;

const http = axios.create({ baseURL: FX_BASE });

// pair format: "EURUSD" or "USDJPY"
export async function getFxPair(pair) {
  if (!fxKey) throw new Error('Missing VITE_FOREX_API_KEY');
  if (!pair || pair.length !== 6) throw new Error('Invalid pair');
  const base = pair.slice(0, 3).toUpperCase();
  const quote = pair.slice(3).toUpperCase();
  const { data } = await http.get('/latest', {
    params: { api_key: fxKey, base, currencies: quote },
  });
  const rate = data?.rates?.[quote] ?? null;
  return { rate };
}