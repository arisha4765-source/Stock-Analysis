import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "./supabase";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function App() {
  // ---------------- STATE ----------------
  const [symbol, setSymbol] = useState("TCS");

  const [stockData, setStockData] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [news, setNews] = useState([]);

  const [aiResult, setAiResult] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const BACKEND =
    import.meta.env.VITE_BACKEND_URL;

  // ---------------- AUTH ----------------
  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      () => {
        checkUser();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---------------- CHECK USER ----------------
  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  };

  // ---------------- LOGIN ----------------
  const login = async () => {
    const email = prompt(
      "Enter your email"
    );

    if (!email) return;

    const { error } =
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            window.location.origin,
        },
      });

    if (error) {
      alert(error.message);
    } else {
      alert(
        "Login link sent to your email"
      );
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    await supabase.auth.signOut();
  };

  // ---------------- FETCH STOCK ----------------
  const fetchStock = async () => {
  try {
    setLoading(true);

    // STOCK
    const stockRes = await axios.get(
      `${BACKEND}/api/yahoo/${symbol}`
    );

    setStockData(stockRes.data);

    // HISTORY
    const historyRes = await axios.get(
      `${BACKEND}/api/history/${symbol}`
    );

    const historyData = historyRes.data || [];

    setHistory(historyData);

    // NEWS
    const newsRes = await axios.get(
      `${BACKEND}/api/news/${symbol}`
    );

    setNews(newsRes.data.articles || []);

    // AI
    const aiRes = await axios.post(
      `${BACKEND}/api/ai`,
      {
        symbol,
        price: stockRes.data.price,
        history: historyData,
      }
    );

    setAiResult(aiRes.data.analysis);

  } catch (err) {
    console.log(
      err.response?.data || err.message
    );

    alert("Failed to load stock data");
  } finally {
    setLoading(false);
  }
};

  // ---------------- CREATE ALERT ----------------
  const createAlert = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const target = prompt(
      "Target price?"
    );

    const condition = prompt(
      "above or below?"
    );

    const method = prompt(
      "email / whatsapp"
    );

    if (
      !target ||
      !condition ||
      !method
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("alerts")
        .insert([
          {
            user_id: user.id,
            symbol,
            target_price:
              Number(target),
            condition,
            method,
          },
        ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Alert created");
    }
  };

  // ---------------- UI ----------------
  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      {/* HEADER */}
      <h1>
        📈 AI Stock Analysis Dashboard
      </h1>

      {/* LOGIN */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        {!user ? (
          <button onClick={login}>
            🔐 Login
          </button>
        ) : (
          <>
            <span>
              Logged in as:{" "}
              {user.email}
            </span>

            <button
              onClick={logout}
              style={{
                marginLeft: "10px",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* SEARCH */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          value={symbol}
          onChange={(e) =>
            setSymbol(
              e.target.value.toUpperCase()
            )
          }
          placeholder="Enter stock symbol"
          style={{
            padding: "10px",
            width: "250px",
            marginRight: "10px",
          }}
        />

        <button onClick={fetchStock}>
          {loading
            ? "Loading..."
            : "Analyze"}
        </button>

        <button
          onClick={createAlert}
          style={{
            marginLeft: "10px",
          }}
        >
          🔔 Create Alert
        </button>
      </div>

      {/* STOCK CARD */}
      {stockData && (
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h2>{symbol}</h2>

          <h1>
            ₹
            {stockData.price || stockData.regularMarketPrice || "N/A"}
          </h1>
        </div>
      )}

      {/* CHART */}
      {history.length > 0 && (
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h2>
            📊 Price History
          </h2>

          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="datetime" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="close"
                stroke="#38bdf8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI RESULT */}
      {aiResult && (
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <h2>
            🤖 AI Analysis
          </h2>

          <p>{aiResult}</p>
        </div>
      )}

      {/* NEWS */}
      {news.length > 0 && (
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2>
            📰 Latest News
          </h2>

          {news
            .slice(0, 10)
            .map((item, index) => (
              <div
                key={index}
                style={{
                  marginBottom:
                    "15px",
                  borderBottom:
                    "1px solid #334155",
                  paddingBottom:
                    "10px",
                }}
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color:
                      "#38bdf8",
                    textDecoration:
                      "none",
                    fontWeight:
                      "bold",
                  }}
                >
                  {item.title}
                </a>

                <p
                  style={{
                    color:
                      "#cbd5e1",
                    fontSize:
                      "14px",
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
