import express from "express";
import cors from "cors";
import OpenAI from "openai";
import yahooFinance from "yahoo-finance2";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

// ---------------- ROOT ----------------
app.get("/", (req, res) => {
  res.send("Yahoo Finance Backend Running ✅");
});

// ---------------- FORMAT SYMBOL ----------------
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

    const result =
      await yahooFinance.quote(symbol);

    res.json({
      symbol: result.symbol,
      name: result.shortName,
      price: result.regularMarketPrice,
      change: result.regularMarketChangePercent,
      currency: result.currency,
      market: result.exchange,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Stock fetch failed",
    });
  }
});

// ---------------- CHART HISTORY ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const result =
      await yahooFinance.chart(symbol, {
        period1: "2024-01-01",
        interval: "1d",
      });

    const prices =
      result.quotes.map((item) => ({
        datetime:
          item.date?.toISOString().split("T")[0],
        close: item.close,
      }));

    res.json(prices);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "History failed",
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
    console.log(err);

    res.status(500).json({
      error: "News failed",
    });
  }
});

// ---------------- OPENAI ----------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------- AI ----------------
app.post("/api/ai", async (req, res) => {
  try {
    const {
      symbol,
      price,
      history,
    } = req.body;

    const prompt = `
Analyze this stock.

Stock:
${symbol}

Current Price:
${price}

Recent Prices:
${history?.join(", ")}

Give:
- Trend
- Buy/Hold/Sell
- Risk
- Short reason
`;

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    res.json({
      analysis:
        completion.choices[0].message.content,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "AI failed",
    });
  }
});

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on ${PORT}`
  );
});
