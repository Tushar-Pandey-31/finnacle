export const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

import axios from 'axios';

const apiToken = import.meta.env.VITE_FINNHUB_API_KEY;

const http = axios.create({
  baseURL: FINNHUB_BASE_URL,
});

function requireToken() {
  if (!apiToken) {
    throw new Error('Missing VITE_FINNHUB_API_KEY. Set it in your .env file.');
  }
}

export async function getQuote(symbol) {
  requireToken();
  const { data } = await http.get('/quote', {
    params: { symbol, token: apiToken },
  });
  return data; // { c,h,l,o,pc,t }
}

export async function getCandles({ symbol, resolution = 'D', from, to }) {
  requireToken();
  const { data } = await http.get('/stock/candle', {
    params: { symbol, resolution, from, to, token: apiToken },
  });
  return data; // { s, t[], o[], h[], l[], c[] }
}

export async function searchSymbols(query) {
  requireToken();
  const { data } = await http.get('/search', {
    params: { q: query, token: apiToken },
  });
  return data; // { count, result: [{ symbol, description, ... }] }
}

export async function getOptionChain(symbol) {
  requireToken();
  const { data } = await http.get('/stock/option/chain', {
    params: { symbol, token: apiToken },
  });
  return data; // shape depends on API; handle defensively in UI
}

export function finnhubCandleToSeries(candleResponse) {
  if (!candleResponse || candleResponse.s !== 'ok') return [];
  const { t = [], o = [], h = [], l = [], c = [] } = candleResponse;
  const length = Math.min(t.length, o.length, h.length, l.length, c.length);
  const series = [];
  for (let i = 0; i < length; i += 1) {
    series.push({
      time: t[i],
      open: o[i],
      high: h[i],
      low: l[i],
      close: c[i],
    });
  }
  return series;
}