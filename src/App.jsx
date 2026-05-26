import React, { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  // ---------------- STOCK STATE ----------------
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  // ---------------- AI STATE ----------------
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  // ---------------- AUTH STATE ----------------
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ---------------- WATCHLIST ----------------
  const [watchlist, setWatchlist] = useState([]);

  // ================= AUTH SESSION =================
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // ================= LOAD WATCHLIST (FIXED) =================
  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  // ================= STOCK FETCH =================
  const fetchStock = async () => {
    const res = await axios.get(
      "https://stock-analysis-81hr.onrender.com/api/stock/" + symbol
    );

    setData(res.data);

    const h = await axios.get(
      "https://stock-analysis-81hr.onrender.com/api/history/" + symbol
    );

    setHistory(
      h.data.prices.map((p, i) => ({
        time: i,
        price: p,
      }))
    );
  };

  // ================= AI =================
  const askAI = async () => {
    const res = await axios.post(
      "https://stock-analysis-81hr.onrender.com/api/ai",
      {
        symbol: data?.symbol,
        price: data?.price,
        history: history.map((h) => h.price),
        question,
      }
    );

    setAiAnswer(res.data.analysis);
  };

  // ================= LOGIN =================
  const signUp = async () => {
    await supabase.auth.signUp({ email, password });
  };

  const signIn = async () => {
    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setUser(data.user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ================= WATCHLIST =================
  const loadWatchlist = async () => {
    const { data } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id);

    setWatchlist(data || []);
  };

  const addToWatchlist = async () => {
    if (!user || !data?.symbol) return;

    await supabase.from("watchlist").insert([
      {
        user_id: user.id,
        symbol: data.symbol,
      },
    ]);

    loadWatchlist();
  };

  // ================= UI =================
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{ width: 250, padding: 10, background: "#111", color: "#fff" }}>
        <h3>Stock AI</h3>

        {/* LOGIN */}
        {!user ? (
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

            <button onClick={signIn}>Login</button>
            <button onClick={signUp}>Signup</button>
          </div>
        ) : (
          <div>
            <p>Logged in</p>
            <button onClick={signOut}>Logout</button>
          </div>
        )}

        {/* SEARCH */}
        <input
          placeholder="Stock"
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button onClick={fetchStock}>Search</button>

        {/* WATCHLIST */}
        <h4>Watchlist</h4>
        {watchlist.map((w) => (
          <p key={w.id}>{w.symbol}</p>
        ))}

        <button onClick={addToWatchlist}>+ Add</button>
      </div>

      {/* CENTER CHART */}
      <div style={{ flex: 1, padding: 20 }}>
        <h2>{data?.symbol}</h2>

        {history.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#00ff88" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* RIGHT AI PANEL */}
      <div style={{ width: 300, padding: 10, background: "#111", color: "#fff" }}>
        <h3>AI Analyst</h3>

        <textarea
          style={{ width: "100%", height: 100 }}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button onClick={askAI}>Ask AI</button>

        <pre style={{ whiteSpace: "pre-wrap" }}>{aiAnswer}</pre>
      </div>
    </div>
  );
}
