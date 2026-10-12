import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import authRoutes from "./routes/auth.js";
import notificationRoutes from "./routes/notifications.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import integrationsRoutes from "./routes/integrations.js";
import spotlightRoutes from "./routes/spotlights.js";
import complaintsRoutes from "./routes/complaints.js";
import adminRoutes from "./routes/admin.js";
import perksRoutes from "./routes/perks.js";
import badgesRoutes from "./routes/badges.js";
import ledgerRoutes from "./routes/ledger.js";
import usersRoutes from "./routes/users.js";
import opportunitiesRoutes from "./routes/opportunities.js";
import contributorsRoutes from "./routes/contributors.js";
import "./workers/syncWorker.js"; // Boot the background worker
import { prisma } from "./lib/db.js";

const app = express();
export { app };

// Trust reverse proxy (Caddy) for correct client IP detection in rate limiting
app.set("trust proxy", 1);

// Security Headers (explicitly deny framing)
app.use(helmet({ frameguard: { action: "deny" } }));

// Structured JSON Logging (threaded reqId)
app.use((pinoHttp as any)({
  transport: process.env.NODE_ENV !== "production" 
    ? { target: "pino-pretty" } 
    : undefined
}));

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Generous limit for normal student browsing
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/perks", perksRoutes);
app.use("/api/badges", badgesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api/spotlights", spotlightRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/contributors", contributorsRoutes);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized Global Error Handler (prevents stack trace disclosure)
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  req.log?.error ? req.log.error(err) : console.error("Unhandled request error:", err);

  if (res.headersSent) {
    return;
  }

  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : (err.message || "An unexpected error occurred")
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is missing in production.");
  process.exit(1);
}

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});