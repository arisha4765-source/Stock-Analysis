import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";
import yahooFinance from "yahoo-finance2";

const app = express();

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

    const result = await yahooFinance.quote(symbol);

    res.json({
      symbol: result.symbol,
      name: result.shortName,
      price: result.regularMarketPrice,
      change: result.regularMarketChange,
      changePercent:
        result.regularMarketChangePercent,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Stock fetch failed",
    });
  }
});

// ---------------- HISTORY ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const result = await yahooFinance.chart(
      symbol,
      {
        period1: "2024-01-01",
        interval: "1d",
      }
    );

    const history =
      result.quotes?.map((item) => ({
        datetime:
          item.date?.toISOString().split("T")[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      })) || [];

    res.json(history);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "History fetch failed",
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
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------- AI ----------------
app.post("/api/ai", async (req, res) => {
  try {
    const {
      symbol,
      price,
      history = [],
    } = req.body;

    const closes = history
      .slice(-30)
      .map((item) =>
        typeof item === "object"
          ? item.close
          : item
      );

    const prompt = `
You are a professional stock analyst.

Stock: ${symbol}
Current Price: ${price}

Recent Closing Prices:
${closes.join(", ")}

Provide:

Trend:
Buy/Hold/Sell:
Confidence:
Risk:
Reason:
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
