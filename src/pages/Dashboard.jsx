import React, { useState, useEffect } from 'react';
import '../index.css';
import { getQuote, getCandles, finnhubCandleToSeries } from '../services/finnhub';
import CandleChart from '../components/CandleChart';

const ONE_DAY = 24 * 60 * 60;

const Dashboard = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [series, setSeries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAll = async (sym) => {
    setLoading(true); setError('');
    try {
      const [quote, candles] = await Promise.all([
        getQuote(sym),
        getCandles({ symbol: sym, resolution: 'D', from: Math.floor(Date.now() / 1000) - ONE_DAY * 365, to: Math.floor(Date.now() / 1000) }),
      ]);
      setStockData(quote);
      setSeries(finnhubCandleToSeries(candles));
    } catch (err) {
      setError(err.message || 'API error');
      setStockData(null);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    await loadAll(sym);
  };

  useEffect(() => {
    loadAll(symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="card-content">
          <div className="controls" style={{ justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0 }}>Stock Dashboard</h1>
            <div className="controls">
              <input className="input" type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Enter stock symbol" />
              <button className="button primary" onClick={handleSearch} disabled={loading}>{loading ? 'Loading…' : 'Search'}</button>
            </div>
          </div>
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          {stockData && (
            <div className="grid grid-cols-2" style={{ marginTop: 12 }}>
              <div className="kpi">
                <div className="kpi-label">Price</div>
                <div className="kpi-value">{stockData.c}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Open</div>
                <div className="kpi-value">{stockData.o}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">High</div>
                <div className="kpi-value">{stockData.h}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Low</div>
                <div className="kpi-value">{stockData.l}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {series.length > 0 && (
        <div className="card chart-card" style={{ marginTop: 16 }}>
          <div className="card-content">
            <CandleChart seriesData={series} height={400} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
