import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { pair } = req.query;
    if (!pair || pair.length !== 6) return res.status(400).json({ error: 'Invalid pair' });
    const base = pair.slice(0, 3).toUpperCase();
    const quote = pair.slice(3).toUpperCase();
    const apiKey = process.env.FOREX_API_KEY || process.env.VITE_FOREX_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server FOREX_API_KEY missing' });
    const { data } = await axios.get('https://api.forexrateapi.com/v1/latest', {
      params: { api_key: apiKey, base, currencies: quote },
    });
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    return res.status(200).json({ rate: data?.rates?.[quote] ?? null });
  } catch (e) {
    const code = e.response?.status || 500;
    return res.status(code).json({ error: 'Upstream error', details: e.response?.data || e.message });
  }
}