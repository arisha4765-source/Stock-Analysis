import React, { useState } from "react";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);
  const [aiAnswer, setAiAnswer] = useState("");

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

        <button style={{ width: "100%", marginTop: 10 }}>
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

        <textarea
          placeholder="Ask something..."
          style={{ width: "100%", height: "100px" }}
        />

        <button style={{ width: "100%", marginTop: 10 }}>
          Ask AI
        </button>

        <p>{aiAnswer}</p>
      </div>

    </div>
  );
}
