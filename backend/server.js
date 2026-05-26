const express = require("express");
const axios = require("axios");
const cors = require("cors");
const yahooFinance = require("yahoo-finance2").default;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

// 📈 STOCK API
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    let symbol = req.params.symbol.toUpperCase();

    // 🇮🇳 Indian stocks → Yahoo Finance
    if (symbol.includes(":NSE")) {

      const yahooSymbol =
        symbol.replace(":NSE", ".NS");

      const result = await yahooFinance.quote(
        yahooSymbol
      );

      const price = result.regularMarketPrice;

      const previous =
        result.regularMarketPreviousClose;

      const change = (
        ((price - previous) / previous) *
        100
      ).toFixed(2);

      let recommendation = "HOLD";

      if (change > 2)
        recommendation = "STRONG BUY";
      else if (change > 0)
        recommendation = "BUY";
      else if (change < -2)
        recommendation = "SELL";

      return res.json({
        symbol,
        price,
        change,
        recommendation,
      });
    }

    // 🇺🇸 US STOCKS → Twelve Data
    const response = await axios.get(
      "https://api.twelvedata.com/quote",
      {
        params: {
          symbol,
          apikey: "aaf7843c99e64f0d8a388c0ad4e736c7,
        },
      }
    );

    const stock = response.data;

    if (stock.status === "error") {
      return res.status(404).json({
        error: stock.message,
      });
    }

    const price = parseFloat(stock.close);

    const previousClose = parseFloat(
      stock.previous_close || price
    );

    const change = (
      ((price - previousClose) / previousClose) *
      100
    ).toFixed(2);

    let recommendation = "HOLD";

    if (change > 2)
      recommendation = "STRONG BUY";
    else if (change > 0)
      recommendation = "BUY";
    else if (change < -2)
      recommendation = "SELL";

    res.json({
      symbol,
      price,
      change,
      recommendation,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "API error",
    });
  }
});

// 📊 HISTORY API
app.get("/api/history/:symbol", async (req, res) => {
  try {
    let symbol = req.params.symbol.toUpperCase();

    // 🇮🇳 NSE STOCK HISTORY
    if (symbol.includes(":NSE")) {

      const yahooSymbol =
        symbol.replace(":NSE", ".NS");

      const result =
        await yahooFinance.historical(
          yahooSymbol,
          {
            period1: "2024-01-01",
          }
        );

      const prices = result.map(
        (item) => item.close
      );

      return res.json({
        c: prices,
      });
    }

    // 🇺🇸 US HISTORY → Twelve Data
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

    const values = response.data.values;

    if (!values) {
      return res.json({
        c: [],
      });
    }

    const closePrices = values
      .reverse()
      .map((item) =>
        parseFloat(item.close)
      );

    res.json({
      c: closePrices,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      c: [],
      error: "History API error",
    });
  }
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
