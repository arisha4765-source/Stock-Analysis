import React, { useState } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

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

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: symbol,
        data: [120, 140, 135, 170, 160]
      }
    ]
  };

  return (
    <div
      style={{
        padding: 30,
        background: darkMode ? "#111" : "#fff",
        color: darkMode ? "#fff" : "#000",
        minHeight: "100vh"
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

      <button onClick={fetchStock}>
        Analyze
      </button>

      <button
        onClick={() =>
          setWatchlist([...watchlist, symbol])
        }
      >
        Add to Watchlist
      </button>

      {data && (
        <div style={{ marginTop: 20 }}>
          <h2>{data.symbol}</h2>

          <h3>Price: ${data.price}</h3>

          <h3>
            Change: {data.change}%
          </h3>

          <h3>
            Recommendation:
            {data.recommendation}
          </h3>

          <Line data={chartData} />
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
