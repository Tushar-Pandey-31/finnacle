import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { addHolding, createPortfolio, getHoldings, analyzePortfolio } from '../services/backend';
import { useMemo } from 'react';

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
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [analysisPrices, setAnalysisPrices] = useState(null);
  const [showPrices, setShowPrices] = useState(false);

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

  async function onAnalyze() {
    try {
      setAnalyzing(true);
      setAnalysis('');
      setAnalysisError('');
      setAnalysisPrices(null);
      if (!portfolio?.id && !portfolio?._id) {
        setAnalysisError('No portfolio id');
        return;
      }
      const id = portfolio.id || portfolio._id;
      const result = await analyzePortfolio({ portfolioId: id });
      if (typeof result === 'string') {
        setAnalysis(result);
      } else if (result && typeof result === 'object') {
        setAnalysis(result.analysis || '');
        if (result.prices && typeof result.prices === 'object') {
          setAnalysisPrices(result.prices);
        }
      } else {
        setAnalysis('No analysis returned');
      }
    } catch (e) {
      setAnalysisError(e.response?.data?.error || e.message || 'Failed to analyze');
    } finally {
      setAnalyzing(false);
    }
  }

  function copyAnalysis() {
    if (!analysis) return;
    try {
      navigator.clipboard.writeText(analysis);
      setMsg('Analysis copied');
      setTimeout(() => setMsg(''), 1500);
    } catch {}
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
            <button className="button ghost" onClick={onAnalyze} disabled={analyzing}>{analyzing ? 'Analyzing…' : 'Analyze Portfolio'}</button>
          </div>
          {msg && <div style={{ color: 'var(--muted)', marginBottom: 8 }}>{msg}</div>}
          {(analysisError || analysis) && (
            <div className="card" style={{ marginTop: 8 }}>
              <div className="card-header">Analysis</div>
              <div className="card-content">
                {analysisError ? (
                  <div style={{ color: 'var(--danger)' }}>
                    {analysisError}
                    <div style={{ marginTop: 8 }}>
                      <button className="button ghost" onClick={onAnalyze} disabled={analyzing}>Retry</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="controls" style={{ marginBottom: 8 }}>
                      <button className="button ghost" onClick={copyAnalysis} disabled={!analysis}>Copy</button>
                    </div>
                    <textarea readOnly value={analysis} style={{ width: '100%', minHeight: 160, resize: 'vertical' }} />
                    {analysisPrices && (
                      <div style={{ marginTop: 12 }}>
                        <button className="button ghost" onClick={() => setShowPrices((s) => !s)}>
                          {showPrices ? 'Hide Prices used' : 'Show Prices used'}
                        </button>
                        {showPrices && (
                          <div className="table-wrap" style={{ marginTop: 8 }}>
                            <table className="table">
                              <thead>
                                <tr><th>Symbol</th><th>Price</th></tr>
                              </thead>
                              <tbody>
                                {Object.entries(analysisPrices).map(([sym, pr]) => (
                                  <tr key={sym}><td>{sym}</td><td>{Number(pr)?.toFixed ? Number(pr).toFixed(4) : pr}</td></tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
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