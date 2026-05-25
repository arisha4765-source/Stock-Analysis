import React, { useState } from "react";

export default function App() {
  const [symbol, setSymbol] = useState("");

  return (
    <div style={{ padding: 30 }}>
      <h1>⚡ Stock Analyzer</h1>

      <input
        placeholder="Enter Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <button>Analyze</button>
    </div>
  );
}
