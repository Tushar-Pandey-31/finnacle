import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';

const Dashboard = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard?symbols=${symbol}`);
      console.log(response.data);
      setStockData(response.data);
      setError('');
    } catch (err) {
      setError('Stock not found or API error');
    }
  };

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
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p>{error}</p>}

      {stockData && (
        <div className="stock-info">
          <h2>Stock Data for {symbol.toUpperCase()}</h2>
          <p>Price: {stockData[0].data.c}</p>
          <p>High: {stockData[0].data.h}</p>
          <p>Low: {stockData[0].data.l}</p>
          <p>Open: {stockData[0].data.o}</p>
          <p>Previous Close: {stockData[0].data.pc}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
