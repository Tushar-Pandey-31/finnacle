import axios from 'axios';

const CMC_BASE = import.meta.env.DEV ? '/cmc/v1' : '';
const cmcKey = import.meta.env.VITE_CMC_API_KEY;

const http = axios.create({ baseURL: CMC_BASE });

export async function getCryptoQuote(symbol) {
  if (!import.meta.env.DEV) {
    const { data } = await axios.get('/api/cmc/quote', { params: { symbol } });
    const info = data?.data?.[symbol];
    const usd = info?.quote?.USD;
    return {
      price: usd?.price ?? null,
      percentChange24h: usd?.percent_change_24h ?? null,
      volume24h: usd?.volume_24h ?? null,
    };
  }
  if (!cmcKey) throw new Error('Missing VITE_CMC_API_KEY');
  const { data } = await http.get('/cryptocurrency/quotes/latest', {
    params: { symbol },
    headers: { 'X-CMC_PRO_API_KEY': cmcKey },
  });
  const info = data?.data?.[symbol];
  const usd = info?.quote?.USD;
  return {
    price: usd?.price ?? null,
    percentChange24h: usd?.percent_change_24h ?? null,
    volume24h: usd?.volume_24h ?? null,
  };
}