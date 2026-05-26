import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// ================= OPENAI =================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ,
});

// ================= STOCK API (TWELVE DATA) =================
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    let symbol = req.params.symbol.toUpperCase();

    // Indian stock mapping
    const indianMap = {
      TCS: "TCS",
      RELIANCE: "RELIANCE",
      INFY: "INFY",
      SBIN: "SBIN",
    };

    if (indianMap[symbol]) {
      symbol = indianMap[symbol];
    }

    const url =
      "https://api.twelvedata.com/quote?symbol=" +
      symbol +
      "&apikey=" +
      process.env.TWELVE_DATA_API_KEY;

    const response = await axios.get(url);

    if (response.data.status === "error") {
      return res.json({ error: "Stock not found" });
    }

    res.json({
      symbol: response.data.symbol,
      price: response.data.close,
      change: response.data.change,
      percent: response.data.percent_change,
    });
  } catch (err) {
    res.status(500).json({ error: "API error" });
  }
});

// ================= HISTORY (for charts) =================
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const url =
      "https://api.twelvedata.com/time_series?symbol=" +
      symbol +
      "&interval=1day&outputsize=30&apikey=" +
      process.env.TWELVE_DATA_API_KEY;

    const response = await axios.get(url);

    const values = response.data.values || [];

    const prices = values.map((v) => Number(v.close)).reverse();

    res.json({ prices });
  } catch (err) {
    res.status(500).json({ error: "History error" });
  }
});

// ================= AI =================
app.post("/api/ai", async (req, res) => {
  try {
    const { symbol, price, question } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "You are a stock expert.\n" +
            "Stock: " +
            symbol +
            "\nPrice: " +
            price +
            "\nQuestion: " +
            question,
        },
      ],
    });

    res.json({
      answer: response.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error: "AI error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on " + PORT));
