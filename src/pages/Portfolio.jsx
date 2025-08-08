import React, { useMemo, useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';

export default function Portfolio() {
  const cash = usePortfolioStore((s) => s.cash);
  const positions = usePortfolioStore((s) => s.positions);
  const realizedPnl = usePortfolioStore((s) => s.realizedPnl);
  const sell = usePortfolioStore((s) => s.sell);
  const reset = usePortfolioStore((s) => s.reset);

  const [marks, setMarks] = useState({}); // id -> mark price

  const rows = useMemo(() => Object.values(positions), [positions]);

  const totalValue = rows.reduce((sum, p) => sum + (marks[p.id] || p.avgPrice) * p.quantity, 0);
  const equity = cash + totalValue;

  function handleClose(p) {
    const qtyStr = prompt(`Quantity to sell (max ${p.quantity}):`, String(p.quantity));
    const qty = Number(qtyStr);
    if (!qty || qty <= 0 || qty > p.quantity) return;
    const priceStr = prompt('Sell price:', String(marks[p.id] || p.avgPrice));
    const price = Number(priceStr);
    if (!price || price <= 0) return;
    sell({ id: p.id, symbol: p.symbol, type: p.type, quantity: qty, price });
  }

  return (
    <div className="container">
      <div className="grid" style={{ marginBottom: 16 }}>
        <div className="kpis">
          <div className="kpi"><div className="kpi-label">Cash</div><div className="kpi-value">${cash.toFixed(2)}</div></div>
          <div className="kpi"><div className="kpi-label">Positions Value</div><div className="kpi-value">${totalValue.toFixed(2)}</div></div>
          <div className="kpi"><div className="kpi-label">Equity</div><div className="kpi-value">${equity.toFixed(2)}</div></div>
          <div className="kpi"><div className="kpi-label">Realized PnL</div><div className="kpi-value" style={{ color: realizedPnl >= 0 ? 'var(--accent)' : 'var(--danger)' }}>${realizedPnl.toFixed(2)}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Positions</div>
        <div className="card-content">
          <div className="controls" style={{ marginBottom: 8 }}>
            <button className="button ghost" onClick={reset}>Reset</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Avg Price</th>
                  <th>Mark</th>
                  <th>Value</th>
                  <th>UPL</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>No positions</td></tr>
                )}
                {rows.map((p) => {
                  const mark = marks[p.id] || p.avgPrice;
                  const value = mark * p.quantity;
                  const upl = (mark - p.avgPrice) * p.quantity;
                  return (
                    <tr key={p.id}>
                      <td style={{ maxWidth: 260 }}>
                        <div style={{ fontWeight: 600 }}>{p.symbol}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.id}</div>
                      </td>
                      <td>{p.type}</td>
                      <td>{p.quantity}</td>
                      <td>${p.avgPrice.toFixed(2)}</td>
                      <td>
                        <input
                          className="input"
                          style={{ width: 110, height: 36 }}
                          value={marks[p.id] ?? ''}
                          placeholder={String(p.avgPrice.toFixed(2))}
                          onChange={(e) => setMarks((m) => ({ ...m, [p.id]: Number(e.target.value) }))}
                        />
                      </td>
                      <td>${value.toFixed(2)}</td>
                      <td style={{ color: upl >= 0 ? 'var(--accent)' : 'var(--danger)' }}>${upl.toFixed(2)}</td>
                      <td>
                        <button className="button danger" onClick={() => handleClose(p)}>Sell</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}