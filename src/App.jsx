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

  // 🚀 SMART STOCK FETCHER
  const fetchStock = async (loadHistory = false) => {
    try {
      if (!symbol) return;

      let formattedSymbol = symbol.trim().toUpperCase();

      // 🇮🇳 Indian indices
      if (formattedSymbol === "NIFTY") {
        formattedSymbol = "NIFTY:NSE";
      }

      if (formattedSymbol === "SENSEX") {
        formattedSymbol = "SENSEX:BSE";
      }

      // ₿ Crypto support
      if (formattedSymbol === "BTC") {
        formattedSymbol = "BTC/USD";
      }

      if (formattedSymbol === "ETH") {
        formattedSymbol = "ETH/USD";
      }

      let stockRes;

      // 📈 TRY DEFAULT MARKET FIRST
      try {
        stockRes = await axios.get(
          "https://stock-analysis-81hr.onrender.com/api/stock/" +
            formattedSymbol
        );

        if (
          !stockRes.data ||
          stockRes.data.price === 0 ||
          stockRes.data.price === null
        ) {
          throw new Error("Retry NSE");
        }

      } catch (err) {

        // 🇮🇳 Retry as NSE stock
        if (!formattedSymbol.includes(":")) {
          formattedSymbol = `${formattedSymbol}:NSE`;

          stockRes = await axios.get(
            "https://stock-analysis-81hr.onrender.com/api/stock/" +
              formattedSymbol
          );
        } else {
          throw err;
        }
      }

      // ✅ SET STOCK DATA
      setData(stockRes.data);

      // 📈 LOAD CHART HISTORY
      if (loadHistory) {
        const historyRes = await axios.get(
          "https://stock-analysis-81hr.onrender.com/api/history/" +
            formattedSymbol
        );

        const cleanData = Array.isArray(historyRes.data?.c)
          ? historyRes.data.c
          : [];

        setHistory(cleanData);
      }

    } catch (err) {
      console.error(err);

      alert("Stock not found");
    }
  };

  // ⚡ REAL-TIME UPDATES EVERY 5 SECONDS
 useEffect(() => {
  if (!symbol || !data) return;

  const interval = setInterval(() => {
    fetchStock(false);
  }, 30000);

  return () => clearInterval(interval);
}, [symbol, data]);

  // 📊 CHART CONFIG
  const chartData = {
    labels: history.map((_, i) => i + 1),

    datasets: [
      {
        label: `${symbol.toUpperCase()} Price History`,
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
        transition: "0.3s",
      }}
    >
      {/* HEADER */}
      <h1>📈 Live Stock Analyzer Dashboard</h1>

      <p>
        Track real-time US stocks, Indian stocks,
        crypto, and market indices.
      </p>

      {/* THEME BUTTON */}
      <button onClick={() => setDarkMode(!darkMode)}>
        Toggle Theme
      </button>

      <br />
      <br />

      {/* SEARCH */}
      <input
        placeholder="AAPL, TCS, BTC, NIFTY..."
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={{
          padding: "10px",
          width: "260px",
          borderRadius: "5px",
          border: "1px solid gray",
        }}
      />

      {/* ANALYZE BUTTON */}
      <button
        onClick={() => fetchStock(true)}
        style={{
          marginLeft: "10px",
          padding: "10px",
        }}
      >
        Analyze
      </button>

      {/* WATCHLIST BUTTON */}
      <button
        onClick={() => {
          if (symbol && !watchlist.includes(symbol)) {
            setWatchlist([...watchlist, symbol]);
          }
        }}
        style={{
          marginLeft: "10px",
          padding: "10px",
        }}
      >
        Add to Watchlist
      </button>

      {/* STOCK INFO */}
      {data && (
        <div style={{ marginTop: 30 }}>
          <h2>{data.symbol}</h2>

          <h3>💲 Price: ${data.price}</h3>

          <h3>📊 Change: {data.change}%</h3>

          <h3>🧠 Recommendation: {data.recommendation}</h3>
        </div>
      )}

      {/* CHART */}
      <div
        style={{
          width: "700px",
          maxWidth: "100%",
          marginTop: 20,
          background: darkMode ? "#222" : "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        {history.length > 0 ? (
          <Line
            data={chartData}
            options={{
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
            }}
          />
        ) : (
          <p>No chart data available</p>
        )}
      </div>

      {/* WATCHLIST */}
      <div style={{ marginTop: 40 }}>
        <h2>⭐ Watchlist</h2>

        <ul>
          {watchlist.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* SEO CONTENT */}
      <div style={{ marginTop: 40 }}>
        <h2>Real-Time Market Dashboard</h2>

        <p>
          This dashboard provides live stock prices,
          cryptocurrency tracking, market indices,
          and historical charts for US and Indian markets
          including Apple, Tesla, Reliance, TCS,
          Infosys, Bitcoin, Ethereum, and more.
        </p>
      </div>
    </div>
  );
}
