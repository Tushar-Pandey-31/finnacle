import { useEffect, useState } from 'react';
import { getFxPair } from '../services/forex';
import { usePortfolioStore } from '../store/portfolioStore';

const PAIRS = ['EURUSD', 'USDJPY', 'GBPUSD'];

export default function Forex() {
  const [pair, setPair] = useState('EURUSD');
  const [rate, setRate] = useState(null);
  const [qty, setQty] = useState('1000');
  const buy = usePortfolioStore((s) => s.buy);
  const sell = usePortfolioStore((s) => s.sell);
  const positions = usePortfolioStore((s) => s.positions);
  const id = `FX-${pair.toUpperCase()}`;
  const posQty = positions[id]?.quantity || 0;

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

  function onBuy() {
    const q = Number(qty); const p = Number(rate);
    if (!q || !p) return;
    buy({ id, symbol: pair, type: 'forex', quantity: q, price: p, meta: {} });
  }
  function onSell() {
    const q = Number(qty); const p = Number(rate);
    if (!q || !p) return;
    if (q > posQty) { alert('Insufficient quantity'); return; }
    sell({ id, symbol: pair, type: 'forex', quantity: q, price: p });
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">Forex Market</div>
        <div className="card-content">
          <div className="controls" style={{ justifyContent: 'space-between' }}>
            <div className="controls">
              <select className="select" value={pair} onChange={(e) => setPair(e.target.value)}>
                {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ fontWeight: 800 }}>{rate != null ? Number(rate).toFixed(5) : '--'}</div>
            </div>
            <div className="controls">
              <input className="input" style={{ width: 140 }} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty (base units)" />
              <button className="button primary" onClick={onBuy}>Buy</button>
              <button className="button ghost" onClick={onSell}>Sell</button>
            </div>
          </div>
          <div style={{ color: 'var(--muted)', marginTop: 8 }}>Position: {posQty}</div>
        </div>
      </div>
    </div>
  );
}