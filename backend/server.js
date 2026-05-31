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

  // Yahoo format
  if (
    indianStocks.includes(symbol) &&
    !symbol.endsWith(".NS")
  ) {
    return `${symbol}.NS`;
  }

  return symbol;
};

// ---------------- STOCK PRICE ----------------
app.get("/api/yahoo/:symbol", async (req, res) => {
  try {
    const result = await yahooFinance.quote(req.params.symbol);

    res.json({
      provider: "Yahoo",
      symbol: result.symbol,
      price: result.regularMarketPrice,
      name: result.shortName
    });
  } catch (err) {
    res.status(500).json({ error: "Yahoo failed" });
  }
});

app.get("/api/yahoo-history/:symbol", async (req, res) => {
  try {
    const result = await yahooFinance.chart(
      req.params.symbol,
      {
        period1: "2025-01-01",
        interval: "1d"
      }
    );

    res.json(result.quotes);
  } catch (err) {
    res.status(500).json({ error: "Yahoo chart failed" });
  }
});

app.get("/api/twelve/:symbol", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.twelvedata.com/price?symbol=${req.params.symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    res.json({
      provider: "TwelveData",
      ...response.data
    });
  } catch (err) {
    res.status(500).json({ error: "TwelveData failed" });
  }
});

// ---------------- HISTORY ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    let symbol = req.params.symbol.toUpperCase();

    const indianStocks = [
      "TCS",
      "INFY",
      "RELIANCE",
      "SBIN",
      "HDFCBANK",
      "ICICIBANK",
      "WIPRO",
      "LT",
      "AXISBANK"
    ];

    if (
      indianStocks.includes(symbol) &&
      !symbol.endsWith(".NS")
    ) {
      symbol = `${symbol}.NS`;
    }

    const result = await yahooFinance.chart(
      symbol,
      {
        period1: "2023-01-01",
        interval: "1d"
      }
    );

    const history =
      result.quotes?.map((item) => ({
        datetime:
          item.date
            ?.toISOString()
            .split("T")[0],
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      })) || [];

    res.json(history);

  } catch (error) {
    console.log(error);

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
    console.log("AI REQUEST:", req.body);

    // existing OpenAI code hereapp.post("/api/ai", async (req, res) => {
  try {
    const {
      symbol,
      price,
      history,
    } = req.body;

    const prompt = `
You are an expert stock analyst.

Analyze this stock:

Stock: ${symbol}
Current Price: ${price}

Recent Prices:
${history?.join(", ")}

Return:
- Trend
- Buy/Hold/Sell
- Risk
- Confidence %
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
    

  } catch (err) {
    console.error("AI ERROR:", err);

    res.status(500).json({
      error: err.message
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
