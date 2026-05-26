const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

// 📈 STOCK INFO API
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      "https://api.twelvedata.com/quote",
      {
        params: {
          symbol,
          apikey: "aaf7843c99e64f0d8a388c0ad4e736c7",
        },
      }
    );

    const stock = response.data;

    console.log(stock);

    // ❌ API returned error
    if (stock.status === "error") {
      return res.status(404).json({
        error: stock.message || "Stock not found",
      });
    }

    // ✅ HANDLE DIFFERENT PRICE FIELDS
    const price = parseFloat(
      stock.close ||
      stock.price ||
      stock.previous_close ||
      0
    );

    const previousClose = parseFloat(
      stock.previous_close || price
    );

    const change = (
      ((price - previousClose) / previousClose) *
      100
    ).toFixed(2);

    let recommendation = "HOLD";

    if (change > 2) {
      recommendation = "STRONG BUY";
    } else if (change > 0) {
      recommendation = "BUY";
    } else if (change < -2) {
      recommendation = "SELL";
    }

    res.json({
      symbol,
      price,
      change,
      recommendation,
    });

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      error: "API error",
    });
  }
});

// 📊 HISTORY API
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      "https://api.twelvedata.com/time_series",
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
        error: "No history data",
      });
    }

    // newest → oldest
    const closePrices = values
      .reverse()
      .map((item) => parseFloat(item.close));

    res.json({
      c: closePrices,
    });

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      c: [],
      error: "History API error",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
