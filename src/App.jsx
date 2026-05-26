import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [history, setHistory] = ([]);
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  const parseSignal = (text) => {
  if (!text) return "⚪ UNKNOWN";

  const lower = text.toLowerCase();

  if (lower.includes("buy")) return "🟢 BUY";
  if (lower.includes("sell")) return "🔴 SELL";
  if (lower.includes("hold")) return "🟡 HOLD";

  return "⚪ UNKNOWN";
};
  // ---------------- FETCH STOCK ----------------
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

  // ---------------- AI ----------------
 const askAI = async () => {
  const res = await axios.post(
    "https://stock-analysis-81hr.onrender.com/api/ai",
    {
      symbol: data.symbol,
      price: data.price,
      history: history.map((h) => h.price),
      question,
    }
  );

  setAiAnswer(res.data.analysis);
};
 <h3>Signal: {parseSignal(aiAnswer)}</h3>
<pre style={{ whiteSpace: "pre-wrap" }}>{aiAnswer}</pre>
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f0f0f", color: "white" }}>

      {/* SIDEBAR */}
      <div style={{ marginTop: 20, padding: 10, background: "#222" }}>
  <h3>🤖 AI Trading Signal</h3>
  <pre style={{ whiteSpace: "pre-wrap" }}>{aiAnswer}</pre>
</div>

        <input
          placeholder="Enter stock (TCS, AAPL)"
          style={{ width: "100%", padding: 8 }}
          onChange={(e) => setSymbol(e.target.value)}
        />

        <button onClick={fetchStock} style={{ width: "100%", marginTop: 10 }}>
          Search
        </button>

        {data && (
          <div style={{ marginTop: 20 }}>
            <h3>{data.symbol}</h3>
            <p>Price: {data.price}</p>
          </div>
        )}
      </div>

      {/* MAIN CHART AREA */}
      <div style={{ flex: 1, padding: 20 }}>
        <h2>Market Chart</h2>

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

      {/* AI PANEL */}
      <div style={{ width: 320, padding: 20, background: "#111" }}>
        <h3>🤖 AI Analyst</h3>

        <textarea
          style={{ width: "100%", height: 100 }}
          placeholder="Ask: Buy or Sell?"
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button onClick={askAI} style={{ width: "100%", marginTop: 10 }}>
          Ask AI
        </button>

        <div style={{ marginTop: 20 }}>
          <b>AI Response:</b>
          <p>{aiAnswer}</p>
        </div>
      </div>
    </div>
  );
}
