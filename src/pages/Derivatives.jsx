import { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../store/authStore';
import { buyStock, sellStock, getPortfolioSummary } from '../services/backend';

export default function Derivatives() {
  const [symbol, setSymbol] = useState('AAPL');
  const [type, setType] = useState('CALL');
  const [strike, setStrike] = useState('200');
  const [expiry, setExpiry] = useState('2025-12-19');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('1.00');

  const setPositions = usePortfolioStore.setState;
  const walletBalanceCents = useAuthStore((s) => s.walletBalanceCents);
  const setWalletBalanceCents = useAuthStore((s) => s.setWalletBalanceCents);
  const positions = usePortfolioStore((s) => s.positions);

  const id = `${symbol.trim().toUpperCase()}-${expiry}-${Number(strike)}-${type.toUpperCase()}`;
  const posQty = positions[id]?.quantity || 0;

  async function onBuy() {
    const qn = Number(qty); const pn = Number(price);
    if (!qn || !pn) return;
    const cash = (walletBalanceCents || 0) / 100;
    if (qn * pn > cash) { alert('Insufficient wallet balance'); return; }
    try {
      const res = await buyStock({ symbol: symbol.trim().toUpperCase(), quantity: qn, priceUsd: pn });
      if (typeof res?.walletBalanceCents === 'number') setWalletBalanceCents(res.walletBalanceCents);
      const summary = await getPortfolioSummary();
      const list = Array.isArray(summary?.positions) ? summary.positions : [];
      const mapped = {};
      for (const pos of list) { const key = pos.id || pos.symbol; if (!key) continue; mapped[key] = { id: key, symbol: pos.symbol || key, type: pos.type || 'stock', quantity: Number(pos.quantity) || 0, avgPrice: Number(pos.avgPrice) || 0, meta: pos.meta || {} }; }
      setPositions({ positions: mapped });
    } catch (e) { alert(e?.response?.data?.error || e.message || 'Buy failed'); }
  }
  async function onSell() {
    const qn = Number(qty); const pn = Number(price);
    if (!qn || !pn) return;
    if (qn > posQty) { alert('Insufficient quantity to sell'); return; }
    try {
      const res = await sellStock({ symbol: symbol.trim().toUpperCase(), quantity: qn, priceUsd: pn });
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
        <div className="card-header">Derivatives Trade</div>
        <div className="card-content">
          <div className="controls" style={{ flexWrap: 'wrap', gap: 12 }}>
            <input className="input" style={{ width: 120 }} value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" />
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option>CALL</option>
              <option>PUT</option>
            </select>
            <input className="input" style={{ width: 120 }} value={strike} onChange={(e) => setStrike(e.target.value)} placeholder="Strike" />
            <input className="input" style={{ width: 160 }} value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="YYYY-MM-DD" />
            <input className="input" style={{ width: 100 }} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" />
            <input className="input" style={{ width: 120 }} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
            <button className="button primary" onClick={onBuy}>Buy</button>
            <button className="button ghost" onClick={onSell}>Sell</button>
          </div>
          <div style={{ color: 'var(--muted)', marginTop: 8 }}>ID: {id} • Position: {posQty}</div>
        </div>
      </div>
    </div>
  );
}