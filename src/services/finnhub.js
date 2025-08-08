export const FINNHUB_BASE_URL = (import.meta.env.DEV ? '/fh/api/v1' : '');

import axios from 'axios';

const apiToken = import.meta.env.VITE_FINNHUB_API_KEY;

const http = axios.create({
  baseURL: FINNHUB_BASE_URL,
});

function requireToken() {
  if (!apiToken && import.meta.env.DEV) {
    throw new Error('Missing VITE_FINNHUB_API_KEY. Set it in your .env file.');
  }
}

export async function getQuote(symbol) {
  if (!import.meta.env.DEV) {
    // use serverless proxy in production
    const { data } = await axios.get('/api/finnhub/quote', { params: { symbol } });
    return data;
  }
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
  // Finnhub option chain API endpoint
  const { data } = await http.get('/stock/option/chain', {
    params: { symbol, token: apiToken },
    maxRedirects: 0,
    validateStatus: (s) => s >= 200 && s < 400,
  });
  return data;
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