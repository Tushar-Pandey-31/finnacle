import { backend } from './backend';

// pair format: "EURUSD" or "USDJPY"
export async function getFxPair(pair) {
  const { data } = await backend.get('/api/forex/quote', { params: { pair } });
  return data;
}