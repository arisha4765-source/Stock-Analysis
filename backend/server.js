const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.use(
  cors({
    origin: "https://stock-analysis-1-1mhd.onrender.com"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.get("const axios = require("axios");

app.get("app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=YOUR_API_KEY`
    );

    const series = response.data["Time Series (Daily)"];

    if (!series) {
      return res.status(404).json({
        error: "Stock not found"
      });
    }

    const prices = Object.values(series)
      .slice(0, 20)
      .map((day) => parseFloat(day["4. close"]));

    const latestPrice = prices[0];

    const average =
      prices.reduce((a, b) => a + b, 0) / prices.length;

    // Simple AI-like prediction
    const prediction = (
      latestPrice + (latestPrice - average) * 0.5
    ).toFixed(2);

    let recommendation = "HOLD";

    if (prediction > latestPrice) {
      recommendation = "BUY";
    } else if (prediction < latestPrice) {
      recommendation = "SELL";
    }

    res.json({
      symbol,
      currentPrice: latestPrice,
      predictedPrice: prediction,
      recommendation
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "API error"
    });
  }
});", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=FSNLQL7LFZGWQARX`
    );

    const stock = response.data["Global Quote"];

    if (!stock || !stock["05. price"]) {
      return res.status(404).json({
        error: "Stock not found"
      });
    }

    const price = parseFloat(stock["05. price"]);
    const change = parseFloat(stock["10. change percent"]);

    let recommendation = "HOLD";

    if (change > 2) recommendation = "STRONG BUY";
    else if (change > 0) recommendation = "BUY";
    else if (change < -2) recommendation = "SELL";

    res.json({
      symbol,
      price,
      change,
      recommendation
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "API error"
    });
  }
});", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  const randomPrice = (Math.random() * 500 + 50).toFixed(2);

  const recommendations = [
    "BUY",
    "SELL",
    "HOLD",
    "STRONG BUY"
  ];

  const randomRecommendation =
    recommendations[
      Math.floor(Math.random() * recommendations.length)
    ];

  res.json({
    symbol,
    recommendation: randomRecommendation,
    prediction: randomPrice
  });
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  let price = 100;

  const interval = setInterval(() => {
    price += (Math.random() - 0.5) * 2;

    ws.send(
      JSON.stringify({
        price: price.toFixed(2),
        time: new Date().toLocaleTimeString()
      })
    );
  }, 2000);

  ws.on("close", () => {
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
