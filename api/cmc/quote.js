import axios from 'axios';

export default async function handler(req, res) {
  try {
    const { symbol } = req.query;
    if (!symbol) return res.status(400).json({ error: 'Missing symbol' });
    const apiKey = process.env.CMC_API_KEY || process.env.VITE_CMC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server CMC_API_KEY missing' });
    const { data } = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      params: { symbol },
      headers: { 'X-CMC_PRO_API_KEY': apiKey },
    });
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    const code = e.response?.status || 500;
    return res.status(code).json({ error: 'Upstream error', details: e.response?.data || e.message });
  }
}