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
import perksRoutes from "./routes/perks.js";
import badgesRoutes from "./routes/badges.js";
import ledgerRoutes from "./routes/ledger.js";
import usersRoutes from "./routes/users.js";
import opportunitiesRoutes from "./routes/opportunities.js";
import "./workers/syncWorker.js"; // Boot the background worker

const app = express();
export { app };

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

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/perks", perksRoutes);
app.use("/api/badges", badgesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/opportunities", opportunitiesRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}