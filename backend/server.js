import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const formatSymbol = (symbol) => {
  symbol = symbol.toUpperCase();

  const indianStocks = [
    "TCS",
    "INFY",
    "RELIANCE",
    "SBIN",
    "HDFCBANK",
    "ICICIBANK",
  ];

  if (indianStocks.includes(symbol)) {
    return `${symbol}.NSE`;
  }

  return symbol;
};

// STOCK
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const response = await axios.get(
      `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    res.json(response.data);

  } catch (err) {
    console.log(err.message);

    res.status(500).json({
      error: "Stock failed",
    });
  }
});

// HISTORY
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = formatSymbol(req.params.symbol);

    const response = await axios.get(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${process.env.TWELVE_DATA_API_KEY}`
    );

    const prices =
      response.data.values?.map((v) => ({
        datetime: v.datetime,
        close: Number(v.close),
      })).reverse() || [];

    res.json(prices);

  } catch (err) {
    console.log(err.message);

    res.status(500).json({
      error: "History failed",
    });
  }
});

// NEWS
app.get("/api/news/:symbol", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${req.params.symbol}&apiKey=${process.env.NEWS_API_KEY}`
    );

    res.json(response.data);

  } catch (err) {
    console.log(err.message);

    res.status(500).json({
      error: "News failed",
    });
  }
});

// AI
app.post("/api/ai", async (req, res) => {
  try {
    const {
      symbol,
      price,
      history,
      question,
    } = req.body;

    const prompt = `
Analyze stock ${symbol}

Price: ${price}

History:
${history?.join(", ")}

Question:
${question}

Give short investment advice.
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
    console.log(err.message);

    res.status(500).json({
      error: "AI failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
