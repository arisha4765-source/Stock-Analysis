import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "./supabase";

export default function App() {
  const [symbol, setSymbol] = useState("TCS");
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [history, setHistory] = useState([]);

  // -----------------------------
  // AUTH CHECK (Supabase)
  // -----------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  // -----------------------------
  // FETCH STOCK PRICE
  // -----------------------------
  const fetchStock = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/${symbol}`
      );

      setPrice(res.data.price);
    } catch (err) {
      console.log(err);
      alert("Stock not found or API error");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FETCH NEWS (optional backend)
  // -----------------------------
  const fetchNews = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/news/${symbol}`
      );
      setNews(res.data.articles || []);
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // FETCH HISTORY (for charts)
  // -----------------------------
  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/history/${symbol}`
      );
      setHistory(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // AI PREDICTION (backend route)
  // -----------------------------
  const getPrediction = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ai/${symbol}`
      );

      alert(res.data.prediction || "No prediction available");
    } catch (err) {
      console.log(err);
      alert("AI not responding");
    }
  };

  // -----------------------------
  // CREATE ALERT (PHASE 4)
  // -----------------------------
  const createAlert = async () => {
    const target = prompt("Enter target price");
    const condition = prompt("above or below?");
    const method = prompt("email / whatsapp / inapp");

    if (!target || !condition || !method) return;

    await supabase.from("alerts").insert([
      {
        user_id: user?.id,
        symbol,
        target_price: Number(target),
        condition,
        method,
      },
    ]);

    alert("Alert created!");
  };

  // -----------------------------
  // LOGIN (simple)
  // -----------------------------
  const login = async () => {
    const email = prompt("Enter email");

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) alert(error.message);
    else alert("Check your email for login link");
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>📊 Stock Analysis Dashboard</h1>

      {/* LOGIN */}
      {!user ? (
        <button onClick={login}>🔐 Login</button>
      ) : (
        <p>👤 Logged in</p>
      )}

      <hr />

      {/* SEARCH */}
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter stock symbol"
      />

      <button onClick={fetchStock}>
        {loading ? "Loading..." : "Get Price"}
      </button>

      <button onClick={fetchHistory}>📈 Load Chart Data</button>

      <button onClick={fetchNews}>📰 Load News</button>

      <button onClick={getPrediction}>🤖 AI Prediction</button>

      <button onClick={createAlert}>🔔 Create Alert</button>

      <hr />

      {/* PRICE */}
      <h2>Price: {price ? `₹${price}` : "No data"}</h2>

      {/* NEWS */}
      <h3>📰 News</h3>
      {news.map((n, i) => (
        <p key={i}>{n.title}</p>
      ))}

      {/* CHART DATA (placeholder) */}
      <h3>📈 History Data</h3>
      <pre>{JSON.stringify(history, null, 2)}</pre>
    </div>
  );
}
