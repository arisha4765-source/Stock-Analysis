import React, { useState } from "react";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [aiAnswer, setAiAnswer] = useState("");
const fetchStock = async () => {
  if (!symbol) return;

  try {
    const res = await fetch(
      "https://stock-analysis-81hr.onrender.com/api/stock/" +
        symbol.toUpperCase()
    );

    const json = await res.json();
    setData(json);
  } catch (err) {
    console.log(err);
    alert("Stock not found");
  }
};
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{ width: "250px", background: "#111", color: "#fff", padding: 20 }}>
        <h2>📊 Stock App</h2>

        <input
          placeholder="Search stock"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={{ width: "100%", marginTop: 10 }}
        />

        <button
  style={{ width: "100%", marginTop: 10 }}
  onClick={fetchStock}
>
  Search
</button>
        <hr />

        <p>📌 Watchlist</p>
        <p>🔔 Alerts</p>
        <p>🤖 AI Assistant</p>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, padding: 20 }}>

        <h1>Dashboard</h1>

        {data ? (
          <div>
            <h2>{data.symbol}</h2>
            <p>Price: {data.price}</p>
          </div>
        ) : (
          <p>Search a stock to begin</p>
        )}
      </div>

      {/* AI PANEL */}
      <div style={{ width: "300px", background: "#f4f4f4", padding: 20 }}>
        <h3>🤖 AI Assistant</h3>
const [question, setQuestion] = useState("");
        <textarea
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="Ask something..."
  style={{ width: "100%", height: "100px" }}
/>
        POST /api/ai
        const askAI = async () => {
  try {
    const res = await fetch(
      "https://stock-analysis-81hr.onrender.com/api/ai",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          symbol: data?.symbol,
          price: data?.price,
        }),
      }
    );

    const json = await res.json();
    setAiAnswer(json.answer);
  } catch (err) {
    setAiAnswer("AI error");
  }
};
        <button style={{ width: "100%", marginTop: 10 }} onClick={askAI}>
  Ask AI
</button>

        <p>{aiAnswer}</p>
      </div>

    </div>
  );
}
