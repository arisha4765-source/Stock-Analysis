import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("ROOT WORKING");
});

app.get("/test", (req, res) => {
  res.send("TEST ROUTE WORKING");
});

app.get("/api/stock/:symbol", (req, res) => {
  res.json({
    symbol: req.params.symbol,
    success: true,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server started");
});
