import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
    const token = process.env.FINNHUB_API_KEY || process.env.VITE_FINNHUB_API_KEY;
    if (!token) return res.status(500).json({ error: 'Server API key missing' });
    const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
      params: { symbol, token },
    });
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    return res.status(200).json(data);
  } catch (e) {
    const code = e.response?.status || 500;
    return res.status(code).json({ error: 'Upstream error', details: e.response?.data || e.message });
  }
}