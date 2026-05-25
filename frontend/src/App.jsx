import React, { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [livePrice, setLivePrice] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("wss://YOUR-BACKEND-URL.onrender.com");

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setLivePrice(parsed);
    };

    return () => ws.close();
  }, []);

  const fetchStock = async () => {
    const res = await axios.get(
      `https://YOUR-BACKEND-URL.onrender.com/api/stock/${symbol}`
    );
    setData(res.data);
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

      {livePrice && (
        <div style={{ marginTop: 20 }}>
          <h2>Live Price: {livePrice.price}</h2>
          <p>Updated at: {livePrice.time}</p>
        </div>
      )}

      {data && (
        <div>
          <h2>{data.recommendation}</h2>
          <h3>Predicted: {data.prediction.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
}
