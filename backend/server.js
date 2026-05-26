import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// ================= OPENAI =================
const openai = new OpenAI({
  apiKey: process.env.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 ,
});

// ================= STOCK (FAKE API SAFE) =================
app.get("/api/stock/:symbol", async (req, res) => {
  const symbol = req.params.symbol;

  // MOCK DATA (replace later with real API)
  res.json({
    symbol,
    price: (Math.random() * 1000).toFixed(2),
  });
});

// ================= NEWS (MOCK SAFE) =================
app.get("/api/news/:symbol", (req, res) => {
  res.json([
    { title: "Market showing positive momentum" },
    { title: "IT stocks gain strength" },
  ]);
});

// ================= AI =================
app.post("/api/ai", async (req, res) => {
  try {
    const { question, symbol, price } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Stock: " +
            symbol +
            "\nPrice: " +
            price +
            "\nQuestion: " +
            question,
        },
      ],
    });

    res.json({
      answer: response.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).json({ error: "AI error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on " + PORT));
