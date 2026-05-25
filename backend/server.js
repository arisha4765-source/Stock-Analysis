const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*", // allow frontend to connect safely
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

// ---------------- STOCK API ----------------
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=d8a10g9r01qhv1uvp210d8a10g9r01qhv1uvp21g`
    );

    const stock = response.data;

    if (!stock || stock.c === undefined) {
      return res.status(404).json({ error: "Stock not found" });
    }

    const price = stock.c;
    const change = stock.dp;

    let recommendation = "HOLD";
    if (change > 2) recommendation = "STRONG BUY";
    else if (change > 0) recommendation = "BUY";
    else if (change < -2) recommendation = "SELL";

    res.json({
      symbol,
      price,
      change,
      recommendation,
    });
  } catch (err) {
    console.error("STOCK ERROR:", err.message);
    res.status(500).json({ error: "API error" });
  }
});

// ---------------- HISTORY API ----------------
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      `https://api.twelvedata.com/time_series`,
      {
        params: {
          symbol,
          interval: "1day",
          outputsize: 30,
          apikey: "aaf7843c99e64f0d8a388c0ad4e736c7",
        },
      }
    );

    const values = response.data?.values;

    if (!values) {
      return res.json({
        c: [],
        error: response.data?.message || "No data from Twelve Data",
      });
    }

    // Twelve Data returns newest first → reverse it
    const closePrices = values
      .reverse()
      .map((item) => parseFloat(item.close));

    res.json({
      c: closePrices,
    });

  } catch (err) {
    console.error("HISTORY ERROR:", err.message);
    res.json({
      c: [],
      error: "API failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
