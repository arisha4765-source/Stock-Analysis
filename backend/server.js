import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);
// ---------------- OPENAI ----------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------- STOCK FORMAT ----------------
const formatSymbol = (symbol) => {
  symbol = symbol.toUpperCase();

  const india = ["TCS", "INFY", "RELIANCE", "SBIN"];

  if (india.includes(symbol)) {
    return symbol + ".NSE";
  }

  return symbol;
};

app.get("/api/ai/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;

    res.json({
      prediction:
        `${symbol} currently shows moderate momentum. ` +
        `This is not financial advice but trend appears bullish.`,
    });
  } catch (err) {
    res.status(500).json({
      error: "AI failed",
    });
  }
});

app.get("/api/news/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol;

    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${process.env.NEWS_API_KEY}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: "News failed",
    });
  }
});
// ---------------- STOCK API ----------------
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    let symbol = req.params.symbol.toUpperCase();

    // Indian stocks
    if (
      !symbol.includes(":") &&
      !symbol.includes(".")
    ) {
      symbol = `${symbol}:NSE`;
    }

    const response = await axios.get(
      `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "API error",
    });
  }
});

// ---------------- STOCK API ----------------


// ---------------- HISTORY (CHART) ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const url =
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${process.env.TWELVE_DATA_API_KEY}`;

    const response = await axios.get(url);

    const prices =
      response.data.values?.map((v) => Number(v.close)).reverse() || [];

    res.json({ prices });
  } catch (err) {
    res.status(500).json({ error: "History error" });
  }
});
// ---------------- AI ASSISTANT ----------------
app.post("/api/ai", async (req, res) => {
  try {
    const { symbol, price, history, question } = req.body;

    const lastPrices = history?.slice(-10) || [];

    const prompt = `
You are a professional stock market analyst.

Analyze this stock:

Symbol: ${symbol}
Price: ${price}
Recent prices: ${lastPrices.join(", ")}
User question: ${question}

Return ONLY in this format:

Signal: Buy | Hold | Sell
Confidence: 0-100
Risk: Low | Medium | High
Reason: short explanation
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      analysis: response.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});

// ---------------- HISTORY (CHART) ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const url =
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${process.env.TWELVE_DATA_API_KEY}`;

    const response = await axios.get(url);

    const prices =
      response.data.values?.map((v) => Number(v.close)).reverse() || [];

    res.json({ prices });
  } catch (err) {
    res.status(500).json({ error: "History error" });
  }
});

// ---------------- AI ASSISTANT ----------------
app.post("/api/ai", async (req, res) => {
  try {
    const { symbol, price, history, question } = req.body;

    const lastPrices = history?.slice(-10) || [];

    const prompt = `
You are a professional stock market analyst.

Analyze this stock:

Symbol: ${symbol}
Price: ${price}
Recent prices: ${lastPrices.join(", ")}
User question: ${question}

Return ONLY in this format:

Signal: Buy | Hold | Sell
Confidence: 0-100
Risk: Low | Medium | High
Reason: short explanation
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      analysis: response.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});
// ---------------- START ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log("Server running on " + PORT)
);
