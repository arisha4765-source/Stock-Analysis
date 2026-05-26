import React, { useState, useEffect } from "react";
import axios from "axios";
import supabase from "./supabase";

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

  // STOCK
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [news, setNews] = useState([]);

  // UI
  const [darkMode, setDarkMode] = useState(false);

  // AI
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [rsi, setRsi] = useState(0);
  const [ma, setMa] = useState(0);
  const [sentiment, setSentiment] = useState("");

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  // ALERTS
  const [alertPrice, setAlertPrice] = useState("");
  const [alerts, setAlerts] = useState([]);

  // AUTH
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // SESSION
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);

  // RSI
  const calculateRSI = (prices) => {
    if (!prices || prices.length < 10) return 50;

    let gain = 0;
    let loss = 0;

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gain += diff;
      else loss -= diff;
    }

    const rs = gain / (loss || 1);
    return (100 - 100 / (1 + rs)).toFixed(2);
  };

  // MA
  const movingAverage = (prices, days) => {
    const recent = prices.slice(-days);
    const sum = recent.reduce((a, b) => a + b, 0);
    return (sum / recent.length).toFixed(2);
  };

  // SIGNUP
  const signup = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) setAuthMessage(error.message);
    else setAuthMessage("Signup successful");
  };

  // LOGIN
  const login = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) setAuthMessage(error.message);
    else {
      setUser(data.user);
      setAuthMessage("Login successful");
    }
  };

  // LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthMessage("Logged out");
  };

  // AI
const askAI = async () => {
  try {
    const res = await axios.get(
      "https://stock-analysis-81hr.onrender.com/api/ai",
      {
        params: {
          symbol: data.symbol,
          price: data.price,
          prediction,
          rsi,
          sentiment,
          question,
        },
      }
    );

    setAiAnswer(res.data.answer);
  } catch (err) {
    setAiAnswer("AI error. Try again later.");
  }
};

  // FETCH STOCK
  const fetchStock = async () => {
    if (!symbol) return;

    try {
      let formattedSymbol = symbol.toUpperCase();

      const indianStocks = [
        "TCS",
        "RELIANCE",
        "INFY",
        "SBIN",
        "ITC",
        "HDFCBANK",
        "ICICIBANK",
      ];

      if (indianStocks.includes(formattedSymbol)) {
        formattedSymbol = formattedSymbol + ":NSE";
      }

      const res = await axios.get(
        "https://stock-analysis-81hr.onrender.com/api/stock/" +
          formattedSymbol
      );

      setData(res.data);

      const historyRes = await axios.get(
        "https://stock-analysis-81hr.onrender.com/api/history/" +
          formattedSymbol
      );

      const prices = Array.isArray(historyRes.data.c)
        ? historyRes.data.c
        : [];

      setHistory(prices);

      // prediction
      if (prices.length > 5) {
        const first = prices[0];
        const last = prices[prices.length - 1];

        const trend = ((last - first) / first) * 100;

        if (trend > 2) {
          setPrediction("Bullish");
          setConfidence(80);
        } else if (trend < -2) {
          setPrediction("Bearish");
          setConfidence(80);
        } else {
          setPrediction("Neutral");
          setConfidence(50);
        }

        setRsi(calculateRSI(prices));
        setMa(movingAverage(prices, 5));
      }

      // news
      const newsRes = await axios.get(
        "https://stock-analysis-81hr.onrender.com/api/news/" +
          formattedSymbol
      );

      setNews(newsRes.data || []);

      // sentiment
      let score = 0;

      (newsRes.data || []).forEach((a) => {
        const t = (a.title || "").toLowerCase();

        if (t.includes("gain") || t.includes("profit"))
          score++;

        if (t.includes("loss") || t.includes("drop"))
          score--;
      });

      if (score > 0) setSentiment("Positive");
      else if (score < 0) setSentiment("Negative");
      else setSentiment("Neutral");

    } catch (err) {
      console.log(err);
      alert("Stock not found or API error");
    }
  };

  // ALERT LOOP
  useEffect(() => {
    const interval = setInterval(() => {
      if (!data) return;

      alerts.forEach((a) => {
        if (
          data.symbol &&
          data.symbol.includes(a.symbol) &&
          Number(data.price) >= a.target
        ) {
          alert(a.symbol + " hit " + a.target);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [data, alerts]);

  const chartData = {
    labels: history.map((_, i) => i + 1),
    datasets: [
      {
        label: "Price",
        data: history,
        borderColor: "blue",
      },
    ],
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Stock Analyzer</h1>

      {/* AUTH */}
      <div>
        {user ? (
          <div>
            <p>Logged in: {user.email}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <div>
            <input
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={signup}>Signup</button>
            <button onClick={login}>Login</button>
          </div>
        )}
        <p>{authMessage}</p>
      </div>

      {/* STOCK */}
      {user && (
        <div>
          <input
            placeholder="Stock"
            onChange={(e) => setSymbol(e.target.value)}
          />
          <button onClick={fetchStock}>Search</button>
        </div>
      )}

      {/* DATA */}
      {data && (
        <div>
          <h2>{data.symbol}</h2>
          <p>Price: {data.price}</p>
          <p>Prediction: {prediction}</p>
          <p>RSI: {rsi}</p>
          <p>MA: {ma}</p>
          <p>Sentiment: {sentiment}</p>

          <Line data={chartData} />

          <h3>News</h3>
          {news.map((n, i) => (
            <p key={i}>{n.title}</p>
          ))}

          <h3>AI Assistant</h3>
          <button onClick={askAI}>Ask AI</button>
          <p>{aiAnswer}</p>

          <h3>Alerts</h3>
          <input
            placeholder="price"
            onChange={(e) => setAlertPrice(e.target.value)}
          />
          <button
            onClick={() =>
              setAlerts([
                ...alerts,
                { symbol, target: Number(alertPrice) },
              ])
            }
          >
            Set Alert
          </button>
        </div>
      )}
    </div>
  );
}
