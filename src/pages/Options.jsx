import React, { useMemo, useState } from 'react';
import { getOptionChain } from '../services/finnhub';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../store/authStore';
import { buyStock, sellStock, getPortfolioSummary } from '../services/backend';

export default function Options() {
  const [symbol, setSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chain, setChain] = useState(null);
  const [expiry, setExpiry] = useState('');

  const setPositions = usePortfolioStore.setState;
  const walletBalanceCents = useAuthStore((s) => s.walletBalanceCents);
  const setWalletBalanceCents = useAuthStore((s) => s.setWalletBalanceCents);

  const expirations = useMemo(() => {
    if (!chain) return [];
    const dates = new Set();
    const add = (arr) => (arr || []).forEach((o) => o.expirationDate && dates.add(o.expirationDate));
    add(chain.call);
    add(chain.put);
    return Array.from(dates).sort();
  }, [chain]);

  const filtered = useMemo(() => {
    if (!chain) return { calls: [], puts: [] };
    const calls = (chain.call || []).filter((o) => !expiry || o.expirationDate === expiry);
    const puts = (chain.put || []).filter((o) => !expiry || o.expirationDate === expiry);
    return { calls, puts };
  }, [chain, expiry]);

  async function handleFetch() {
    setLoading(true); setError('');
    try {
      const data = await getOptionChain(symbol.trim().toUpperCase());
      setChain(data || {});
      setExpiry('');
    } catch (e) {
      setError(e.message || 'Failed to fetch option chain');
    } finally {
      setLoading(false);
    }
  }

  async function handleTrade(option, side) {
    const qtyStr = prompt(`Enter quantity to ${side} for ${option.symbol || symbol} ${option.type || option.optionType || ''} ${option.strike || ''} ${option.expirationDate || ''}`);
    const qty = Number(qtyStr);
    if (!qty || qty <= 0) return;
    const mid = (Number(option.bid) + Number(option.ask)) / 2 || Number(option.lastPrice) || Number(option.price) || 0;
    const priceStr = prompt('Enter price (default mid):', mid ? String(mid.toFixed(2)) : '0');
    const price = Number(priceStr);
    if (!price || price <= 0) return;
    const id = option.contractIdentifier || `${symbol}-${option.expirationDate}-${option.strike}-${(option.type || option.optionType || 'CALL').toUpperCase()}`;
    const payload = { symbol, quantity: qty, price, type: 'option', meta: { ...option, id } };
    if (side === 'buy') {
      const cash = (walletBalanceCents || 0) / 100;
      if (qty * price > cash) { alert('Insufficient wallet balance'); return; }
      try {
        const res = await buyStock({ symbol, quantity: qty, priceUsd: price });
        if (typeof res?.walletBalanceCents === 'number') setWalletBalanceCents(res.walletBalanceCents);
      } catch (e) { alert(e?.response?.data?.error || e.message || 'Buy failed'); return; }
    } else {
      try {
        const res = await sellStock({ symbol, quantity: qty, priceUsd: price });
        if (typeof res?.walletBalanceCents === 'number') setWalletBalanceCents(res.walletBalanceCents);
      } catch (e) { alert(e?.response?.data?.error || e.message || 'Sell failed'); return; }
    }
    try {
      const summary = await getPortfolioSummary();
      const list = Array.isArray(summary?.positions) ? summary.positions : [];
      const mapped = {};
      for (const pos of list) { const key = pos.id || pos.symbol; if (!key) continue; mapped[key] = { id: key, symbol: pos.symbol || key, type: pos.type || 'stock', quantity: Number(pos.quantity) || 0, avgPrice: Number(pos.avgPrice) || 0, meta: pos.meta || {} }; }
      setPositions({ positions: mapped });
    } catch {}
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-content">
          <div className="controls" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Options</h2>
            <div className="controls" style={{ flexWrap: 'wrap', gap: 8, flex: '1 1 360px', justifyContent: 'flex-end' }}>
              <input className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol e.g. AAPL" style={{ flex: '1 1 200px', minWidth: 140 }} />
              <button className="button primary" onClick={handleFetch} disabled={loading} style={{ flex: '0 0 auto' }}>{loading ? 'Loading…' : 'Fetch Chain'}</button>
              {expirations.length > 0 && (
                <select className="select" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ flex: '0 0 auto' }}>
                  <option value="">All expirations</option>
                  {expirations.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
            </div>
          </div>
          {error && <div style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      {chain ? (
        <div className="grid grid-cols-2" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-header">Calls {expiry && `(${expiry})`}</div>
            <div className="card-content">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Strike</th>
                      <th>Bid</th>
                      <th>Ask</th>
                      <th>Last</th>
                      <th>OI</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filtered.calls || []).slice(0, 200).map((o, idx) => (
                      <tr key={o.contractIdentifier || `${o.expirationDate}-${o.strike}-C-${idx}`}>
                        <td>{o.strike}</td>
                        <td>{o.bid}</td>
                        <td>{o.ask}</td>
                        <td>{o.lastPrice || o.price}</td>
                        <td>{o.openInterest}</td>
                        <td>
                          <div className="controls">
                            <button className="button primary" onClick={() => handleTrade({ ...o, optionType: 'CALL' }, 'buy')}>Buy</button>
                            <button className="button ghost" onClick={() => handleTrade({ ...o, optionType: 'CALL' }, 'sell')}>Sell</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">Puts {expiry && `(${expiry})`}</div>
            <div className="card-content">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Strike</th>
                      <th>Bid</th>
                      <th>Ask</th>
                      <th>Last</th>
                      <th>OI</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filtered.puts || []).slice(0, 200).map((o, idx) => (
                      <tr key={o.contractIdentifier || `${o.expirationDate}-${o.strike}-P-${idx}`}>
                        <td>{o.strike}</td>
                        <td>{o.bid}</td>
                        <td>{o.ask}</td>
                        <td>{o.lastPrice || o.price}</td>
                        <td>{o.openInterest}</td>
                        <td>
                          <div className="controls">
                            <button className="button primary" onClick={() => handleTrade({ ...o, optionType: 'PUT' }, 'buy')}>Buy</button>
                            <button className="button ghost" onClick={() => handleTrade({ ...o, optionType: 'PUT' }, 'sell')}>Sell</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-content">Enter a symbol and fetch the chain.</div>
        </div>
      )}
    </div>
  );
}