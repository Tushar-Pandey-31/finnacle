import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import MarketTickerStrip from './components/MarketTickerStrip.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MarketTickerStrip />
    <App />
  </React.StrictMode>
);
