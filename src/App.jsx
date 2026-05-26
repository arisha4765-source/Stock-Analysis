import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {

  const [symbol, setSymbol] =
    useState("");

  const [data, setData] =
    useState(null);

 const [history, setHistory] =
  useState([]);

const [news, setNews] =
  useState([]);
  
  const [alertPrice, setAlertPrice] =
  useState("");

const [alerts, setAlerts] =
  useState([]);

  const [watchlist, setWatchlist] =
    useState([]);

  const [darkMode, setDarkMode] =
    useState(false);

  // ✅ FETCH STOCK
  const fetchStock = async (
    loadHistory = true
  ) => {

    try {

      if (!symbol) return;

      let formattedSymbol =
        symbol.trim().toUpperCase();

      // 🇮🇳 Indian Stocks
      const indianStocks = [
        "TCS",
        "RELIANCE",
        "INFY",
        "SBIN",
        "ITC",
        "HDFCBANK",
        "WIPRO",
        "ICICIBANK",
        "LT",
        "AXISBANK",
        "BHARTIARTL",
        "KOTAKBANK",
        "ASIANPAINT",
        "MARUTI",
        "HCLTECH",
      ];

      // ✅ Add NSE suffix
      if (
        indianStocks.includes(
          formattedSymbol
        )
      ) {
        formattedSymbol =
          `${formattedSymbol}:NSE`;
      }

      // 📈 STOCK DATA
      const stockRes =
        await axios.get(
          `https://stock-analysis-81hr.onrender.com/api/stock/${formattedSymbol}`
        );

      setData(stockRes.data);

      // 📊 HISTORY
      if (loadHistory) {

        const historyRes =
          await axios.get(
            `https://stock-analysis-81hr.onrender.com/api/history/${formattedSymbol}`
          );

        const cleanHistory =
          Array.isArray(
            historyRes.data.c
          )
            ? historyRes.data.c.filter(
                (item) =>
                  item !== null
              )
            : [];

        setHistory(cleanHistory);
        const newsRes =
  await axios.get(
    `https://stock-analysis-81hr.onrender.com/api/news/${formattedSymbol}`
  );

setNews(newsRes.data);
      }

    } catch (err) {

      console.error(
        err.response?.data ||
        err.message
      );

      alert("Stock not found");
    }
  };

  // 🔄 AUTO REFRESH
  useEffect(() => {

    if (!data) return;

    const interval =
      setInterval(() => {
        fetchStock(false);
        // 🔔 CHECK ALERTS
alerts.forEach((item) => {

  if (
    data &&
    data.symbol.includes(
      item.symbol
    ) &&
    Number(data.price) >=
      item.target
  ) {

    alert(
      `${item.symbol} hit ₹${item.target}!`
    );
  }
});
      }, 60000);

    return () =>
      clearInterval(interval);

  }, [data]);

  // 📈 CHART DATA
  const chartData = {
    labels: history.map(
      (_, i) => i + 1
    ),

    datasets: [
      {
        label:
          "Price History",

        data: history,

        borderColor:
          "rgb(75,192,192)",

        backgroundColor:
          "rgba(75,192,192,0.2)",

        tension: 0.4,
      },
    ],
  };
<div style={{ marginTop: 30 }}>

  <h2>
    📰 Latest Stock News
  </h2>

  {news.length > 0 ? (

    news
      .slice(0, 5)
      .map(
        (
          article,
          index
        ) => (

          <div
            key={index}
            style={{
              marginBottom: 20,
              padding: 15,
              border:
                "1px solid #ccc",
              borderRadius: 10,
            }}
          >

            {article.urlToImage && (

              <img
                src={
                  article.urlToImage
                }
                alt="news"
                style={{
                  width: "100%",
                  maxHeight:
                    200,
                  objectFit:
                    "cover",
                  borderRadius:
                    10,
                }}
              />

            )}

            <h3>
              {
                article.title
              }
            </h3>

            <p>
              {
                article.source
                  ?.name
              }
            </p>

            <a
              href={
                article.url
              }
              target="_blank"
              rel="noreferrer"
            >
              Read Article →
            </a>

          </div>
        )
      )

  ) : (

    <p>
      No news available
    </p>

  )}

</div>
  return (
    <div
      style={{
        padding: 30,
        minHeight: "100vh",

        background: darkMode
          ? "#111"
          : "#fff",

        color: darkMode
          ? "#fff"
          : "#000",
      }}
    >

      <h1>
        📈 Live Stock Analyzer
      </h1>

      <button
        onClick={() =>
          setDarkMode(
            !darkMode
          )
        }
      >
        Toggle Theme
      </button>

      <br />
      <br />

      <input
        placeholder="Enter Stock Symbol"
        value={symbol}
        onChange={(e) =>
          setSymbol(
            e.target.value
          )
        }
      />

      <button
        onClick={() =>
          fetchStock(true)
        }
      >
        Analyze
      </button>

      <button
        onClick={() =>
          setWatchlist([
            ...watchlist,
            symbol,
          ])
        }
      >
        Add to Watchlist
      </button>

      <br />
<br />

<input
  type="number"
  placeholder="Alert Price"
  value={alertPrice}
  onChange={(e) =>
    setAlertPrice(e.target.value)
  }
/>

<button
  onClick={() => {

    if (!symbol || !alertPrice)
      return;

    const newAlert = {
      symbol:
        symbol.toUpperCase(),

      target:
        Number(alertPrice),
    };

    setAlerts([
      ...alerts,
      newAlert,
    ]);

    alert(
      `Alert set for ${symbol} at ₹${alertPrice}`
    );

    setAlertPrice("");
  }}
>
  Set Alert
</button>

      {/* 📊 RESULTS */}
      {data && (

        <div
          style={{
            marginTop: 20,
          }}
        >

          <h2>
            {data.symbol}
          </h2>

          <h3>
            Price: $
            {data.price}
          </h3>

          <h3>
            Change:
            {" "}
            {data.change}%
          </h3>

          <h3>
            Recommendation:
            {" "}
            {
              data.recommendation
            }
          </h3>

          {/* 📈 CHART */}
          {history.length >
          0 ? (

            <div
              style={{
                width: "700px",
                maxWidth:
                  "100%",

                marginTop: 20,

                background:
                  "#fff",

                padding: 20,

                borderRadius: 10,
              }}
            >

              <Line
                data={
                  chartData
                }
                options={{
                  responsive: true,
                }}
              />

            </div>

          ) : (

            <p>
              No chart data
              available
            </p>

          )}

        </div>
      )}

      {/* ⭐ WATCHLIST */}
      <div
        style={{
          marginTop: 30,
        }}
      >

        <h2>
          ⭐ Watchlist
        </h2>
<div style={{ marginTop: 30 }}>

  <h2>🔔 Alerts</h2>

  <ul>
    {alerts.map(
      (item, index) => (
        <li key={index}>
          {item.symbol}
          {" "}
          → ₹
          {item.target}
        </li>
      )
    )}
  </ul>

</div>
        <ul>
          {watchlist.map(
            (
              item,
              index
            ) => (
              <li key={index}>
                {item}
              </li>
            )
          )}
        </ul>

      </div>

    </div>
  );
}
