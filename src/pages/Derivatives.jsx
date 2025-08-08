import { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';

export default function Derivatives() {
  const [symbol, setSymbol] = useState('AAPL');
  const [type, setType] = useState('CALL');
  const [strike, setStrike] = useState('200');
  const [expiry, setExpiry] = useState('2025-12-19');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('1.00');

  const buy = usePortfolioStore((s) => s.buy);
  const sell = usePortfolioStore((s) => s.sell);
  const positions = usePortfolioStore((s) => s.positions);

  const id = `${symbol.trim().toUpperCase()}-${expiry}-${Number(strike)}-${type.toUpperCase()}`;
  const posQty = positions[id]?.quantity || 0;

  function onBuy() {
    const qn = Number(qty); const pn = Number(price);
    if (!qn || !pn) return;
    buy({ id, symbol: symbol.trim().toUpperCase(), type: 'option', quantity: qn, price: pn, meta: { type, strike: Number(strike), expirationDate: expiry } });
  }
  function onSell() {
    const qn = Number(qty); const pn = Number(price);
    if (!qn || !pn) return;
    if (qn > posQty) { alert('Insufficient quantity to sell'); return; }
    sell({ id, symbol: symbol.trim().toUpperCase(), type: 'option', quantity: qn, price: pn });
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