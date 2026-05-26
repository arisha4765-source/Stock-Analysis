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

  // 🔹 STATES
  const [symbol, setSymbol] =
    useState("");

  const [data, setData] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [watchlist, setWatchlist] =
    useState([]);

  const [darkMode, setDarkMode] =
    useState(false);

  const [news, setNews] =
    useState([]);

  const [prediction, setPrediction] =
    useState("");

  const [confidence, setConfidence] =
    useState(0);

  const [rsi, setRsi] =
    useState(0);

  const [ma, setMa] =
    useState(0);

  const [sentiment, setSentiment] =
    useState("");

  const [alertPrice, setAlertPrice] =
    useState("");

  const [alerts, setAlerts] =
    useState([]);

  // 🔹 RSI FUNCTION
  const calculateRSI = (
    prices
  ) => {

    if (prices.length < 15)
      return 50;

    let gains = 0;
    let losses = 0;

    for (
      let i = 1;
      i < 15;
      i++
    ) {

      const diff =
        prices[i] -
        prices[i - 1];

      if (diff > 0)
        gains += diff;
      else
        losses -= diff;
    }

    const rs =
      gains / (losses || 1);

    return (
      100 -
      100 / (1 + rs)
    ).toFixed(2);
  };

  // 🔹 MOVING AVERAGE
  const movingAverage = (
    prices,
    days
  ) => {

    const recent =
      prices.slice(-days);

    const sum =
      recent.reduce(
        (a, b) => a + b,
        0
      );

    return (
      sum / recent.length
    ).toFixed(2);
  };

  // 🔹 FETCH STOCK
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

        // 🤖 AI PREDICTION
        if (
          cleanHistory.length >= 5
        ) {

          const recent =
            cleanHistory.slice(-5);

          const first =
            recent[0];

          const last =
            recent[
              recent.length - 1
            ];

          const trend =
            ((last - first) /
              first) *
            100;

          if (trend > 2) {

            setPrediction(
              "Bullish 📈"
            );

            setConfidence(
              Math.min(
                95,
                Math.round(
                  Math.abs(
                    trend
                  ) * 10
                )
              )
            );

          } else if (
            trend < -2
          ) {

            setPrediction(
              "Bearish 📉"
            );

            setConfidence(
              Math.min(
                95,
                Math.round(
                  Math.abs(
                    trend
                  ) * 10
                )
              )
            );

          } else {

            setPrediction(
              "Neutral ➖"
            );

            setConfidence(
              50
            );
          }

          // 📊 RSI
          const rsiValue =
            calculateRSI(
              cleanHistory
            );

          setRsi(rsiValue);

          // 📈 MOVING AVERAGE
          const maValue =
            movingAverage(
              cleanHistory,
              5
            );

          setMa(maValue);
        }

        // 📰 NEWS
        const newsRes =
          await axios.get(
            `https://stock-analysis-81hr.onrender.com/api/news/${formattedSymbol}`
          );

        setNews(
          newsRes.data
        );

        // 🤖 SENTIMENT AI
        const positiveWords =
          [
            "gain",
            "surge",
            "profit",
            "growth",
            "bullish",
          ];

        const negativeWords =
          [
            "loss",
            "crash",
            "drop",
            "bearish",
          ];

        let score = 0;

        newsRes.data.forEach(
          (article) => {

            const title =
              article.title?.toLowerCase() ||
              "";

            positiveWords.forEach(
              (word) => {

                if (
                  title.includes(
                    word
                  )
                )
                  score++;
              }
            );

            negativeWords.forEach(
              (word) => {

                if (
                  title.includes(
                    word
                  )
                )
                  score--;
              }
            );
          }
        );

        if (score > 0)
          setSentiment(
            "Positive 📈"
          );
        else if (score < 0)
          setSentiment(
            "Negative 📉"
          );
        else
          setSentiment(
            "Neutral ➖"
          );
      }

    } catch (err) {

      console.error(
        err.response?.data ||
        err.message
      );

      alert(
        "Stock not found"
      );
    }
  };

  // 🔄 AUTO REFRESH
  useEffect(() => {

    if (!data) return;

    const interval =
      setInterval(() => {

        fetchStock(false);

        // 🔔 ALERT CHECK
        alerts.forEach(
          (item) => {

            if (
              data &&
              data.symbol.includes(
                item.symbol
              ) &&
              Number(
                data.price
              ) >=
                item.target
            ) {

              alert(
                `${item.symbol} hit ₹${item.target}!`
              );
            }
          }
        );

      }, 60000);

    return () =>
      clearInterval(
        interval
      );

  }, [data, alerts]);

  // 📈 CHART
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

      {/* 🔔 ALERTS */}
      <input
        type="number"
        placeholder="Alert Price"
        value={alertPrice}
        onChange={(e) =>
          setAlertPrice(
            e.target.value
          )
        }
      />

      <button
        onClick={() => {

          if (
            !symbol ||
            !alertPrice
          )
            return;

          const newAlert = {
            symbol:
              symbol.toUpperCase(),

            target:
              Number(
                alertPrice
              ),
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
            Price: ₹
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

          {/* 🤖 AI */}
          <div
            style={{
              marginTop: 20,
              padding: 20,
              borderRadius: 10,

              background:
                darkMode
                  ? "#222"
                  : "#f5f5f5",
            }}
          >

            <h2>
              🤖 AI Prediction
            </h2>

            <h3>
              {
                prediction
              }
            </h3>

            <p>
              Confidence:
              {" "}
              {
                confidence
              }%
            </p>

            <h3>
              RSI:
              {" "}
              {rsi}
            </h3>

            <p>
              {rsi > 70
                ? "Overbought 🔥"
                : rsi < 30
                ? "Oversold ❄️"
                : "Neutral"}
            </p>

            <h3>
              5-Day MA:
              {" "}
              {ma}
            </h3>

            <h3>
              News Sentiment:
              {" "}
              {
                sentiment
              }
            </h3>

          </div>

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

          {/* 📰 NEWS */}
          <div
            style={{
              marginTop: 30,
            }}
          >

            <h2>
              📰 Latest
              Stock News
            </h2>

            {news.length >
            0 ? (

              news
                .slice(0, 5)
                .map(
                  (
                    article,
                    index
                  ) => (

                    <div
                      key={
                        index
                      }
                      style={{
                        marginBottom:
                          20,

                        padding:
                          15,

                        border:
                          "1px solid #ccc",

                        borderRadius:
                          10,
                      }}
                    >

                      {article.urlToImage && (

                        <img
                          src={
                            article.urlToImage
                          }
                          alt="news"
                          style={{
                            width:
                              "100%",

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
                          article
                            .source
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
                        Read
                        Article →
                      </a>

                    </div>
                  )
                )

            ) : (

              <p>
                No news
                available
              </p>

            )}

          </div>

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

      {/* 🔔 ALERTS LIST */}
      <div
        style={{
          marginTop: 30,
        }}
      >

        <h2>
          🔔 Alerts
        </h2>

        <ul>
          {alerts.map(
            (
              item,
              index
            ) => (
              <li key={index}>
                {
                  item.symbol
                }
                {" "}
                →
                ₹
                {
                  item.target
                }
              </li>
            )
          )}
        </ul>

      </div>

    </div>
  );
}
