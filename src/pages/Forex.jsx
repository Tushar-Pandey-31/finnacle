import { useEffect, useState } from 'react';
import { getFxPair } from '../services/forex';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../store/authStore';
import { buyStock, sellStock, getPortfolioSummary } from '../services/backend';
import PageChart from '../components/PageChart';
import { usePolling } from '../hooks/usePolling';

const PAIRS = ['EURUSD', 'USDJPY', 'GBPUSD'];

export default function Forex() {
  const [pair, setPair] = useState('EURUSD');
  const [rate, setRate] = useState(null);
  const [qty, setQty] = useState('1000');
  const setPositions = usePortfolioStore.setState;
  const positions = usePortfolioStore((s) => s.positions);
  const walletBalanceCents = useAuthStore((s) => s.walletBalanceCents);
  const setWalletBalanceCents = useAuthStore((s) => s.setWalletBalanceCents);
  const id = `FX-${pair.toUpperCase()}`;
  const posQty = positions[id]?.quantity || 0;

  const { points } = usePolling(async (p) => getFxPair(p), { key: pair, intervalMs: 8000, maxPoints: 180 });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const q = await getFxPair(pair);
        if (!cancelled) setRate(q.rate);
      } catch {}
    }
    load();
    const t = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(t); };
  }, [pair]);

  async function onBuy() {
    const q = Number(qty); const p = Number(rate);
    if (!q || !p) return;
    const cash = (walletBalanceCents || 0) / 100;
    if (q * p > cash) { alert('Insufficient wallet balance'); return; }
    try {
      const res = await buyStock({ symbol: pair, quantity: q, priceUsd: rate });
      if (typeof res?.walletBalanceCents === 'number') setWalletBalanceCents(res.walletBalanceCents);
      const summary = await getPortfolioSummary();
      const list = Array.isArray(summary?.positions) ? summary.positions : [];
      const mapped = {};
      for (const pos of list) { const key = pos.id || pos.symbol; if (!key) continue; mapped[key] = { id: key, symbol: pos.symbol || key, type: pos.type || 'stock', quantity: Number(pos.quantity) || 0, avgPrice: Number(pos.avgPrice) || 0, meta: pos.meta || {} }; }
      setPositions({ positions: mapped });
    } catch (e) { alert(e?.response?.data?.error || e.message || 'Buy failed'); }
  }
  async function onSell() {
    const q = Number(qty); const p = Number(rate);
    if (!q || !p) return;
    if (q > posQty) { alert('Insufficient quantity'); return; }
    try {
      const res = await sellStock({ symbol: pair, quantity: q, priceUsd: rate });
      if (typeof res?.walletBalanceCents === 'number') setWalletBalanceCents(res.walletBalanceCents);
      const summary = await getPortfolioSummary();
      const list = Array.isArray(summary?.positions) ? summary.positions : [];
      const mapped = {};
      for (const pos of list) { const key = pos.id || pos.symbol; if (!key) continue; mapped[key] = { id: key, symbol: pos.symbol || key, type: pos.type || 'stock', quantity: Number(pos.quantity) || 0, avgPrice: Number(pos.avgPrice) || 0, meta: pos.meta || {} }; }
      setPositions({ positions: mapped });
    } catch (e) { alert(e?.response?.data?.error || e.message || 'Sell failed'); }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">Forex Market</div>
        <div className="card-content">
          <div className="controls" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div className="controls" style={{ flexWrap: 'wrap', gap: 8 }}>
              <select className="select" value={pair} onChange={(e) => setPair(e.target.value)}>
                {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ fontWeight: 800 }}>{rate != null ? Number(rate).toFixed(5) : '--'}</div>
            </div>
            <div className="controls" style={{ flexWrap: 'wrap', gap: 8 }}>
              <input className="input" style={{ width: 180 }} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty (base units)" />
              <button className="button primary" onClick={onBuy}>Buy</button>
              <button className="button ghost" onClick={onSell}>Sell</button>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <PageChart candleSeries={[]} points={points} height={220} />
          </div>
          <div style={{ color: 'var(--muted)', marginTop: 8 }}>Position: {posQty}</div>
        </div>
      </div>
    </div>
  );
}