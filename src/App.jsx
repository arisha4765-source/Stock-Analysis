import React, { useState } from "react";
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
  const [watchlist, setWatchlist] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchStock = async () => {
    try {
      const stockRes = await axios.get(
        "https://stock-analysis-81hr.onrender.com/api/stock/" + symbol
      );

      setData(stockRes.data);

      const historyRes = await axios.get(
        "https://stock-analysis-81hr.onrender.com/api/history/" + symbol
      );

      console.log("HISTORY RESPONSE:", historyRes.data);
      console.log("history length:", history.length);

      // ✅ Finnhub candle data is inside "c"
      const prices = historyRes.data?.c;

      if (Array.isArray(prices)) {
        setHistory(prices);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching stock data");
    }
  };

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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? "#fff" : "#000",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? "#fff" : "#000",
        },
      },
      y: {
        ticks: {
          color: darkMode ? "#fff" : "#000",
        },
      },
    },
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
      <h1>📈 Live Stock Analyzer</h1>

      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Theme
      </button>

      <br />
      <br />

      <input
        placeholder="Enter Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <button onClick={fetchStock}>Analyze</button>

      <button
        onClick={() => setWatchlist([...watchlist, symbol])}
      >
        Add to Watchlist
      </button>

      {data && (
        <div style={{ marginTop: 20 }}>
          <h2>{data.symbol}</h2>
          <h3>Price: ${data.price}</h3>
          <h3>Change: {data.change}%</h3>
          <h3>Recommendation: {data.recommendation}</h3>

          <p>History points: {history.length}</p>

          <div
            style={{
              width: "700px",
              maxWidth: "100%",
              height: "400px",
              marginTop: "20px",
              background: darkMode ? "#222" : "#fff",
              padding: "20px",
              borderRadius: "10px",
            }}
          >
            {history.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p>No chart data available</p>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h2>⭐ Watchlist</h2>
        <ul>
          {watchlist.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
