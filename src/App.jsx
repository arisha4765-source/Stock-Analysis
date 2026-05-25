import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);

  const fetchStock = async () => {
    try {
      const res = await axios.get(
        "https://stock-analysis-81hr.onrender.com/api/stock/" + symbol
      );

      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching stock data");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>⚡ Live Stock Analyzer</h1>

      <input
        placeholder="Enter Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <button onClick={fetchStock}>Analyze</button>

      {data && (
        <div style={{ marginTop: 20 }}>
          <h2>{data.symbol}</h2>
          <h3>Price: ${data.price}</h3>
          <h3>Change: {data.change}%</h3>
          <h3>Recommendation: {data.recommendation}</h3>
        </div>
      )}
    </div>
  );
}
      
