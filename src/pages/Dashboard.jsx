import React, { useState, useEffect } from 'react';
import '../index.css';
import { getQuote, getCandles, finnhubCandleToSeries } from '../services/finnhub';
import CandleChart from '../components/CandleChart';
import SparklineChart from '../components/SparklineChart';
import { useQuoteStream } from '../hooks/useQuoteStream';
import TradePanel from '../components/TradePanel';

const ONE_DAY = 24 * 60 * 60;

const Dashboard = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [series, setSeries] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const { points, last } = useQuoteStream(symbol, { intervalMs: 5000, maxPoints: 300 });

  const loadAll = async (sym) => {
    setLoading(true); setError(''); setInfo('');
    try {
      const quote = await getQuote(sym);
      setStockData(quote);
    } catch (err) {
      setError(err.message || 'Quote API error');
      setStockData(null);
    }
    try {
      const candles = await getCandles({ symbol: sym, resolution: 'D', from: Math.floor(Date.now() / 1000) - ONE_DAY * 365, to: Math.floor(Date.now() / 1000) });
      setSeries(finnhubCandleToSeries(candles));
    } catch (err) {
      setSeries([]);
      setInfo('Chart shows live price (no historical on current plan)');
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

  const lastPoint = points && points.length ? points[points.length - 1] : null;
  const effectivePrice = stockData?.c ?? last?.c ?? lastPoint?.p;

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
          {info && !error && <p style={{ color: 'var(--muted)' }}>{info}</p>}
          {stockData && (
            <div className="grid grid-cols-2" style={{ marginTop: 12 }}>
              <div className="kpi">
                <div className="kpi-label">Price</div>
                <div className="kpi-value">{(stockData.c ?? effectivePrice)?.toFixed ? (stockData.c ?? effectivePrice).toFixed(2) : stockData.c || effectivePrice || '-'}</div>
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

      <div className="grid" style={{ marginTop: 16, gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="card chart-card">
          <div className="card-content">
            {series.length > 0 ? (
              <CandleChart seriesData={series} height={320} />
            ) : (
              <CandleChart seriesData={[]} linePoints={points} height={200} />
            )}
          </div>
        </div>
        <TradePanel symbol={symbol} price={effectivePrice} />
      </div>
    </div>
  );
};

export default Dashboard;
