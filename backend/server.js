const express = require("express");
const axios = require("axios");
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

app.get("app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YJXFCCD9KINZJ41OU`
    );

    console.log(response.data);

    const stock = response.data["Global Quote"];

    if (
      !stock ||
      Object.keys(stock).length === 0 ||
      !stock["05. price"]
    ) {
      return res.status(404).json({
        error: "Stock not found",
        apiResponse: response.data
      });
    }

    const price = parseFloat(stock["05. price"]);
    const change = parseFloat(
      stock["10. change percent"]
    );

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
});", async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=JXFCCD9KINZJ41OU`
    );

    const stock = response.data["Global Quote"];

    if (!stock || !stock["05. price"]) {
      return res.status(404).json({
        error: "Stock not found"
      });
    }

    const price = parseFloat(stock["05. price"]);
    const change = parseFloat(
      stock["10. change percent"]
    );

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
