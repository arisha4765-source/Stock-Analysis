import express from "express";
import cors from "cors";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const app = express();

app.get("/test-stock", async (req, res) => {
  try {
    const result =
      await yahooFinance.quote("TCS.NS");

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});

app.get("/debug", (req, res) => {
  res.json({
    yahooFinance
  });
});

app.get("/methods", (req, res) => {
  res.json(
    Object.getOwnPropertyNames(
      Object.getPrototypeOf(yahooFinance)
    )
  );
});

app.use(cors());
app.use(express.json());

// ---------------- ROOT ----------------
app.get("/", (req, res) => {
  res.send("Hybrid Stock Backend Running ✅");
});

// ---------------- SYMBOL FORMAT ----------------
const formatSymbol = (symbol) => {
  symbol = symbol.toUpperCase().trim();

  const indianStocks = [
    "TCS",
    "INFY",
    "RELIANCE",
    "SBIN",
    "HDFCBANK",
    "ICICIBANK",
    "WIPRO",
    "LT",
    "AXISBANK",
    "KOTAKBANK",
  ];

  if (
    indianStocks.includes(symbol) &&
    !symbol.endsWith(".NS")
  ) {
    return `${symbol}.NS`;
  }

  return symbol;
};

// ---------------- STOCK PRICE ----------------
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const response = await axios.get(
      `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    res.json({
      symbol,
      price: response.data.price
    });

  } catch (err) {
  console.log(
    "BACKEND ERROR:",
    err.response?.data
  );

  console.log(err);

  alert("Failed to load stock data");
}
});
// ---------------- HISTORY ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=100&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    const history =
      response.data.values?.map(item => ({
        datetime: item.datetime,
        close: Number(item.close)
      })) || [];

    res.json(history.reverse());

  } catch (err) {
    res.status(500).json({
      error: "History fetch failed"
    });
  }
});
// ---------------- NEWS ----------------
app.get("/api/news/:symbol", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${req.params.symbol}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "News fetch failed",
    });
  }
});

// ---------------- OPENAI ----------------

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// ---------------- AI ----------------
app.post("/api/ai", async (req, res) => {
  try {
    const { symbol, price, history = [] } =
      req.body;

    const closes = history
      .slice(-30)
      .map((item) => item.close);

    const prompt = `
Stock: ${symbol}
Current Price: ${price}

Recent Prices:
${closes.join(", ")}

Provide:

Trend:
Buy/Hold/Sell:
Confidence:
Risk:
Reason:
`;

    const model =
      genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

    const result =
      await model.generateContent(prompt);

    const text =
      result.response.text();

    res.json({
      analysis: text,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "AI failed",
    });
  }
});

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
