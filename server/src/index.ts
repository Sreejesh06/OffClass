import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import authRoutes from "./routes/auth.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import integrationsRoutes from "./routes/integrations.js";
import complaintsRoutes from "./routes/complaints.js";
import adminRoutes from "./routes/admin.js";
import "./workers/syncWorker.js"; // Boot the background worker

const app = express();

// Security Headers (explicitly deny framing)
app.use(helmet({ frameguard: { action: "deny" } }));

// Structured JSON Logging (threaded reqId)
app.use((pinoHttp as any)({
  transport: process.env.NODE_ENV !== "production" 
    ? { target: "pino-pretty" } 
    : undefined
}));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000);