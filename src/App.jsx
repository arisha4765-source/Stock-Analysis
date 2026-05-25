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
  labels: ["1", "2", "3", "4", "5", "6", "7"],

  datasets: [
    {
      label: `${symbol} Price`,
      data: [
        data?.price - 5,
        data?.price - 3,
        data?.price - 1,
        data?.price,
        data?.price + 2,
        data?.price + 1,
        data?.price + 4
      ],

      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      tension: 0.4
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

    <div
      style={{
        width: "700px",
        maxWidth: "100%",
        marginTop: "20px",
        background: "#fff",
        padding: "20px",
        borderRadius: "10px"
      }}
    >
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "#000"
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: "#000"
              }
            },
            y: {
              ticks: {
                color: "#000"
              }
            }
          }
        }}
      />
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
