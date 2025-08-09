import { backend } from './backend';

export async function getQuote(symbol) {
  const { data } = await backend.get('/api/finnhub/quote', { params: { symbol } });
  return data;
}

export async function getCandles({ symbol, resolution = 'D', from, to }) {
  const { data } = await backend.get('/api/finnhub/candles', {
    params: { symbol, resolution, from, to },
  });
  return data; // { s, t[], o[], h[], l[], c[] }
}

export async function searchSymbols(query) {
  const { data } = await backend.get('/api/finnhub/search', { params: { q: query } });
  return data;
}

export async function getOptionChain(symbol) {
  const { data } = await backend.get('/api/finnhub/options', { params: { symbol } });
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