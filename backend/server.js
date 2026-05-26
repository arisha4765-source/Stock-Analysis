const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

// 📈 STOCK API
app.get("/api/stock/:symbol", async (req, res) => {
  try {

    let symbol =
      req.params.symbol.toUpperCase();

    // 🇮🇳 INDIAN STOCKS
    if (symbol.includes(":NSE")) {

      const yahooSymbol =
        symbol.replace(":NSE", ".NS");

      const response =
        await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`
        );

      const result =
        response.data?.chart?.result?.[0];

      if (!result) {
        return res.status(404).json({
          error: "Indian stock not found",
        });
      }

      const meta = result.meta;

      const price =
        meta.regularMarketPrice;

      const previous =
        meta.previousClose;

      if (!price || !previous) {
        return res.status(404).json({
          error: "No stock data",
        });
      }

      const change = (
        ((price - previous) /
          previous) *
        100
      ).toFixed(2);

      let recommendation =
        "HOLD";

      if (change > 2)
        recommendation =
          "STRONG BUY";
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

    // 🇺🇸 US STOCKS
    const response =
      await axios.get(
        "https://api.twelvedata.com/quote",
        {
          params: {
            symbol,
            apikey:
              "YOUR_TWELVEDATA_API_KEY",
          },
        }
      );

    const stock = response.data;

    if (stock.status === "error") {
      return res.status(404).json({
        error: stock.message,
      });
    }

    const price = parseFloat(
      stock.close
    );

    const previousClose =
      parseFloat(
        stock.previous_close ||
          price
      );

    const change = (
      ((price - previousClose) /
        previousClose) *
      100
    ).toFixed(2);

    let recommendation =
      "HOLD";

    if (change > 2)
      recommendation =
        "STRONG BUY";
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

    console.error(
      "SERVER ERROR:",
      err.response?.data ||
      err.message
    );

    res.status(500).json({
      error: "API error",
    });
  }
});

// 📊 HISTORY API
app.get("/api/history/:symbol", async (req, res) => {
  try {
    let symbol = req.params.symbol.toUpperCase();

    // 🇮🇳 INDIAN STOCK HISTORY
    if (symbol.includes(":NSE")) {

      const yahooSymbol =
        symbol.replace(":NSE", ".NS");

      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=1mo&interval=1d`
      );

      const prices =
        response.data.chart.result[0]
          .indicators.quote[0].close;

      return res.json({
        c: prices,
      });
    }

    // 🇺🇸 US HISTORY → TWELVE DATA
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
    console.error(err.message);

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
