import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // 📊 FETCH STOCK DATA
  const fetchStock = async (loadHistory = false) => {
    try {
      if (!symbol) return;

      const stockRes = await axios.get(
        "https://stock-analysis-81hr.onrender.com/api/stock/" + symbol
      );

      setData(stockRes.data);

      // only load history once (important for performance)
      if (loadHistory) {
        const historyRes = await axios.get(
          "https://stock-analysis-81hr.onrender.com/api/history/" + symbol
        );

        const cleanData = Array.isArray(historyRes.data?.c)
          ? historyRes.data.c
          : [];

        setHistory(cleanData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ⚡ REAL-TIME PRICE UPDATE (every 5 sec)
  useEffect(() => {
    if (!symbol) return;

    fetchStock(true); // initial full load

    const interval = setInterval(() => {
      fetchStock(false); // only update price
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  // 📈 CHART DATA
  const chartData = {
    labels: history.map((_, i) => i + 1),
    datasets: [
      {
        label: `${symbol} Price History`,
        data: history,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div
      style={{
        padding: 30,
        background: darkMode ? "#111" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh",
      }}
    >
      <h1>📈 Live Stock Analyzer Dashboard</h1>
      <p>Track real-time stock prices, charts, and market trends.</p>

      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Theme
      </button>

      <br /><br />

      <input
        placeholder="Enter Stock Symbol (AAPL, TSLA)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
      />

      <button onClick={() => fetchStock(true)}>Analyze</button>

      <button
        onClick={() => setWatchlist([...watchlist, symbol])}
      >
        Add to Watchlist
      </button>

      {/* 📊 STOCK INFO */}
      {data && (
        <div style={{ marginTop: 20 }}>
          <h2>{data.symbol}</h2>
          <h3>Price: ${data.price}</h3>
          <h3>Change: {data.change}%</h3>
          <h3>Recommendation: {data.recommendation}</h3>
        </div>
      )}

      {/* 📈 CHART */}
      <div
        style={{
          width: "700px",
          maxWidth: "100%",
          height: "400px",
          marginTop: 20,
          background: darkMode ? "#222" : "#fff",
          padding: 20,
          borderRadius: 10,
        }}
      >
        {history.length > 0 ? (
          <Line data={chartData} />
        ) : (
          <p>No chart data available</p>
        )}
      </div>

      {/* ⭐ WATCHLIST */}
      <div style={{ marginTop: 30 }}>
        <h2>Watchlist</h2>
        <ul>
          {watchlist.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* 🔎 SEO CONTENT (IMPORTANT FOR GOOGLE) */}
      <div style={{ marginTop: 40 }}>
        <h2>Real-Time Stock Market Data</h2>
        <p>
          This dashboard provides live stock prices, historical charts, and
          real-time market insights for global stocks like Apple, Tesla, and Microsoft.
        </p>
      </div>
    </div>
  );
}
