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
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    // TRY YAHOO FIRST
    try {
      const yahoo =
        await yahooFinance.quote(symbol);

      return res.json({
        provider: "Yahoo Finance",
        symbol: yahoo.symbol,
        name: yahoo.shortName,
        price: yahoo.regularMarketPrice,
        change:
          yahoo.regularMarketChangePercent,
        currency: yahoo.currency,
        exchange: yahoo.exchange,
      });

    } catch (yahooErr) {
      console.log(
        "Yahoo failed, using TwelveData"
      );
    }

    // FALLBACK TO TWELVE DATA
    const twelveSymbol =
      symbol.replace(".NS", ".NSE");

    const response = await axios.get(
      `https://api.twelvedata.com/price?symbol=${twelveSymbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    return res.json({
      provider: "Twelve Data",
      symbol: twelveSymbol,
      price: response.data.price,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Stock fetch failed",
    });
  }
});

// ---------------- HISTORY ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    // TRY YAHOO FIRST
    try {
      const result =
        await yahooFinance.chart(symbol, {
          period1: "2024-01-01",
          interval: "1d",
        });

      const prices =
        result.quotes.map((item) => ({
          datetime:
            item.date
              ?.toISOString()
              .split("T")[0],
          close: item.close,
        }));

      return res.json(prices);

    } catch (yahooErr) {
      console.log(
        "Yahoo history failed, using TwelveData"
      );
    }

    // FALLBACK TO TWELVE DATA
    const twelveSymbol =
      symbol.replace(".NS", ".NSE");

    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${twelveSymbol}&interval=1day&outputsize=30&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    const prices =
      response.data.values?.map((v) => ({
        datetime: v.datetime,
        close: Number(v.close),
      })).reverse() || [];

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

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on ${PORT}`
  );
});
