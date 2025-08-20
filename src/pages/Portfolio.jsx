import React, { useMemo, useState, useEffect } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useAuthStore } from '../store/authStore';
import { getQuote } from '../services/finnhub';
import { analyzePortfolio, getPortfolioSummary } from '../services/backend';

export default function Portfolio() {
  const walletBalanceCents = useAuthStore((s) => s.walletBalanceCents);
  const positionsStore = usePortfolioStore((s) => s.positions);
  const setPositions = usePortfolioStore.setState;
  const realizedPnl = usePortfolioStore((s) => s.realizedPnl);
  const sellLocal = usePortfolioStore((s) => s.sell);

  const [marks, setMarks] = useState({}); // id -> mark price
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [analysisPrices, setAnalysisPrices] = useState(null);
  const [showPrices, setShowPrices] = useState(false);

  const rows = useMemo(() => Object.values(positionsStore), [positionsStore]);

  const totalValue = rows.reduce((sum, p) => sum + (marks[p.id] || p.avgPrice) * p.quantity, 0);
  const cash = (walletBalanceCents || 0) / 100;
  const equity = cash + totalValue;

  // Periodically refresh mark prices for live P&L
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const next = {};
      for (const p of rows) {
        try {
          const q = await getQuote(p.symbol);
          const price = Number(q?.c);
          if (isFinite(price)) next[p.id] = price;
        } catch {}
      }
      if (!cancelled) setMarks((m) => ({ ...m, ...next }));
    }
    if (rows.length) {
      refresh();
      const t = setInterval(refresh, 15000);
      return () => { cancelled = true; clearInterval(t); };
    }
  }, [rows]);

  // Load positions from backend summary and mirror to local store
  useEffect(() => {
    let cancelled = false;
    async function loadPositions() {
      try {
        const summary = await getPortfolioSummary();
        const list = Array.isArray(summary?.positions) ? summary.positions : [];
        if (!cancelled) {
          const mapped = {};
          for (const p of list) {
            const key = p.id || p.symbol;
            if (!key) continue;
            mapped[key] = {
              id: key,
              symbol: p.symbol || key,
              type: p.type || 'stock',
              quantity: Number(p.quantity) || 0,
              avgPrice: Number(p.avgPrice) || 0,
              meta: p.meta || {},
            };
          }
          setPositions({ positions: mapped });
        }
      } catch {}
    }
    loadPositions();
    const t = setInterval(loadPositions, 20000);
    return () => { cancelled = true; clearInterval(t); };
  }, [setPositions]);

  async function onAnalyze() {
    try {
      setAnalyzing(true);
      setAnalysis('');
      setAnalysisError('');
      setAnalysisPrices(null);
      if (!rows.length) {
        setAnalysisError('No positions to analyze');
        return;
      }
      const holdings = rows.map((p) => ({ symbol: p.symbol, quantity: p.quantity }));
      const result = await analyzePortfolio({ holdings });
      if (typeof result === 'string') {
        setAnalysis(result);
      } else if (result && typeof result === 'object') {
        setAnalysis(result.analysis || '');
        if (result.prices && typeof result.prices === 'object') setAnalysisPrices(result.prices);
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
    try { navigator.clipboard.writeText(analysis); } catch {}
  }

  function handleClose(p) {
    const qtyStr = prompt(`Quantity to sell (max ${p.quantity}):`, String(p.quantity));
    const qty = Number(qtyStr);
    if (!qty || qty <= 0 || qty > p.quantity) return;
    const priceStr = prompt('Sell price:', String(marks[p.id] || p.avgPrice));
    const price = Number(priceStr);
    if (!price || price <= 0) return;
    sellLocal({ id: p.id, symbol: p.symbol, type: p.type, quantity: qty, price });
  }

  return (
    <div className="container">
      <div className="grid" style={{ marginBottom: 16 }}>
        <div className="kpis">
          <div className="kpi"><div className="kpi-label">Wallet</div><div className="kpi-value">${cash.toFixed(2)}</div></div>
          <div className="kpi"><div className="kpi-label">Positions Value</div><div className="kpi-value">${totalValue.toFixed(2)}</div></div>
          <div className="kpi"><div className="kpi-label">Equity</div><div className="kpi-value">${equity.toFixed(2)}</div></div>
          <div className="kpi"><div className="kpi-label">Realized PnL</div><div className="kpi-value" style={{ color: realizedPnl >= 0 ? 'var(--accent)' : 'var(--danger)' }}>${realizedPnl.toFixed(2)}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Positions</div>
        <div className="card-content">
          <div className="controls" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <button className="button primary" onClick={onAnalyze} disabled={analyzing || rows.length === 0}>{analyzing ? 'Analyzing…' : 'Analyze Portfolio'}</button>
          </div>
          {(analysisError || analysis) && (
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-header">Analysis</div>
              <div className="card-content">
                {analysisError ? (
                  <div style={{ color: 'var(--danger)' }}>{analysisError}</div>
                ) : (
                  <>
                    <div className="controls" style={{ marginBottom: 8 }}>
                      <button className="button ghost" onClick={copyAnalysis} disabled={!analysis}>Copy</button>
                      {analysisPrices && (
                        <button className="button ghost" onClick={() => setShowPrices((s) => !s)}>{showPrices ? 'Hide Prices used' : 'Show Prices used'}</button>
                      )}
                    </div>
                    <textarea readOnly value={analysis} style={{ width: '100%', minHeight: 160, resize: 'vertical' }} />
                    {showPrices && analysisPrices && (
                      <div className="table-wrap" style={{ marginTop: 8 }}>
                        <table className="table">
                          <thead><tr><th>Symbol</th><th>Price</th></tr></thead>
                          <tbody>
                            {Object.entries(analysisPrices).map(([sym, pr]) => (
                              <tr key={sym}><td>{sym}</td><td>{Number(pr)?.toFixed ? Number(pr).toFixed(4) : pr}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
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