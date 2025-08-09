import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { addHolding, createPortfolio, getHoldings } from '../services/backend';

export default function MyPortfolio() {
  const token = useAuthStore((s) => s.token);
  const email = useAuthStore((s) => s.email);
  const init = useAuthStore((s) => s.init);

  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [name, setName] = useState('My First Portfolio');
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState('1');
  const [msg, setMsg] = useState('');

  useEffect(() => { init(); }, [init]);

  async function onCreate() {
    try {
      const p = await createPortfolio({ name });
      setPortfolio(p);
      setMsg('Portfolio created');
    } catch (e) {
      setMsg(e.response?.data?.error || e.message);
    }
  }

  async function onAdd() {
    try {
      if (!portfolio?.id && !portfolio?._id) return setMsg('No portfolio id');
      const id = portfolio.id || portfolio._id;
      await addHolding({ portfolioId: id, symbol, quantity: Number(quantity) });
      setMsg('Added holding');
      await onFetch();
    } catch (e) {
      setMsg(e.response?.data?.error || e.message);
    }
  }

  async function onFetch() {
    try {
      if (!portfolio?.id && !portfolio?._id) return setMsg('No portfolio id');
      const id = portfolio.id || portfolio._id;
      const data = await getHoldings({ portfolioId: id });
      setHoldings(data || []);
    } catch (e) {
      setMsg(e.response?.data?.error || e.message);
    }
  }

  if (!token) {
    return (
      <div className="container">
        <div className="card"><div className="card-content">Please login to manage your portfolio.</div></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">My Portfolio</div>
        <div className="card-content">
          <div style={{ marginBottom: 8, color: 'var(--muted)' }}>Signed in as {email || 'user'}</div>
          <div className="controls" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Portfolio name" />
            <button className="button primary" onClick={onCreate}>Create</button>
            <button className="button ghost" onClick={onFetch}>Refresh Holdings</button>
          </div>
          <div className="controls" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <input className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol" />
            <input className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" />
            <button className="button primary" onClick={onAdd}>Add Holding</button>
          </div>
          {msg && <div style={{ color: 'var(--muted)', marginBottom: 8 }}>{msg}</div>}
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Symbol</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead>
              <tbody>
                {(holdings || []).length === 0 && <tr><td colSpan={4}>No holdings</td></tr>}
                {(holdings || []).map((h, idx) => {
                  const qty = h.quantity ?? h.qty ?? 0;
                  const price = h.price ?? h.currentPrice ?? 0;
                  const value = qty * price;
                  return (
                    <tr key={`${h.symbol}-${idx}`}>
                      <td>{h.symbol}</td>
                      <td>{qty}</td>
                      <td>{price?.toFixed ? price.toFixed(2) : price}</td>
                      <td>{value?.toFixed ? value.toFixed(2) : value}</td>
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