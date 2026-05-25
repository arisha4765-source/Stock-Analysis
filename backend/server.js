const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.get("/api/stock/:symbol", (req, res) => {
  const symbol = req.params.symbol;

  res.json({
    symbol,
    recommendation: "BUY",
    prediction: 152.34
  });
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
