import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../store/authStore';
import { buyStock, sellStock, getPortfolioSummary } from '../services/backend';

export default function TradePanel({ symbol, price }) {
  const [qty, setQty] = useState('1');
  const [limit, setLimit] = useState('');
  const setPositions = usePortfolioStore.setState;
  const positions = usePortfolioStore((s) => s.positions);
  const walletBalanceCents = useAuthStore((s) => s.walletBalanceCents);
  const setWalletBalanceCents = useAuthStore((s) => s.setWalletBalanceCents);

  const id = symbol?.trim().toUpperCase();
  const usePrice = useMemo(() => Number(limit) > 0 ? Number(limit) : Number(price) || 0, [limit, price]);
  const estCost = useMemo(() => usePrice * (Number(qty) || 0), [usePrice, qty]);
  const posQty = positions[id]?.quantity || 0;

  async function onBuy() {
    const q = Number(qty);
    const p = usePrice;
    if (!id || !q || !p) return;
    const cash = (walletBalanceCents || 0) / 100;
    if (estCost > cash) {
      alert('Insufficient wallet balance');
      return;
    }
    try {
      const res = await buyStock({ symbol: id, quantity: q, priceUsd: limit ? p : undefined });
      if (typeof res?.walletBalanceCents === 'number') setWalletBalanceCents(res.walletBalanceCents);
      const summary = await getPortfolioSummary();
      const list = Array.isArray(summary?.positions) ? summary.positions : [];
      const mapped = {};
      for (const pos of list) {
        const key = pos.id || pos.symbol;
        if (!key) continue;
        mapped[key] = { id: key, symbol: pos.symbol || key, type: pos.type || 'stock', quantity: Number(pos.quantity) || 0, avgPrice: Number(pos.avgPrice) || 0, meta: pos.meta || {} };
      }
      setPositions({ positions: mapped });
    } catch (e) {
      alert(e?.response?.data?.error || e.message || 'Buy failed');
    }
  }

  async function onSell() {
    const q = Number(qty);
    const p = usePrice;
    if (!id || !q || !p) return;
    if (q > posQty) {
      alert('Insufficient quantity to sell');
      return;
    }
    try {
      const res = await sellStock({ symbol: id, quantity: q, priceUsd: limit ? p : undefined });
      if (typeof res?.walletBalanceCents === 'number') setWalletBalanceCents(res.walletBalanceCents);
      const summary = await getPortfolioSummary();
      const list = Array.isArray(summary?.positions) ? summary.positions : [];
      const mapped = {};
      for (const pos of list) {
        const key = pos.id || pos.symbol;
        if (!key) continue;
        mapped[key] = { id: key, symbol: pos.symbol || key, type: pos.type || 'stock', quantity: Number(pos.quantity) || 0, avgPrice: Number(pos.avgPrice) || 0, meta: pos.meta || {} };
      }
      setPositions({ positions: mapped });
    } catch (e) {
      alert(e?.response?.data?.error || e.message || 'Sell failed');
    }
  }

  return (
    <div className="card">
      <div className="card-header">Trade {id || ''}</div>
      <div className="card-content">
        <div className="trade-controls" style={{ marginBottom: 8 }}>
          <input 
            className="input input-qty" 
            value={qty} 
            onChange={(e) => setQty(e.target.value)} 
            placeholder="Qty" 
          />
          <input 
            className="input input-limit" 
            value={limit} 
            onChange={(e) => setLimit(e.target.value)} 
            placeholder={`Limit (mkt ${price || '-'})`} 
          />
          <button className="button primary" onClick={onBuy}>Buy</button>
          <button className="button ghost" onClick={onSell}>Sell</button>
        </div>
        <div className="trade-info">
          Est. {limit ? 'limit' : 'mkt'} {usePrice ? `$${usePrice.toFixed(2)}` : '-'} • Cost: ${estCost.toFixed(2)} • Position: {posQty}
        </div>
      </div>
    </div>
  );
}