import { useState, useMemo } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';

export default function TradePanel({ symbol, price }) {
  const [qty, setQty] = useState('1');
  const [limit, setLimit] = useState('');
  const buy = usePortfolioStore((s) => s.buy);
  const sell = usePortfolioStore((s) => s.sell);
  const cash = usePortfolioStore((s) => s.cash);
  const positions = usePortfolioStore((s) => s.positions);

  const id = symbol?.trim().toUpperCase();
  const usePrice = useMemo(() => Number(limit) > 0 ? Number(limit) : Number(price) || 0, [limit, price]);
  const estCost = useMemo(() => usePrice * (Number(qty) || 0), [usePrice, qty]);
  const posQty = positions[id]?.quantity || 0;

  function onBuy() {
    const q = Number(qty);
    const p = usePrice;
    if (!id || !q || !p) return;
    if (estCost > cash) {
      const ok = confirm(`This will exceed cash by $${(estCost - cash).toFixed(2)}. Proceed?`);
      if (!ok) return;
    }
    buy({ id, symbol: id, type: 'stock', quantity: q, price: p, meta: {} });
  }

  function onSell() {
    const q = Number(qty);
    const p = usePrice;
    if (!id || !q || !p) return;
    if (q > posQty) {
      alert('Insufficient quantity to sell');
      return;
    }
    sell({ id, symbol: id, type: 'stock', quantity: q, price: p });
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