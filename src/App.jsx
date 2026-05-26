import React, {
useState,
useEffect,
} from "react";

import axios from "axios";

import supabase
from "./supabase";

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

import { Line }
from "react-chartjs-2";

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

// 🔹 STOCK STATES
const [symbol, setSymbol] =
useState("");

const [data, setData] =
useState(null);

const [history, setHistory] =
useState([]);

const [watchlist, setWatchlist] =
useState([]);

const [news, setNews] =
useState([]);

// 🔹 THEME
const [darkMode, setDarkMode] =
useState(false);

// 🔹 AI STATES
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

const [question, setQuestion] =
useState("");

const [aiAnswer, setAiAnswer] =
useState("");

// 🔔 ALERTS
const [alertPrice, setAlertPrice] =
useState("");

const [alerts, setAlerts] =
useState([]);

// 👤 AUTH STATES
const [email, setEmail] =
useState("");

const [password, setPassword] =
useState("");

const [user, setUser] =
useState(null);

const [loading, setLoading] =
useState(false);

const [authMessage, setAuthMessage] =
useState("");

// ✅ CHECK USER SESSION
useEffect(() => {

```
const getUser = async () => {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    setUser(user);
  }
};

getUser();
```

}, []);

// 🔹 RSI FUNCTION
const calculateRSI = (
prices
) => {

```
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
```

};

// 🔹 MOVING AVERAGE
const movingAverage = (
prices,
days
) => {

```
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
```

};

// 🔹 SIGNUP
const signup = async () => {

```
if (!email || !password) {

  setAuthMessage(
    "Please fill all fields"
  );

  return;
}

if (password.length < 6) {

  setAuthMessage(
    "Password must be at least 6 characters"
  );

  return;
}

setLoading(true);

const { error } =
  await supabase.auth.signUp({

    email,
    password,
  });

setLoading(false);

if (error) {

  setAuthMessage(error.message);

} else {

  setAuthMessage(
    "Signup successful ✅"
  );
}
```

};

// 🔹 LOGIN
const login = async () => {

```
if (!email || !password) {

  setAuthMessage(
    "Please fill all fields"
  );

  return;
}

setLoading(true);

const {
  data,
  error,
} = await supabase.auth.signInWithPassword({

  email,
  password,
});

setLoading(false);

if (error) {

  setAuthMessage(error.message);

} else {

  setUser(data.user);

  setAuthMessage(
    "Login successful ✅"
  );
}
```

};

// 🔹 LOGOUT
const logout = async () => {

```
await supabase.auth.signOut();

setUser(null);

setAuthMessage(
  "Logged out"
);
```

};

// 🔹 AI ASSISTANT
const askAI = async () => {

```
if (!data) {

  setAiAnswer(
    "Analyze a stock first"
  );

  return;
}

let answer = "";

if (
  prediction.includes(
    "Bullish"
  ) &&
  rsi < 70
) {

 answer =
  data.symbol +
  " looks bullish 📈. " +
  "Momentum is positive and RSI is healthy.";

} else if (
  prediction.includes(
    "Bearish"
  )
) {

  answer =
  data.symbol +
  " looks bearish 📉. " +
  "Recent trend is weak.";

} else {

answer =
  data.symbol +
  " is neutral ➖.";
}

if (
  sentiment.includes(
    "Positive"
  )
) {

  answer +=
    " News sentiment is positive.";

} else if (
  sentiment.includes(
    "Negative"
  )
) {

  answer +=
    " News sentiment is negative.";
}

setAiAnswer(answer);
```

};

// 🔹 FETCH STOCK
const fetchStock = async (
loadHistory = true
) => {

```
try {

  if (!symbol) return;

  let formattedSymbol =
    symbol.trim().toUpperCase();

  const indianStocks = [
    "TCS",
    "RELIANCE",
    "INFY",
    "SBIN",
    "ITC",
    "HDFCBANK",
    "WIPRO",
    "ICICIBANK",
  ];

  if (
    indianStocks.includes(
      formattedSymbol
    )
  ) {

    formattedSymbol =
      `${formattedSymbol}:NSE`;
  }

  // 📈 STOCK
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

    // 🤖 PREDICTION
    if (
      cleanHistory.length >= 5
    ) {

      const recent =
        cleanHistory.slice(-5);

      const first = recent[0];

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
          Math.round(
            Math.abs(
              trend
            ) * 10
          )
        );

      } else if (
        trend < -2
      ) {

        setPrediction(
          "Bearish 📉"
        );

        setConfidence(
          Math.round(
            Math.abs(
              trend
            ) * 10
          )
        );

      } else {

        setPrediction(
          "Neutral ➖"
        );

        setConfidence(50);
      }

      setRsi(
        calculateRSI(
          cleanHistory
        )
      );

      setMa(
        movingAverage(
          cleanHistory,
          5
        )
      );
    }

    // 📰 NEWS
    const newsRes =
      await axios.get(
        `https://stock-analysis-81hr.onrender.com/api/news/${formattedSymbol}`
      );

    setNews(newsRes.data);

    // 🤖 SENTIMENT
    const positiveWords = [
      "gain",
      "profit",
      "growth",
      "bullish",
    ];

    const negativeWords = [
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
              title.includes(word)
            ) {
              score++;
            }
          }
        );

        negativeWords.forEach(
          (word) => {

            if (
              title.includes(word)
            ) {
              score--;
            }
          }
        );
      }
    );

    if (score > 0) {
      setSentiment(
        "Positive 📈"
      );
    } else if (score < 0) {
      setSentiment(
        "Negative 📉"
      );
    } else {
      setSentiment(
        "Neutral ➖"
      );
    }
  }

} catch (err) {

  console.error(err);

  alert(
    "Stock not found"
  );
}
```

};

// 🔄 AUTO REFRESH
useEffect(() => {

```
if (!data) return;

const interval =
  setInterval(() => {

    fetchStock(false);

    alerts.forEach(
      (item) => {

        if (
          data &&
          data.symbol.includes(
            item.symbol
          ) &&
          Number(data.price) >=
            item.target
        ) {

          alert(
            `${item.symbol} hit ₹${item.target}`
          );
        }
      }
    );

  }, 60000);

return () =>
  clearInterval(interval);
```

}, [data, alerts]);

// 📈 CHART
const chartData = {
labels: history.map(
(_, i) => i + 1
),

```
datasets: [
  {
    label: "Price History",
    data: history,
    borderColor:
      "rgb(75,192,192)",
    backgroundColor:
      "rgba(75,192,192,0.2)",
    tension: 0.4,
  },
],
```

};

return (

```
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
      setDarkMode(!darkMode)
    }
  >
    Toggle Theme
  </button>

  <br />
  <br />

  {/* 👤 LOGIN */}
  <div
    style={{
      marginBottom: 30,
      padding: 20,
      borderRadius: 15,
      background: darkMode
        ? "#1e1e1e"
        : "#f5f5f5",
      maxWidth: 450,
    }}
  >

    <h2>
      👤 Account
    </h2>

    {user ? (

      <div>

        <p>
          Logged in as:
        </p>

        <strong>
          {user.email}
        </strong>

        <br />
        <br />

        <button
          onClick={logout}
        >
          Logout
        </button>

      </div>

    ) : (

      <>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 15,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 15,
          }}
        />

        <button
          onClick={signup}
        >
          {
            loading
              ? "Loading..."
              : "Sign Up"
          }
        </button>

        <button
          onClick={login}
          style={{
            marginLeft: 10,
          }}
        >
          {
            loading
              ? "Loading..."
              : "Login"
          }
        </button>

      </>

    )}

    {authMessage && (

      <p>
        {authMessage}
      </p>

    )}

  </div>

  {/* 🔍 STOCK SEARCH */}
  {user ? (

    <>

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
        Add Watchlist
      </button>

    </>

  ) : (

    <p>
      Please login to analyze stocks.
    </p>

  )}

  {/* 📊 STOCK DATA */}
  {data && (

    <div
      style={{
        marginTop: 30,
      }}
    >

      <h2>
        {data.symbol}
      </h2>

      <h3>
        Price: ₹{data.price}
      </h3>

      <h3>
        Change: {data.change}%
      </h3>

      <h3>
        Recommendation:
        {" "}
        {data.recommendation}
      </h3>

      {/* 🤖 AI ANALYSIS */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          borderRadius: 10,
          background: darkMode
            ? "#222"
            : "#f5f5f5",
        }}
      >

        <h2>
          🤖 AI Prediction
        </h2>

        <h3>
          {prediction}
        </h3>

        <p>
          Confidence:
          {" "}
          {confidence}%
        </p>

        <h3>
          RSI: {rsi}
        </h3>

        <h3>
          5-Day MA: {ma}
        </h3>

        <h3>
          News Sentiment:
          {" "}
          {sentiment}
        </h3>

      </div>

      {/* 📈 CHART */}
      {history.length > 0 ? (

        <div
          style={{
            marginTop: 30,
            background: "#fff",
            padding: 20,
            borderRadius: 10,
          }}
        >

          <Line
            data={chartData}
          />

        </div>

      ) : (

        <p>
          No chart data available
        </p>

      )}

      {/* 🔔 ALERTS */}
      <div
        style={{
          marginTop: 30,
        }}
      >

        <h2>
          🔔 Price Alerts
        </h2>

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
            ) return;

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

            setAlertPrice("");
          }}
        >
          Set Alert
        </button>

      </div>

      {/* 📰 NEWS */}
      <div
        style={{
          marginTop: 40,
        }}
      >

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

                  <h3>
                    {article.title}
                  </h3>

                  <a
                    href={article.url}
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

      {/* 🤖 AI ASSISTANT */}
      <div
        style={{
          marginTop: 40,
          padding: 20,
          borderRadius: 10,
          background: darkMode
            ? "#222"
            : "#f5f5f5",
        }}
      >

        <h2>
          🤖 AI Assistant
        </h2>

        <input
          type="text"
          placeholder="Ask AI about this stock"
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
          style={{
            width: "70%",
            padding: 10,
          }}
        />

        <button
          onClick={askAI}
          style={{
            marginLeft: 10,
          }}
        >
          Ask AI
        </button>

        {aiAnswer && (

          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 10,
              background: darkMode
                ? "#333"
                : "#fff",
            }}
          >

            <p>
              {aiAnswer}
            </p>

          </div>

        )}

      </div>

    </div>

  )}

  {/* ⭐ WATCHLIST */}
  <div
    style={{
      marginTop: 40,
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

</div>
```

);
}
