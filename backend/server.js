import express from "express";
import cors from "cors";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pkg from "stock-nse-india";

const { NseIndia } = pkg;

const app = express();

app.use(cors());
app.use(express.json());

const nse = new NseIndia();

// ---------------- GEMINI ----------------
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

// ---------------- ROOT ----------------
app.get("/", (req, res) => {
  res.send("Stock Backend Running ✅");
});

// ---------------- STOCK LIST ----------------
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
  "KOTAKBANK"
];

const isIndianStock = (symbol) => {
  return indianStocks.includes(
    symbol.toUpperCase()
  );
};

// ---------------- STOCK PRICE ----------------
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol =
      req.params.symbol.toUpperCase();

    // -------- NSE STOCKS --------
    if (isIndianStock(symbol)) {
      const data =
        await nse.getEquityDetails(symbol);

      return res.json({
        symbol,
        name: data.info.companyName,
        price:
          data.priceInfo.lastPrice,
        change:
          data.priceInfo.change,
        changePercent:
          data.priceInfo.pChange
      });
    }

    // -------- US STOCKS --------
    const response =
      await axios.get(
        `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
      );

    res.json({
      symbol,
      price: response.data.price
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Stock fetch failed",
      details: err.message
    });
  }
});

// ---------------- HISTORY ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol =
      req.params.symbol.toUpperCase();

    // -------- NSE HISTORY --------
    if (isIndianStock(symbol)) {
      const data =
        await nse.getEquityHistoricalData(
          symbol,
          "01-01-2024",
          "31-12-2025"
        );

      const history = data.map(
        (item) => ({
          datetime: item.CH_TIMESTAMP,
          open: item.CH_OPENING_PRICE,
          high: item.CH_TRADE_HIGH_PRICE,
          low: item.CH_TRADE_LOW_PRICE,
          close:
            item.CH_CLOSING_PRICE,
          volume:
            item.CH_TOT_TRADED_QTY
        })
      );

      return res.json(history);
    }

    // -------- US HISTORY --------
    const response =
      await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=200&apikey=${process.env.TWELVE_DATA_API_KEY}`
      );

    const history =
      response.data.values?.map(
        (item) => ({
          datetime:
            item.datetime,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        })
      ) || [];

    res.json(history.reverse());

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "History fetch failed",
      details: err.message
    });
  }
});

// ---------------- NEWS ----------------
app.get("/api/news/:symbol", async (req, res) => {
  try {
    const symbol =
      req.params.symbol;

    const response =
      await axios.get(
        `https://newsapi.org/v2/everything?q=${symbol}&sortBy=publishedAt&language=en&apiKey=${process.env.NEWS_API_KEY}`
      );

    res.json(response.data);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "News fetch failed"
    });
  }
});

// ---------------- AI ----------------
app.post("/api/ai", async (req, res) => {
  try {
    const {
      symbol,
      price,
      history = []
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

    const model =
      genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

    const result =
      await model.generateContent(
        prompt
      );

    const text =
      result.response.text();

    res.json({
      analysis: text
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "AI failed",
      details: err.message
    });
  }
});

// ---------------- START ----------------
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on ${PORT}`
  );
});
