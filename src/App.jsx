import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stock/AAPL');
        setStockData(response.data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div className="App">
      <h1>Stock Data</h1>
      {stockData ? (
        <div>
          <p>Current Price: {stockData.c}</p>
          <p>High: {stockData.h}</p>
          <p>Low: {stockData.l}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;

