import React, { useMemo, useState } from 'react';
import { getOptionChain } from '../services/finnhub';
import { usePortfolioStore } from '../store/portfolioStore';

export default function Options() {
  const [symbol, setSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chain, setChain] = useState(null);
  const [expiry, setExpiry] = useState('');

  const buy = usePortfolioStore((s) => s.buy);

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

  function handleBuy(option, side) {
    const qtyStr = prompt(`Enter quantity to ${side} for ${option.symbol || symbol} ${option.type || option.optionType || ''} ${option.strike || ''} ${option.expirationDate || ''}`);
    const qty = Number(qtyStr);
    if (!qty || qty <= 0) return;
    const mid = (Number(option.bid) + Number(option.ask)) / 2 || Number(option.lastPrice) || Number(option.price) || 0;
    const priceStr = prompt('Enter price (default mid):', mid ? String(mid.toFixed(2)) : '0');
    const price = Number(priceStr);
    if (!price || price <= 0) return;
    const id = option.contractIdentifier || `${symbol}-${option.expirationDate}-${option.strike}-${(option.type || option.optionType || 'CALL').toUpperCase()}`;
    const payload = { id, symbol, type: 'option', quantity: qty, price, meta: { ...option } };
    if (side === 'buy') {
      buy(payload);
    } else {
      // selling without borrow checks; user must own quantity
      usePortfolioStore.getState().sell({ id, symbol, type: 'option', quantity: qty, price });
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Options</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol e.g. AAPL" />
        <button onClick={handleFetch} disabled={loading}>{loading ? 'Loading…' : 'Fetch Chain'}</button>
        {expirations.length > 0 && (
          <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
            <option value="">All expirations</option>
            {expirations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {!chain && <div>Enter a symbol and fetch the chain.</div>}
      {chain && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <h3>Calls {expiry && `(${expiry})`}</h3>
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
                      <button onClick={() => handleBuy({ ...o, optionType: 'CALL' }, 'buy')}>Buy</button>
                      <button onClick={() => handleBuy({ ...o, optionType: 'CALL' }, 'sell')}>Sell</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3>Puts {expiry && `(${expiry})`}</h3>
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
                      <button onClick={() => handleBuy({ ...o, optionType: 'PUT' }, 'buy')}>Buy</button>
                      <button onClick={() => handleBuy({ ...o, optionType: 'PUT' }, 'sell')}>Sell</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}