import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import leaderboardRoutes from "./routes/leaderboard.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000);