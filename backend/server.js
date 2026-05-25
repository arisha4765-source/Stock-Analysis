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

app.get("/api/stock/:symbol", (req, res) => {
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
