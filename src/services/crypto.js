import { backend } from './backend';

export async function getCryptoQuote(symbol) {
  const { data } = await backend.get('/api/cmc/quote', { params: { symbol } });
  const info = data?.data?.[symbol];
  const usd = info?.quote?.USD;
  return {
    price: usd?.price ?? null,
    percentChange24h: usd?.percent_change_24h ?? null,
    volume24h: usd?.volume_24h ?? null,
  };
}