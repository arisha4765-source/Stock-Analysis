import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [symbol, setSymbol] = useState("");
  const [data, setData] = useState(null);

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  // ================= STOCK =================
 const fetchStock = async () => {
  const res = await axios.get(
    "https://stock-analysis-81hr.onrender.com/api/stock/" + symbol
  );

  setData(res.data);

  const historyRes = await axios.get(
    "https://stock-analysis-81hr.onrender.com/api/history/" + symbol
  );

  setHistory(historyRes.data.prices || []);
};
  // ================= AI =================
  const askAI = async () => {
    const res = await axios.post(
      "https://stock-analysis-81hr.onrender.com/api/ai",
      {
        symbol: data?.symbol,
        price: data?.price,
        question,
      }
    );

    setAiAnswer(res.data.answer);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Stock AI Dashboard</h1>

      {/* SEARCH */}
      <input
        placeholder="Stock symbol"
        onChange={(e) => setSymbol(e.target.value)}
      />
      <button onClick={fetchStock}>Search</button>

      {/* STOCK DATA */}
      {data && (
        <div>
          <h2>{data.symbol}</h2>
          <p>Price: {data.price}</p>
        </div>
      )}

      {/* AI */}
      <div style={{ marginTop: 20 }}>
        <h3>AI Assistant</h3>

        <textarea
          placeholder="Ask question"
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button onClick={askAI}>Ask AI</button>

        <p>{aiAnswer}</p>
      </div>
    </div>
  );
}
