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
    // initial load
    loadAll(symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard">
      <h1>Stock Dashboard</h1>
      <div className="search-bar">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter stock symbol"
        />
        <button onClick={handleSearch} disabled={loading}>{loading ? 'Loading…' : 'Search'}</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stockData && (
        <div className="stock-info">
          <h2>Stock Data for {symbol.toUpperCase()}</h2>
          <p>Price: {stockData.c}</p>
          <p>High: {stockData.h}</p>
          <p>Low: {stockData.l}</p>
          <p>Open: {stockData.o}</p>
          <p>Previous Close: {stockData.pc}</p>
        </div>
      )}

      {series.length > 0 && (
        <div style={{ margin: '24px auto', maxWidth: 960 }}>
          <CandleChart seriesData={series} height={360} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
